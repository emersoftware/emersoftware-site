/** Display + derived helpers so authors don't hand-enter redundant fields. */

/** 2023-10-01 → "octubre 2023" / "October 2023" (UTC-safe). */
export function displayDate(d: Date, locale: 'es' | 'en' = 'en'): string {
  const month = new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(d);
  const displayMonth = locale === 'es' ? month : month.charAt(0).toUpperCase() + month.slice(1);
  return `${displayMonth} ${d.getUTCFullYear()}`;
}

/** Estimate reading time from the raw body. ~200 wpm, floor of 1 min. */
export function readingTime(text: string | undefined): string {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}
