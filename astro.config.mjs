import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://emersoftware.cl',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'server',
  adapter: cloudflare(),
});
