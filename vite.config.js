import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pages = ['index', 'catalog', 'export', 'quality', 'about', 'contacts'];

// <include src="partials/x.html" page="catalog"></include> -> partial content
function partials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<include src="([^"]+)"(?: page="([^"]*)")?\s*><\/include>/g, (_, file, page) => {
          let out = readFileSync(resolve(__dirname, file), 'utf8');
          if (page) out = out.replace(new RegExp('data-nav="' + page + '"', 'g'), 'data-nav="' + page + '" aria-current="page"');
          return out;
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, p + '.html')])),
    },
  },
});
