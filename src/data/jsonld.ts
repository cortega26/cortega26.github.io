// Single source for JSON-LD on the home pages, the work pages, and the root
// landing (Plan 033). Service pages keep their own Service/FAQ/Breadcrumb
// blocks in ServicePage.astro; everything else is built here so the same
// entity cannot drift between pages.
//
// Rule: only visible, verifiable entities. Offer names and URLs come from
// src/data/service-registry.json; project items come from src/data/caseStudies.ts.

import serviceRegistry from './service-registry.json';
import { casesByLocale, type CaseStudy } from './caseStudies';
import { SITE_ORIGIN } from './routes';
import { pricing } from './pricing';

export type JsonLdLocale = 'en' | 'es';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

const offerDescriptions: Record<JsonLdLocale, Record<string, string>> = {
  en: {
    automation: 'Scheduled, reproducible workflows for recurring reports, ETL, and structured data delivery.',
    'recurring-data': 'Resilient scraping and acquisition flows for public or authorized sources.',
    'internal-tools': 'Documented CLIs, internal APIs, and guided interfaces for known operational workflows.',
    financial: 'Fail-closed reconciliation and control workflows with deterministic audit artifacts.',
    web: 'Fast, maintainable public surfaces with SEO, performance, and handoff documentation.',
    htw: `Security headers, HTTPS, DNS, forms, Search Console, and lightweight monitoring for live sites with no internal technical owner. Diagnostic from ${pricing.webHygiene.en.diagnostic}.`,
  },
  es: {
    automation: 'Flujos programados y reproducibles para reportes recurrentes, ETL y entrega estructurada de datos.',
    'recurring-data': 'Flujos resilientes de scraping y adquisición para fuentes públicas o autorizadas.',
    'internal-tools': 'CLIs, APIs internas e interfaces guiadas para flujos operativos conocidos.',
    financial: 'Flujos de conciliación y control fail-closed con artefactos de auditoría deterministas.',
    web: 'Superficies públicas rápidas y mantenibles, con SEO, rendimiento y documentación de traspaso.',
    htw: 'Headers de seguridad, HTTPS, DNS, formularios, Search Console y monitoreo liviano para sitios publicados sin responsable técnico interno.',
  },
};

const person: Record<JsonLdLocale, {
  url: string;
  jobTitle: string;
  description: string;
  knowsAbout: string[];
  occupationName: string;
  occupationDescription: string;
}> = {
  en: {
    url: `${SITE_ORIGIN}/`,
    jobTitle: 'Operational Systems & Python Automation Consultant',
    description:
      'Reliable operational systems across Python automation, recurring data collection, internal tools, financial controls, focused front ends, and web technical hygiene — scoped and documented for handoff.',
    knowsAbout: [
      'Python Automation', 'ETL Pipelines', 'Data Engineering',
      'Web Scraping', 'Internal APIs', 'Reporting Automation',
      'Static Sites', 'Financial Tooling', 'Web Technical Hygiene',
      'Security Headers', 'DNS Configuration', 'Search Console',
    ],
    occupationName: 'Python Automation Consultant',
    occupationDescription:
      'Scoped implementation of ETL pipelines, scrapers, internal APIs, and reporting workflows with CI, documentation, and handoff-ready systems.',
  },
  es: {
    url: `${SITE_ORIGIN}/es/`,
    jobTitle: 'Consultor de Sistemas Operacionales y Automatización Python',
    description:
      'Construyo sistemas confiables para operaciones: automatización Python, recolección recurrente, herramientas internas, controles financieros, frontends acotados e higiene técnica web, con alcance definido y traspaso documentado.',
    knowsAbout: [
      'Automatización Python', 'Pipelines ETL', 'Data Engineering',
      'Web Scraping', 'APIs Internas', 'Automatización de Reportes',
      'Sitios Estáticos', 'Herramientas Financieras',
      'Higiene Técnica Web', 'Headers de Seguridad', 'DNS', 'Search Console',
    ],
    occupationName: 'Consultor de Automatización Python',
    occupationDescription:
      'Implementación acotada de pipelines ETL, scrapers, APIs internas y flujos de reportes con CI, documentación y sistemas listos para traspaso.',
  },
};

export function buildProfessionalService(lang: JsonLdLocale) {
  const data = person[lang];
  return {
    '@context': 'https://schema.org',
    '@type': ['Person', 'ProfessionalService'],
    name: 'Carlos Ortega Gonzalez',
    alternateName: 'Tooltician',
    url: data.url,
    sameAs: ['https://github.com/cortega26', 'https://www.linkedin.com/in/cortega26'],
    jobTitle: data.jobTitle,
    description: data.description,
    areaServed: ['CL', 'Worldwide'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santiago',
      addressCountry: 'CL',
    },
    makesOffer: serviceRegistry.services.map((service) => ({
      '@type': 'Offer',
      name: lang === 'en' ? service.public_name : service.public_name_es,
      description: offerDescriptions[lang][service.service_id] ?? service.public_name,
      url: `${SITE_ORIGIN}${lang === 'en' ? service.route_en : service.route_es}`,
    })),
    knowsAbout: data.knowsAbout,
    hasOccupation: {
      '@type': 'Occupation',
      name: data.occupationName,
      description: data.occupationDescription,
      skills: 'Python, SQL, FastAPI, Selenium, BeautifulSoup, Pandas, Astro, GitHub Actions, CI/CD',
    },
  };
}

export function buildPortfolioItemList(lang: JsonLdLocale, cases: CaseStudy[] = casesByLocale[lang]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tooltician portfolio',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: cases.length,
    itemListElement: cases.map((project, index) => {
      const url = project.evidence?.find((chip) => chip.type === 'pypi' && chip.href)?.href ?? project.links[0]?.href;
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': project.id === 'noticiencias' ? 'WebSite' : 'SoftwareApplication',
          name: project.title,
          ...(url ? { url } : {}),
          description: project.summary,
        },
      };
    }),
  };
}

export function buildBreadcrumb(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildWorkCollection(lang: JsonLdLocale, canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: lang === 'en' ? 'Production work, with evidence' : 'Trabajo en producción, con evidencia',
    url: canonical,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'Tooltician', url: `${SITE_ORIGIN}/` },
  };
}

export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tooltician',
    url: `${SITE_ORIGIN}/`,
    inLanguage: ['en', 'es'],
  };
}

export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tooltician',
    url: `${SITE_ORIGIN}/`,
    sameAs: ['https://github.com/cortega26', 'https://www.linkedin.com/in/cortega26'],
    founder: { '@type': 'Person', name: 'Carlos Ortega Gonzalez' },
  };
}
