import { config, fields, collection } from '@keystatic/core';

/**
 * Keystatic — the writer for Emerson Software blog content.
 *
 * Storage is `local` for end-to-end testing: editing at /keystatic writes
 * .mdoc files into src/content/blog, which the Astro site reads via
 * Content Collections (src/content.config.ts).
 *
 * Fields the site needs are marked required HERE (so the author can't save
 * an incomplete blog post), while the Astro/Zod schema stays forgiving (so a
 * stray draft still lists instead of crashing the build). Belt and braces.
 *
 * Images (cover + inline) are written to public/images/blog and
 * referenced by an absolute public path, so they're served as-is and never
 * hit Astro's relative-image resolver.
 *
 * To move to a separate content repo later, swap `storage` for:
 *   storage: { kind: "github", repo: "your-username/blog-content" }
 */
const IMAGE_DIR = 'public/images/blog';
const IMAGE_PUBLIC_PATH = '/images/blog/';

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'Emerson Software' },
  },

  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'category', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'The title of the blog post. The URL slug is generated from it.',
          },
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Software Development', value: 'Software Development' },
            { label: 'Web Development', value: 'Web Development' },
            { label: 'Cloud Computing', value: 'Cloud Computing' },
            { label: 'DevOps', value: 'DevOps' },
            { label: 'Tutorial', value: 'Tutorial' },
            { label: 'Career', value: 'Career' },
            { label: 'Personal', value: 'Personal' },
            { label: 'Blog', value: 'Blog' },
          ],
          defaultValue: 'Blog',
        }),
        publishedAt: fields.date({
          label: 'Publication date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
          description: 'Used for sorting (newest first) and displaying the date.',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
          description: 'The short summary that appears below the title.',
        }),
        placeholder: fields.text({
          label: 'Cover caption',
          description: "Text for the cover image placeholder when there's no image (optional).",
        }),
        cover: fields.image({
          label: 'Cover image (optional)',
          directory: IMAGE_DIR,
          publicPath: IMAGE_PUBLIC_PATH,
        }),
        body: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: IMAGE_DIR,
              publicPath: IMAGE_PUBLIC_PATH,
            },
          },
        }),
      },
    }),
  },
});
