import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://emersoftware.cl',
  integrations: [tailwind(), sitemap()],
  output: 'server',
  adapter: vercel(),
});
