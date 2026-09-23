import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sitemapLinksForPath } from './src/data/routes.ts';

export default defineConfig({
  site: 'https://tooltician.com',
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
        },
      },
      // The route registry is authoritative for hreflang: overwrite the
      // plugin's i18n links so HTML <head> and sitemap cannot drift.
      serialize(item) {
        const links = sitemapLinksForPath(new URL(item.url).pathname);
        return links.length > 0 ? { ...item, links } : item;
      },
    }),
  ],
});
