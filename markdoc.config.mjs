import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    project: {
      render: component('./src/components/blog/ProjectLink.astro'),
      attributes: {
        href: { type: String, required: true },
        label: { type: String, required: true },
        icon: { type: String },
      },
    },
  },
});
