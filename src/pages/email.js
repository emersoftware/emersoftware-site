import { RESEND_API_KEY, TURNSTILE_SECRET_KEY } from 'astro:env/server';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });

const getTextField = (data, name) => {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

const escapeHtml = (value) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character]
  );

export const POST = async ({ request }) => {
  if (!TURNSTILE_SECRET_KEY || !RESEND_API_KEY) {
    console.error('Contact form configuration is incomplete:', {
      hasTurnstileSecret: Boolean(TURNSTILE_SECRET_KEY),
      hasResendApiKey: Boolean(RESEND_API_KEY),
    });
    return json({ message: 'Contact form unavailable' }, 503);
  }

  const contentType = request.headers.get('content-type') || '';
  if (
    !contentType.startsWith('multipart/form-data') &&
    !contentType.startsWith('application/x-www-form-urlencoded')
  ) {
    return json({ message: 'Invalid form submission' }, 415);
  }

  try {
    const data = await request.formData();
    const firstname = getTextField(data, 'firstname');
    const lastname = getTextField(data, 'lastname');
    const email = getTextField(data, 'email');
    const message = getTextField(data, 'message');
    const turnstileResponse = getTextField(data, 'cf-turnstile-response');

    const missing = Object.entries({ firstname, lastname, email, message })
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      return json({ message: 'Missing required fields', missing }, 400);
    }

    if (
      firstname.length > 100 ||
      lastname.length > 100 ||
      email.length > 254 ||
      message.length > 5000 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return json({ message: 'Invalid form fields' }, 400);
    }

    if (!turnstileResponse) {
      return json({ message: 'CAPTCHA verification failed' }, 400);
    }

    const verificationData = new FormData();
    verificationData.append('secret', TURNSTILE_SECRET_KEY);
    verificationData.append('response', turnstileResponse);

    const clientIp =
      request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
    if (clientIp) verificationData.append('remoteip', clientIp);

    const turnstileResponseFromCloudflare = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verificationData,
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!turnstileResponseFromCloudflare.ok) {
      console.error('Turnstile service error:', {
        status: turnstileResponseFromCloudflare.status,
      });
      return json({ message: 'CAPTCHA verification unavailable' }, 502);
    }

    const turnstileResult = await turnstileResponseFromCloudflare.json();
    if (!turnstileResult.success) {
      console.warn('Turnstile verification failed:', {
        errorCodes: turnstileResult['error-codes'],
      });
      return json({ message: 'CAPTCHA verification failed' }, 400);
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['e.benjaminsalazarrubilar@gmail.com'],
        subject: 'Message from website',
        html: [
          `<p>Name: ${escapeHtml(firstname)} ${escapeHtml(lastname)}</p>`,
          `<p>Email: ${escapeHtml(email)}</p>`,
          `<p>Message: ${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
        ].join(''),
      }),
      signal: AbortSignal.timeout(10000),
    });

    const resendResult = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      console.error('Resend API error:', {
        status: resendResponse.status,
        name: resendResult?.name,
        message: resendResult?.message,
      });
      return json({ message: 'Error sending email' }, 502);
    }

    return json({ message: 'Email sent successfully', id: resendResult?.id });
  } catch (error) {
    console.error('Contact form error:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    });
    return json({ message: 'Server error' }, 500);
  }
};
