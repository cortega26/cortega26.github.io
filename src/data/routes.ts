// Single source of truth for locale route pairs, hreflang alternates, and the
// sitemap's xhtml:link groups. Consumed by BaseLayout, every localized page,
// astro.config.mjs (sitemap serialize), and tests/sitemap-i18n.mjs.
//
// Normalization rule (fixed 2026-10-15, Ahrefs reciprocal hreflang):
// - Homepage: en + es + x-default = '/' (the root language selector).
// - Other bilingual groups: en + es + x-default = one localized URL
//   IN THE SAME GROUP (English default for services/work/docs; Spanish for blog).
//   A blanket x-default='/' creates non-reciprocal cross-topic links because
//   the homepage doesn't link back to every service or work page.
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
  { id: 'work', paths: { en: '/en/work/', es: '/es/trabajo/', xDefault: '/en/work/' } },
  { id: 'websites', paths: { en: '/en/sites/', es: '/es/sitios/', xDefault: '/en/sites/' } },
  { id: 'case-study:chile-hub', paths: { en: '/en/work/chile-hub/', es: '/es/trabajo/chile-hub/', xDefault: '/en/work/chile-hub/' } },
  { id: 'doc:privacy', paths: { en: '/en/privacy/', es: '/es/privacy/', xDefault: '/en/privacy/' } },
  { id: 'doc:cookies', paths: { en: '/en/cookies/', es: '/es/cookies/', xDefault: '/en/cookies/' } },
  { id: 'doc:terms', paths: { en: '/en/terms/', es: '/es/terms/', xDefault: '/en/terms/' } },
  { id: 'doc:engagement', paths: { en: '/en/engagement/', es: '/es/engagement/', xDefault: '/en/engagement/' } },
  {
    id: 'service:automation',
    paths: { en: '/en/services/python-automation/', es: '/es/servicios/automatizacion-python/', xDefault: '/en/services/python-automation/' },
  },
  {
    id: 'service:recurring-data',
    paths: { en: '/en/services/recurring-data-collection/', es: '/es/servicios/recoleccion-recurrente-datos/', xDefault: '/en/services/recurring-data-collection/' },
  },
  {
    id: 'service:internal-tools',
    paths: { en: '/en/services/internal-tools/', es: '/es/servicios/herramientas-internas/', xDefault: '/en/services/internal-tools/' },
  },
  {
    id: 'service:financial',
    paths: { en: '/en/services/financial-tooling/', es: '/es/servicios/herramientas-financieras/', xDefault: '/en/services/financial-tooling/' },
  },
  {
    id: 'service:web',
    paths: { en: '/en/services/static-sites/', es: '/es/servicios/sitios-web/', xDefault: '/en/services/static-sites/' },
  },
  {
    id: 'service:htw',
    paths: { en: '/en/services/web-technical-hygiene/', es: '/es/servicios/higiene-tecnica-web/', xDefault: '/en/services/web-technical-hygiene/' },
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
  { id: 'blog-hub', paths: { en: '/en/blog/', es: '/blog/', xDefault: '/blog/' } },
  {
    id: 'blog:python-313-314-315',
    paths: { en: '/en/blog/python-313-vs-314-vs-315/', es: '/blog/python-313-vs-314-vs-315/', xDefault: '/blog/python-313-vs-314-vs-315/' },
  },
];

/** Prototype-only public paths. Kept OUT of routeGroups, hreflang and sitemap.
 * They are reachable for QA but explicitly noindex until the owner launches. */
export const prototypeOnlyRoutes = [
  {
    id: 'contrapeso:news:calendario-electoral-29oct-2026',
    path: '/venezuela-lab/actualidad/calendario-electoral-29oct-2026/',
  },
  {
    id: 'contrapeso:news:activos-estatales-29oct-2026',
    path: '/venezuela-lab/actualidad/activos-estatales-29oct-2026/',
  },
  {
    id: 'contrapeso:news:marcha-miraflores-28oct-2026',
    path: '/venezuela-lab/actualidad/marcha-miraflores-28oct-2026/',
  },
  {
    id: 'contrapeso:news:regreso-machado-2026',
    path: '/venezuela-lab/actualidad/regreso-machado-2026/',
  },
  {
    id: 'contrapeso:explainer:actas-28j-2024',
    path: '/venezuela-lab/explicadores/actas-28j-2024/',
  },
  {
    id: 'contrapeso:method',
    path: '/venezuela-lab/metodo/',
  },
  {
    id: 'contrapeso:explainer:tsj-2017',
    path: '/venezuela-lab/explicadores/sentencias-155-156-2017/',
  },
] as const;

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
