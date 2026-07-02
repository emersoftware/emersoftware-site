import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * `blog` — the blog posts collection.
 *
 * Backed by Markdoc files (`src/content/blog/*.mdoc`) that Keystatic
 * writes and the site reads. The schema is deliberately FORGIVING: only
 * `title` and `publishedAt` are required, everything else has a default,
 * so a half-finished entry still lists instead of being dropped.
 *
 * Display date and reading time are DERIVED (see src/lib/format.ts), not
 * stored — fewer fields for the author to fill, fewer ways to break.
 */
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdoc}',
  }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    category: z.string().default('Blog'),
    description: z.string().default(''),
    placeholder: z.string().default(''),
    // Keystatic writes null when no image is set.
    cover: z.string().nullable().optional(),
  }),
});

export const collections = { blog };
