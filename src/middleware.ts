import type { MiddlewareHandler } from 'astro';
import { supportedLocales, defaultLocale } from './i18n/config';

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
  'ES', // Spain
  'UY', // Uruguay
  'VE', // Venezuela
]);

function detectFromAcceptLanguage(headerValue: string | null | undefined): 'es' | 'en' | null {
  if (!headerValue) return null;
  // Simple parse: take first language token
  const first = headerValue.split(',')[0]?.trim().toLowerCase();
  if (!first) return null;
  if (first.startsWith('es')) return 'es';
  if (first.startsWith('en')) return 'en';
  return null;
}

function detectFromCountry(countryCode: string | null | undefined): 'es' | 'en' | null {
  if (!countryCode) return null;
  const cc = countryCode.toUpperCase();
  if (ES_COUNTRIES.has(cc)) return 'es';
  return null; // default to null to allow other signals to decide
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
    const vercelCountry = request.headers.get('x-vercel-ip-country');

    const langFromAL = detectFromAcceptLanguage(acceptLanguage);
    const langFromCC = detectFromCountry(vercelCountry);

    const lang = (langFromAL || langFromCC || defaultLocale) as 'es' | 'en';

    if (lang === 'en') {
      // Redirect to /en, preserve hash
      const hash = url.hash || '';
      return context.redirect(`/en/${hash}`);
    }
    return next(); // es stays at root
  }

  return next();
};
