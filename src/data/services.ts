// Single source of truth for productized service landing pages.
// Mirrors the siteDocuments.ts pattern: typed, bilingual content records.
// Each service renders through src/components/ServicePage.astro via thin
// per-locale route files under /en/services/<slug>/ and /es/servicios/<slug>/.

export type ServiceLocale = 'en' | 'es';

export interface ServicePricingTier {
  priceLabel: string; // "From $1,500" / "Desde 30 UF"
  priceApprox: string; // "one-time" / "por proyecto"
  name: string;
  intro: string;
  note?: string;
  items: string[];
  recommended?: boolean;
}

export interface ServiceRelatedLink {
  label: string;
  href: string;
  accent?: boolean;
}

export interface ServiceContent {
  // <head>
  title: string;
  description: string;
  serviceName: string;
  serviceType: string[];
  // hero
  eyebrow: string;
  h1: string;
  lede: string;
  subcopy?: string;
  ctaPrimary: string;
  ctaSecondary: string;
  microcopy?: string;
  // summary aside
  fitEyebrow: string;
  fitItems: string[];
  signalsEyebrow: string;
  signals: { label: string; accent?: boolean }[];
  entryEyebrow: string;
  entryPrice: string;
  entryCaption: string;
  availabilityEyebrow: string;
  availability: string;
  // problem
  problemEyebrow: string;
  problemTitle: string;
  problemSubtitle: string;
  problemCards: { title: string; body: string }[];
  // scope / approach
  scopeEyebrow: string;
  scopeTitle: string;
  scopeSubtitle: string;
  scopeNote?: { label: string; body: string };
  reviewGroups: { title: string; items: string[] }[];
  // process
  processEyebrow: string;
  processTitle: string;
  processSubtitle: string;
  processSteps: [string, string, string][]; // num, title, body
  // plans
  plansEyebrow: string;
  plansTitle: string;
  plansSubtitle: string;
  plans: ServicePricingTier[];
  tableFeatures: [string, ...boolean[]][];
  pricingNote: string;
  // why
  whyEyebrow: string;
  whyTitle: string;
  whySubtitle: string;
  whyAltLabel: string;
  whyAltItems: string[];
  whyUsLabel: string;
  whyUsItems: string[];
  whyNote?: { label: string; body: string };
  // use cases
  casesEyebrow: string;
  casesTitle: string;
  casesSubtitle: string;
  cases: [string, string][]; // title, body
  relatedLabel: string;
  related: ServiceRelatedLink[];
  // faq
  faqEyebrow: string;
  faqTitle: string;
  faqs: [string, string][];
  // contact
  contactEyebrow: string;
  contactTitle: string;
  contactSubtitle: string;
  contactCardTitle: string;
  contactCardBody: string;
  contactRiskNote?: string;
  contactCallLabel: string;
  intakeHeading: string;
  intents: { tag: string; body: string }[];
  outreach?: string;
}

export interface ServiceDefinition {
  slugEn: string;
  slugEs: string;
  serviceKey: string; // IntakeForm `service` value
  areaServed: string[];
  en: ServiceContent;
  es: ServiceContent;
}

const pythonAutomation: ServiceDefinition = {
  slugEn: 'python-automation',
  slugEs: 'automatizacion-python',
  serviceKey: 'automation',
  areaServed: ['US', 'GB', 'EU', 'LATAM'],
  en: {
    title: 'Python Automation & Data Pipelines | Tooltician',
    description:
      'Scheduled, reproducible Python automation: ETL pipelines, scrapers, and reporting flows built to keep running. Scoped, documented, and handoff-ready.',
    serviceName: 'Python Automation & Data Pipelines',
    serviceType: ['Python automation', 'ETL pipeline development', 'Web scraping', 'Reporting automation'],
    eyebrow: 'Python Automation · Tooltician',
    h1: 'Python automation that keeps running after you stop watching it',
    lede: 'I replace recurring manual data work — report assembly, fragile scrapes, copy-paste delivery — with scheduled, reproducible pipelines that emit the same answer every time and are documented for the next person to operate.',
    subcopy:
      'All deliverables are in English. You get a production-minded system with tests, logging, and a runbook — not a script that only the author can run.',
    ctaPrimary: 'Scope my automation — from $290',
    ctaSecondary: "See what's included",
    microcopy:
      'Fixed scope, not open-ended hours. Every engagement starts with a free 15-minute call to confirm fit before any quote.',
    fitEyebrow: 'Typical fit',
    fitItems: [
      'Ops-heavy teams with a known recurring bottleneck already affecting work.',
      'Founders who need a scoped build, not a permanent embedded data team.',
      'Teams that value a written handoff over a person who becomes a dependency.',
    ],
    signalsEyebrow: 'Built for production',
    signals: [
      { label: 'Tests & CI', accent: true },
      { label: 'Logging & retries', accent: true },
      { label: 'README + runbook' },
      { label: 'Failure alerts' },
    ],
    entryEyebrow: 'Entry point',
    entryPrice: '$290',
    entryCaption: 'Automation scoping. Applied as credit toward any build.',
    availabilityEyebrow: 'Availability',
    availability: '2–3 new builds per month. Response within 24–48 business hours.',
    problemEyebrow: 'Problem',
    problemTitle: 'The work runs, but only because someone keeps doing it by hand',
    problemSubtitle:
      'Most operational data work is invisible until the person who runs it is on holiday, leaves, or makes one quiet mistake. The cost is real but rarely measured.',
    problemCards: [
      {
        title: 'What typically happens',
        body: 'A report is assembled by hand every week, a scraper breaks silently when a page changes, numbers are copied between systems, and the whole thing depends on one person remembering the steps. It works — until it does not, usually at the worst possible time.',
      },
      {
        title: 'The real asymmetry',
        body: 'Manual workflows feel cheap because the cost is hidden in people-hours and absorbed errors. A scoped automation costs far less over a year than the recurring time, the silent mistakes, and the key-person risk of leaving it manual.',
      },
    ],
    scopeEyebrow: 'Approach',
    scopeTitle: 'Built around the workflow, not just the code',
    scopeSubtitle:
      'Before anything is written, the engagement goes through a scope pass — inputs, outputs, owner, failure modes, and handoff target. What gets built is a system the next person can run, diagnose, and extend.',
    scopeNote: {
      label: 'What this is not',
      body: 'This is not open-ended product development, real-time streaming infrastructure, a data-warehouse standup, or ML model development. It is scoped, reliable automation of work you already do.',
    },
    reviewGroups: [
      {
        title: 'ETL & workflow automation',
        items: [
          'Scheduled, reproducible pipelines with the same output every run.',
          'Source extraction, transformation, and structured loading.',
          'Idempotent runs that can be re-executed safely.',
          'Clear separation of config, secrets, and logic.',
        ],
      },
      {
        title: 'Scraping & data acquisition',
        items: [
          'Resilient collection built for recurring production use, not a demo.',
          'Retries, backoff, and graceful handling of layout changes.',
          'Logging and alerts when a source breaks or drifts.',
          'Respectful, maintainable extraction with documented assumptions.',
        ],
      },
      {
        title: 'Reporting & data delivery',
        items: [
          'Structured outputs, exports, or dashboards that remove copy-paste.',
          'Scheduled delivery to the place the team actually reads.',
          'Deterministic numbers that reconcile across runs.',
          'Documentation so downstream use stays predictable.',
        ],
      },
    ],
    processEyebrow: 'Process',
    processTitle: 'How an automation build works',
    processSubtitle:
      'Designed to be concrete from the first step: lock the scope, build the smallest coherent system, and leave it documented enough to run without me.',
    processSteps: [
      ['01', 'Free diagnostic call', 'A 15-minute call to confirm the problem is a fit and worth automating. No charge, no obligation.'],
      ['02', 'Automation scoping', 'A short paid discovery that locks inputs, outputs, owner, failure modes, and success criteria — agreed in writing. The fee is credited toward the build.'],
      ['03', 'Scoped build', 'Implementation with visible progress in GitHub, tests, logging, and pragmatic tradeoffs documented instead of surprise scope creep.'],
      ['04', 'Handoff', 'README, runbook, setup steps, and the failure points worth watching — so the next person can run, debug, and extend it without me on a call.'],
    ],
    plansEyebrow: 'Plans & pricing',
    plansTitle: 'A clear scope at each step, from first pipeline to ongoing upkeep',
    plansSubtitle:
      'The natural entry point is Automation Scoping ($290, credited toward the build). Most teams start with a Scoped Build for one flow, then add a Stabilization Retainer once the system is load-bearing.',
    plans: [
      {
        priceLabel: 'From $290',
        priceApprox: 'credited to build',
        name: 'Automation Scoping',
        intro: 'A written scope before any build: inputs, outputs, owner, failure modes, and success criteria.',
        note: 'Fee credited toward any build that follows.',
        items: ['Free 15-min diagnostic call', 'Written scope document', 'Fixed-price build quote', 'Credited toward the build'],
      },
      {
        priceLabel: 'From $1,500',
        priceApprox: 'one-time',
        name: 'Scoped Automation Build',
        intro: 'One pipeline, scraper, or reporting flow built to production standards and handed off cleanly.',
        note: 'Most common starting point.',
        recommended: true,
        items: ['Everything in Scoping', 'One flow built end-to-end', 'Tests, logging, CI/schedule', 'Failure alerts', 'README + runbook handoff'],
      },
      {
        priceLabel: 'From $3,200',
        priceApprox: 'one-time',
        name: 'Multi-source Data System',
        intro: 'Several sources extracted, orchestrated, monitored, and delivered as one coherent system.',
        items: ['Everything in Scoped Build', 'Multiple sources orchestrated', 'Centralized monitoring', 'Structured delivery layer'],
      },
      {
        priceLabel: 'From $290/mo',
        priceApprox: 'per month',
        name: 'Stabilization Retainer',
        intro: 'Keep the system healthy: monitoring, small changes, and external technical judgment as things evolve.',
        note: 'Optional. No lock-in.',
        items: ['Monitoring & upkeep', 'Small changes & fixes', 'Source-drift repair', 'Priority response'],
      },
    ],
    tableFeatures: [
      ['Free 15-min diagnostic call', true, true, true, true],
      ['Written scope document', true, true, true, false],
      ['One flow built end-to-end', false, true, true, false],
      ['Multiple sources orchestrated', false, false, true, false],
      ['Tests, CI & scheduled runs', false, true, true, true],
      ['Failure alerts & monitoring', false, true, true, true],
      ['README + runbook handoff', false, true, true, true],
      ['Ongoing upkeep & changes', false, false, false, true],
    ],
    pricingNote:
      'Prices are starting points for clearly scoped work and are confirmed after the scoping step. International USD pricing reflects fully English deliverables and executive-ready documentation. Looking for local pricing in Spanish? The Spanish version of this service is calibrated for the Chilean and Latin American market.',
    whyEyebrow: 'Why Tooltician',
    whyTitle: 'Not the same as a one-off script from a marketplace',
    whySubtitle:
      'A marketplace freelancer builds the script you describe. Tooltician builds a system that survives the day you stop thinking about it.',
    whyAltLabel: 'Generic freelancer',
    whyAltItems: [
      'Delivers the script you asked for. If you under-specify, the result is fragile.',
      'No tests, no logging, no runbook by default — debugging falls back on you.',
      'No handoff. When it breaks, the knowledge left with the author.',
      'Each fix is a new project with no memory of how the system works.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Builds for the failure modes you did not know to ask about.',
      'Tests, logging, retries, and alerts so problems surface early and loudly.',
      'Handoff materials so the next person operates it without reverse-engineering.',
      'Public, auditable work: PyPI packages, CI, and production systems.',
    ],
    whyNote: {
      label: 'Proof, not promises',
      body: 'Tooltician ships open-source data layers (chile-hub), published Python packages (bankrecon, rutificador), and production systems with handoff-ready docs. The same standards apply to your build.',
    },
    casesEyebrow: 'Use cases',
    casesTitle: 'Where this service fits best',
    casesSubtitle: 'Built for recurring operational work that already matters and is currently held together by hand.',
    cases: [
      ['Recurring reporting', 'A report assembled manually every week or month, where the inputs and owner are known but the assembly is slow and error-prone.'],
      ['Fragile data collection', 'A scrape or acquisition flow the team depends on, that breaks silently and needs to be rebuilt rather than babysat.'],
      ['Copy-paste between systems', 'Numbers moved by hand between tools, spreadsheets, or dashboards, where a deterministic pipeline removes the manual step entirely.'],
      ['Key-person risk', 'A workflow only one person knows how to run, where a documented, tested system reduces the risk of that knowledge leaving.'],
    ],
    relatedLabel: 'Related projects',
    related: [
      { label: 'chile-hub', href: 'https://github.com/cortega26/chile-hub', accent: true },
      { label: 'Conciliador Bancario', href: 'https://github.com/cortega26/conciliador_bancario', accent: true },
      { label: 'rutificador', href: 'https://pypi.org/project/rutificador/', accent: true },
      { label: 'Portfolio', href: '/en/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions worth answering precisely',
    faqs: [
      ['How do you price this — hourly or fixed?', 'Fixed scope, not hourly. After a short scoping step we agree on a fixed price for a clearly defined build. You know the cost before work starts.'],
      ['What does the $290 scoping include?', 'A written scope document: inputs, outputs, owner, failure modes, and success criteria, plus a fixed-price quote for the build. If you proceed, the $290 is credited toward the build.'],
      ['Do you need access to our systems?', 'For scoping, usually not. For the build, controlled access to the relevant data sources, repository, or environment is required — scoped to what the work needs and no more.'],
      ['What language and stack do you use?', 'Primarily Python (Pandas, FastAPI, Selenium, BeautifulSoup) with SQL, Bash, GitHub Actions, and reliability-minded packaging. The stack is chosen to fit your environment and handoff, not the other way around.'],
      ['What happens after delivery?', 'You get handoff materials — README, runbook, setup, and failure points — so your team can run and extend it. An optional Stabilization Retainer is available if you want ongoing upkeep, but it is not a lock-in.'],
      ['Why is this priced in USD when the homepage shows UF?', 'This international service is delivered entirely in English with executive-ready documentation, priced in USD for US, UK, and EU clients. The Spanish version is calibrated for the Chilean and Latin American market in UF. The technical scope is equivalent; the delivery context is not.'],
    ],
    contactEyebrow: 'Next step',
    contactTitle: 'Start with a scoped problem, not an open-ended retainer',
    contactSubtitle:
      'If a recurring workflow is eating time or quietly creating risk, the right entry point is a short scoping pass that turns it into a fixed-price build.',
    contactCardTitle: 'Automation scoping — $290',
    contactCardBody:
      'A written scope of the workflow: inputs, outputs, owner, failure modes, and success criteria, plus a fixed-price build quote. The fee is credited toward the build.',
    contactRiskNote:
      'If scoping shows the work is not worth automating yet, the document says so with reasoning — knowing where the real bottleneck is, is also valuable. The fee applies regardless, but there are no surprises or additional charges.',
    contactCallLabel: 'Schedule a call instead',
    intakeHeading: 'Tell me about the workflow',
    intents: [
      { tag: 'I have a recurring report', body: 'Automate the assembly and delivery so it runs on schedule and reconciles every time.' },
      { tag: 'My scraper keeps breaking', body: 'Rebuild it as a resilient, logged, alert-backed collection flow that can be repaired, not babysat.' },
      { tag: 'I want ongoing support', body: 'Light monitoring, small changes, and external judgment without an in-house data hire.' },
    ],
    outreach:
      'If you arrived here from a specific bottleneck — a manual report, a fragile scrape, copy-paste between systems — the scope is this: lock it down, build it reliably, and hand it off documented. Fixed price, no open-ended hours.',
  },
  es: {
    title: 'Automatización Python y Pipelines | Tooltician',
    description:
      'Automatización Python programada y reproducible: pipelines ETL, scrapers y reportes acotados, documentados y listos para seguir funcionando.',
    serviceName: 'Automatización en Python y Pipelines de Datos',
    serviceType: ['Automatización en Python', 'Desarrollo de pipelines ETL', 'Web scraping', 'Automatización de reportes'],
    eyebrow: 'Automatización en Python · Tooltician',
    h1: 'Automatización en Python que sigue funcionando cuando dejas de vigilarla',
    lede: 'Reemplazo el trabajo manual recurrente con datos — armado de reportes, scrapes frágiles, copia-pega entre sistemas — por pipelines programados y reproducibles que entregan la misma respuesta cada vez y quedan documentados para que la siguiente persona los opere.',
    subcopy:
      'Obtienes un sistema pensado para producción, con tests, logging y un runbook — no un script que solo el autor sabe ejecutar.',
    ctaPrimary: 'Acotar mi automatización — desde 3 UF',
    ctaSecondary: 'Ver qué incluye',
    microcopy:
      'Alcance fijo, no horas abiertas. Cada proyecto empieza con una llamada gratuita de 15 minutos para confirmar el encaje antes de cualquier cotización.',
    fitEyebrow: 'Encaje típico',
    fitItems: [
      'Equipos operativos con un cuello de botella recurrente que ya afecta el trabajo.',
      'Fundadores que necesitan una entrega acotada, no un equipo de datos permanente.',
      'Equipos que valoran un traspaso por escrito por sobre depender de una persona.',
    ],
    signalsEyebrow: 'Pensado para producción',
    signals: [
      { label: 'Tests y CI', accent: true },
      { label: 'Logging y reintentos', accent: true },
      { label: 'README + runbook' },
      { label: 'Alertas de falla' },
    ],
    entryEyebrow: 'Punto de entrada',
    entryPrice: '3 UF',
    entryCaption: 'Diagnóstico de automatización. Se acredita a cualquier implementación.',
    availabilityEyebrow: 'Disponibilidad',
    availability: '2–3 proyectos nuevos al mes. Respuesta en 24–48 horas hábiles.',
    problemEyebrow: 'Problema',
    problemTitle: 'El trabajo funciona, pero solo porque alguien lo sigue haciendo a mano',
    problemSubtitle:
      'Casi todo el trabajo operativo con datos es invisible hasta que la persona que lo ejecuta está de vacaciones, se va o comete un error silencioso. El costo es real pero rara vez se mide.',
    problemCards: [
      {
        title: 'Lo que suele pasar',
        body: 'Un reporte se arma a mano cada semana, un scraper se rompe en silencio cuando cambia una página, los números se copian entre sistemas, y todo depende de que una persona recuerde los pasos. Funciona — hasta que no, normalmente en el peor momento.',
      },
      {
        title: 'La asimetría real',
        body: 'Los flujos manuales parecen baratos porque el costo está escondido en horas-persona y errores absorbidos. Una automatización acotada cuesta mucho menos en un año que el tiempo recurrente, los errores silenciosos y el riesgo de depender de una sola persona.',
      },
    ],
    scopeEyebrow: 'Enfoque',
    scopeTitle: 'Construido en torno al flujo de trabajo, no solo al código',
    scopeSubtitle:
      'Antes de escribir nada, el proyecto pasa por una revisión de alcance — inputs, outputs, responsable, modos de falla y objetivo de traspaso. Lo que se construye es un sistema que la siguiente persona puede operar, diagnosticar y extender.',
    scopeNote: {
      label: 'Qué no es esto',
      body: 'No es desarrollo de producto abierto, infraestructura de streaming en tiempo real, montaje de un data warehouse ni desarrollo de modelos de ML. Es automatización acotada y confiable de trabajo que ya haces.',
    },
    reviewGroups: [
      {
        title: 'ETL y automatización de flujos',
        items: [
          'Pipelines programados y reproducibles con la misma salida cada ejecución.',
          'Extracción, transformación y carga estructurada.',
          'Ejecuciones idempotentes que pueden reejecutarse con seguridad.',
          'Separación clara entre configuración, secretos y lógica.',
        ],
      },
      {
        title: 'Scraping y adquisición de datos',
        items: [
          'Recolección resiliente para uso recurrente en producción, no una demo.',
          'Reintentos, backoff y manejo elegante de cambios de layout.',
          'Logging y alertas cuando una fuente se rompe o se desvía.',
          'Extracción mantenible y respetuosa, con supuestos documentados.',
        ],
      },
      {
        title: 'Reportes y entrega de datos',
        items: [
          'Salidas estructuradas, exports o dashboards que eliminan el copia-pega.',
          'Entrega programada al lugar donde el equipo realmente lee.',
          'Números deterministas que cuadran entre ejecuciones.',
          'Documentación para que el consumo aguas abajo siga siendo predecible.',
        ],
      },
    ],
    processEyebrow: 'Proceso',
    processTitle: 'Cómo funciona una automatización',
    processSubtitle:
      'Pensado para ser concreto desde el primer paso: fijar el alcance, construir el sistema más pequeño y coherente, y dejarlo documentado lo suficiente para operar sin mí.',
    processSteps: [
      ['01', 'Llamada de diagnóstico gratuita', 'Una llamada de 15 minutos para confirmar que el problema encaja y vale la pena automatizar. Sin costo, sin compromiso.'],
      ['02', 'Diagnóstico de automatización', 'Un discovery corto y pagado que fija inputs, outputs, responsable, modos de falla y criterios de éxito — acordados por escrito. El valor se acredita a la implementación.'],
      ['03', 'Construcción acotada', 'Implementación con progreso visible en GitHub, tests, logging y tradeoffs documentados en lugar de scope creep sorpresa.'],
      ['04', 'Traspaso', 'README, runbook, pasos de setup y los puntos de falla que conviene vigilar — para que la siguiente persona pueda operar, depurar y extender sin necesitarme en una llamada.'],
    ],
    plansEyebrow: 'Planes y precios',
    plansTitle: 'Un alcance claro en cada paso, del primer pipeline a la mantención',
    plansSubtitle:
      'El punto de entrada natural es el Diagnóstico de Automatización (3 UF, acreditable a la implementación). La mayoría parte con una Construcción Acotada de un flujo y luego suma un Retainer de Estabilización cuando el sistema se vuelve crítico.',
    plans: [
      {
        priceLabel: '3 UF',
        priceApprox: 'acreditable',
        name: 'Diagnóstico de Automatización',
        intro: 'Un alcance por escrito antes de construir: inputs, outputs, responsable, modos de falla y criterios de éxito.',
        note: 'El valor se acredita a la implementación que siga.',
        items: ['Llamada de diagnóstico gratis', 'Documento de alcance', 'Cotización a precio fijo', 'Acreditable a la construcción'],
      },
      {
        priceLabel: 'Desde 30 UF',
        priceApprox: 'por proyecto',
        name: 'Construcción Acotada',
        intro: 'Un pipeline, scraper o flujo de reportes construido con estándar de producción y traspasado limpiamente.',
        note: 'El punto de partida más común.',
        recommended: true,
        items: ['Todo lo del Diagnóstico', 'Un flujo de extremo a extremo', 'Tests, logging, CI/programación', 'Alertas de falla', 'Traspaso con README + runbook'],
      },
      {
        priceLabel: 'Desde 60 UF',
        priceApprox: 'por proyecto',
        name: 'Sistema de Datos Multi-fuente',
        intro: 'Varias fuentes extraídas, orquestadas, monitoreadas y entregadas como un solo sistema coherente.',
        items: ['Todo lo de la Construcción Acotada', 'Varias fuentes orquestadas', 'Monitoreo centralizado', 'Capa de entrega estructurada'],
      },
      {
        priceLabel: 'Desde 6 UF/mes',
        priceApprox: 'por mes',
        name: 'Retainer de Estabilización',
        intro: 'Mantén el sistema sano: monitoreo, cambios pequeños y juicio técnico externo a medida que las cosas evolucionan.',
        note: 'Opcional. Sin amarre.',
        items: ['Monitoreo y mantención', 'Cambios y arreglos pequeños', 'Reparación de desvíos de fuente', 'Respuesta prioritaria'],
      },
    ],
    tableFeatures: [
      ['Llamada de diagnóstico gratis', true, true, true, true],
      ['Documento de alcance', true, true, true, false],
      ['Un flujo de extremo a extremo', false, true, true, false],
      ['Varias fuentes orquestadas', false, false, true, false],
      ['Tests, CI y ejecución programada', false, true, true, true],
      ['Alertas de falla y monitoreo', false, true, true, true],
      ['Traspaso con README + runbook', false, true, true, true],
      ['Mantención y cambios continuos', false, false, false, true],
    ],
    pricingNote:
      'Los precios son puntos de partida para trabajo claramente acotado y se confirman tras el paso de diagnóstico. Los valores en UF están calibrados para el mercado chileno y latinoamericano. ¿Necesitas el servicio en inglés con documentación lista para gerencia? La versión internacional está cotizada en USD.',
    whyEyebrow: 'Por qué Tooltician',
    whyTitle: 'No es lo mismo que un script puntual de un marketplace',
    whySubtitle:
      'Un freelancer de marketplace construye el script que describes. Tooltician construye un sistema que sobrevive al día en que dejas de pensar en él.',
    whyAltLabel: 'Freelancer genérico',
    whyAltItems: [
      'Entrega el script que pediste. Si lo especificas mal, el resultado es frágil.',
      'Sin tests, sin logging, sin runbook por defecto — depurar vuelve a quedar en ti.',
      'Sin traspaso. Cuando se rompe, el conocimiento se fue con el autor.',
      'Cada arreglo es un proyecto nuevo sin memoria de cómo funciona el sistema.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Construye para los modos de falla que no sabías que debías preguntar.',
      'Tests, logging, reintentos y alertas para que los problemas aparezcan temprano y fuerte.',
      'Materiales de traspaso para que la siguiente persona lo opere sin descifrarlo.',
      'Trabajo público y auditable: paquetes en PyPI, CI y sistemas en producción.',
    ],
    whyNote: {
      label: 'Evidencia, no promesas',
      body: 'Tooltician publica capas de datos abiertas (chile-hub), paquetes en PyPI (bankrecon, rutificador) y sistemas en producción con docs listas para traspaso. Los mismos estándares aplican a tu proyecto.',
    },
    casesEyebrow: 'Casos de uso',
    casesTitle: 'Dónde encaja mejor este servicio',
    casesSubtitle: 'Para trabajo operativo recurrente que ya importa y hoy se sostiene a mano.',
    cases: [
      ['Reportería recurrente', 'Un reporte armado a mano cada semana o mes, donde los inputs y el responsable se conocen pero el armado es lento y propenso a errores.'],
      ['Recolección frágil', 'Un scrape o flujo de adquisición del que el equipo depende, que se rompe en silencio y necesita reconstruirse en vez de vigilarse.'],
      ['Copia-pega entre sistemas', 'Números movidos a mano entre herramientas, planillas o dashboards, donde un pipeline determinista elimina el paso manual por completo.'],
      ['Riesgo de persona única', 'Un flujo que solo una persona sabe ejecutar, donde un sistema documentado y testeado reduce el riesgo de que ese conocimiento se vaya.'],
    ],
    relatedLabel: 'Proyectos relacionados',
    related: [
      { label: 'chile-hub', href: 'https://github.com/cortega26/chile-hub', accent: true },
      { label: 'Conciliador Bancario', href: 'https://github.com/cortega26/conciliador_bancario', accent: true },
      { label: 'rutificador', href: 'https://pypi.org/project/rutificador/', accent: true },
      { label: 'Portafolio', href: '/es/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Preguntas que vale la pena responder con precisión',
    faqs: [
      ['¿Cómo cobras esto — por hora o precio fijo?', 'Alcance fijo, no por hora. Tras un paso corto de diagnóstico acordamos un precio fijo para una construcción claramente definida. Sabes el costo antes de empezar.'],
      ['¿Qué incluye el diagnóstico de 3 UF?', 'Un documento de alcance: inputs, outputs, responsable, modos de falla y criterios de éxito, más una cotización a precio fijo. Si avanzas, las 3 UF se acreditan a la construcción.'],
      ['¿Necesitas acceso a nuestros sistemas?', 'Para el diagnóstico, normalmente no. Para la construcción se requiere acceso controlado a las fuentes de datos, el repositorio o el entorno relevante — acotado a lo que el trabajo necesita y nada más.'],
      ['¿Qué lenguaje y stack usas?', 'Principalmente Python (Pandas, FastAPI, Selenium, BeautifulSoup) con SQL, Bash, GitHub Actions y empaquetado orientado a confiabilidad. El stack se elige para encajar con tu entorno y traspaso, no al revés.'],
      ['¿Qué pasa después de la entrega?', 'Recibes materiales de traspaso — README, runbook, setup y puntos de falla — para que tu equipo lo opere y extienda. Hay un Retainer de Estabilización opcional si quieres mantención continua, pero no es un amarre.'],
      ['¿Por qué la versión en inglés se cotiza en USD y aquí en UF?', 'El servicio internacional se entrega completamente en inglés con documentación lista para gerencia, cotizado en USD para clientes de EE. UU., Reino Unido y Europa. La versión en español está calibrada para el mercado chileno y latinoamericano en UF. El alcance técnico es equivalente; el contexto de entrega no.'],
    ],
    contactEyebrow: 'Siguiente paso',
    contactTitle: 'Parte de un problema acotado, no de un retainer abierto',
    contactSubtitle:
      'Si un flujo recurrente está consumiendo tiempo o creando riesgo en silencio, el punto de entrada correcto es un diagnóstico corto que lo convierte en una construcción a precio fijo.',
    contactCardTitle: 'Diagnóstico de automatización — 3 UF',
    contactCardBody:
      'Un alcance por escrito del flujo: inputs, outputs, responsable, modos de falla y criterios de éxito, más una cotización a precio fijo. El valor se acredita a la construcción.',
    contactRiskNote:
      'Si el diagnóstico muestra que aún no vale la pena automatizar, el documento lo dice con argumentos — saber dónde está el cuello de botella real también es valioso. El valor aplica igual, pero no hay sorpresas ni cargos adicionales.',
    contactCallLabel: 'Prefiero agendar una llamada',
    intakeHeading: 'Cuéntame sobre el flujo',
    intents: [
      { tag: 'Tengo un reporte recurrente', body: 'Automatizar el armado y la entrega para que corra programado y cuadre cada vez.' },
      { tag: 'Mi scraper se rompe seguido', body: 'Reconstruirlo como un flujo de recolección resiliente, logueado y con alertas, que se repara en vez de vigilarse.' },
      { tag: 'Quiero soporte continuo', body: 'Monitoreo liviano, cambios pequeños y juicio externo sin contratar a alguien de datos interno.' },
    ],
    outreach:
      'Si llegaste aquí por un cuello de botella específico — un reporte manual, un scrape frágil, copia-pega entre sistemas — el alcance es este: fijarlo, construirlo de forma confiable y traspasarlo documentado. Precio fijo, sin horas abiertas.',
  },
};

const internalTools: ServiceDefinition = {
  slugEn: 'internal-tools',
  slugEs: 'herramientas-internas',
  serviceKey: 'internal-tools',
  areaServed: ['US', 'GB', 'EU', 'LATAM'],
  en: {
    title: 'Internal Tools & APIs | Tooltician',
    description:
      'Package scripts behind internal APIs or interfaces so workflows stay usable. Maintainable tools with FastAPI, CLIs, auth, tests, and documentation.',
    serviceName: 'Internal Tools & APIs',
    serviceType: ['Internal tools development', 'FastAPI development', 'Internal API development', 'Workflow tooling'],
    eyebrow: 'Internal Tools & APIs · Tooltician',
    h1: 'Turn the script only one person can run into a tool your team can use',
    lede: 'I wrap fragile scripts and one-person workflows behind internal APIs, CLIs, or guided interfaces — with auth, validation, tests, and documentation — so the workflow stays usable when the original builder is on holiday or gone.',
    subcopy:
      'All deliverables are in English. The result is a maintainable internal tool, not a notebook with tribal knowledge attached.',
    ctaPrimary: 'Scope my internal tool — from $290',
    ctaSecondary: "See what's included",
    microcopy:
      'Fixed scope, not open-ended hours. Every engagement starts with a free 15-minute call to confirm fit before any quote.',
    fitEyebrow: 'Typical fit',
    fitItems: [
      'Teams where several people touch the same workflow and handoff risk is real.',
      'Founders who need a script turned into something operators can use safely.',
      'Teams that want a maintainable tool, not a permanent embedded engineer.',
    ],
    signalsEyebrow: 'Built for production',
    signals: [
      { label: 'FastAPI / CLI', accent: true },
      { label: 'Auth & validation', accent: true },
      { label: 'Tests & CI' },
      { label: 'Docs + handoff' },
    ],
    entryEyebrow: 'Entry point',
    entryPrice: '$290',
    entryCaption: 'Tool scoping. Applied as credit toward any build.',
    availabilityEyebrow: 'Availability',
    availability: '2–3 new builds per month. Response within 24–48 business hours.',
    problemEyebrow: 'Problem',
    problemTitle: 'A workflow that lives in one head is a risk, not an asset',
    problemSubtitle:
      'When a useful process only exists as a script on one laptop, every run depends on that person being available, remembering the steps, and not making a quiet mistake.',
    problemCards: [
      {
        title: 'What typically happens',
        body: 'A clever script does real work, but it has no interface, no validation, and no docs. Onboarding someone means screen-sharing. Running it wrong corrupts data. When the author leaves, the workflow leaves with them.',
      },
      {
        title: 'The real asymmetry',
        body: 'A raw script feels finished because it works for its author. Turning it into a guarded tool — with an interface, validation, and docs — costs far less than the outages, errors, and re-builds that come from leaving it as tribal knowledge.',
      },
    ],
    scopeEyebrow: 'Approach',
    scopeTitle: 'Wrap the workflow so operators can use it, not just the author',
    scopeSubtitle:
      'Before building, we define the interface contract: who uses it, what inputs are valid, what the tool must refuse to do, and how it hands off. The result is usable by people who did not write it.',
    scopeNote: {
      label: 'What this is not',
      body: 'This is not a full SaaS product, a design-heavy frontend, a mobile app, or staff augmentation with undefined ownership. It is a scoped internal tool with a clear contract and handoff.',
    },
    reviewGroups: [
      {
        title: 'Internal APIs',
        items: [
          'Wrap existing logic behind a clean FastAPI service.',
          'Input validation that refuses bad data instead of corrupting it.',
          'Authentication and access control scoped to real users.',
          'Versioned, documented endpoints teams can build on.',
        ],
      },
      {
        title: 'Guided tools & CLIs',
        items: [
          'Turn scripts into guided CLIs or simple interfaces operators can run.',
          'Sensible defaults, clear errors, and safe confirmations.',
          'Packaging so the tool installs and runs without the author.',
          'Usage docs written for the operator, not the developer.',
        ],
      },
      {
        title: 'Reliability & handoff',
        items: [
          'Tests that lock expected behavior before changes ship.',
          'CI so regressions are caught, not discovered in production.',
          'Operating notes covering setup, run, and failure modes.',
          'A clean handoff so the next maintainer is not reverse-engineering.',
        ],
      },
    ],
    processEyebrow: 'Process',
    processTitle: 'How an internal tool build works',
    processSubtitle:
      'Lock the interface contract, build the smallest usable tool, and leave it documented enough for operators to run without the author.',
    processSteps: [
      ['01', 'Free diagnostic call', 'A 15-minute call to confirm the workflow is worth productizing. No charge, no obligation.'],
      ['02', 'Tool scoping', 'A short paid discovery that locks the interface, valid inputs, access model, and handoff target — agreed in writing. The fee is credited toward the build.'],
      ['03', 'Scoped build', 'Implementation with auth, validation, tests, and visible progress in GitHub instead of surprise scope creep.'],
      ['04', 'Handoff', 'Operator docs, setup steps, and failure points — so your team runs and extends the tool without me on a call.'],
    ],
    plansEyebrow: 'Plans & pricing',
    plansTitle: 'From one wrapped workflow to a platform several people rely on',
    plansSubtitle:
      'The natural entry point is Tool Scoping ($290, credited toward the build). Most teams start by wrapping one workflow, then expand to a small platform as more people depend on it.',
    plans: [
      {
        priceLabel: 'From $290',
        priceApprox: 'credited to build',
        name: 'Tool Scoping',
        intro: 'A written interface contract before any build: users, valid inputs, access model, and handoff target.',
        note: 'Fee credited toward any build that follows.',
        items: ['Free 15-min diagnostic call', 'Interface contract in writing', 'Fixed-price build quote', 'Credited toward the build'],
      },
      {
        priceLabel: 'From $1,800',
        priceApprox: 'one-time',
        name: 'Scoped Internal Tool',
        intro: 'One workflow wrapped behind an API, CLI, or guided interface, with auth, tests, and a clean handoff.',
        note: 'Most common starting point.',
        recommended: true,
        items: ['Everything in Scoping', 'One workflow wrapped', 'Auth & input validation', 'Tests & CI', 'Operator docs + handoff'],
      },
      {
        priceLabel: 'From $3,600',
        priceApprox: 'one-time',
        name: 'Team Platform',
        intro: 'Several workflows behind one coherent internal surface that multiple roles can use safely.',
        items: ['Everything in Scoped Tool', 'Multiple workflows unified', 'Role-based access', 'Shared documentation'],
      },
      {
        priceLabel: 'From $290/mo',
        priceApprox: 'per month',
        name: 'Stabilization Retainer',
        intro: 'Keep the tool healthy as needs evolve: small changes, upkeep, and external technical judgment.',
        note: 'Optional. No lock-in.',
        items: ['Upkeep & small changes', 'New endpoints/commands', 'Dependency maintenance', 'Priority response'],
      },
    ],
    tableFeatures: [
      ['Free 15-min diagnostic call', true, true, true, true],
      ['Interface contract in writing', true, true, true, false],
      ['One workflow wrapped', false, true, true, false],
      ['Multiple workflows unified', false, false, true, false],
      ['Auth & input validation', false, true, true, true],
      ['Tests & CI', false, true, true, true],
      ['Operator docs + handoff', false, true, true, true],
      ['Ongoing upkeep & changes', false, false, false, true],
    ],
    pricingNote:
      'Prices are starting points for clearly scoped work and are confirmed after the scoping step. International USD pricing reflects fully English deliverables and executive-ready documentation. Looking for local pricing in Spanish? The Spanish version of this service is calibrated for the Chilean and Latin American market.',
    whyEyebrow: 'Why Tooltician',
    whyTitle: 'Not the same as a contractor who leaves a script behind',
    whySubtitle:
      'A contractor delivers code that works on their machine. Tooltician delivers a tool your team can operate without them.',
    whyAltLabel: 'Generic contractor',
    whyAltItems: [
      'Leaves a script that works for them, with no interface or guardrails.',
      'No validation — wrong input quietly corrupts the workflow.',
      'No operator docs. Onboarding the next person means a call.',
      'No tests, so every change is a gamble.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Builds an interface and guardrails so non-authors can use it safely.',
      'Validation that refuses bad input instead of absorbing it.',
      'Operator documentation written for the people who run it.',
      'Tests and CI so the tool can evolve without breaking quietly.',
    ],
    whyNote: {
      label: 'Proof, not promises',
      body: 'Tooltician ships published packages and CLIs (rutificador, DNSpect, FastSearchAPI) and internal-grade tooling with handoff-ready docs. The same standards apply to your build.',
    },
    casesEyebrow: 'Use cases',
    casesTitle: 'Where this service fits best',
    casesSubtitle: 'Built for workflows that already deliver value but depend too heavily on one person and one machine.',
    cases: [
      ['Script to internal API', 'A working script that needs to become a service other tools and teammates can call safely.'],
      ['Operator-run tool', 'A process non-technical staff need to run, where a guided interface prevents costly mistakes.'],
      ['Key-person dependency', 'A workflow only one person can operate, where an interface, tests, and docs de-risk a departure.'],
      ['Shared workflow at scale', 'Several people touching the same process, where role-based access and a single surface reduce chaos.'],
    ],
    relatedLabel: 'Related projects',
    related: [
      { label: 'rutificador', href: 'https://pypi.org/project/rutificador/', accent: true },
      { label: 'DNSpect', href: 'https://github.com/cortega26/DNSpect', accent: true },
      { label: 'FastSearchAPI', href: 'https://github.com/cortega26/FastSearchAPI', accent: true },
      { label: 'Portfolio', href: '/en/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions worth answering precisely',
    faqs: [
      ['How do you price this — hourly or fixed?', 'Fixed scope, not hourly. After a short scoping step we agree on a fixed price for a clearly defined build. You know the cost before work starts.'],
      ['What does the $290 scoping include?', 'A written interface contract: users, valid inputs, access model, and handoff target, plus a fixed-price quote. If you proceed, the $290 is credited toward the build.'],
      ['Can you wrap an existing script we already have?', 'Yes — that is the common case. I wrap existing logic behind a clean interface with validation, tests, and docs, rather than rewriting it from scratch unless the code requires it.'],
      ['What stack do you use?', 'Primarily Python and FastAPI for APIs, plus CLIs and lightweight interfaces, with auth, tests, and GitHub Actions. The stack is chosen to fit your environment and handoff.'],
      ['Do you build the frontend too?', 'I build lean, functional interfaces where they help operators. This service is not a design-heavy product UI — if you need that, a Static Sites & Front Ends engagement is the better fit.'],
      ['Why is this priced in USD when the homepage shows UF?', 'This international service is delivered entirely in English with executive-ready documentation, priced in USD for US, UK, and EU clients. The Spanish version is calibrated for the Chilean and Latin American market in UF.'],
    ],
    contactEyebrow: 'Next step',
    contactTitle: 'Start by scoping the tool, not by signing a retainer',
    contactSubtitle:
      'If a workflow is trapped in one person or one script, the right entry point is a short scoping pass that turns it into a fixed-price build.',
    contactCardTitle: 'Tool scoping — $290',
    contactCardBody:
      'A written interface contract: users, valid inputs, access model, and handoff target, plus a fixed-price build quote. The fee is credited toward the build.',
    contactRiskNote:
      'If scoping shows the workflow is not worth productizing yet, the document says so with reasoning. The fee applies regardless, but there are no surprises or additional charges.',
    contactCallLabel: 'Schedule a call instead',
    intakeHeading: 'Tell me about the workflow',
    intents: [
      { tag: 'I have a script to productize', body: 'Wrap it behind an API or guided interface with validation, tests, and docs.' },
      { tag: 'Operators need to run it safely', body: 'Add an interface and guardrails so non-technical staff cannot break it.' },
      { tag: 'I want ongoing support', body: 'Small changes, new endpoints, and upkeep without an in-house engineer.' },
    ],
    outreach:
      'If you arrived here because a workflow depends too much on one person, the scope is this: define the contract, wrap it safely, and hand it off documented. Fixed price, no open-ended hours.',
  },
  es: {
    title: 'Herramientas Internas y APIs | Tooltician',
    description:
      'Empaqueto scripts detrás de APIs o interfaces para que sigan siendo usables. Herramientas mantenibles con FastAPI, autenticación y documentación.',
    serviceName: 'Herramientas Internas y APIs',
    serviceType: ['Desarrollo de herramientas internas', 'Desarrollo FastAPI', 'Desarrollo de APIs internas', 'Tooling de flujos'],
    eyebrow: 'Herramientas Internas y APIs · Tooltician',
    h1: 'Convierte el script que solo una persona sabe correr en una herramienta para tu equipo',
    lede: 'Empaqueto scripts frágiles y flujos de una sola persona detrás de APIs internas, CLIs o interfaces guiadas — con autenticación, validación, tests y documentación — para que el flujo siga siendo usable cuando el autor está de vacaciones o ya no está.',
    subcopy:
      'El resultado es una herramienta interna mantenible, no un notebook con conocimiento tribal adjunto.',
    ctaPrimary: 'Acotar mi herramienta — desde 3 UF',
    ctaSecondary: 'Ver qué incluye',
    microcopy:
      'Alcance fijo, no horas abiertas. Cada proyecto empieza con una llamada gratuita de 15 minutos para confirmar el encaje antes de cualquier cotización.',
    fitEyebrow: 'Encaje típico',
    fitItems: [
      'Equipos donde varias personas tocan el mismo flujo y el riesgo de traspaso es real.',
      'Fundadores que necesitan convertir un script en algo que operadores puedan usar con seguridad.',
      'Equipos que quieren una herramienta mantenible, no un ingeniero embebido permanente.',
    ],
    signalsEyebrow: 'Pensado para producción',
    signals: [
      { label: 'FastAPI / CLI', accent: true },
      { label: 'Auth y validación', accent: true },
      { label: 'Tests y CI' },
      { label: 'Docs + traspaso' },
    ],
    entryEyebrow: 'Punto de entrada',
    entryPrice: '3 UF',
    entryCaption: 'Diagnóstico de la herramienta. Se acredita a cualquier implementación.',
    availabilityEyebrow: 'Disponibilidad',
    availability: '2–3 proyectos nuevos al mes. Respuesta en 24–48 horas hábiles.',
    problemEyebrow: 'Problema',
    problemTitle: 'Un flujo que vive en una sola cabeza es un riesgo, no un activo',
    problemSubtitle:
      'Cuando un proceso útil solo existe como un script en un notebook, cada ejecución depende de que esa persona esté disponible, recuerde los pasos y no cometa un error silencioso.',
    problemCards: [
      {
        title: 'Lo que suele pasar',
        body: 'Un script ingenioso hace trabajo real, pero no tiene interfaz, ni validación, ni docs. Subir a alguien nuevo implica compartir pantalla. Correrlo mal corrompe datos. Cuando el autor se va, el flujo se va con él.',
      },
      {
        title: 'La asimetría real',
        body: 'Un script crudo parece terminado porque funciona para su autor. Convertirlo en una herramienta protegida — con interfaz, validación y docs — cuesta mucho menos que las caídas, los errores y las reconstrucciones de dejarlo como conocimiento tribal.',
      },
    ],
    scopeEyebrow: 'Enfoque',
    scopeTitle: 'Empaquetar el flujo para que lo usen operadores, no solo el autor',
    scopeSubtitle:
      'Antes de construir definimos el contrato de la interfaz: quién la usa, qué inputs son válidos, qué debe rechazar la herramienta y cómo se traspasa. El resultado es usable por gente que no lo escribió.',
    scopeNote: {
      label: 'Qué no es esto',
      body: 'No es un producto SaaS completo, un frontend cargado de diseño, una app móvil ni staff augmentation sin ownership definido. Es una herramienta interna acotada con un contrato claro y traspaso.',
    },
    reviewGroups: [
      {
        title: 'APIs internas',
        items: [
          'Empaqueto la lógica existente detrás de un servicio FastAPI limpio.',
          'Validación de inputs que rechaza datos malos en vez de corromperlos.',
          'Autenticación y control de acceso acotados a usuarios reales.',
          'Endpoints versionados y documentados sobre los que el equipo puede construir.',
        ],
      },
      {
        title: 'Herramientas guiadas y CLIs',
        items: [
          'Convierto scripts en CLIs guiados o interfaces simples que los operadores pueden correr.',
          'Defaults sensatos, errores claros y confirmaciones seguras.',
          'Empaquetado para que la herramienta se instale y corra sin el autor.',
          'Docs de uso escritas para el operador, no para el desarrollador.',
        ],
      },
      {
        title: 'Confiabilidad y traspaso',
        items: [
          'Tests que fijan el comportamiento esperado antes de que entren cambios.',
          'CI para que las regresiones se detecten, no se descubran en producción.',
          'Notas operativas que cubren setup, ejecución y modos de falla.',
          'Un traspaso limpio para que el siguiente no tenga que descifrar.',
        ],
      },
    ],
    processEyebrow: 'Proceso',
    processTitle: 'Cómo funciona una herramienta interna',
    processSubtitle:
      'Fijar el contrato de la interfaz, construir la herramienta usable más pequeña, y dejarla documentada lo suficiente para que operadores la corran sin el autor.',
    processSteps: [
      ['01', 'Llamada de diagnóstico gratuita', 'Una llamada de 15 minutos para confirmar que el flujo vale la pena productizar. Sin costo, sin compromiso.'],
      ['02', 'Diagnóstico de la herramienta', 'Un discovery corto y pagado que fija la interfaz, los inputs válidos, el modelo de acceso y el objetivo de traspaso — acordados por escrito. El valor se acredita a la implementación.'],
      ['03', 'Construcción acotada', 'Implementación con auth, validación, tests y progreso visible en GitHub en vez de scope creep sorpresa.'],
      ['04', 'Traspaso', 'Docs de operador, pasos de setup y puntos de falla — para que tu equipo opere y extienda la herramienta sin necesitarme en una llamada.'],
    ],
    plansEyebrow: 'Planes y precios',
    plansTitle: 'De un flujo empaquetado a una plataforma de la que dependen varios',
    plansSubtitle:
      'El punto de entrada natural es el Diagnóstico de la Herramienta (3 UF, acreditable a la implementación). La mayoría parte empaquetando un flujo y luego se expande a una pequeña plataforma a medida que más personas dependen de ella.',
    plans: [
      {
        priceLabel: '3 UF',
        priceApprox: 'acreditable',
        name: 'Diagnóstico de la Herramienta',
        intro: 'Un contrato de interfaz por escrito antes de construir: usuarios, inputs válidos, modelo de acceso y objetivo de traspaso.',
        note: 'El valor se acredita a la implementación que siga.',
        items: ['Llamada de diagnóstico gratis', 'Contrato de interfaz por escrito', 'Cotización a precio fijo', 'Acreditable a la construcción'],
      },
      {
        priceLabel: 'Desde 35 UF',
        priceApprox: 'por proyecto',
        name: 'Herramienta Interna Acotada',
        intro: 'Un flujo empaquetado detrás de una API, CLI o interfaz guiada, con auth, tests y un traspaso limpio.',
        note: 'El punto de partida más común.',
        recommended: true,
        items: ['Todo lo del Diagnóstico', 'Un flujo empaquetado', 'Auth y validación de inputs', 'Tests y CI', 'Docs de operador + traspaso'],
      },
      {
        priceLabel: 'Desde 70 UF',
        priceApprox: 'por proyecto',
        name: 'Plataforma de Equipo',
        intro: 'Varios flujos detrás de una superficie interna coherente que múltiples roles pueden usar con seguridad.',
        items: ['Todo lo de la Herramienta Acotada', 'Varios flujos unificados', 'Acceso por rol', 'Documentación compartida'],
      },
      {
        priceLabel: 'Desde 6 UF/mes',
        priceApprox: 'por mes',
        name: 'Retainer de Estabilización',
        intro: 'Mantén la herramienta sana a medida que evolucionan las necesidades: cambios pequeños, mantención y juicio técnico externo.',
        note: 'Opcional. Sin amarre.',
        items: ['Mantención y cambios pequeños', 'Nuevos endpoints/comandos', 'Mantención de dependencias', 'Respuesta prioritaria'],
      },
    ],
    tableFeatures: [
      ['Llamada de diagnóstico gratis', true, true, true, true],
      ['Contrato de interfaz por escrito', true, true, true, false],
      ['Un flujo empaquetado', false, true, true, false],
      ['Varios flujos unificados', false, false, true, false],
      ['Auth y validación de inputs', false, true, true, true],
      ['Tests y CI', false, true, true, true],
      ['Docs de operador + traspaso', false, true, true, true],
      ['Mantención y cambios continuos', false, false, false, true],
    ],
    pricingNote:
      'Los precios son puntos de partida para trabajo claramente acotado y se confirman tras el paso de diagnóstico. Los valores en UF están calibrados para el mercado chileno y latinoamericano. ¿Necesitas el servicio en inglés con documentación lista para gerencia? La versión internacional está cotizada en USD.',
    whyEyebrow: 'Por qué Tooltician',
    whyTitle: 'No es lo mismo que un contratista que deja un script atrás',
    whySubtitle:
      'Un contratista entrega código que funciona en su máquina. Tooltician entrega una herramienta que tu equipo puede operar sin él.',
    whyAltLabel: 'Contratista genérico',
    whyAltItems: [
      'Deja un script que funciona para él, sin interfaz ni guardas.',
      'Sin validación — un input equivocado corrompe el flujo en silencio.',
      'Sin docs de operador. Subir a la siguiente persona implica una llamada.',
      'Sin tests, así que cada cambio es una apuesta.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Construye una interfaz y guardas para que no-autores la usen con seguridad.',
      'Validación que rechaza inputs malos en vez de absorberlos.',
      'Documentación de operador escrita para quienes la corren.',
      'Tests y CI para que la herramienta evolucione sin romperse en silencio.',
    ],
    whyNote: {
      label: 'Evidencia, no promesas',
      body: 'Tooltician publica paquetes y CLIs (rutificador, DNSpect, FastSearchAPI) y tooling de nivel interno con docs listas para traspaso. Los mismos estándares aplican a tu proyecto.',
    },
    casesEyebrow: 'Casos de uso',
    casesTitle: 'Dónde encaja mejor este servicio',
    casesSubtitle: 'Para flujos que ya entregan valor pero dependen demasiado de una persona y una máquina.',
    cases: [
      ['Script a API interna', 'Un script que funciona y necesita volverse un servicio que otras herramientas y compañeros puedan llamar con seguridad.'],
      ['Herramienta para operadores', 'Un proceso que personal no técnico necesita correr, donde una interfaz guiada evita errores costosos.'],
      ['Dependencia de persona única', 'Un flujo que solo una persona puede operar, donde una interfaz, tests y docs reducen el riesgo de una salida.'],
      ['Flujo compartido a escala', 'Varias personas tocando el mismo proceso, donde el acceso por rol y una sola superficie reducen el caos.'],
    ],
    relatedLabel: 'Proyectos relacionados',
    related: [
      { label: 'rutificador', href: 'https://pypi.org/project/rutificador/', accent: true },
      { label: 'DNSpect', href: 'https://github.com/cortega26/DNSpect', accent: true },
      { label: 'FastSearchAPI', href: 'https://github.com/cortega26/FastSearchAPI', accent: true },
      { label: 'Portafolio', href: '/es/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Preguntas que vale la pena responder con precisión',
    faqs: [
      ['¿Cómo cobras esto — por hora o precio fijo?', 'Alcance fijo, no por hora. Tras un paso corto de diagnóstico acordamos un precio fijo para una construcción claramente definida. Sabes el costo antes de empezar.'],
      ['¿Qué incluye el diagnóstico de 3 UF?', 'Un contrato de interfaz por escrito: usuarios, inputs válidos, modelo de acceso y objetivo de traspaso, más una cotización a precio fijo. Si avanzas, las 3 UF se acreditan a la construcción.'],
      ['¿Puedes empaquetar un script que ya tenemos?', 'Sí — es el caso común. Empaqueto la lógica existente detrás de una interfaz limpia con validación, tests y docs, en vez de reescribirla desde cero salvo que el código lo exija.'],
      ['¿Qué stack usas?', 'Principalmente Python y FastAPI para APIs, más CLIs e interfaces livianas, con auth, tests y GitHub Actions. El stack se elige para encajar con tu entorno y traspaso.'],
      ['¿También construyes el frontend?', 'Construyo interfaces sobrias y funcionales donde ayudan a los operadores. Este servicio no es una UI de producto cargada de diseño — si necesitas eso, un proyecto de Sitios y Frontends encaja mejor.'],
      ['¿Por qué la versión en inglés se cotiza en USD y aquí en UF?', 'El servicio internacional se entrega completamente en inglés con documentación lista para gerencia, cotizado en USD para clientes de EE. UU., Reino Unido y Europa. La versión en español está calibrada para el mercado chileno y latinoamericano en UF.'],
    ],
    contactEyebrow: 'Siguiente paso',
    contactTitle: 'Parte acotando la herramienta, no firmando un retainer',
    contactSubtitle:
      'Si un flujo está atrapado en una persona o un script, el punto de entrada correcto es un diagnóstico corto que lo convierte en una construcción a precio fijo.',
    contactCardTitle: 'Diagnóstico de la herramienta — 3 UF',
    contactCardBody:
      'Un contrato de interfaz por escrito: usuarios, inputs válidos, modelo de acceso y objetivo de traspaso, más una cotización a precio fijo. El valor se acredita a la construcción.',
    contactRiskNote:
      'Si el diagnóstico muestra que aún no vale la pena productizar el flujo, el documento lo dice con argumentos. El valor aplica igual, pero no hay sorpresas ni cargos adicionales.',
    contactCallLabel: 'Prefiero agendar una llamada',
    intakeHeading: 'Cuéntame sobre el flujo',
    intents: [
      { tag: 'Tengo un script para productizar', body: 'Empaquetarlo detrás de una API o interfaz guiada con validación, tests y docs.' },
      { tag: 'Operadores deben correrlo seguro', body: 'Agregar interfaz y guardas para que personal no técnico no lo rompa.' },
      { tag: 'Quiero soporte continuo', body: 'Cambios pequeños, nuevos endpoints y mantención sin un ingeniero interno.' },
    ],
    outreach:
      'Si llegaste aquí porque un flujo depende demasiado de una persona, el alcance es este: definir el contrato, empaquetarlo con seguridad y traspasarlo documentado. Precio fijo, sin horas abiertas.',
  },
};

const financialTooling: ServiceDefinition = {
  slugEn: 'financial-tooling',
  slugEs: 'herramientas-financieras',
  serviceKey: 'financial',
  areaServed: ['US', 'GB', 'EU', 'LATAM'],
  en: {
    title: 'Financial & Audit Tooling | Tooltician',
    description:
      'Reconciliation and finance workflows that stop on mismatches and preserve audit traces. Fail-closed by design, with deterministic audit artifacts.',
    serviceName: 'Financial & Audit Tooling',
    serviceType: ['Bank reconciliation automation', 'Financial reconciliation software', 'Audit tooling', 'Fail-closed controls'],
    eyebrow: 'Financial & Audit Tooling · Tooltician',
    h1: 'Reconciliation that stops on a mismatch instead of hiding it',
    lede: 'I build finance and reconciliation workflows that fail closed — they halt on discrepancies, preserve deterministic audit trails, and make review easier — so a wrong number is caught before it becomes an expensive surprise.',
    subcopy:
      'All deliverables are in English. Trust-critical work, built with the explicit checks and audit artifacts that finance review actually needs.',
    ctaPrimary: 'Scope my controls — from $390',
    ctaSecondary: "See what's included",
    microcopy:
      'Fixed scope, not open-ended hours. Every engagement starts with a free 15-minute call to confirm fit before any quote.',
    fitEyebrow: 'Typical fit',
    fitItems: [
      'Finance or ops teams where a wrong answer costs more than a slower explicit check.',
      'Teams reconciling banks, ledgers, or systems by hand and absorbing silent errors.',
      'Founders who need auditable controls without standing up a full finance platform.',
    ],
    signalsEyebrow: 'Built for trust',
    signals: [
      { label: 'Fail-closed', accent: true },
      { label: 'Deterministic', accent: true },
      { label: 'Audit artifacts' },
      { label: 'Tested controls' },
    ],
    entryEyebrow: 'Entry point',
    entryPrice: '$390',
    entryCaption: 'Controls scoping. Applied as credit toward any build.',
    availabilityEyebrow: 'Availability',
    availability: '1–2 new builds per month. Response within 24–48 business hours.',
    problemEyebrow: 'Problem',
    problemTitle: 'In finance, a silent wrong answer is worse than a loud failure',
    problemSubtitle:
      'Manual reconciliation and ad-hoc spreadsheets tend to fail open: they produce a number even when the inputs do not agree. The error is invisible until it is expensive.',
    problemCards: [
      {
        title: 'What typically happens',
        body: 'Balances are matched by hand, a formula silently swallows a mismatch, and the report looks fine. The discrepancy surfaces weeks later in an audit, a close, or a complaint — long after it was cheap to fix.',
      },
      {
        title: 'The real asymmetry',
        body: 'A fast spreadsheet feels efficient until it produces a confident wrong number. A fail-closed control that stops and flags costs a little more time per run and far less than the rework, restatement, and trust damage of a silent error.',
      },
    ],
    scopeEyebrow: 'Approach',
    scopeTitle: 'Make the system refuse to produce a confident wrong answer',
    scopeSubtitle:
      'Before building, we define the controls: what must match, what tolerance is allowed, what the system must refuse, and what evidence each run must leave behind. Correctness over convenience.',
    scopeNote: {
      label: 'What this is not',
      body: 'This is not a full ERP or accounting platform, a certified financial audit (I am not a CPA), or tax filing and advice. It is scoped, fail-closed tooling that makes finance work verifiable.',
    },
    reviewGroups: [
      {
        title: 'Reconciliation',
        items: [
          'Match banks, ledgers, or systems with explicit, documented rules.',
          'Fail closed on mismatches instead of producing a silent number.',
          'Tolerances and exceptions handled deliberately, not by accident.',
          'Reproducible runs that reconcile to the same result every time.',
        ],
      },
      {
        title: 'Fail-closed controls',
        items: [
          'Validations that halt and flag rather than absorbing bad input.',
          'Deterministic finance math, not floating-point surprises.',
          'Clear, reviewable rules a non-author can understand.',
          'Tests that lock the controls before any change ships.',
        ],
      },
      {
        title: 'Audit artifacts',
        items: [
          'Deterministic outputs and an audit trail for every run.',
          'Evidence packaged so review and sign-off are straightforward.',
          'Versioned rules so changes to logic are traceable.',
          'Documentation that survives the audit and the handoff.',
        ],
      },
    ],
    processEyebrow: 'Process',
    processTitle: 'How a controls build works',
    processSubtitle:
      'Lock the control requirements, build the smallest verifiable system, and leave audit-grade evidence and documentation behind.',
    processSteps: [
      ['01', 'Free diagnostic call', 'A 15-minute call to confirm the reconciliation or control is a fit. No charge, no obligation.'],
      ['02', 'Controls scoping', 'A short paid discovery that locks what must match, allowed tolerances, what the system must refuse, and required evidence — agreed in writing. The fee is credited toward the build.'],
      ['03', 'Scoped build', 'Implementation with fail-closed controls, tests, deterministic outputs, and visible progress in GitHub.'],
      ['04', 'Handoff', 'Audit artifacts, control documentation, setup, and failure modes — so your team runs and reviews it without me on a call.'],
    ],
    plansEyebrow: 'Plans & pricing',
    plansTitle: 'From one reconciliation to a system of financial controls',
    plansSubtitle:
      'The natural entry point is Controls Scoping ($390, credited toward the build). Most teams start with one reconciliation flow, then expand to a broader control system as trust requirements grow.',
    plans: [
      {
        priceLabel: 'From $390',
        priceApprox: 'credited to build',
        name: 'Controls Scoping',
        intro: 'A written control spec before any build: what must match, tolerances, refusals, and required evidence.',
        note: 'Fee credited toward any build that follows.',
        items: ['Free 15-min diagnostic call', 'Control spec in writing', 'Fixed-price build quote', 'Credited toward the build'],
      },
      {
        priceLabel: 'From $2,400',
        priceApprox: 'one-time',
        name: 'Scoped Implementation',
        intro: 'One reconciliation or control flow built fail-closed, with deterministic outputs and audit artifacts.',
        note: 'Most common starting point.',
        recommended: true,
        items: ['Everything in Scoping', 'One fail-closed control flow', 'Deterministic audit artifacts', 'Tested controls', 'Documentation + handoff'],
      },
      {
        priceLabel: 'From $4,800',
        priceApprox: 'one-time',
        name: 'Financial Control System',
        intro: 'Multiple sources and controls unified into one auditable system with consistent evidence.',
        items: ['Everything in Scoped Implementation', 'Multiple sources reconciled', 'Unified audit trail', 'Versioned control rules'],
      },
      {
        priceLabel: 'From $390/mo',
        priceApprox: 'per month',
        name: 'Stabilization Retainer',
        intro: 'Keep controls current as rules, sources, and requirements evolve, with external review.',
        note: 'Optional. No lock-in.',
        items: ['Rule & source updates', 'New controls', 'Audit support', 'Priority response'],
      },
    ],
    tableFeatures: [
      ['Free 15-min diagnostic call', true, true, true, true],
      ['Control spec in writing', true, true, true, false],
      ['One fail-closed control flow', false, true, true, false],
      ['Multiple sources reconciled', false, false, true, false],
      ['Deterministic audit artifacts', false, true, true, true],
      ['Tested controls & CI', false, true, true, true],
      ['Documentation + handoff', false, true, true, true],
      ['Ongoing rule maintenance', false, false, false, true],
    ],
    pricingNote:
      'Prices are starting points for clearly scoped work and are confirmed after the scoping step. Trust-critical work is priced accordingly. International USD pricing reflects fully English deliverables and executive-ready audit documentation. The Spanish version is calibrated for the Chilean and Latin American market.',
    whyEyebrow: 'Why Tooltician',
    whyTitle: 'Not the same as a spreadsheet that always returns a number',
    whySubtitle:
      'A spreadsheet is happy to be confidently wrong. Tooltician builds systems that would rather stop than mislead you.',
    whyAltLabel: 'Spreadsheet / generic script',
    whyAltItems: [
      'Fails open: produces a number even when inputs do not agree.',
      'Floating-point and copy errors hide inside formulas.',
      'No audit trail — you cannot prove what a past run actually did.',
      'No tests, so a quiet change to logic goes unnoticed.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Fails closed: halts and flags rather than producing a silent wrong number.',
      'Deterministic finance math with explicit, reviewable rules.',
      'Audit artifacts that make review and sign-off straightforward.',
      'Tested, versioned controls so changes are traceable.',
    ],
    whyNote: {
      label: 'Proof, not promises',
      body: 'Tooltician ships bankrecon (a fail-closed bank reconciliation CLI on PyPI) and Portfolio Manager (deterministic finance math, local-only persistence). The same standards apply to your build.',
    },
    casesEyebrow: 'Use cases',
    casesTitle: 'Where this service fits best',
    casesSubtitle: 'Built for finance and operations work where correctness matters more than a slightly faster run.',
    cases: [
      ['Bank reconciliation', 'Matching statements to ledgers by hand, where a fail-closed tool catches mismatches before close.'],
      ['Cross-system controls', 'Numbers that must agree across systems, where silent drift is currently absorbed and discovered late.'],
      ['Audit readiness', 'A process that needs a defensible trail, where deterministic artifacts make review and sign-off simple.'],
      ['Deterministic finance math', 'Calculations that must be exact and reproducible, where floating-point surprises are unacceptable.'],
    ],
    relatedLabel: 'Related projects',
    related: [
      { label: 'bankrecon', href: 'https://pypi.org/project/bankrecon/', accent: true },
      { label: 'Conciliador Bancario', href: 'https://github.com/cortega26/conciliador_bancario', accent: true },
      { label: 'Portfolio Manager', href: 'https://github.com/cortega26/portfolio-manager-server', accent: true },
      { label: 'Portfolio', href: '/en/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions worth answering precisely',
    faqs: [
      ['How do you price this — hourly or fixed?', 'Fixed scope, not hourly. After a short scoping step we agree on a fixed price for a clearly defined build. You know the cost before work starts.'],
      ['Why is this more expensive than the other services?', 'Trust-critical work carries more responsibility: the cost of a silent error is high, so the controls, tests, and audit artifacts are more rigorous. The pricing reflects that rigor.'],
      ['Is this a financial audit?', 'No. I am not a CPA and this is not a certified audit. I build the tooling and controls that make your finance work verifiable and audit-ready — the audit itself stays with your auditor.'],
      ['What does fail-closed mean here?', 'It means the system refuses to produce a confident result when inputs do not agree. It halts and flags instead of returning a number that looks fine but is wrong.'],
      ['Do you need access to financial data?', 'For scoping, usually a sample or schema is enough. For the build, controlled access to the relevant sources is required, scoped to what the work needs and handled with care.'],
      ['Why is this priced in USD when the homepage shows UF?', 'This international service is delivered entirely in English with executive-ready audit documentation, priced in USD for US, UK, and EU clients. The Spanish version is calibrated for the Chilean and Latin American market in UF.'],
    ],
    contactEyebrow: 'Next step',
    contactTitle: 'Start by scoping the controls, not by trusting the spreadsheet',
    contactSubtitle:
      'If a reconciliation or control matters enough that a silent error would hurt, the right entry point is a short scoping pass that turns it into a fail-closed build.',
    contactCardTitle: 'Controls scoping — $390',
    contactCardBody:
      'A written control spec: what must match, tolerances, refusals, and required evidence, plus a fixed-price build quote. The fee is credited toward the build.',
    contactRiskNote:
      'If scoping shows existing controls are already sound, the document confirms it with evidence — knowing the basics hold is also valuable before an audit or a close. The fee applies regardless, but there are no surprises.',
    contactCallLabel: 'Schedule a call instead',
    intakeHeading: 'Tell me about the control',
    intents: [
      { tag: 'I reconcile by hand', body: 'Replace manual matching with a fail-closed tool that halts on mismatches and leaves an audit trail.' },
      { tag: 'Numbers must agree across systems', body: 'Build cross-system controls that catch silent drift before it becomes expensive.' },
      { tag: 'I need to be audit-ready', body: 'Deterministic artifacts and documentation that make review and sign-off straightforward.' },
    ],
    outreach:
      'If you arrived here because a number has to be right, the scope is this: define the controls, build them fail-closed, and leave audit-grade evidence. Fixed price, no open-ended hours.',
  },
  es: {
    title: 'Herramientas Financieras y Auditoría | Tooltician',
    description:
      'Conciliaciones y flujos financieros que se detienen ante diferencias y conservan trazas de auditoría. Diseñadas para auditorías y revisiones simples.',
    serviceName: 'Herramientas Financieras y de Auditoría',
    serviceType: ['Automatización de conciliación bancaria', 'Software de conciliación financiera', 'Tooling de auditoría', 'Controles fail-closed'],
    eyebrow: 'Herramientas Financieras y de Auditoría · Tooltician',
    h1: 'Conciliación que se detiene ante una diferencia en vez de esconderla',
    lede: 'Construyo flujos financieros y de conciliación que fallan cerrado — se detienen ante discrepancias, preservan trazas de auditoría deterministas y facilitan la revisión — para que un número equivocado se detecte antes de volverse una sorpresa cara.',
    subcopy:
      'Trabajo crítico para la confianza, construido con los chequeos explícitos y artefactos de auditoría que la revisión financiera realmente necesita.',
    ctaPrimary: 'Acotar mis controles — desde 4 UF',
    ctaSecondary: 'Ver qué incluye',
    microcopy:
      'Alcance fijo, no horas abiertas. Cada proyecto empieza con una llamada gratuita de 15 minutos para confirmar el encaje antes de cualquier cotización.',
    fitEyebrow: 'Encaje típico',
    fitItems: [
      'Equipos de finanzas u operaciones donde una respuesta equivocada cuesta más que un chequeo explícito más lento.',
      'Equipos que concilian bancos, libros o sistemas a mano y absorben errores silenciosos.',
      'Fundadores que necesitan controles auditables sin levantar una plataforma financiera completa.',
    ],
    signalsEyebrow: 'Pensado para la confianza',
    signals: [
      { label: 'Fail-closed', accent: true },
      { label: 'Determinista', accent: true },
      { label: 'Artefactos de auditoría' },
      { label: 'Controles testeados' },
    ],
    entryEyebrow: 'Punto de entrada',
    entryPrice: '4 UF',
    entryCaption: 'Diagnóstico de controles. Se acredita a cualquier implementación.',
    availabilityEyebrow: 'Disponibilidad',
    availability: '1–2 proyectos nuevos al mes. Respuesta en 24–48 horas hábiles.',
    problemEyebrow: 'Problema',
    problemTitle: 'En finanzas, una respuesta equivocada silenciosa es peor que una falla ruidosa',
    problemSubtitle:
      'La conciliación manual y las planillas ad-hoc tienden a fallar abierto: producen un número incluso cuando los inputs no cuadran. El error es invisible hasta que es caro.',
    problemCards: [
      {
        title: 'Lo que suele pasar',
        body: 'Los saldos se cuadran a mano, una fórmula traga una diferencia en silencio, y el reporte se ve bien. La discrepancia aparece semanas después en una auditoría, un cierre o un reclamo — mucho después de cuando era barato arreglarla.',
      },
      {
        title: 'La asimetría real',
        body: 'Una planilla rápida parece eficiente hasta que produce un número equivocado con confianza. Un control fail-closed que se detiene y marca cuesta un poco más de tiempo por ejecución y mucho menos que el retrabajo, la corrección y el daño de confianza de un error silencioso.',
      },
    ],
    scopeEyebrow: 'Enfoque',
    scopeTitle: 'Hacer que el sistema se niegue a producir una respuesta equivocada con confianza',
    scopeSubtitle:
      'Antes de construir definimos los controles: qué debe cuadrar, qué tolerancia se permite, qué debe rechazar el sistema y qué evidencia debe dejar cada ejecución. Corrección por sobre conveniencia.',
    scopeNote: {
      label: 'Qué no es esto',
      body: 'No es un ERP o plataforma contable completa, una auditoría financiera certificada (no soy contador auditor) ni declaración o asesoría tributaria. Es tooling acotado y fail-closed que hace verificable el trabajo financiero.',
    },
    reviewGroups: [
      {
        title: 'Conciliación',
        items: [
          'Cuadro bancos, libros o sistemas con reglas explícitas y documentadas.',
          'Falla cerrado ante diferencias en vez de producir un número silencioso.',
          'Tolerancias y excepciones manejadas a propósito, no por accidente.',
          'Ejecuciones reproducibles que concilian al mismo resultado cada vez.',
        ],
      },
      {
        title: 'Controles fail-closed',
        items: [
          'Validaciones que se detienen y marcan en vez de absorber input malo.',
          'Matemática financiera determinista, sin sorpresas de punto flotante.',
          'Reglas claras y revisables que un no-autor puede entender.',
          'Tests que fijan los controles antes de que entre cualquier cambio.',
        ],
      },
      {
        title: 'Artefactos de auditoría',
        items: [
          'Salidas deterministas y una traza de auditoría por cada ejecución.',
          'Evidencia empaquetada para que la revisión y la firma sean simples.',
          'Reglas versionadas para que los cambios de lógica sean trazables.',
          'Documentación que sobrevive a la auditoría y al traspaso.',
        ],
      },
    ],
    processEyebrow: 'Proceso',
    processTitle: 'Cómo funciona una implementación de controles',
    processSubtitle:
      'Fijar los requisitos de control, construir el sistema verificable más pequeño, y dejar evidencia y documentación con grado de auditoría.',
    processSteps: [
      ['01', 'Llamada de diagnóstico gratuita', 'Una llamada de 15 minutos para confirmar que la conciliación o el control encaja. Sin costo, sin compromiso.'],
      ['02', 'Diagnóstico de controles', 'Un discovery corto y pagado que fija qué debe cuadrar, tolerancias permitidas, qué debe rechazar el sistema y la evidencia requerida — acordados por escrito. El valor se acredita a la implementación.'],
      ['03', 'Construcción acotada', 'Implementación con controles fail-closed, tests, salidas deterministas y progreso visible en GitHub.'],
      ['04', 'Traspaso', 'Artefactos de auditoría, documentación de controles, setup y modos de falla — para que tu equipo lo opere y revise sin necesitarme en una llamada.'],
    ],
    plansEyebrow: 'Planes y precios',
    plansTitle: 'De una conciliación a un sistema de controles financieros',
    plansSubtitle:
      'El punto de entrada natural es el Diagnóstico de Controles (4 UF, acreditable a la implementación). La mayoría parte con un flujo de conciliación y luego se expande a un sistema de control más amplio a medida que crecen los requisitos de confianza.',
    plans: [
      {
        priceLabel: '4 UF',
        priceApprox: 'acreditable',
        name: 'Diagnóstico de Controles',
        intro: 'Una especificación de control por escrito antes de construir: qué debe cuadrar, tolerancias, rechazos y evidencia requerida.',
        note: 'El valor se acredita a la implementación que siga.',
        items: ['Llamada de diagnóstico gratis', 'Especificación de control por escrito', 'Cotización a precio fijo', 'Acreditable a la construcción'],
      },
      {
        priceLabel: 'Desde 45 UF',
        priceApprox: 'por proyecto',
        name: 'Implementación Acotada',
        intro: 'Un flujo de conciliación o control construido fail-closed, con salidas deterministas y artefactos de auditoría.',
        note: 'El punto de partida más común.',
        recommended: true,
        items: ['Todo lo del Diagnóstico', 'Un flujo de control fail-closed', 'Artefactos de auditoría deterministas', 'Controles testeados', 'Documentación + traspaso'],
      },
      {
        priceLabel: 'Desde 90 UF',
        priceApprox: 'por proyecto',
        name: 'Sistema de Control Financiero',
        intro: 'Varias fuentes y controles unificados en un sistema auditable con evidencia consistente.',
        items: ['Todo lo de la Implementación Acotada', 'Varias fuentes conciliadas', 'Traza de auditoría unificada', 'Reglas de control versionadas'],
      },
      {
        priceLabel: 'Desde 8 UF/mes',
        priceApprox: 'por mes',
        name: 'Retainer de Estabilización',
        intro: 'Mantén los controles vigentes a medida que evolucionan reglas, fuentes y requisitos, con revisión externa.',
        note: 'Opcional. Sin amarre.',
        items: ['Actualización de reglas y fuentes', 'Nuevos controles', 'Apoyo en auditoría', 'Respuesta prioritaria'],
      },
    ],
    tableFeatures: [
      ['Llamada de diagnóstico gratis', true, true, true, true],
      ['Especificación de control por escrito', true, true, true, false],
      ['Un flujo de control fail-closed', false, true, true, false],
      ['Varias fuentes conciliadas', false, false, true, false],
      ['Artefactos de auditoría deterministas', false, true, true, true],
      ['Controles testeados y CI', false, true, true, true],
      ['Documentación + traspaso', false, true, true, true],
      ['Mantención de reglas continua', false, false, false, true],
    ],
    pricingNote:
      'Los precios son puntos de partida para trabajo claramente acotado y se confirman tras el paso de diagnóstico. El trabajo crítico para la confianza se cotiza en consecuencia. Los valores en UF están calibrados para el mercado chileno y latinoamericano. La versión internacional está cotizada en USD con documentación de auditoría lista para gerencia.',
    whyEyebrow: 'Por qué Tooltician',
    whyTitle: 'No es lo mismo que una planilla que siempre devuelve un número',
    whySubtitle:
      'A una planilla le da igual estar equivocada con confianza. Tooltician construye sistemas que prefieren detenerse antes que engañarte.',
    whyAltLabel: 'Planilla / script genérico',
    whyAltItems: [
      'Falla abierto: produce un número incluso cuando los inputs no cuadran.',
      'Errores de punto flotante y de copia se esconden dentro de las fórmulas.',
      'Sin traza de auditoría — no puedes probar qué hizo realmente una ejecución pasada.',
      'Sin tests, así que un cambio silencioso en la lógica pasa inadvertido.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Falla cerrado: se detiene y marca en vez de producir un número equivocado silencioso.',
      'Matemática financiera determinista con reglas explícitas y revisables.',
      'Artefactos de auditoría que hacen simples la revisión y la firma.',
      'Controles testeados y versionados para que los cambios sean trazables.',
    ],
    whyNote: {
      label: 'Evidencia, no promesas',
      body: 'Tooltician publica bankrecon (un CLI de conciliación bancaria fail-closed en PyPI) y Portfolio Manager (matemática financiera determinista, persistencia local). Los mismos estándares aplican a tu proyecto.',
    },
    casesEyebrow: 'Casos de uso',
    casesTitle: 'Dónde encaja mejor este servicio',
    casesSubtitle: 'Para trabajo financiero y operativo donde la corrección importa más que una ejecución un poco más rápida.',
    cases: [
      ['Conciliación bancaria', 'Cuadrar cartolas con libros a mano, donde una herramienta fail-closed detecta diferencias antes del cierre.'],
      ['Controles entre sistemas', 'Números que deben cuadrar entre sistemas, donde el desvío silencioso hoy se absorbe y se descubre tarde.'],
      ['Preparación para auditoría', 'Un proceso que necesita una traza defendible, donde los artefactos deterministas simplifican revisión y firma.'],
      ['Matemática financiera determinista', 'Cálculos que deben ser exactos y reproducibles, donde las sorpresas de punto flotante son inaceptables.'],
    ],
    relatedLabel: 'Proyectos relacionados',
    related: [
      { label: 'bankrecon', href: 'https://pypi.org/project/bankrecon/', accent: true },
      { label: 'Conciliador Bancario', href: 'https://github.com/cortega26/conciliador_bancario', accent: true },
      { label: 'Portfolio Manager', href: 'https://github.com/cortega26/portfolio-manager-server', accent: true },
      { label: 'Portafolio', href: '/es/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Preguntas que vale la pena responder con precisión',
    faqs: [
      ['¿Cómo cobras esto — por hora o precio fijo?', 'Alcance fijo, no por hora. Tras un paso corto de diagnóstico acordamos un precio fijo para una construcción claramente definida. Sabes el costo antes de empezar.'],
      ['¿Por qué es más caro que los otros servicios?', 'El trabajo crítico para la confianza conlleva más responsabilidad: el costo de un error silencioso es alto, así que los controles, tests y artefactos de auditoría son más rigurosos. El precio refleja ese rigor.'],
      ['¿Es esto una auditoría financiera?', 'No. No soy contador auditor y esto no es una auditoría certificada. Construyo el tooling y los controles que hacen verificable y lista-para-auditoría tu operación financiera — la auditoría en sí queda con tu auditor.'],
      ['¿Qué significa fail-closed aquí?', 'Significa que el sistema se niega a producir un resultado con confianza cuando los inputs no cuadran. Se detiene y marca en vez de devolver un número que se ve bien pero está equivocado.'],
      ['¿Necesitas acceso a datos financieros?', 'Para el diagnóstico suele bastar una muestra o el esquema. Para la construcción se requiere acceso controlado a las fuentes relevantes, acotado a lo que el trabajo necesita y manejado con cuidado.'],
      ['¿Por qué la versión en inglés se cotiza en USD y aquí en UF?', 'El servicio internacional se entrega completamente en inglés con documentación de auditoría lista para gerencia, cotizado en USD para clientes de EE. UU., Reino Unido y Europa. La versión en español está calibrada para el mercado chileno y latinoamericano en UF.'],
    ],
    contactEyebrow: 'Siguiente paso',
    contactTitle: 'Parte acotando los controles, no confiando en la planilla',
    contactSubtitle:
      'Si una conciliación o control importa lo suficiente como para que un error silencioso duela, el punto de entrada correcto es un diagnóstico corto que lo convierte en una construcción fail-closed.',
    contactCardTitle: 'Diagnóstico de controles — 4 UF',
    contactCardBody:
      'Una especificación de control por escrito: qué debe cuadrar, tolerancias, rechazos y evidencia requerida, más una cotización a precio fijo. El valor se acredita a la construcción.',
    contactRiskNote:
      'Si el diagnóstico muestra que los controles existentes ya son sólidos, el documento lo confirma con evidencia — saber que lo básico se sostiene también es valioso antes de una auditoría o un cierre. El valor aplica igual, pero no hay sorpresas.',
    contactCallLabel: 'Prefiero agendar una llamada',
    intakeHeading: 'Cuéntame sobre el control',
    intents: [
      { tag: 'Concilio a mano', body: 'Reemplazar el cuadre manual con una herramienta fail-closed que se detiene ante diferencias y deja traza de auditoría.' },
      { tag: 'Los números deben cuadrar entre sistemas', body: 'Construir controles entre sistemas que detectan el desvío silencioso antes de que sea caro.' },
      { tag: 'Necesito estar listo para auditoría', body: 'Artefactos deterministas y documentación que simplifican revisión y firma.' },
    ],
    outreach:
      'Si llegaste aquí porque un número tiene que estar bien, el alcance es este: definir los controles, construirlos fail-closed y dejar evidencia con grado de auditoría. Precio fijo, sin horas abiertas.',
  },
};

const staticSites: ServiceDefinition = {
  slugEn: 'static-sites',
  slugEs: 'sitios-web',
  serviceKey: 'web',
  areaServed: ['US', 'GB', 'EU', 'LATAM'],
  en: {
    title: 'Static Sites & Front Ends | Tooltician',
    description:
      'Lean Astro and static web sites with SEO, speed, bilingual support, and clean deploy pipelines. Built to be readable and easily maintained.',
    serviceName: 'Static Sites & Front Ends',
    serviceType: ['Astro development', 'Static site development', 'Frontend development', 'Bilingual website development'],
    eyebrow: 'Static Sites & Front Ends · Tooltician',
    h1: 'A fast, indexable site that explains the system — not decoration',
    lede: 'I build lean Astro and static surfaces with SEO and performance baked in, bilingual where you need it, and a clean deploy pipeline — sites that convert the right lead and stay maintainable instead of rotting after launch.',
    subcopy:
      'All deliverables are in English. You get a fast, accessible, documented site, not a heavy template you cannot edit.',
    ctaPrimary: 'Scope my site — from $190',
    ctaSecondary: "See what's included",
    microcopy:
      'Fixed scope, not open-ended hours. Every engagement starts with a free 15-minute call to confirm fit before any quote.',
    fitEyebrow: 'Typical fit',
    fitItems: [
      'Teams that need a credible, fast public surface, not a decorative marketing site.',
      'Founders who want a site that ranks and converts, with a clean handoff.',
      'Projects that value evidence and clarity over heavy templates and plugins.',
    ],
    signalsEyebrow: 'Built for performance',
    signals: [
      { label: 'Astro / static', accent: true },
      { label: 'SEO baked in', accent: true },
      { label: 'Bilingual / i18n' },
      { label: 'Clean deploy' },
    ],
    entryEyebrow: 'Entry point',
    entryPrice: '$190',
    entryCaption: 'Site scoping. Applied as credit toward any build.',
    availabilityEyebrow: 'Availability',
    availability: '2–3 new sites per month. Response within 24–48 business hours.',
    problemEyebrow: 'Problem',
    problemTitle: 'Most sites are slow, hard to edit, and quietly invisible to search',
    problemSubtitle:
      'A heavy template looks fine on launch day, then accumulates plugins, slows down, and becomes something no one on the team can safely change.',
    problemCards: [
      {
        title: 'What typically happens',
        body: 'A page builder or bloated theme ships fast but loads slowly, scores poorly on mobile, leaks SEO basics, and locks editing behind a tool only the original agency understands. Every change becomes a ticket.',
      },
      {
        title: 'The real asymmetry',
        body: 'A cheap template feels like a saving until it costs you ranking, speed, and the ability to make a simple edit. A lean, documented static site costs a little more up front and far less over its life.',
      },
    ],
    scopeEyebrow: 'Approach',
    scopeTitle: 'Lean by default, with SEO and performance built in, not bolted on',
    scopeSubtitle:
      'Before building, we agree the sitemap, the content surfaces, and the conversion goal. The result is a fast, accessible site your team can actually maintain.',
    scopeNote: {
      label: 'What this is not',
      body: 'This is not a complex web app, an e-commerce backend, a CMS-heavy build, or ongoing content production. It is a lean, fast, maintainable public surface with a clean handoff.',
    },
    reviewGroups: [
      {
        title: 'Build & performance',
        items: [
          'Astro or static build with minimal JavaScript by default.',
          'Performance and Core Web Vitals considered from the first commit.',
          'Self-hosted fonts, optimized assets, and a fast first paint.',
          'No uncontrolled third-party dependencies dragging the page down.',
        ],
      },
      {
        title: 'SEO & accessibility',
        items: [
          'Semantic markup, metadata, Open Graph, and structured data.',
          'Sitemap, canonical, and hreflang for bilingual sites.',
          'Accessible by default: focus states, contrast, and keyboard nav.',
          'Indexable content that search engines can actually read.',
        ],
      },
      {
        title: 'Maintainability & handoff',
        items: [
          'A clean deploy pipeline (e.g. GitHub Actions) you control.',
          'Content structured so non-developers can make safe edits.',
          'Documentation covering build, deploy, and content updates.',
          'A handoff so the next person is not locked out of their own site.',
        ],
      },
    ],
    processEyebrow: 'Process',
    processTitle: 'How a site build works',
    processSubtitle:
      'Agree the sitemap and conversion goal, build a fast and accessible surface, and hand it off documented enough to maintain.',
    processSteps: [
      ['01', 'Free diagnostic call', 'A 15-minute call to confirm the site is a fit and clarify the conversion goal. No charge, no obligation.'],
      ['02', 'Site scoping', 'A short paid discovery that locks the sitemap, content surfaces, and success criteria — agreed in writing. The fee is credited toward the build.'],
      ['03', 'Scoped build', 'Implementation with SEO and performance built in, visible progress in GitHub, and a clean deploy pipeline.'],
      ['04', 'Handoff', 'Build, deploy, and content-edit documentation — so your team updates and extends the site without me on a call.'],
    ],
    plansEyebrow: 'Plans & pricing',
    plansTitle: 'From a fast landing to a complete bilingual site',
    plansSubtitle:
      'The natural entry point is Site Scoping ($190, credited toward the build). Most projects start with a scoped site or landing, then grow into a multi-page bilingual build.',
    plans: [
      {
        priceLabel: 'From $190',
        priceApprox: 'credited to build',
        name: 'Site Scoping',
        intro: 'A sitemap and scope before any build: pages, content surfaces, conversion goal, and success criteria.',
        note: 'Fee credited toward any build that follows.',
        items: ['Free 15-min diagnostic call', 'Sitemap + scope in writing', 'Fixed-price build quote', 'Credited toward the build'],
      },
      {
        priceLabel: 'From $1,200',
        priceApprox: 'one-time',
        name: 'Scoped Site / Landing',
        intro: 'One fast, indexable site or landing with SEO and performance baked in and a clean handoff.',
        note: 'Most common starting point.',
        recommended: true,
        items: ['Everything in Scoping', 'One fast, indexable site', 'SEO + performance built in', 'Accessible by default', 'Deploy pipeline + handoff'],
      },
      {
        priceLabel: 'From $2,600',
        priceApprox: 'one-time',
        name: 'Multi-page + i18n',
        intro: 'A larger bilingual site, SEO-complete, with the structure to grow without rotting.',
        items: ['Everything in Scoped Site', 'Multiple pages', 'Bilingual / i18n + hreflang', 'Structured content model'],
      },
      {
        priceLabel: 'From $150/mo',
        priceApprox: 'per month',
        name: 'Maintenance',
        intro: 'Keep the site fast and current: updates, monitoring, and small changes as needs evolve.',
        note: 'Optional. No lock-in.',
        items: ['Updates & small changes', 'Performance monitoring', 'Dependency upkeep', 'Priority response'],
      },
    ],
    tableFeatures: [
      ['Free 15-min diagnostic call', true, true, true, true],
      ['Sitemap + scope in writing', true, true, true, false],
      ['One fast, indexable site', false, true, true, false],
      ['Multiple pages', false, false, true, false],
      ['SEO + performance built in', false, true, true, true],
      ['Bilingual / i18n + hreflang', false, false, true, false],
      ['Deploy pipeline + handoff', false, true, true, true],
      ['Ongoing updates & monitoring', false, false, false, true],
    ],
    pricingNote:
      'Prices are starting points for clearly scoped work and are confirmed after the scoping step. International USD pricing reflects fully English deliverables and documentation. Looking for local pricing in Spanish? The Spanish version of this service is calibrated for the Chilean and Latin American market.',
    whyEyebrow: 'Why Tooltician',
    whyTitle: 'Not the same as a page builder or a bloated template',
    whySubtitle:
      'A template gets you live. Tooltician gets you a site that stays fast, ranks, and can be edited by your own team.',
    whyAltLabel: 'Page builder / template',
    whyAltItems: [
      'Ships fast but loads slowly and scores poorly on mobile.',
      'SEO basics leak; structured data and hreflang are an afterthought.',
      'Editing is locked behind a tool only the original builder understands.',
      'Plugins accumulate until no one can safely change anything.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Lean by default — fast first paint and strong Core Web Vitals.',
      'SEO, structured data, and hreflang built in from the first commit.',
      'Content structured so your team can make safe edits.',
      'A documented deploy pipeline you actually own.',
    ],
    whyNote: {
      label: 'Proof, not promises',
      body: 'This very site is the reference build: self-hosted fonts, complete metadata and structured data, a clean GitHub Actions deploy, and public, auditable code. The same standards apply to your site.',
    },
    casesEyebrow: 'Use cases',
    casesTitle: 'Where this service fits best',
    casesSubtitle: 'Built for public surfaces that need to be fast, credible, and maintainable, not decorative.',
    cases: [
      ['Product or service site', 'A site that needs to explain the offering clearly, rank, and convert the right lead.'],
      ['Bilingual presence', 'A site that must serve two languages cleanly, with correct hreflang and a single content model.'],
      ['Replacing a slow template', 'An existing site that loads slowly and is hard to edit, rebuilt lean and documented.'],
      ['Evidence-first surface', 'A technical or portfolio site where clarity and proof matter more than decorative marketing.'],
    ],
    relatedLabel: 'Related projects',
    related: [
      { label: 'Monedario', href: 'https://monedario.cl', accent: true },
      { label: 'El Rincón de Ébano', href: 'https://elrincondeebano.com', accent: true },
      { label: 'Noticiencias', href: 'https://noticiencias.com', accent: true },
      { label: 'Portfolio', href: '/en/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions worth answering precisely',
    faqs: [
      ['How do you price this — hourly or fixed?', 'Fixed scope, not hourly. After a short scoping step we agree on a fixed price for a clearly defined build. You know the cost before work starts.'],
      ['What stack do you use?', 'Primarily Astro and static generation with minimal JavaScript, self-hosted fonts, and a GitHub Actions deploy. The result is fast, accessible, and maintainable.'],
      ['Can my team edit the site afterwards?', 'Yes. Content is structured so non-developers can make safe edits, and the handoff includes documentation for content updates, build, and deploy.'],
      ['Do you do e-commerce or complex web apps?', 'This service is for lean, fast public surfaces. Heavy e-commerce backends and complex web apps are out of scope — though I can advise on the right approach.'],
      ['Can you make it bilingual?', 'Yes. The Multi-page + i18n tier includes a bilingual build with correct hreflang and a single content model — the same pattern this site uses.'],
      ['Why is this priced in USD when the homepage shows UF?', 'This international service is delivered entirely in English, priced in USD for US, UK, and EU clients. The Spanish version is calibrated for the Chilean and Latin American market in UF.'],
    ],
    contactEyebrow: 'Next step',
    contactTitle: 'Start by scoping the site, not by picking a template',
    contactSubtitle:
      'If you need a fast, credible, maintainable site, the right entry point is a short scoping pass that turns it into a fixed-price build.',
    contactCardTitle: 'Site scoping — $190',
    contactCardBody:
      'A sitemap and scope: pages, content surfaces, conversion goal, and success criteria, plus a fixed-price build quote. The fee is credited toward the build.',
    contactRiskNote:
      'If scoping shows your current site mostly needs targeted fixes rather than a rebuild, the document says so — sometimes the right answer is smaller than a full project. The fee applies regardless, but there are no surprises.',
    contactCallLabel: 'Schedule a call instead',
    intakeHeading: 'Tell me about the site',
    intents: [
      { tag: 'I need a new site', body: 'A fast, indexable site or landing with SEO and performance built in.' },
      { tag: 'My site is slow and hard to edit', body: 'Rebuild it lean and documented so it ranks and your team can maintain it.' },
      { tag: 'I need it bilingual', body: 'A multi-page build with correct hreflang and a single content model.' },
    ],
    outreach:
      'If you arrived here because your site is slow, invisible to search, or impossible to edit, the scope is this: agree the sitemap, build it lean and fast, and hand it off documented. Fixed price, no open-ended hours.',
  },
  es: {
    title: 'Sitios Web y Frontends | Tooltician',
    description:
      'Sitios web y frontends en Astro y estáticos con SEO, velocidad y soporte bilingüe. Construidos para ser mantenibles y con código limpio.',
    serviceName: 'Sitios Web y Frontends',
    serviceType: ['Desarrollo Astro', 'Desarrollo de sitios estáticos', 'Desarrollo frontend', 'Desarrollo de sitios bilingües'],
    eyebrow: 'Sitios Web y Frontends · Tooltician',
    h1: 'Un sitio rápido e indexable que explica el sistema — no decoración',
    lede: 'Construyo superficies sobrias en Astro y estáticas con SEO y rendimiento integrados, bilingües donde lo necesites, y un pipeline de despliegue limpio — sitios que convierten al lead correcto y se mantienen mantenibles en vez de pudrirse después del lanzamiento.',
    subcopy:
      'Obtienes un sitio rápido, accesible y documentado, no un template pesado que no puedes editar.',
    ctaPrimary: 'Acotar mi sitio — desde 2 UF',
    ctaSecondary: 'Ver qué incluye',
    microcopy:
      'Alcance fijo, no horas abiertas. Cada proyecto empieza con una llamada gratuita de 15 minutos para confirmar el encaje antes de cualquier cotización.',
    fitEyebrow: 'Encaje típico',
    fitItems: [
      'Equipos que necesitan una superficie pública creíble y rápida, no un sitio de marketing decorativo.',
      'Fundadores que quieren un sitio que rankea y convierte, con un traspaso limpio.',
      'Proyectos que valoran evidencia y claridad por sobre templates y plugins pesados.',
    ],
    signalsEyebrow: 'Pensado para el rendimiento',
    signals: [
      { label: 'Astro / estático', accent: true },
      { label: 'SEO integrado', accent: true },
      { label: 'Bilingüe / i18n' },
      { label: 'Despliegue limpio' },
    ],
    entryEyebrow: 'Punto de entrada',
    entryPrice: '2 UF',
    entryCaption: 'Diagnóstico del sitio. Se acredita a cualquier implementación.',
    availabilityEyebrow: 'Disponibilidad',
    availability: '2–3 sitios nuevos al mes. Respuesta en 24–48 horas hábiles.',
    problemEyebrow: 'Problema',
    problemTitle: 'La mayoría de los sitios son lentos, difíciles de editar e invisibles para el buscador',
    problemSubtitle:
      'Un template pesado se ve bien el día del lanzamiento, luego acumula plugins, se vuelve lento y termina siendo algo que nadie del equipo puede cambiar con seguridad.',
    problemCards: [
      {
        title: 'Lo que suele pasar',
        body: 'Un page builder o tema recargado sale rápido pero carga lento, puntúa mal en móvil, descuida lo básico de SEO y deja la edición tras una herramienta que solo la agencia original entiende. Cada cambio se vuelve un ticket.',
      },
      {
        title: 'La asimetría real',
        body: 'Un template barato parece un ahorro hasta que te cuesta ranking, velocidad y la capacidad de hacer una edición simple. Un sitio estático sobrio y documentado cuesta un poco más al inicio y mucho menos a lo largo de su vida.',
      },
    ],
    scopeEyebrow: 'Enfoque',
    scopeTitle: 'Sobrio por defecto, con SEO y rendimiento integrados, no pegados después',
    scopeSubtitle:
      'Antes de construir acordamos el sitemap, las superficies de contenido y el objetivo de conversión. El resultado es un sitio rápido y accesible que tu equipo realmente puede mantener.',
    scopeNote: {
      label: 'Qué no es esto',
      body: 'No es una web app compleja, un backend de e-commerce, una construcción cargada de CMS ni producción de contenido continua. Es una superficie pública sobria, rápida y mantenible, con un traspaso limpio.',
    },
    reviewGroups: [
      {
        title: 'Construcción y rendimiento',
        items: [
          'Construcción en Astro o estática con JavaScript mínimo por defecto.',
          'Rendimiento y Core Web Vitals considerados desde el primer commit.',
          'Fuentes self-hosted, assets optimizados y un primer render rápido.',
          'Sin dependencias de terceros sin control arrastrando la página.',
        ],
      },
      {
        title: 'SEO y accesibilidad',
        items: [
          'Markup semántico, metadata, Open Graph y datos estructurados.',
          'Sitemap, canonical y hreflang para sitios bilingües.',
          'Accesible por defecto: estados de foco, contraste y navegación por teclado.',
          'Contenido indexable que los buscadores realmente pueden leer.',
        ],
      },
      {
        title: 'Mantenibilidad y traspaso',
        items: [
          'Un pipeline de despliegue limpio (p. ej. GitHub Actions) que controlas.',
          'Contenido estructurado para que no-desarrolladores editen con seguridad.',
          'Documentación que cubre build, despliegue y actualización de contenido.',
          'Un traspaso para que la siguiente persona no quede afuera de su propio sitio.',
        ],
      },
    ],
    processEyebrow: 'Proceso',
    processTitle: 'Cómo funciona la construcción de un sitio',
    processSubtitle:
      'Acordar el sitemap y el objetivo de conversión, construir una superficie rápida y accesible, y traspasarla documentada lo suficiente para mantener.',
    processSteps: [
      ['01', 'Llamada de diagnóstico gratuita', 'Una llamada de 15 minutos para confirmar que el sitio encaja y aclarar el objetivo de conversión. Sin costo, sin compromiso.'],
      ['02', 'Diagnóstico del sitio', 'Un discovery corto y pagado que fija el sitemap, las superficies de contenido y los criterios de éxito — acordados por escrito. El valor se acredita a la implementación.'],
      ['03', 'Construcción acotada', 'Implementación con SEO y rendimiento integrados, progreso visible en GitHub y un pipeline de despliegue limpio.'],
      ['04', 'Traspaso', 'Documentación de build, despliegue y edición de contenido — para que tu equipo actualice y extienda el sitio sin necesitarme en una llamada.'],
    ],
    plansEyebrow: 'Planes y precios',
    plansTitle: 'De una landing rápida a un sitio bilingüe completo',
    plansSubtitle:
      'El punto de entrada natural es el Diagnóstico del Sitio (2 UF, acreditable a la implementación). La mayoría parte con un sitio o landing acotado y luego crece a una construcción bilingüe de varias páginas.',
    plans: [
      {
        priceLabel: '2 UF',
        priceApprox: 'acreditable',
        name: 'Diagnóstico del Sitio',
        intro: 'Un sitemap y alcance antes de construir: páginas, superficies de contenido, objetivo de conversión y criterios de éxito.',
        note: 'El valor se acredita a la implementación que siga.',
        items: ['Llamada de diagnóstico gratis', 'Sitemap + alcance por escrito', 'Cotización a precio fijo', 'Acreditable a la construcción'],
      },
      {
        priceLabel: 'Desde 25 UF',
        priceApprox: 'por proyecto',
        name: 'Sitio / Landing Acotado',
        intro: 'Un sitio o landing rápido e indexable con SEO y rendimiento integrados y un traspaso limpio.',
        note: 'El punto de partida más común.',
        recommended: true,
        items: ['Todo lo del Diagnóstico', 'Un sitio rápido e indexable', 'SEO + rendimiento integrados', 'Accesible por defecto', 'Pipeline de despliegue + traspaso'],
      },
      {
        priceLabel: 'Desde 50 UF',
        priceApprox: 'por proyecto',
        name: 'Multi-página + i18n',
        intro: 'Un sitio bilingüe más grande, SEO-completo, con la estructura para crecer sin pudrirse.',
        items: ['Todo lo del Sitio Acotado', 'Varias páginas', 'Bilingüe / i18n + hreflang', 'Modelo de contenido estructurado'],
      },
      {
        priceLabel: 'Desde 3 UF/mes',
        priceApprox: 'por mes',
        name: 'Mantención',
        intro: 'Mantén el sitio rápido y vigente: actualizaciones, monitoreo y cambios pequeños a medida que evolucionan las necesidades.',
        note: 'Opcional. Sin amarre.',
        items: ['Actualizaciones y cambios pequeños', 'Monitoreo de rendimiento', 'Mantención de dependencias', 'Respuesta prioritaria'],
      },
    ],
    tableFeatures: [
      ['Llamada de diagnóstico gratis', true, true, true, true],
      ['Sitemap + alcance por escrito', true, true, true, false],
      ['Un sitio rápido e indexable', false, true, true, false],
      ['Varias páginas', false, false, true, false],
      ['SEO + rendimiento integrados', false, true, true, true],
      ['Bilingüe / i18n + hreflang', false, false, true, false],
      ['Pipeline de despliegue + traspaso', false, true, true, true],
      ['Actualizaciones y monitoreo continuos', false, false, false, true],
    ],
    pricingNote:
      'Los precios son puntos de partida para trabajo claramente acotado y se confirman tras el paso de diagnóstico. Los valores en UF están calibrados para el mercado chileno y latinoamericano. ¿Necesitas el servicio en inglés con documentación lista para gerencia? La versión internacional está cotizada en USD.',
    whyEyebrow: 'Por qué Tooltician',
    whyTitle: 'No es lo mismo que un page builder o un template recargado',
    whySubtitle:
      'Un template te deja online. Tooltician te deja un sitio que se mantiene rápido, rankea y puede ser editado por tu propio equipo.',
    whyAltLabel: 'Page builder / template',
    whyAltItems: [
      'Sale rápido pero carga lento y puntúa mal en móvil.',
      'Lo básico de SEO se descuida; datos estructurados y hreflang quedan de adorno.',
      'La edición queda tras una herramienta que solo el constructor original entiende.',
      'Los plugins se acumulan hasta que nadie puede cambiar nada con seguridad.',
    ],
    whyUsLabel: 'Tooltician',
    whyUsItems: [
      'Sobrio por defecto — primer render rápido y buenos Core Web Vitals.',
      'SEO, datos estructurados y hreflang integrados desde el primer commit.',
      'Contenido estructurado para que tu equipo edite con seguridad.',
      'Un pipeline de despliegue documentado que realmente es tuyo.',
    ],
    whyNote: {
      label: 'Evidencia, no promesas',
      body: 'Este mismo sitio es la construcción de referencia: fuentes self-hosted, metadata y datos estructurados completos, un despliegue limpio con GitHub Actions y código público y auditable. Los mismos estándares aplican a tu sitio.',
    },
    casesEyebrow: 'Casos de uso',
    casesTitle: 'Dónde encaja mejor este servicio',
    casesSubtitle: 'Para superficies públicas que necesitan ser rápidas, creíbles y mantenibles, no decorativas.',
    cases: [
      ['Sitio de producto o servicio', 'Un sitio que necesita explicar la oferta con claridad, rankear y convertir al lead correcto.'],
      ['Presencia bilingüe', 'Un sitio que debe servir dos idiomas limpiamente, con hreflang correcto y un solo modelo de contenido.'],
      ['Reemplazar un template lento', 'Un sitio existente que carga lento y es difícil de editar, reconstruido sobrio y documentado.'],
      ['Superficie centrada en evidencia', 'Un sitio técnico o de portafolio donde la claridad y la prueba importan más que el marketing decorativo.'],
    ],
    relatedLabel: 'Proyectos relacionados',
    related: [
      { label: 'Monedario', href: 'https://monedario.cl', accent: true },
      { label: 'El Rincón de Ébano', href: 'https://elrincondeebano.com', accent: true },
      { label: 'Noticiencias', href: 'https://noticiencias.com', accent: true },
      { label: 'Portafolio', href: '/es/#portfolio' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Preguntas que vale la pena responder con precisión',
    faqs: [
      ['¿Cómo cobras esto — por hora o precio fijo?', 'Alcance fijo, no por hora. Tras un paso corto de diagnóstico acordamos un precio fijo para una construcción claramente definida. Sabes el costo antes de empezar.'],
      ['¿Qué stack usas?', 'Principalmente Astro y generación estática con JavaScript mínimo, fuentes self-hosted y despliegue con GitHub Actions. El resultado es rápido, accesible y mantenible.'],
      ['¿Mi equipo puede editar el sitio después?', 'Sí. El contenido se estructura para que no-desarrolladores editen con seguridad, y el traspaso incluye documentación para actualizar contenido, build y despliegue.'],
      ['¿Haces e-commerce o web apps complejas?', 'Este servicio es para superficies públicas sobrias y rápidas. Backends de e-commerce pesados y web apps complejas quedan fuera de alcance — aunque puedo asesorarte sobre el enfoque correcto.'],
      ['¿Puedes hacerlo bilingüe?', 'Sí. El nivel Multi-página + i18n incluye una construcción bilingüe con hreflang correcto y un solo modelo de contenido — el mismo patrón que usa este sitio.'],
      ['¿Por qué la versión en inglés se cotiza en USD y aquí en UF?', 'El servicio internacional se entrega completamente en inglés, cotizado en USD para clientes de EE. UU., Reino Unido y Europa. La versión en español está calibrada para el mercado chileno y latinoamericano en UF.'],
    ],
    contactEyebrow: 'Siguiente paso',
    contactTitle: 'Parte acotando el sitio, no eligiendo un template',
    contactSubtitle:
      'Si necesitas un sitio rápido, creíble y mantenible, el punto de entrada correcto es un diagnóstico corto que lo convierte en una construcción a precio fijo.',
    contactCardTitle: 'Diagnóstico del sitio — 2 UF',
    contactCardBody:
      'Un sitemap y alcance: páginas, superficies de contenido, objetivo de conversión y criterios de éxito, más una cotización a precio fijo. El valor se acredita a la construcción.',
    contactRiskNote:
      'Si el diagnóstico muestra que tu sitio actual necesita arreglos puntuales en vez de una reconstrucción, el documento lo dice — a veces la respuesta correcta es más pequeña que un proyecto completo. El valor aplica igual, pero no hay sorpresas.',
    contactCallLabel: 'Prefiero agendar una llamada',
    intakeHeading: 'Cuéntame sobre el sitio',
    intents: [
      { tag: 'Necesito un sitio nuevo', body: 'Un sitio o landing rápido e indexable con SEO y rendimiento integrados.' },
      { tag: 'Mi sitio es lento y difícil de editar', body: 'Reconstruirlo sobrio y documentado para que rankee y tu equipo lo mantenga.' },
      { tag: 'Lo necesito bilingüe', body: 'Una construcción multi-página con hreflang correcto y un solo modelo de contenido.' },
    ],
    outreach:
      'Si llegaste aquí porque tu sitio es lento, invisible para el buscador o imposible de editar, el alcance es este: acordar el sitemap, construirlo sobrio y rápido, y traspasarlo documentado. Precio fijo, sin horas abiertas.',
  },
};

export const services: Record<
  'python-automation' | 'internal-tools' | 'financial-tooling' | 'static-sites',
  ServiceDefinition
> = {
  'python-automation': pythonAutomation,
  'internal-tools': internalTools,
  'financial-tooling': financialTooling,
  'static-sites': staticSites,
};

export const serviceList = Object.values(services);
