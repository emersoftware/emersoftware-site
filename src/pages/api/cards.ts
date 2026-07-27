import type { APIRoute } from 'astro';
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

const MAX_MESSAGE_LENGTH = 64;
const MAX_SIGNATURE_LENGTH = 20;
const MAX_STROKES = 16;
const MAX_POINTS = 900;
const MAX_DRAWING_BYTES = 30_000;
const MAX_CARDS_PER_HOUR = 3;
const MAX_VISIBLE_CARDS = 5;
const LOCAL_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';

type Point = [number, number];
type Drawing = { strokes: Point[][] };
type TurnstileVerification =
  | { success: true; attempts: number }
  | { success: false; retryable: boolean; errorCodes: string[]; attempts: number };

interface CardRow {
  id: string;
  message: string;
  drawing: string;
  signature: string;
  public_url: string | null;
  created_at: string;
}

type LogLevel = 'info' | 'warn' | 'error';

const json = (body: unknown, status = 200, cacheControl = 'no-store', requestId?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      'Cache-Control': cacheControl,
      ...(requestId ? { 'X-Request-Id': requestId } : {}),
    },
  });

const logEvent = (level: LogLevel, event: string, details: Record<string, unknown>) => {
  const entry = { service: 'guest_cards', event, ...details };
  if (level === 'error') {
    console.error(entry);
  } else if (level === 'warn') {
    console.warn(entry);
  } else {
    console.info(entry);
  }
};

const errorDetails = (error: unknown) => {
  if (!(error instanceof Error)) return { errorName: 'UnknownError' };
  return {
    errorName: error.name,
    errorMessage: error.message.slice(0, 300),
  };
};

const requestContext = (request: Request) => ({
  requestId: crypto.randomUUID(),
  rayId: request.headers.get('cf-ray') || undefined,
  startedAt: Date.now(),
});

const logContext = (context: ReturnType<typeof requestContext>) => ({
  requestId: context.requestId,
  ...(context.rayId ? { rayId: context.rayId } : {}),
});

const durationMs = (context: ReturnType<typeof requestContext>) => Date.now() - context.startedAt;

const errorResponse = (body: Record<string, unknown>, status: number, requestId: string) =>
  json({ ...body, requestId }, status, 'no-store', requestId);

const isLocalRequest = (request: Request) => {
  const { hostname } = new URL(request.url);
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  );
};

const getDatabase = async () => {
  if (import.meta.env.DEV) return null;
  const { getGuestbookDatabase } = await import('../../lib/guestbook-db');
  return getGuestbookDatabase();
};

const publicCard = (row: CardRow) => ({
  id: row.id,
  kind: row.message ? 'message' : 'drawing',
  message: row.message,
  drawing: JSON.parse(row.drawing) as Drawing,
  signature: row.signature,
  publicUrl: row.public_url,
  createdAt: row.created_at,
});

const normalizeMessage = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const message = value
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
  const length = Array.from(message).length;
  if (length > MAX_MESSAGE_LENGTH || message.split('\n').length > 4) return null;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(message)) return null;
  return message;
};

const normalizeDrawing = (value: unknown): Drawing | null => {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Drawing).strokes)) {
    return null;
  }

  const source = (value as Drawing).strokes;
  if (source.length > MAX_STROKES) return null;

  let totalPoints = 0;
  const strokes: Point[][] = [];

  for (const stroke of source) {
    if (!Array.isArray(stroke)) return null;
    if (stroke.length < 2) continue;
    const cleanStroke: Point[] = [];

    for (const point of stroke) {
      if (
        !Array.isArray(point) ||
        point.length !== 2 ||
        !Number.isFinite(point[0]) ||
        !Number.isFinite(point[1]) ||
        point[0] < 0 ||
        point[0] > 256 ||
        point[1] < 0 ||
        point[1] > 256
      ) {
        return null;
      }
      cleanStroke.push([Math.round(point[0] * 10) / 10, Math.round(point[1] * 10) / 10]);
      totalPoints += 1;
      if (totalPoints > MAX_POINTS) return null;
    }

    strokes.push(cleanStroke);
  }

  const drawing = { strokes };
  if (new TextEncoder().encode(JSON.stringify(drawing)).length > MAX_DRAWING_BYTES) return null;
  return drawing;
};

const normalizeSignature = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const signature = value
    .trim()
    .replace(/^[—–-]+\s*/u, '')
    .replace(/\s+/g, ' ');
  const length = Array.from(signature).length;
  if (!signature || length > MAX_SIGNATURE_LENGTH || !/^[\p{L}\p{N}._ -]+$/u.test(signature)) {
    return null;
  }
  return signature;
};

const normalizeContact = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const contact = value.trim();
  if (!contact) return { publicUrl: null, privateEmail: null };

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(contact) && contact.length <= 254) {
    return { publicUrl: null, privateEmail: contact.toLowerCase() };
  }

  try {
    const url = new URL(contact);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.href.length > 2048
    ) {
      return null;
    }
    return { publicUrl: url.href, privateEmail: null };
  } catch {
    return null;
  }
};

const verifyTurnstile = async (
  request: Request,
  token: unknown
): Promise<TurnstileVerification> => {
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return {
      success: false,
      retryable: true,
      errorCodes: ['invalid-client-token'],
      attempts: 0,
    };
  }

  const secret = TURNSTILE_SECRET_KEY || (isLocalRequest(request) ? LOCAL_TURNSTILE_SECRET : '');
  if (!secret) {
    return {
      success: false,
      retryable: false,
      errorCodes: ['missing-server-secret'],
      attempts: 0,
    };
  }

  const verificationData = new FormData();
  verificationData.append('secret', secret);
  verificationData.append('response', token);
  verificationData.append('idempotency_key', crypto.randomUUID());

  const clientIp =
    request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
  if (clientIp) verificationData.append('remoteip', clientIp.split(',')[0].trim());

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verificationData,
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        if (attempt === 0) continue;
        return {
          success: false,
          retryable: true,
          errorCodes: [`siteverify-http-${response.status}`],
          attempts: attempt + 1,
        };
      }

      const result = (await response.json()) as {
        success?: boolean;
        'error-codes'?: string[];
      };
      if (result.success === true) return { success: true, attempts: attempt + 1 };

      const errorCodes = Array.isArray(result['error-codes'])
        ? result['error-codes']
        : ['siteverify-rejected'];
      if (attempt === 0 && errorCodes.includes('internal-error')) continue;

      const configurationError = errorCodes.some((code) =>
        ['missing-input-secret', 'invalid-input-secret', 'bad-request'].includes(code)
      );
      return {
        success: false,
        retryable: !configurationError,
        errorCodes,
        attempts: attempt + 1,
      };
    } catch {
      if (attempt === 0) continue;
      return {
        success: false,
        retryable: true,
        errorCodes: ['siteverify-unavailable'],
        attempts: attempt + 1,
      };
    }
  }

  return {
    success: false,
    retryable: true,
    errorCodes: ['siteverify-unavailable'],
    attempts: 2,
  };
};

const makeRateKey = async (request: Request) => {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'local';
  const hour = new Date().toISOString().slice(0, 13);
  const bytes = new TextEncoder().encode(`${hour}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const GET: APIRoute = async ({ request }) => {
  const context = requestContext(request);
  let stage = 'database_read';

  try {
    const database = await getDatabase();
    if (!database) {
      logEvent('warn', 'guest_cards_read_failed', {
        ...logContext(context),
        stage: 'database_binding',
        status: 503,
        durationMs: durationMs(context),
      });
      return errorResponse(
        { message: 'Cards unavailable in local CMS mode', code: 'database_unavailable' },
        503,
        context.requestId
      );
    }

    const { results } = await database
      .prepare(
        `SELECT id, message, drawing, signature, public_url, created_at
         FROM guest_cards
         WHERE is_visible = 1
         ORDER BY RANDOM()
         LIMIT ?`
      )
      .bind(MAX_VISIBLE_CARDS)
      .all<CardRow>();

    stage = 'serialize_response';
    return json({ cards: results.map(publicCard) }, 200, 'no-store', context.requestId);
  } catch (error) {
    logEvent('error', 'guest_cards_read_failed', {
      ...logContext(context),
      stage,
      status: 503,
      durationMs: durationMs(context),
      ...errorDetails(error),
    });
    return errorResponse(
      { message: 'Cards unavailable', code: 'cards_read_failed' },
      503,
      context.requestId
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  const context = requestContext(request);
  let stage = 'request_headers';
  const reject = (
    body: Record<string, unknown>,
    status: number,
    event = 'guest_card_rejected',
    details: Record<string, unknown> = {}
  ) => {
    logEvent(status >= 500 ? 'error' : 'warn', event, {
      ...logContext(context),
      stage,
      status,
      durationMs: durationMs(context),
      ...details,
    });
    return errorResponse(body, status, context.requestId);
  };

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reject(
      { message: 'Invalid content type', code: 'invalid_content_type' },
      415,
      'guest_card_rejected',
      { reason: 'invalid_content_type' }
    );
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) {
    return reject(
      { message: 'Invalid origin', code: 'invalid_origin' },
      403,
      'guest_card_rejected',
      { reason: 'invalid_origin' }
    );
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > 40_000) {
    return reject(
      { message: 'Card is too large', code: 'invalid_card_content', field: 'drawing' },
      413,
      'guest_card_validation_failed',
      { reason: 'drawing_too_large', declaredLength }
    );
  }

  try {
    stage = 'parse_json';
    let body: {
      message?: unknown;
      drawing?: unknown;
      signature?: unknown;
      contact?: unknown;
      turnstileToken?: unknown;
    };

    try {
      body = (await request.json()) as typeof body;
    } catch (error) {
      return reject({ message: 'Invalid JSON', code: 'invalid_json' }, 400, 'guest_card_rejected', {
        reason: 'invalid_json',
        ...errorDetails(error),
      });
    }

    stage = 'validate_card';
    const message = normalizeMessage(body.message);
    const drawing = normalizeDrawing(body.drawing);
    const signature = normalizeSignature(body.signature);
    const contact = normalizeContact(body.contact);
    const hasMessage = Boolean(message);
    const hasDrawing = Boolean(drawing?.strokes.length);
    const validationField =
      message === null
        ? 'message'
        : !drawing
          ? 'drawing'
          : !signature
            ? 'signature'
            : !contact
              ? 'contact'
              : hasMessage === hasDrawing
                ? hasDrawing
                  ? 'message'
                  : 'drawing'
                : null;

    if (validationField) {
      const submittedStrokes =
        body.drawing &&
        typeof body.drawing === 'object' &&
        Array.isArray((body.drawing as Drawing).strokes)
          ? (body.drawing as Drawing).strokes
          : [];
      return reject(
        {
          message: 'Invalid card content',
          code: 'invalid_card_content',
          field: validationField,
        },
        400,
        'guest_card_validation_failed',
        {
          reason: validationField,
          declaredLength,
          strokeCount: submittedStrokes.length,
          pointCount: submittedStrokes.reduce(
            (total, stroke) => total + (Array.isArray(stroke) ? stroke.length : 0),
            0
          ),
        }
      );
    }

    stage = 'turnstile_verification';
    const verificationStartedAt = Date.now();
    const verification = await verifyTurnstile(request, body.turnstileToken);
    const verificationDurationMs = Date.now() - verificationStartedAt;
    if (verification.success === false) {
      return reject(
        {
          message: 'Verification failed',
          code: 'verification_failed',
          retryable: verification.retryable,
        },
        verification.retryable ? 400 : 503,
        'guest_card_turnstile_failed',
        {
          retryable: verification.retryable,
          errorCodes: verification.errorCodes,
          attempts: verification.attempts,
          verificationDurationMs,
        }
      );
    }

    if (verification.attempts > 1) {
      logEvent('warn', 'guest_card_turnstile_recovered', {
        ...logContext(context),
        stage,
        attempts: verification.attempts,
        verificationDurationMs,
        durationMs: durationMs(context),
      });
    }

    stage = 'database_binding';
    const database = await getDatabase();
    if (!database) {
      return reject(
        { message: 'Cards unavailable in local CMS mode', code: 'database_unavailable' },
        503,
        'guest_card_database_failed'
      );
    }

    stage = 'rate_limit_query';
    const rateKey = await makeRateKey(request);
    const recentCount =
      (await database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM guest_cards
           WHERE rate_key = ? AND created_at >= datetime('now', '-1 hour')`
        )
        .bind(rateKey)
        .first<number>('count')) || 0;

    if (recentCount >= MAX_CARDS_PER_HOUR) {
      return reject(
        { message: 'Rate limit exceeded', code: 'rate_limited' },
        429,
        'guest_card_rate_limited',
        { recentCount, limit: MAX_CARDS_PER_HOUR }
      );
    }

    const drawingJson = JSON.stringify(drawing);
    const legacyKind = drawing.strokes.length > 0 ? 'drawing' : 'note';
    const legacyContent = legacyKind === 'drawing' ? drawingJson : message;

    const row: CardRow = {
      id: crypto.randomUUID(),
      message,
      drawing: drawingJson,
      signature,
      public_url: contact.publicUrl,
      created_at: new Date().toISOString(),
    };

    stage = 'database_insert';
    await database
      .prepare(
        `INSERT INTO guest_cards (
           id, kind, content, message, drawing, signature,
           public_url, private_email, rate_key, created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        row.id,
        legacyKind,
        legacyContent,
        row.message,
        row.drawing,
        row.signature,
        row.public_url,
        contact.privateEmail,
        rateKey,
        row.created_at
      )
      .run();

    logEvent('info', 'guest_card_saved', {
      ...logContext(context),
      status: 201,
      cardKind: legacyKind === 'drawing' ? 'drawing' : 'message',
      strokeCount: drawing.strokes.length,
      pointCount: drawing.strokes.reduce((total, stroke) => total + stroke.length, 0),
      hasPublicUrl: Boolean(contact.publicUrl),
      hasPrivateEmail: Boolean(contact.privateEmail),
      turnstileAttempts: verification.attempts,
      verificationDurationMs,
      durationMs: durationMs(context),
    });

    return json({ card: publicCard(row) }, 201, 'no-store', context.requestId);
  } catch (error) {
    return reject(
      { message: 'Could not save card', code: 'card_creation_failed' },
      500,
      'guest_card_creation_failed',
      errorDetails(error)
    );
  }
};
