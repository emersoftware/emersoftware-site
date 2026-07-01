import type { MiddlewareHandler } from 'astro';
import { defaultLocale, type SupportedLocale } from './i18n/config';

const ES_COUNTRIES = new Set([
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // Dominican Republic
  'EC', // Ecuador
  'ES', // Spain
  'SV', // El Salvador
  'GQ', // Equatorial Guinea (Spanish official)
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // Mexico
  'NI', // Nicaragua
  'PA', // Panama
  'PY', // Paraguay
  'PE', // Peru
  'PR', // Puerto Rico
  'UY', // Uruguay
  'VE', // Venezuela
]);

function detectFromAcceptLanguage(headerValue: string | null | undefined): SupportedLocale | null {
  if (!headerValue) return null;
  const ranked = headerValue
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.split('=')[1]) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag.startsWith('es')) return 'es';
    if (tag.startsWith('en')) return 'en';
  }
  return null;
}

function detectFromCountry(countryCode: string | null | undefined): SupportedLocale | null {
  if (!countryCode) return null;
  if (ES_COUNTRIES.has(countryCode.toUpperCase())) return 'es';
  return null;
}

function isStaticAssetPath(pathname: string): boolean {
  // Skip redirects for static assets and API routes
  if (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  )
    return true;
  const ext = pathname.split('.').pop();
  if (
    ext &&
    ['svg', 'png', 'jpg', 'jpeg', 'webp', 'ico', 'txt', 'json', 'xml', 'js', 'css', 'map'].includes(
      ext
    )
  )
    return true;
  return false;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // If path starts with /en, continue (secondary locale). We serve default (es) at root.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return next();
  }

  // Ignore non-HTML paths
  if (isStaticAssetPath(pathname)) {
    return next();
  }

  // Only auto-redirect to /en for users whose preferred language is EN
  if (pathname === '/' || pathname === '') {
    const acceptLanguage = request.headers.get('accept-language');
    const cloudflareCountry = request.headers.get('cf-ipcountry');

    const langFromAL = detectFromAcceptLanguage(acceptLanguage);
    const langFromCC = detectFromCountry(cloudflareCountry);

    const lang: SupportedLocale = langFromAL || langFromCC || defaultLocale;

    if (lang === 'en') {
      return context.redirect('/en/');
    }
    return next();
  }

  return next();
};
