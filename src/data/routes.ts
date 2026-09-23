// Single source of truth for locale route pairs, hreflang alternates, and the
// sitemap's xhtml:link groups. Consumed by BaseLayout, every localized page,
// astro.config.mjs (sitemap serialize), and tests/sitemap-i18n.mjs.
//
// Normalization rule (audit 2026-09-23, Plan 025):
// - Bilingual groups: en + es + x-default = '/' (the root x-default landing).
// - Monolingual ES groups (guides): es + x-default = the ES URL itself.
// Never hardcode an alternate set anywhere else.

export type Locale = 'en' | 'es';

export interface RouteGroup {
  id: string;
  /** Canonical pathnames (trailing slash). `xDefault` is the pathname that
   *  receives the x-default hreflang for the group. */
  paths: { en?: string; es?: string; xDefault: string };
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export const SITE_ORIGIN = 'https://tooltician.com';

export const routeGroups: RouteGroup[] = [
  { id: 'home', paths: { en: '/en/', es: '/es/', xDefault: '/' } },
  { id: 'work', paths: { en: '/en/work/', es: '/es/trabajo/', xDefault: '/' } },
  { id: 'doc:privacy', paths: { en: '/en/privacy/', es: '/es/privacy/', xDefault: '/' } },
  { id: 'doc:cookies', paths: { en: '/en/cookies/', es: '/es/cookies/', xDefault: '/' } },
  { id: 'doc:terms', paths: { en: '/en/terms/', es: '/es/terms/', xDefault: '/' } },
  { id: 'doc:engagement', paths: { en: '/en/engagement/', es: '/es/engagement/', xDefault: '/' } },
  {
    id: 'service:automation',
    paths: { en: '/en/services/python-automation/', es: '/es/servicios/automatizacion-python/', xDefault: '/' },
  },
  {
    id: 'service:recurring-data',
    paths: { en: '/en/services/recurring-data-collection/', es: '/es/servicios/recoleccion-recurrente-datos/', xDefault: '/' },
  },
  {
    id: 'service:internal-tools',
    paths: { en: '/en/services/internal-tools/', es: '/es/servicios/herramientas-internas/', xDefault: '/' },
  },
  {
    id: 'service:financial',
    paths: { en: '/en/services/financial-tooling/', es: '/es/servicios/herramientas-financieras/', xDefault: '/' },
  },
  {
    id: 'service:web',
    paths: { en: '/en/services/static-sites/', es: '/es/servicios/sitios-web/', xDefault: '/' },
  },
  {
    id: 'service:htw',
    paths: { en: '/en/services/web-technical-hygiene/', es: '/es/servicios/higiene-tecnica-web/', xDefault: '/' },
  },
  {
    id: 'guides-hub',
    paths: { es: '/es/guias/', xDefault: '/es/guias/' },
  },
  {
    id: 'guide:auditoria-tecnica-web-negocios-pequenos',
    paths: {
      es: '/es/guias/auditoria-tecnica-web-negocios-pequenos/',
      xDefault: '/es/guias/auditoria-tecnica-web-negocios-pequenos/',
    },
  },
  {
    id: 'guide:automatizar-reportes-excel-python',
    paths: {
      es: '/es/guias/automatizar-reportes-excel-python/',
      xDefault: '/es/guias/automatizar-reportes-excel-python/',
    },
  },
  {
    id: 'guide:pagina-web-estatica-cuando-conviene',
    paths: {
      es: '/es/guias/pagina-web-estatica-cuando-conviene/',
      xDefault: '/es/guias/pagina-web-estatica-cuando-conviene/',
    },
  },
];

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function routeGroup(id: string): RouteGroup {
  const group = routeGroups.find((candidate) => candidate.id === id);
  if (!group) throw new Error(`Unknown route group: ${id}`);
  return group;
}

export function alternatesFor(id: string): HreflangLink[] {
  const { paths } = routeGroup(id);
  const links: HreflangLink[] = [];
  if (paths.en) links.push({ hreflang: 'en', href: `${SITE_ORIGIN}${paths.en}` });
  if (paths.es) links.push({ hreflang: 'es', href: `${SITE_ORIGIN}${paths.es}` });
  links.push({ hreflang: 'x-default', href: `${SITE_ORIGIN}${paths.xDefault}` });
  return links;
}

export function groupForPath(pathname: string): RouteGroup | undefined {
  const path = normalizePath(pathname);
  const localized = routeGroups.find((group) => group.paths.en === path || group.paths.es === path);
  if (localized) return localized;
  return routeGroups.find((group) => group.paths.xDefault === path);
}

export function sitemapLinksForPath(pathname: string): { url: string; lang: string }[] {
  const group = groupForPath(pathname);
  if (!group) return [];
  return alternatesFor(group.id).map(({ hreflang, href }) => ({ url: href, lang: hreflang }));
}
