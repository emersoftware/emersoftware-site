/// <reference types="astro/client" />

type Env = {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
};
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    otherLocals: any;
  }
}
