import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Inline Shiki transformer:
// - copies the fence language onto <pre> as `data-language` (spec §3.8 label)
// - sets `data-line-numbers` when the fence meta contains `lineNumbers`
const codeBlockTransformer = {
  name: 'monesh:code-block-meta',
  pre(node) {
    const lang = this.options?.lang;
    if (lang && lang !== 'plaintext' && lang !== 'text') {
      node.properties['data-language'] = lang;
    }
    const meta = this.options?.meta;
    const metaString =
      typeof meta === 'string' ? meta : meta?.__raw ?? '';
    if (/\blineNumbers\b/.test(metaString)) {
      node.properties['data-line-numbers'] = '';
    }
  },
};

const shikiConfig = {
  themes: { light: 'github-light', dark: 'github-dark' },
  transformers: [codeBlockTransformer],
  wrap: false,
};

export default defineConfig({
  site: 'https://monesh.example.com',
  output: 'static',
  trailingSlash: 'never',
  markdown: {
    shikiConfig,
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx({ shikiConfig }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
