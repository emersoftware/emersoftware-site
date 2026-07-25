import { env } from 'cloudflare:workers';

export const getGuestbookDatabase = () => env.GUESTBOOK_DB;
