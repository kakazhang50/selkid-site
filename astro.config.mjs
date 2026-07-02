import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';

const site = 'https://selkid.com';

const highPriorityPaths = new Set([
  '/',
  '/learning-system/',
  '/sel-stories/',
  '/thinking-skills/',
  '/ai-cognition/',
  '/free-resources/',
  '/about/',
  '/rex-dino/',
  '/educator-notes/',
]);

export default defineConfig({
  site,
  integrations: [
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname;
        const normalized = path.endsWith('/') ? path : `${path}/`;

        if (path === '/' || normalized === '/') {
          item.priority = 1;
          item.changefreq = 'weekly';
        } else if (highPriorityPaths.has(normalized)) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/resources/')) {
          item.priority = 0.85;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/educator-notes/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }

        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
