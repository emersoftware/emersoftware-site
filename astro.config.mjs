import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Keystatic currently relies on Node globals that are unavailable in the
// Cloudflare Vite runner. Keep local CMS development on Astro's Node runtime.
const isDev = process.argv.includes('dev');
// Only `astro build` emits the deployable Worker. preview/check/sync re-evaluate
// this config but ship nothing, so the guard below must target build alone.
const isBuild = process.argv.includes('build');
const skipKeystatic = process.env.SKIP_KEYSTATIC === 'true';

// SECURITY GUARD — the adapter raises the stakes of the SKIP_KEYSTATIC flag.
// Before, "static, no server runtime" meant a forgotten flag shipped only an
// INERT admin shell. With the Cloudflare adapter, /api/keystatic CAN run as a
// live Worker route, so a forgotten flag would ship a FUNCTIONAL, unauthenticated
// CMS. Fail the production BUILD loudly rather than silently exposing it. Keyed
// on `build` (not `!dev`) so `astro preview`/`check`/`sync` of an already-safe
// build aren't blocked.
if (isBuild && !skipKeystatic) {
  throw new Error(
    '[emersoftware-site] Production build without SKIP_KEYSTATIC=true. The Cloudflare ' +
      'adapter would ship the unauthenticated local CMS as a live Worker route. ' +
      'Set SKIP_KEYSTATIC=true in the build environment.'
  );
}

// https://astro.build/config
export default defineConfig({
  site: 'https://emersoftware.cl',
  integrations: [sitemap(), markdoc(), react(), ...(skipKeystatic ? [] : [keystatic()])],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  adapter: isDev ? undefined : cloudflare(),
  env: {
    schema: {
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
