import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

/**
 * `externalPosts` — posts I wrote that live on other sites (e.g. the
 * BipBop blog). They're listed alongside `blog` in BlogList, sorted by
 * date, but link out instead of rendering here. One entry per post in
 * `src/content/external-posts.json`.
 */
const externalPosts = defineCollection({
  loader: file('./src/content/external-posts.json'),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    url: z.string().url(),
    source: z.string(),
    // Language the post is written in; flagged when it differs from the page.
    lang: z.enum(['es', 'en']).default('es'),
  }),
});

export const collections = { blog, externalPosts };
