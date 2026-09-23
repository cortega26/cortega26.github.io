// Case-study records for the public work surfaces (home portfolio + work pages).
// Extracted from PortfolioSection.astro by Plan 029 so the same records feed the
// cards, the thematic groups (Plan 030), and JSON-LD (Plan 033).
//
// Evidence rule (audit 2026-09-23): every case declares the role Tooltician
// played and the month it was last verified. Do not add metrics that are not
// published elsewhere on the site, and do not invent verification dates.

export type CaseGroup = 'python-data' | 'web-apps' | 'cli-tools' | 'products';

export interface EvidenceChip {
  label: string;
  href?: string;
  type: 'star' | 'fork' | 'pypi' | 'store' | 'live' | 'ci' | 'metric';
}

export interface CaseLink {
  label: string;
  href: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  impact: string;
  impactSuffix?: string;
  summary: string;
  problem: string;
  solution: string;
  proof: string;
  tags: string[];
  filters: string[];
  tagType: 'accent' | 'teal' | 'warm' | 'neutral';
  links: CaseLink[];
  evidence?: EvidenceChip[];
  featured?: boolean;
  /** What Tooltician did on this project — derived from existing copy only. */
  role: string;
  /** Month the claim was last re-verified (YYYY-MM). */
  verifiedAt: string;
  group: CaseGroup;
  /** Localized service page for the "describe this problem" CTA. */
  serviceHref: string;
  confidential?: boolean;
  confidentialNote?: string;
}

export const groupOrder: CaseGroup[] = ['python-data', 'web-apps', 'cli-tools', 'products'];

export const groupLabels: Record<'en' | 'es', Record<CaseGroup, string>> = {
  en: {
    'python-data': 'Python & Data',
    'web-apps': 'Web & Apps',
    'cli-tools': 'CLI & Tools',
    products: 'Products & Extensions',
  },
  es: {
    'python-data': 'Python y Datos',
    'web-apps': 'Web y Apps',
    'cli-tools': 'CLI y Herramientas',
    products: 'Productos y Extensiones',
  },
};

const projectsEN: CaseStudy[] = [
  {
    id: 'ebano',
    role: 'Designed, built, and maintains',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/en/services/static-sites/',
    title: 'El Rincón de Ébano',
    impact: 'Live at elrincondeebano.com · Private residential marketplace',
    impactSuffix: 'Private residential marketplace',
    summary: '100+ SKU storefront handling daily orders for a live private-community business.',
    problem: 'Residents needed a private ordering flow that felt simpler than informal chat-based purchasing.',
    solution: 'Designed and run an Astro storefront with product filtering, bundle promotions, a real-time cart, and WhatsApp checkout.',
    proof: '100+ SKUs, daily transactions, and ongoing operator maintenance in production. This is not a demo.',
    tags: ['Astro', 'E-commerce', 'Vite'],
    filters: ['web'],
    tagType: 'teal',
    featured: true,
    evidence: [
      { label: 'Live', href: 'https://elrincondeebano.com', type: 'live' },
      { label: 'Daily orders', type: 'metric' },
      { label: '100+ SKUs', type: 'metric' },
    ],
    links: [
      { label: 'Visit live site', href: 'https://elrincondeebano.com' },
      { label: 'View repository', href: 'https://github.com/cortega26/elrincondeebano' },
      { label: 'Web technical hygiene', href: '/en/services/web-technical-hygiene/' },
    ],
  },
  {
    id: 'portfolio-manager-unified',
    role: 'Designed and built',
    verifiedAt: '2026-09',
    group: 'products',
    serviceHref: '/en/services/internal-tools/',
    title: 'Portfolio Manager',
    impact: 'Electron + React + Fastify + SQLite · Desktop-first portfolio tracker',
    impactSuffix: 'Desktop-first portfolio tracker',
    summary: 'Desktop-first portfolio manager with local persistence, trust metadata, provider failover, and bilingual UI.',
    problem: 'Many portfolio tools push users into the cloud, hide pricing trust signals, or treat review workflows and financial math as afterthoughts.',
    solution: 'Built an Electron app with a Fastify API, SQLite storage, per-launch session auth, a decimal.js finance engine, provider fallback chains, and benchmark-aware review workflows.',
    proof: '1,470+ node:test assertions, 90+ Vitest tests, Playwright, mutation testing, and a 13-step CI pipeline covering lint, typecheck, quality, coverage, and audit gates.',
    tags: ['Electron', 'Fastify', 'SQLite'],
    filters: ['web', 'data'],
    tagType: 'warm',
    featured: true,
    evidence: [
      { label: 'CI ✓', href: 'https://github.com/cortega26/portfolio-manager-server/actions', type: 'ci' },
      { label: '1,470+ tests', type: 'metric' },
    ],
    links: [
      { label: 'View repository', href: 'https://github.com/cortega26/portfolio-manager-server' },
    ],
  },
  {
    id: 'chile-hub',
    role: 'Built and maintains',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/en/services/python-automation/',
    title: 'chile-hub',
    impact: 'Published data pipelines & CLI',
    impactSuffix: 'Published data pipelines & CLI',
    summary: 'A curated, reproducible data layer that normalizes and validates Chilean public datasets into single-line imports.',
    problem: 'Public datasets in Chile are fragmented, inconsistently formatted (e.g., variable-length CUT codes), and prone to silent upstream changes.',
    solution: 'Built an automated pipeline that extracts, sanitizes, and verifies geography, demography, and health data, exporting optimized Parquet, DuckDB, and JSON builds with loud-failing invariants.',
    proof: 'Almost 60 GitHub stars, fully automated CI/CD pipeline, CLI/API package, and a public static dashboard with verified datasets.',
    tags: ['Python', 'DuckDB', 'Data Pipelines', 'Parquet'],
    filters: ['python', 'data'],
    tagType: 'accent',
    featured: true,
    evidence: [
      { label: 'DuckDB + Parquet', type: 'metric' },
      { label: 'CI/CD Pipeline', type: 'ci' },
    ],
    links: [
      { label: 'View GitHub', href: 'https://github.com/cortega26/chile-hub' },
      { label: 'Python Automation', href: '/en/services/python-automation/' },
    ],
  },
  {
    id: 'monedario',
    role: 'Built and operates',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/en/services/static-sites/',
    title: 'Monedario',
    impact: 'Live at monedario.cl · Chilean personal finance platform',
    impactSuffix: 'Chilean personal finance platform',
    summary: 'Free public finance product with live Chilean indicators and practical calculators.',
    problem: 'Reliable finance guidance in Chile is often fragmented, paywalled, or too technical for normal users.',
    solution: 'Built a public Astro platform with calculators, nine guide categories, and live economic indicators.',
    proof: 'Live product, updated in 2026, with no ads or paywalls.',
    tags: ['Astro', 'TypeScript', 'Finance'],
    filters: ['web', 'data'],
    tagType: 'teal',
    featured: true,
    evidence: [
      { label: 'Live', href: 'https://monedario.cl', type: 'live' },
      { label: 'No ads · No paywalls', type: 'metric' },
    ],
    links: [
      { label: 'Visit live site', href: 'https://monedario.cl' },
      { label: 'Web technical hygiene', href: '/en/services/web-technical-hygiene/' },
    ],
  },
  {
    id: 'stop-spam-linkedin',
    role: 'Built and publishes',
    verifiedAt: '2026-09',
    group: 'products',
    serviceHref: '/en/services/static-sites/',
    title: 'LinkedIn Spam Blocker',
    impact: 'Chrome Web Store + Firefox Add-ons · Local-only browser extension',
    impactSuffix: 'Local-only browser extension',
    summary: 'Browser extension that hides LinkedIn engagement-bait spam locally, with no telemetry, remote blocklists, or network requests.',
    problem: 'LinkedIn engagement-bait posts crowd useful hiring, industry, and work updates, while platform reporting often leaves the pattern untouched.',
    solution: 'Built a Chrome and Firefox extension that scans supported LinkedIn pages locally, hides matching spam patterns, and gives users language toggles, custom phrases, whitelists, snooze, and false-positive recovery.',
    proof: 'Published in the Chrome Web Store and Firefox Add-ons with packaged releases, CI, a public privacy policy, and a zero-network design.',
    tags: ['JavaScript', 'Browser Extension', 'Privacy'],
    filters: ['web'],
    tagType: 'warm',
    evidence: [
      { label: 'Chrome Store', href: 'https://chromewebstore.google.com/detail/linkedin-spam-blocker/eolknfnafdodmaaajdiidaanpjbfolfc', type: 'store' },
      { label: 'Firefox Add-ons', href: 'https://addons.mozilla.org/addon/linkedin-spam-blocker/', type: 'store' },
      { label: 'CI ✓', href: 'https://github.com/cortega26/stop-spam-linkedin/actions', type: 'ci' },
    ],
    links: [
      { label: 'View GitHub', href: 'https://github.com/cortega26/stop-spam-linkedin' },
      { label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/linkedin-spam-blocker/eolknfnafdodmaaajdiidaanpjbfolfc' },
      { label: 'Firefox Add-ons', href: 'https://addons.mozilla.org/addon/linkedin-spam-blocker/' },
    ],
  },
  {
    id: 'conciliador',
    role: 'Built and publishes',
    verifiedAt: '2026-09',
    group: 'cli-tools',
    serviceHref: '/en/services/financial-tooling/',
    title: 'Conciliador Bancario',
    impact: 'Published on PyPI · Fail-closed audit automation',
    impactSuffix: 'Published on PyPI · Fail-closed audit automation',
    summary: 'Audit-grade reconciliation tool that stops on mismatches instead of masking them.',
    problem: 'Reconciliation tools often optimize for convenience even when the underlying data does not actually match.',
    solution: 'Built a Python tool that stops on mismatches, produces deterministic outputs, and keeps append-only audit logs rather than silently producing a wrong result.',
    proof: 'Published on PyPI with reproducible installation and a traceable record of every run.',
    tags: ['Python', 'CLI', 'Audit'],
    filters: ['python', 'cli'],
    tagType: 'accent',
    evidence: [
      { label: 'PyPI', href: 'https://pypi.org/project/bankrecon/', type: 'pypi' },
    ],
    links: [
      { label: 'View GitHub', href: 'https://github.com/cortega26/conciliador_bancario' },
      { label: 'View package', href: 'https://pypi.org/project/bankrecon/' },
    ],
  },
  {
    id: 'rutificador',
    role: 'Built and publishes',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/en/services/python-automation/',
    title: 'Rutificador',
    impact: 'Published on PyPI',
    impactSuffix: 'Published on PyPI',
    summary: 'Published Python package teams can drop into forms, ETL jobs, and batch workflows.',
    problem: 'Teams processing Chilean IDs need consistent validation and normalization instead of re-implementing edge cases.',
    solution: 'Published a Python library and CLI with clean install paths, CI, and CodeQL-backed maintenance.',
    proof: 'Installable on PyPI and usable inside scripted and pipeline-oriented workflows.',
    tags: ['Python', 'PyPI', 'CLI'],
    filters: ['python', 'cli'],
    tagType: 'accent',
    evidence: [
      { label: 'PyPI', href: 'https://pypi.org/project/rutificador/', type: 'pypi' },
      { label: 'CI ✓', href: 'https://github.com/cortega26/rutificador/actions', type: 'ci' },
      { label: 'CodeQL ✓', type: 'ci' },
    ],
    links: [
      { label: 'View GitHub', href: 'https://github.com/cortega26/rutificador' },
      { label: 'View package', href: 'https://pypi.org/project/rutificador/' },
    ],
  },
  {
    id: 'dnspect',
    role: 'Built',
    verifiedAt: '2026-09',
    group: 'cli-tools',
    serviceHref: '/en/services/internal-tools/',
    title: 'DNSpect',
    impact: 'DNS benchmarking with statistical rigor',
    impactSuffix: 'DNS benchmarking with statistical rigor',
    summary: 'Percentile-based DNS benchmarking stack built for analysis, not demo-friendly averages.',
    problem: 'Resolver comparisons often rely on single averages that hide distribution and outlier behavior.',
    solution: 'Built a TypeScript CLI, FastAPI backend, and React dashboard around percentile-based benchmarking.',
    proof: 'Technical framing centers statistical rigor instead of demo-friendly averages.',
    tags: ['TypeScript', 'FastAPI', 'React'],
    filters: ['python', 'web'],
    tagType: 'warm',
    links: [
      { label: 'View repository', href: 'https://github.com/cortega26/DNSpect' },
    ],
  },
  {
    id: 'polla',
    role: 'Built and operates',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/en/services/recurring-data-collection/',
    title: 'Jackpot Data Pipeline',
    impact: 'Recurring production pipeline',
    impactSuffix: 'Recurring production pipeline',
    summary: 'Recurring scrape-to-sheets pipeline that removes manual lottery result updates.',
    problem: 'Lottery result sources are volatile, making manual updates brittle and time-consuming.',
    solution: 'Automated scraping, normalization, and Google Sheets publishing on a recurring schedule.',
    proof: 'Production pipeline with GitHub visibility and outputs designed for repeat use.',
    tags: ['Python', 'Scraping', 'Google Sheets'],
    filters: ['python', 'data'],
    tagType: 'accent',
    evidence: [
      { label: 'Production', type: 'live' },
    ],
    links: [
      { label: 'View repository', href: 'https://github.com/cortega26/polla' },
      { label: 'Read docs', href: 'https://github.com/cortega26/polla#readme' },
    ],
  },
  {
    id: 'noticiencias',
    role: 'Built and operates',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/en/services/static-sites/',
    title: 'Noticiencias',
    impact: 'Live at noticiencias.com · Spanish-language science media, 8 disciplines',
    impactSuffix: 'Spanish-language science media, 8 disciplines',
    summary: 'Live science publication with eight SEO-structured categories and readable editorial architecture.',
    problem: 'Science content sites often trade clarity for volume and lose structure as categories grow.',
    solution: 'Built an Astro editorial platform with category governance, source tracking, and methodology documentation.',
    proof: 'Live publication covering 8 disciplines with SEO-focused content architecture and RSS.',
    tags: ['Astro', 'SEO', 'Accessibility'],
    filters: ['web'],
    tagType: 'teal',
    evidence: [
      { label: 'Live', href: 'https://noticiencias.com', type: 'live' },
      { label: '8 categories', type: 'metric' },
    ],
    links: [
      { label: 'Visit live site', href: 'https://noticiencias.com' },
      { label: 'View repository', href: 'https://github.com/cortega26/noticiencias' },
    ],
  },
]

const projectsES: CaseStudy[] = [
  {
    id: 'ebano',
    role: 'Diseño, construcción y operación continua',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/es/servicios/sitios-web/',
    title: 'El Rincón de Ébano',
    impact: 'Activo en elrincondeebano.com · Minimarket residencial privado',
    impactSuffix: 'Minimarket residencial privado',
    summary: 'Tienda con más de 100 SKUs y pedidos diarios operada como negocio real dentro de una comunidad privada.',
    problem: 'La comunidad necesitaba un flujo de compra privado más claro y ordenado que coordinar todo por chat.',
    solution: 'Diseñé y opero una tienda Astro con filtrado de productos, promociones por combo, carrito en tiempo real y checkout por WhatsApp.',
    proof: 'Más de 100 SKUs, transacciones diarias y mantención activa en producción. Esto no es una demo.',
    tags: ['Astro', 'E-commerce', 'Vite'],
    filters: ['web'],
    tagType: 'teal',
    featured: true,
    evidence: [
      { label: 'Activo', href: 'https://elrincondeebano.com', type: 'live' },
      { label: 'Pedidos diarios', type: 'metric' },
      { label: '100+ SKUs', type: 'metric' },
    ],
    links: [
      { label: 'Ver sitio', href: 'https://elrincondeebano.com' },
      { label: 'Ver repositorio', href: 'https://github.com/cortega26/elrincondeebano' },
      { label: 'Mantención técnica web', href: '/es/servicios/higiene-tecnica-web/' },
    ],
  },
  {
    id: 'portfolio-manager-unified',
    role: 'Diseño y construcción',
    verifiedAt: '2026-09',
    group: 'products',
    serviceHref: '/es/servicios/herramientas-internas/',
    title: 'Portfolio Manager',
    impact: 'Electron + React + Fastify + SQLite · Gestor de portafolio desktop-first',
    impactSuffix: 'Gestor de portafolio desktop-first',
    summary: 'Gestor de portafolio desktop-first con persistencia local, metadata de confianza, fallback de proveedores e interfaz bilingüe.',
    problem: 'Muchas herramientas de portafolio empujan al usuario a la nube, esconden señales de confianza de precios o tratan los flujos de revisión y la matemática financiera como algo secundario.',
    solution: 'Construí una app Electron con API Fastify, almacenamiento SQLite, autenticación de sesión por lanzamiento, motor financiero con decimal.js, cadenas de fallback de proveedores y revisión guiada contra benchmarks.',
    proof: '1,470+ asserts con node:test, 90+ pruebas Vitest, Playwright, mutation testing y pipeline CI de 13 etapas con lint, typecheck, quality, coverage y audit gates.',
    tags: ['Electron', 'Fastify', 'SQLite'],
    filters: ['web', 'data'],
    tagType: 'warm',
    featured: true,
    evidence: [
      { label: 'CI ✓', href: 'https://github.com/cortega26/portfolio-manager-server/actions', type: 'ci' },
      { label: '1.470+ tests', type: 'metric' },
    ],
    links: [
      { label: 'Ver repositorio', href: 'https://github.com/cortega26/portfolio-manager-server' },
    ],
  },
  {
    id: 'chile-hub',
    role: 'Construcción y mantención',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/es/servicios/automatizacion-python/',
    title: 'chile-hub',
    impact: 'Pipelines de datos y CLI publicados',
    impactSuffix: 'Pipelines de datos y CLI publicados',
    summary: 'Una capa de datos curada y reproducible que normaliza y valida datasets públicos de Chile para consumo en una sola línea.',
    problem: 'Los datos públicos chilenos están fragmentados, con formatos inconsistentes (ej. códigos CUT truncados) y propensos a cambios silenciosos de origen.',
    solution: 'Construí un pipeline automatizado que extrae, sanitiza y verifica datos de geografía, demografía y salud, exportando archivos optimizados en Parquet, DuckDB y JSON con alertas ante anomalías.',
    proof: 'Casi 60 estrellas en GitHub, pipeline de CI/CD automatizado, CLI/API en Python y un dashboard estático público con datasets verificados.',
    tags: ['Python', 'DuckDB', 'Pipelines de Datos', 'Parquet'],
    filters: ['python', 'data'],
    tagType: 'accent',
    featured: true,
    evidence: [
      { label: 'DuckDB + Parquet', type: 'metric' },
      { label: 'Pipeline CI/CD', type: 'ci' },
    ],
    links: [
      { label: 'Ver GitHub', href: 'https://github.com/cortega26/chile-hub' },
      { label: 'Automatización Python', href: '/es/servicios/automatizacion-python/' },
    ],
  },
  {
    id: 'monedario',
    role: 'Construcción y operación',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/es/servicios/sitios-web/',
    title: 'Monedario',
    impact: 'Activo en monedario.cl · Plataforma de finanzas personales para Chile',
    impactSuffix: 'Plataforma de finanzas personales para Chile',
    summary: 'Producto público y gratuito con indicadores chilenos en vivo y calculadoras prácticas.',
    problem: 'La orientación financiera confiable en Chile suele estar fragmentada, detrás de paywalls o escrita para especialistas.',
    solution: 'Construí una plataforma pública en Astro con calculadoras, nueve categorías de guías e indicadores económicos en tiempo real.',
    proof: 'Producto activo, actualizado en 2026, sin publicidad ni paywalls.',
    tags: ['Astro', 'TypeScript', 'Finanzas'],
    filters: ['web', 'data'],
    tagType: 'teal',
    featured: true,
    evidence: [
      { label: 'Activo', href: 'https://monedario.cl', type: 'live' },
      { label: 'Sin publicidad', type: 'metric' },
    ],
    links: [
      { label: 'Ver sitio', href: 'https://monedario.cl' },
      { label: 'Mantención técnica web', href: '/es/servicios/higiene-tecnica-web/' },
    ],
  },
  {
    id: 'stop-spam-linkedin',
    role: 'Construcción y publicación',
    verifiedAt: '2026-09',
    group: 'products',
    serviceHref: '/es/servicios/sitios-web/',
    title: 'LinkedIn Spam Blocker',
    impact: 'Chrome Web Store + Firefox Add-ons · Extensión local para navegador',
    impactSuffix: 'Extensión local para navegador',
    summary: 'Extensión de navegador que oculta spam de engagement-bait en LinkedIn de forma local, sin telemetría, blocklists remotas ni requests de red.',
    problem: 'Las publicaciones de engagement-bait en LinkedIn desplazan contenido útil de trabajo e industria, y el flujo de reporte de la plataforma muchas veces no corrige el patrón.',
    solution: 'Construí una extensión para Chrome y Firefox que analiza páginas soportadas de LinkedIn localmente, oculta patrones de spam y deja al usuario afinar idiomas, frases propias, whitelist, snooze y recuperación de falsos positivos.',
    proof: 'Publicada en Chrome Web Store y Firefox Add-ons con releases empaquetados, CI, política de privacidad pública y diseño sin tráfico de red.',
    tags: ['JavaScript', 'Browser Extension', 'Privacy'],
    filters: ['web'],
    tagType: 'warm',
    evidence: [
      { label: 'Chrome Store', href: 'https://chromewebstore.google.com/detail/linkedin-spam-blocker/eolknfnafdodmaaajdiidaanpjbfolfc', type: 'store' },
      { label: 'Firefox Add-ons', href: 'https://addons.mozilla.org/addon/linkedin-spam-blocker/', type: 'store' },
      { label: 'CI ✓', href: 'https://github.com/cortega26/stop-spam-linkedin/actions', type: 'ci' },
    ],
    links: [
      { label: 'Ver GitHub', href: 'https://github.com/cortega26/stop-spam-linkedin' },
      { label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/linkedin-spam-blocker/eolknfnafdodmaaajdiidaanpjbfolfc' },
      { label: 'Firefox Add-ons', href: 'https://addons.mozilla.org/addon/linkedin-spam-blocker/' },
    ],
  },
  {
    id: 'conciliador',
    role: 'Construcción y publicación',
    verifiedAt: '2026-09',
    group: 'cli-tools',
    serviceHref: '/es/servicios/herramientas-financieras/',
    title: 'Conciliador Bancario',
    impact: 'Publicado en PyPI · Automatización de auditoría fail-closed',
    impactSuffix: 'Publicado en PyPI · Automatización de auditoría fail-closed',
    summary: 'Herramienta de conciliación para auditoría que se detiene ante diferencias en vez de esconderlas.',
    problem: 'Muchas herramientas de conciliación priorizan la comodidad incluso cuando los datos base no cuadran realmente.',
    solution: 'Construí una herramienta Python que se detiene ante diferencias, genera salidas deterministas y conserva logs append-only en lugar de producir silenciosamente un resultado incorrecto.',
    proof: 'Publicado en PyPI con instalación reproducible y trazabilidad por ejecución.',
    tags: ['Python', 'CLI', 'Auditoría'],
    filters: ['python', 'cli'],
    tagType: 'accent',
    evidence: [
      { label: 'PyPI', href: 'https://pypi.org/project/bankrecon/', type: 'pypi' },
    ],
    links: [
      { label: 'Ver GitHub', href: 'https://github.com/cortega26/conciliador_bancario' },
      { label: 'Ver paquete', href: 'https://pypi.org/project/bankrecon/' },
    ],
  },
  {
    id: 'rutificador',
    role: 'Construcción y publicación',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/es/servicios/automatizacion-python/',
    title: 'Rutificador',
    impact: 'Publicado en PyPI',
    impactSuffix: 'Publicado en PyPI',
    summary: 'Paquete Python publicado que un equipo puede integrar de inmediato en formularios, ETL y procesos batch.',
    problem: 'Los equipos que procesan RUTs chilenos necesitan validación y normalización consistentes, no reimplementar edge cases.',
    solution: 'Publiqué una librería Python y CLI con instalación limpia, CI y mantenimiento respaldado por CodeQL.',
    proof: 'Disponible en PyPI y usable dentro de flujos automatizados y pipelines.',
    tags: ['Python', 'PyPI', 'CLI'],
    filters: ['python', 'cli'],
    tagType: 'accent',
    evidence: [
      { label: 'PyPI', href: 'https://pypi.org/project/rutificador/', type: 'pypi' },
      { label: 'CI ✓', href: 'https://github.com/cortega26/rutificador/actions', type: 'ci' },
      { label: 'CodeQL ✓', type: 'ci' },
    ],
    links: [
      { label: 'Ver GitHub', href: 'https://github.com/cortega26/rutificador' },
      { label: 'Ver paquete', href: 'https://pypi.org/project/rutificador/' },
    ],
  },
  {
    id: 'dnspect',
    role: 'Construcción',
    verifiedAt: '2026-09',
    group: 'cli-tools',
    serviceHref: '/es/servicios/herramientas-internas/',
    title: 'DNSpect',
    impact: 'Benchmarking DNS con rigor estadístico',
    impactSuffix: 'Benchmarking DNS con rigor estadístico',
    summary: 'Stack de benchmarking DNS basado en percentiles, pensado para análisis serio y no para promedios engañosos.',
    problem: 'Las comparaciones entre resolvers suelen apoyarse en promedios simples que esconden distribución y outliers.',
    solution: 'Construí un CLI TypeScript, backend FastAPI y dashboard React alrededor de benchmarking basado en percentiles.',
    proof: 'El enfoque técnico prioriza rigor estadístico por encima de resultados fáciles de vender.',
    tags: ['TypeScript', 'FastAPI', 'React'],
    filters: ['python', 'web'],
    tagType: 'warm',
    links: [
      { label: 'Ver repositorio', href: 'https://github.com/cortega26/DNSpect' },
    ],
  },
  {
    id: 'polla',
    role: 'Construcción y operación',
    verifiedAt: '2026-09',
    group: 'python-data',
    serviceHref: '/es/servicios/recoleccion-recurrente-datos/',
    title: 'Pipeline de Datos de Lotería',
    impact: 'Pipeline de producción recurrente',
    impactSuffix: 'Pipeline de producción recurrente',
    summary: 'Pipeline recurrente de scraping a Google Sheets que elimina la actualización manual de resultados.',
    problem: 'Las fuentes de resultados de lotería cambian con facilidad y vuelven frágiles las actualizaciones manuales.',
    solution: 'Automaticé scraping, normalización y publicación en Google Sheets con ejecución recurrente.',
    proof: 'Pipeline de producción con visibilidad en GitHub y salidas pensadas para uso repetido.',
    tags: ['Python', 'Scraping', 'Google Sheets'],
    filters: ['python', 'data'],
    tagType: 'accent',
    evidence: [
      { label: 'Producción', type: 'live' },
    ],
    links: [
      { label: 'Ver repositorio', href: 'https://github.com/cortega26/polla' },
      { label: 'Leer docs', href: 'https://github.com/cortega26/polla#readme' },
    ],
  },
  {
    id: 'noticiencias',
    role: 'Construcción y operación',
    verifiedAt: '2026-09',
    group: 'web-apps',
    serviceHref: '/es/servicios/sitios-web/',
    title: 'Noticiencias',
    impact: 'Activo en noticiencias.com · Divulgación científica en español, 8 disciplinas',
    impactSuffix: 'Divulgación científica en español, 8 disciplinas',
    summary: 'Publicación científica activa con ocho categorías vivas y arquitectura editorial pensada para SEO y lectura.',
    problem: 'Los sitios de divulgación suelen perder claridad y estructura cuando las categorías crecen.',
    solution: 'Construí una plataforma editorial en Astro con gobernanza por categoría, rastreo de fuentes y documentación metodológica.',
    proof: 'Publicación activa en 8 disciplinas con arquitectura de contenido orientada a SEO y RSS.',
    tags: ['Astro', 'SEO', 'Accesibilidad'],
    filters: ['web'],
    tagType: 'teal',
    evidence: [
      { label: 'Activo', href: 'https://noticiencias.com', type: 'live' },
      { label: '8 categorías', type: 'metric' },
    ],
    links: [
      { label: 'Ver sitio', href: 'https://noticiencias.com' },
      { label: 'Ver repositorio', href: 'https://github.com/cortega26/noticiencias' },
    ],
  },
]

export const filterLabels = {
  en: {
    all: 'All',
    python: 'Python',
    web: 'Web / Apps',
    cli: 'CLI / Tools',
    data: 'Data',
    label: 'Filter',
    problem: 'Why it mattered',
    solution: 'Built',
    proof: 'Verified result',
  },
  es: {
    all: 'Todos',
    python: 'Python',
    web: 'Web / Apps',
    cli: 'CLI / Herramientas',
    data: 'Datos',
    label: 'Filtrar',
    problem: 'Por qué importó',
    solution: 'Construido',
    proof: 'Resultado verificable',
  },
};

export const repoMap: Record<string, string> = {
  'ebano': 'elrincondeebano',
  'portfolio-manager-unified': 'portfolio-manager-server',
  'chile-hub': 'chile-hub',
  'monedario': 'Monedario',
  'stop-spam-linkedin': 'stop-spam-linkedin',
  'conciliador': 'conciliador_bancario',
  'rutificador': 'rutificador',
  'dnspect': 'DNSpect',
  'polla': 'polla',
  'noticiencias': 'noticiencias',
};

export const casesByLocale: Record<'en' | 'es', CaseStudy[]> = {
  en: projectsEN,
  es: projectsES,
};

/** Cases in the order the work page renders them (thematic groups). */
export function orderedCasesForWork(lang: 'en' | 'es'): CaseStudy[] {
  return groupOrder.flatMap((group) => casesByLocale[lang].filter((item) => item.group === group));
}
