// Public website showcase. Keep operational claims separate from domain ownership.
// Audited 2026-10-22 against the live sites and their current GitHub repositories.
// Showcase only user-owned projects backed by a current repository or live site.
export type WebsiteGroup = 'editorial' | 'commerce' | 'culture' | 'data' | 'studio';
export type WebsiteStatus = 'checked' | 'unverified';

export interface Website {
  id: string;
  name: string;
  domain: string;
  url: string;
  repo?: string;
  group: WebsiteGroup;
  status: WebsiteStatus;
  tags: string[];
  description: { es: string; en: string };
  highlight: { es: string; en: string };
  benefit: { es: string; en: string };
  capabilities: { es: [string, string]; en: [string, string] };
}

export const websites: Website[] = [
  {
    id: 'noticiencias',
    name: 'Noticiencias',
    domain: 'noticiencias.com',
    url: 'https://noticiencias.com/',
    repo: 'https://github.com/cortega26/noticiencias',
    group: 'editorial',
    status: 'checked',
    tags: ['Astro', 'Editorial', 'SEO'],
    description: {
      es: 'Medio de divulgación científica en español, con fuentes identificadas, archivo de noticias y criterios editoriales públicos.',
      en: 'Spanish-language science publication with named sources, a news archive and published editorial standards.',
    },
    highlight: { es: 'Ciencia con contexto', en: 'Science with context' },
    benefit: { es: "Una experiencia editorial para descubrir, leer y profundizar sin perder las fuentes.", en: "An editorial experience built for discovery, reading and source transparency." },
    capabilities: { es: ["Portada, secciones y archivo","Lectura optimizada y SEO"], en: ["Homepage, topics and archive","Reading experience and SEO"] },
  },
  {
    id: 'monedario',
    name: 'Monedario',
    domain: 'monedario.cl',
    url: 'https://monedario.cl/',
    group: 'editorial',
    status: 'checked',
    tags: ['Astro', 'Finanzas', 'Calculadoras'],
    description: {
      es: 'Guías y calculadoras de finanzas personales para Chile: remuneraciones, impuestos, UF, crédito, ahorro y más.',
      en: 'Chilean personal-finance guides and calculators covering salaries, taxes, inflation, credit and savings.',
    },
    highlight: { es: 'Finanzas sin humo', en: 'Practical personal finance' },
    benefit: { es: "Convierte dudas financieras cotidianas en decisiones apoyadas por herramientas.", en: "Turns everyday finance questions into actions supported by practical tools." },
    capabilities: { es: ["Calculadoras y guías útiles","Navegación por situaciones reales"], en: ["Calculators and useful guides","Navigation by real-life scenarios"] },
  },
  {
    id: 'pickfathom',
    name: 'PickFathom',
    domain: 'pickfathom.com',
    url: 'https://pickfathom.com/',
    group: 'editorial',
    // Repository-backed product; public site availability not independently verified yet.
    status: 'unverified',
    tags: ['Astro', 'React', 'Comparador'],
    description: {
      es: 'Producto web en desarrollo para comparar monitores con especificaciones de fabricantes, filtros y comparaciones independientes.',
      en: 'Early-stage product decision website with manufacturer-sourced monitor specs, filters and independent comparisons.',
    },
    highlight: { es: 'Tus prioridades. Tu elección.', en: 'Your priorities. Your pick.' },
    benefit: {
      es: 'Ayuda a evaluar diferencias concretas entre monitores sin rankings opacos ni precios inventados.',
      en: 'Helps shoppers evaluate concrete monitor tradeoffs without opaque rankings or fabricated prices.',
    },
    capabilities: {
      es: ['Catálogo inicial de tres monitores', 'Filtros y comparación lado a lado'],
      en: ['Initial three-monitor catalog', 'Filters and side-by-side comparison'],
    },
  },
  {
    id: 'ebano',
    name: 'El Rincón de Ébano',
    domain: 'elrincondeebano.com',
    url: 'https://www.elrincondeebano.com/',
    repo: 'https://github.com/cortega26/elrincondeebano',
    group: 'commerce',
    status: 'checked',
    tags: ['Astro', 'Catálogo', 'WhatsApp'],
    description: {
      es: 'Minimarket de proximidad con catálogo, promociones, carrito y pedidos coordinados por WhatsApp.',
      en: 'Neighborhood minimarket with an online catalog, offers, cart and WhatsApp-based ordering.',
    },
    highlight: { es: 'Comercio de proximidad', en: 'Neighborhood commerce' },
    benefit: { es: "Permite resolver compras cotidianas sin salir del edificio.", en: "Enables everyday shopping without leaving the building." },
    capabilities: { es: ["Catálogo, búsqueda y carrito","Pedidos coordinados por WhatsApp"], en: ["Catalog, search and cart","WhatsApp order handoff"] },
  },
  {
    id: 'casabea',
    name: 'Casa Bea',
    domain: 'casabea.cl',
    url: 'https://casabea.cl/',
    group: 'commerce',
    status: 'checked',
    tags: ['Astro', 'Panadería', 'WhatsApp'],
    description: {
      es: 'Vitrina y toma de pedidos para una panadería artesanal de roles de canela en Santiago.',
      en: 'Digital storefront and order flow for an artisan cinnamon-roll bakery in Santiago.',
    },
    highlight: { es: 'Hecho a mano, pedido en línea', en: 'Handmade goods, online ordering' },
    benefit: { es: "Transforma un producto artesanal en una experiencia clara de elección y pedido.", en: "Turns a handmade product into a clear digital browsing and ordering experience." },
    capabilities: { es: ["Fotografía y catálogo de productos","Pedido y cotización por WhatsApp"], en: ["Product imagery and catalog","WhatsApp orders and quotes"] },
  },
  {
    id: 'nohemi',
    name: 'Nohemi Palencia',
    domain: 'nohemipalencia.com',
    url: 'https://nohemipalencia.com/',
    repo: 'https://github.com/cortega26/nohemi-palencia',
    group: 'culture',
    status: 'checked',
    tags: ['Arte', 'Galería', 'Portafolio'],
    description: {
      es: 'Portafolio artístico y catálogo de obras de la pintora venezolana Nohemi Palencia Cisneros.',
      en: 'Artist portfolio and catalog of works by Venezuelan painter Nohemi Palencia Cisneros.',
    },
    highlight: { es: 'Una galería para la obra', en: 'A gallery for the work' },
    benefit: { es: "La obra y la identidad artística ocupan el centro de la experiencia.", en: "Artworks and artistic identity are the focus of the experience." },
    capabilities: { es: ["Galería visual y fichas de obras","Adaptación a móvil y exposición"], en: ["Artwork gallery and details","Mobile-first exhibition access"] },
  },
  {
    id: 'chile-hub',
    name: 'chile-hub',
    domain: 'tooltician.com/chile-hub',
    url: 'https://tooltician.com/chile-hub/',
    repo: 'https://github.com/cortega26/chile-hub',
    group: 'data',
    status: 'checked',
    tags: ['Python', 'DuckDB', 'Datos abiertos'],
    description: {
      es: 'Portal de datos públicos chilenos normalizados: catálogo, mapa, consultas SQL y descargas reproducibles.',
      en: 'Curated Chilean public-data portal with a catalog, maps, SQL exploration and reproducible downloads.',
    },
    highlight: { es: 'Datos listos para usar', en: 'Public data, ready to use' },
    benefit: { es: "Hace navegables y reutilizables conjuntos de datos públicos complejos.", en: "Makes complex public datasets explorable and reusable." },
    capabilities: { es: ["Catálogo y exploración de datos","Descargas y trazabilidad"], en: ["Data catalog and exploration","Downloads and provenance"] },
  },
  {
    id: 'tooltician',
    name: 'Tooltician',
    domain: 'tooltician.com',
    url: 'https://tooltician.com/',
    repo: 'https://github.com/cortega26/cortega26.github.io',
    group: 'studio',
    status: 'checked',
    tags: ['Astro', 'Bilingüe', 'Consultoría'],
    description: {
      es: 'Sitio profesional bilingüe sobre automatización Python, sistemas de datos y casos de trabajo verificables.',
      en: 'Bilingual professional site for Python automation, data systems and verifiable case studies.',
    },
    highlight: { es: 'Sistemas que perduran', en: 'Systems that last' },
    benefit: { es: "Presenta servicios técnicos mediante problemas reales y evidencia concreta.", en: "Presents technical services through real problems and evidence." },
    capabilities: { es: ["Portafolio y casos verificables","Servicio bilingüe y contacto"], en: ["Portfolio and verifiable cases","Bilingual service and contact"] },
  },
];

export const websiteGroups: WebsiteGroup[] = ['editorial', 'commerce', 'culture', 'data', 'studio'];
export const websiteGroupLabels: Record<'es' | 'en', Record<WebsiteGroup, string>> = {
  es: {
    editorial: 'Información y herramientas',
    commerce: 'Comercio y negocios',
    culture: 'Arte y cultura',
    data: 'Datos abiertos',
    studio: 'Marca profesional',
  },
  en: {
    editorial: 'Information and tools',
    commerce: 'Commerce and business',
    culture: 'Arts and culture',
    data: 'Open data',
    studio: 'Professional brand',
  },
};
