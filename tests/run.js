#!/usr/bin/env node
/**
 * Tooltician Portfolio — Automated Test Suite
 * Run: node tests/run.js            (source checks only)
 * Run: node tests/run.js --built    (source + dist output checks)
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const BUILT = process.argv.includes('--built');

let passed = 0;
let failed = 0;
const failures = [];

// ─── Helpers ────────────────────────────────────────────────────────────────

function read(relPath) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${name}`);
    passed++;
  } else {
    console.log(`  ✗  ${name}${detail ? '\n       → ' + detail : ''}`);
    failed++;
    failures.push(name);
  }
}

function group(label, fn) {
  console.log(`\n── ${label}`);
  fn();
}

// ─── Source file shortcuts ────────────────────────────────────────────────

const hero       = () => read('src/components/HeroSection.astro') || '';
const portfolio  = () => read('src/components/PortfolioSection.astro') || '';
const caseStudies = () => read('src/data/caseStudies.ts') || '';
const services   = () => read('src/components/ServicesSection.astro') || '';
const about      = () => read('src/components/AboutSection.astro') || '';
const creds      = () => read('src/components/CredentialsSection.astro') || '';
const contact    = () => read('src/components/ContactSection.astro') || '';
const footer     = () => read('src/components/Footer.astro') || '';
const navbar     = () => read('src/components/Navbar.astro') || '';
const pageEN     = () => read('src/pages/en/index.astro') || '';
const pageES     = () => read('src/pages/es/index.astro') || '';
const astroConf  = () => read('astro.config.mjs') || '';
const rootHTML   = () => read('index.html') || '';
const indexAstro = () => read('src/pages/index.astro') || '';
const layout     = () => read('src/layouts/BaseLayout.astro') || '';
const globalCss  = () => read('src/styles/global.css') || '';
const siteLayoutJs = () => read('public/assets/js/site-layout.js') || '';
const portfolioFiltersJs = () => read('public/assets/js/portfolio-filters.js') || '';
const intakeForm = () => read('src/components/IntakeForm.astro') || '';

// ─── Tests ───────────────────────────────────────────────────────────────────

group('A1 · Spinning ring animation removed', () => {
  const src = hero();
  assert(
    'No spin-ring animation property',
    !src.includes('animation: spin-ring') && !src.includes('animation:spin-ring'),
    'Found spin-ring animation in HeroSection.astro'
  );
  assert(
    'No @keyframes spin-ring block',
    !src.includes('@keyframes spin-ring'),
    'Found @keyframes spin-ring in HeroSection.astro'
  );
  assert(
    'No legacy photo-ring markup remains',
    !src.includes('hero__photo-ring'),
    'Legacy hero__photo-ring markup still present'
  );
});

group('A2 · Orb float animations removed', () => {
  const src = hero();
  assert(
    'No @keyframes hero-float block',
    !src.includes('@keyframes hero-float'),
    'Found @keyframes hero-float in HeroSection.astro'
  );
  assert(
    'No animation: hero-float on orb-1',
    !src.match(/hero__orb--1[^}]*animation:/s),
    'hero__orb--1 still has animation property'
  );
  assert(
    'No legacy hero orb classes remain',
    !src.includes('hero__orb'),
    'Legacy hero orb styling still present'
  );
});

group('A3 · Emoji icons removed from ServicesSection', () => {
  const src = services();
  const emojis = ['🔄', '🕷️', '🔌', '🌐', '🏦', '📊'];
  for (const em of emojis) {
    assert(`No emoji ${em} in ServicesSection`, !src.includes(em));
  }
  assert(
    'SVG icons present in ServicesSection',
    src.includes('<svg') && src.includes('viewBox'),
    'Expected inline SVG icons in ServicesSection'
  );
});

group('A4 · Emoji icons removed from AboutSection', () => {
  const src = about();
  const emojis = ['👥', '📦', '⚙️'];
  for (const em of emojis) {
    assert(`No emoji ${em} in AboutSection`, !src.includes(em));
  }
  assert(
    'SVG icons present in AboutSection',
    src.includes('<svg'),
    'Expected inline SVG icons in AboutSection'
  );
});

group('B1 · Hero eyebrow updated', () => {
  const src = hero();
  assert(
    'EN eyebrow is not Tooltician',
    !src.includes("eyebrow: 'Tooltician'") && !src.includes('eyebrow: "Tooltician"'),
    "Hero EN eyebrow still set to 'Tooltician'"
  );
  assert(
    'New eyebrow contains LATAM or Consultant',
    src.includes('LATAM') || src.includes('Consultant') || src.includes('Consultor'),
    'New eyebrow should reference LATAM or Consultant role'
  );
});

group('B2 · Mobile hero layout fixed', () => {
  const src = hero();
  assert(
    'hero__aside NOT display:none in media query',
    !src.match(/@media[^{]*max-width.*?hero__aside[^}]*display\s*:\s*none/s) &&
    !src.match(/hero__aside[^}]*display\s*:\s*none[^}]*}[^@]*@media/s),
    'hero__aside is still hidden on mobile — remove display:none from media query'
  );
  assert(
    'Mobile CTA stacking present',
    src.includes('flex-direction: column') && src.includes('align-items: stretch'),
    'Expected stacked hero CTA layout on small screens'
  );
});

group('B3 · Hero lede updated', () => {
  const src = hero();
  assert(
    'New lede mentions "survive handoff" or "sobrevivir al traspaso"',
    src.includes('survive handoff') || src.includes('sobrevivir al traspaso'),
    'Updated lede should reference handoff survival'
  );
  assert(
    'New lede contains "hand them off" or "traspaso"',
    src.includes('hand them off') || src.includes('traspaso'),
    'Updated lede should say "hand them off" instead of "keep working after I leave"'
  );
  assert(
    'Old lede text removed',
    !src.includes('keep working after I leave'),
    'Old lede text still present'
  );
});

group('TT-006 · Hero portrait removed in favor of credibility panel', () => {
  const src = hero();
  assert(
    'No profile photo asset in HeroSection',
    !src.includes('profile-photo.webp') && !src.includes('profile-photo.png'),
    'Hero still references the portrait asset'
  );
  assert(
    'Hero includes engagement snapshot panel',
    src.includes('hero__brief') && (src.includes('Operating notes') || src.includes('Notas operativas')),
    'Expected hero credibility panel content'
  );
});

group('TT-007 · Hero support content simplified', () => {
  const src = hero();
  assert(
    'Old hero card/photo classes removed',
    !src.includes('hero__photo') && !src.includes('hero__card') && !src.includes('hero__cards'),
    'Legacy hero photo/card classes still present'
  );
  assert(
    'Hero support panel present',
    src.includes('hero__summary-panel') && src.includes('hero__brief-list') && (src.includes('Operating notes') || src.includes('Notas operativas')),
    'Expected current hero support panel with operating notes'
  );
});

group('TT-008 · Mobile nav uses controlled overlay behavior', () => {
  const navSrc = navbar();
  const navJs = siteLayoutJs();
  const cssSrc = globalCss();
  assert(
    'Navbar has overlay close control',
    navSrc.includes('navbar__overlay') && navSrc.includes('data-nav-close'),
    'Navbar overlay close control missing'
  );
  assert(
    'Layout script uses setNavOpen helper',
    navJs.includes('setNavOpen') && navJs.includes('closeNav'),
    'Expected controlled nav open/close helpers in site-layout.js'
  );
  assert(
    'Layout handles Escape and scroll lock',
    navJs.includes("event.key === 'Escape'") &&
    navJs.includes("document.body.classList.toggle('nav-open'"),
    'Expected Escape close and body scroll lock'
  );
  assert(
    'Global CSS defines nav overlay states',
    cssSrc.includes('.navbar__overlay.open') && cssSrc.includes('html.nav-open'),
    'Expected nav overlay/open state styles in global CSS'
  );
});

group('TT-014 · Focus-visible styles are present', () => {
  const cssSrc = globalCss();
  assert(
    'Global focus-visible selector exists',
    cssSrc.includes(':focus-visible'),
    'No focus-visible styles found in global CSS'
  );
  assert(
    'Buttons/nav controls receive custom focus treatment',
    cssSrc.includes('.btn:focus-visible') && cssSrc.includes('.navbar__toggle:focus-visible'),
    'Expected custom focus treatment for buttons and nav toggle'
  );
});

group('C1 · Section order: Services before Portfolio', () => {
  const en = pageEN();
  const es = pageES();
  // Match component usage tags (not import statements)
  const portfolioPosEN = en.indexOf('<PortfolioSection');
  const servicesPosEN  = en.indexOf('<ServicesSection');
  assert(
    'EN page: ServicesSection before PortfolioSection',
    portfolioPosEN > -1 && servicesPosEN > -1 && servicesPosEN < portfolioPosEN,
    `EN: <ServicesSection at ${servicesPosEN}, <PortfolioSection at ${portfolioPosEN}`
  );
  const portfolioPosES = es.indexOf('<PortfolioSection');
  const servicesPosES  = es.indexOf('<ServicesSection');
  assert(
    'ES page: ServicesSection before PortfolioSection',
    portfolioPosES > -1 && servicesPosES > -1 && servicesPosES < portfolioPosES,
    `ES: <ServicesSection at ${servicesPosES}, <PortfolioSection at ${portfolioPosES}`
  );
});

group('D1 · Real-Time Market Monitor removed', () => {
  const src = portfolio();
  assert(
    'crypto-price-tracker not in PortfolioSection',
    !src.includes('crypto-price-tracker'),
    'crypto-price-tracker repo link still present'
  );
  assert(
    'Real-Time Market Monitor not in PortfolioSection',
    !src.includes('Real-Time Market Monitor') && !src.includes('Monitor de Mercado'),
    'Project title still present'
  );
});

group('D2 · isNew badge removed from Ébano', () => {
  const src = portfolio();
  const ebanoBlock = src.match(/id:\s*'ebano'.*?(?=id:\s*'\w|\z)/s)?.[0] || '';
  assert(
    'Ébano project has no isNew: true',
    !ebanoBlock.includes('isNew: true') && !ebanoBlock.includes("isNew:true"),
    'ebano project still has isNew: true'
  );
});

group('D3 · PDF Text Analyzer removed', () => {
  const src = portfolio();
  assert(
    'PDF-Text-Analyzer not in PortfolioSection',
    !src.includes('PDF-Text-Analyzer'),
    'PDF Text Analyzer repo link still present'
  );
  assert(
    'PDF Text Analyzer title not in PortfolioSection',
    !src.includes('PDF Text Analyzer'),
    'PDF Text Analyzer title still present'
  );
});

group('D4 · Portfolio project order', () => {
  const src = caseStudies();
  const positions = {
    ebano: src.indexOf("id: 'ebano'"),
    portfolioManager: src.indexOf("id: 'portfolio-manager-unified'"),
    chileHub: src.indexOf("id: 'chile-hub'"),
    monedario: src.indexOf("id: 'monedario'"),
    stopSpam: src.indexOf("id: 'stop-spam-linkedin'"),
    conciliador: src.indexOf("id: 'conciliador'"),
    rutificador: src.indexOf("id: 'rutificador'"),
    dnspect: src.indexOf("id: 'dnspect'"),
    polla: src.indexOf("id: 'polla'"),
    noticiencias: src.indexOf("id: 'noticiencias'"),
  };
  assert(
    'ebano before portfolio manager',
    positions.ebano < positions.portfolioManager && positions.ebano > -1,
    `ebano:${positions.ebano}, portfolioManager:${positions.portfolioManager}`
  );
  assert(
    'portfolio manager before chile-hub',
    positions.portfolioManager < positions.chileHub,
    `portfolioManager:${positions.portfolioManager}, chileHub:${positions.chileHub}`
  );
  assert(
    'chile-hub before monedario',
    positions.chileHub < positions.monedario,
    `chileHub:${positions.chileHub}, monedario:${positions.monedario}`
  );
  assert(
    'monedario before LinkedIn extension',
    positions.monedario < positions.stopSpam,
    `monedario:${positions.monedario}, stopSpam:${positions.stopSpam}`
  );
  assert(
    'LinkedIn extension before conciliador',
    positions.stopSpam < positions.conciliador,
    `stopSpam:${positions.stopSpam}, conciliador:${positions.conciliador}`
  );
  assert(
    'conciliador before rutificador',
    positions.conciliador < positions.rutificador,
    `conciliador:${positions.conciliador}, rutificador:${positions.rutificador}`
  );
  assert(
    'All 10 required projects present',
    Object.values(positions).every(p => p > -1),
    'One or more required projects missing: ' + Object.entries(positions).filter(([,v]) => v === -1).map(([k]) => k).join(', ')
  );
});

group('D5 · Noticiencias 580M+ removed', () => {
  const src = caseStudies();
  assert(
    'No 580M in PortfolioSection',
    !src.includes('580M'),
    '580M+ claim still present in Noticiencias impact line'
  );
});

group('D6 · Ébano description rewritten', () => {
  const src = caseStudies();
  assert(
    'Ébano desc contains "This is not a demo"',
    src.includes('This is not a demo') || src.includes('Esto no es una demo'),
    'Expected "This is not a demo" in Ébano description'
  );
});

group('D7 · Conciliador description rewritten', () => {
  const src = caseStudies();
  assert(
    'Conciliador desc contains "silently"',
    src.includes('silently') || src.includes('silenciosamente'),
    'Expected "silently" in Conciliador description'
  );
});

group('D8 · Monedario description rewritten', () => {
  const src = caseStudies();
  assert(
    'Monedario desc contains "without advertising"',
    src.includes('without advertising') || src.includes('sin publicidad'),
    'Expected "without advertising" in Monedario description'
  );
});

group('D9 · Portfolio subtitle updated', () => {
  const src = portfolio();
  assert(
    'Portfolio subtitle mentions live production work',
    src.includes('already running in production') || src.includes('ya funcionando en producción'),
    'Portfolio subtitle does not match current copy in PortfolioSection.astro'
  );
});

group('D10 · Portfolio title updated', () => {
  const src = portfolio();
  assert(
    "Home title is 'Selected production work'",
    src.includes("'Selected production work'") || src.includes('"Selected production work"'),
    "Portfolio home title should be 'Selected production work'"
  );
});

group('TT-004 · Portfolio filtering removes cards from layout', () => {
  const src = portfolio();
  const dataSrc = caseStudies();
  const filterJs = portfolioFiltersJs();
  assert(
    'Projects define explicit filter categories',
    dataSrc.includes('filters: [') && src.includes('data-categories={proj.filters.join'),
    'Expected per-project filter categories in PortfolioSection'
  );
  assert(
    'Filter script uses hidden property',
    filterJs.includes('card.hidden = !match'),
    'Expected filtering to use hidden property so cards leave layout'
  );
  assert(
    'Old hidden-class filter behavior removed',
    !src.includes("classList.toggle('hidden'") && !src.includes('project-card.hidden'),
    'Legacy opacity-only hidden class still present'
  );
});

group('TT-015 · Portfolio cards are structured for scanability', () => {
  const src = portfolio();
  const dataSrc = caseStudies();
  assert(
    'Project data includes problem / solution / proof fields',
    dataSrc.includes('problem:') && dataSrc.includes('solution:') && dataSrc.includes('proof:'),
    'Expected problem/solution/proof fields in project data'
  );
  assert(
    'Card markup renders structured project points',
    src.includes('project-points') && src.includes('project-point'),
    'Expected structured project points in card markup'
  );
  assert(
    'Bilingual point labels exist',
    dataSrc.includes("problem: 'Why it mattered'") && dataSrc.includes("solution: 'Built'") && dataSrc.includes("proof: 'Verified result'") &&
    dataSrc.includes("problem: 'Por qué importó'") && dataSrc.includes("solution: 'Construido'") && dataSrc.includes("proof: 'Resultado verificable'"),
    'Expected EN and ES labels for the portfolio scan sections'
  );
});

group('TT-016 · Anchor projects are visually prioritized', () => {
  const src = portfolio();
  const dataSrc = caseStudies();
  const featuredCount = (dataSrc.match(/featured:\s*true/g) || []).length;
  assert(
    'At least two projects are marked featured',
    featuredCount >= 2,
    `Expected at least 2 featured projects, found ${featuredCount}`
  );
  assert(
    'Featured card styling exists',
    src.includes('project-card--featured') && src.includes('border-left: 2px solid var(--clr-accent)'),
    'Expected featured project card styling in PortfolioSection'
  );
});

group('TT-009 · Small external links read as actions', () => {
  const portfolioSrc = caseStudies();
  assert(
    'Portfolio uses explicit action labels',
    portfolioSrc.includes('View repository') || portfolioSrc.includes('Ver repositorio'),
    'Expected explicit repository action labels in portfolio links'
  );
  assert(
    'Legacy generic Repo/Docs labels removed from portfolio',
    !portfolioSrc.includes("label: 'Repo'") && !portfolioSrc.includes("label: 'Docs'") &&
    !portfolioSrc.includes('label: "Repo"') && !portfolioSrc.includes('label: "Docs"'),
    'Generic Repo/Docs labels still present in portfolio project links'
  );
});

group('TT-018 · Contact labels match action behavior', () => {
  const src = contact();
  const intakeSrc = intakeForm();
  assert(
    'Primary contact path is explicit email',
    src.includes('Email instead') || src.includes('Correo directo'),
    'Expected explicit email CTA in ContactSection'
  );
  assert(
    'Copy action is labeled as copy',
    src.includes('Copy address') || src.includes('Copiar dirección'),
    'Expected copy action label in ContactSection'
  );
  assert(
    'Submit button has localized sending label',
    intakeSrc.includes('data-sending={c.submitSending}'),
    'Expected localized submit-pending label via data-sending in IntakeForm'
  );
  assert(
    'Legacy misleading ES copy button label removed',
    !src.includes('Enviar correo'),
    'Found legacy misleading "Enviar correo" label in ContactSection'
  );
});

group('E1 · Services title updated', () => {
  const src = services();
  assert(
    "EN title is 'Six scoped services. One delivery standard.'",
    src.includes("'Six scoped services. One delivery standard.'") || src.includes('"Six scoped services. One delivery standard."'),
    "Services EN title should be 'Six scoped services. One delivery standard.'"
  );
  assert(
    'Old title "What I Build" is gone',
    !src.includes("'What I Build'") && !src.includes('"What I Build"'),
    "Old title 'What I Build' still present"
  );
});

group('E2 · Services subtitle updated', () => {
  const src = services();
  assert(
    'Services subtitle mentions a concrete operational problem',
    src.includes('concrete operational problem') || src.includes('problema operativo concreto'),
    'Services subtitle should mention the concrete operational problem'
  );
});

group('F1 · About title updated', () => {
  const src = about();
  assert(
    'About title is "Fit and Delivery"',
    src.includes('Fit and Delivery') || src.includes('Encaje y entrega'),
    'About title not updated'
  );
});

group('F2 · About intro rewritten', () => {
  const src = about();
  assert(
    'About intro starts from the workflow',
    src.includes('starts with the workflow') || src.includes('parte del flujo de trabajo'),
    'About intro should start from the workflow, not the code'
  );
});

group('G1 · Credentials section retired from homepage', () => {
  const src = creds();
  assert(
    'Credentials component removed from current Astro homepage',
    src === '',
    'Expected CredentialsSection.astro to be absent from the current component set'
  );
  assert(
    'Credentials section not referenced by EN or ES homepage',
    !pageEN().includes('<CredentialsSection') && !pageES().includes('<CredentialsSection'),
    'Credentials section should not be part of current EN/ES homepage composition'
  );
});

group('H2 · Portfolio Manager and LinkedIn extension are included in public work surfaces', () => {
  const portfolioSrc = caseStudies();

  assert(
    'Portfolio includes Portfolio Manager project',
    portfolioSrc.includes('Portfolio Manager') && portfolioSrc.includes('portfolio-manager-server'),
    'PortfolioSection is missing the Portfolio Manager entry'
  );
  assert(
    'Portfolio includes chile-hub project',
    portfolioSrc.includes('chile-hub') && portfolioSrc.includes('chile-hub'),
    'PortfolioSection is missing the chile-hub entry'
  );
  assert(
    'Portfolio includes LinkedIn Spam Blocker project',
    portfolioSrc.includes('LinkedIn Spam Blocker') && portfolioSrc.includes('stop-spam-linkedin'),
    'PortfolioSection is missing the LinkedIn Spam Blocker entry'
  );
});

group('I1 · Sitemap integration in astro.config.mjs', () => {
  const src = astroConf();
  assert(
    'astro.config.mjs imports sitemap',
    src.includes('sitemap'),
    'sitemap integration not found in astro.config.mjs'
  );
  assert(
    'astro.config.mjs has integrations array',
    src.includes('integrations'),
    'integrations array not found in astro.config.mjs'
  );
});

group('I2 · Title tag format updated', () => {
  const en = pageEN();
  const es = pageES();
  assert(
    'EN title contains "Tooltician" brand',
    en.includes('| Tooltician') || en.includes('Tooltician'),
    'EN title should include Tooltician brand'
  );
  assert(
    'EN title keeps a brand separator',
    /title="[^"]*[|—][^"]*Tooltician"/.test(en),
    'EN title should keep the Tooltician brand after a separator'
  );
  assert(
    'ES title contains "Tooltician"',
    es.includes('Tooltician'),
    'ES title should include Tooltician brand'
  );
});

group('I3 · Meta description updated', () => {
  const en = pageEN();
  const es = pageES();
  assert(
    'EN description mentions scoped Python automation',
    en.includes('Scoped Python automation'),
    'EN description should describe scoped Python automation'
  );
  assert(
    'EN description contains "handoff-ready"',
    en.includes('handoff-ready') || en.includes('handoff'),
    'EN description should mention handoff-ready systems'
  );
});

group('I4 · Root is a bilingual x-default landing', () => {
  const src = indexAstro();
  assert(
    'src/pages/index.astro has no meta refresh',
    !/http-equiv=["']?refresh/.test(src),
    'Root landing must not meta-refresh'
  );
  assert(
    'src/pages/index.astro is a real landing',
    src.includes('<h1') && src.includes('data-language-select') && src.includes('/en/#contact') && src.includes('/es/#contact'),
    'Root landing is missing its H1, language cards, or locale CTAs'
  );
  assert(
    'src/pages/index.astro consumes the shared route registry',
    src.includes("alternatesFor('home')"),
    'Root must consume alternatesFor(home) instead of hardcoded alternates'
  );
});

group('I5–I6 · OG card exists', () => {
  const ogPath = join(ROOT, 'public/assets/images/og-card.png');
  const exists = existsSync(ogPath);
  assert('public/assets/images/og-card.png exists', exists);
  if (exists) {
    const size = statSync(ogPath).size;
    assert(
      'og-card.png has meaningful size (> 5000 bytes)',
      size > 5000,
      `File too small: ${size} bytes — may be an empty or corrupt PNG`
    );
  }
});

group('I7 · BaseLayout includes Open Graph image metadata', () => {
  const src = layout();
  assert(
    'BaseLayout contains og:image and twitter:image tags',
    src.includes('og:image') && src.includes('twitter:image'),
    'BaseLayout should include og:image and twitter:image metadata'
  );
});

group('I8 · JSON-LD extended with structured data', () => {
  const en = pageEN();
  assert(
    'EN page consumes the shared JSON-LD builders',
    en.includes('buildPortfolioItemList') && en.includes('buildProfessionalService'),
    'EN page should build its structured data through src/data/jsonld.ts'
  );
});

group('J1 · Gmail address removed from source files', () => {
  const files = [
    ['HeroSection.astro', hero()],
    ['ContactSection.astro', contact()],
    ['Footer.astro', footer()],
    ['index.html (root)', rootHTML()],
  ];
  for (const [name, src] of files) {
    assert(
      `No carlosortega77@gmail.com in ${name}`,
      !src.includes('carlosortega77@gmail.com'),
      `Gmail address still present in ${name}`
    );
  }
});

group('L1 · Public trust surfaces linked from source', () => {
  const footerSrc = footer();
  const intakeSrc = intakeForm();

  assert(
    'Footer links to privacy, cookies, and terms pages',
    footerSrc.includes('/privacy/') && footerSrc.includes('/cookies/') && footerSrc.includes('/terms/'),
    'Footer is missing one or more public policy links'
  );
  assert(
    'Contact section references privacy expectations',
    intakeSrc.includes('/en/privacy/') && intakeSrc.includes('/en/cookies/') &&
    intakeSrc.includes('/es/privacy/') && intakeSrc.includes('/es/cookies/') &&
    intakeSrc.includes('Formspree') && intakeSrc.toLowerCase().includes('calendly'),
    'IntakeForm is missing its privacy/cookies disclosure note'
  );
});

group('K1 · Hero CTA hierarchy remains compact', () => {
  const src = hero();
  const actionButtons = (src.match(/<a class="btn /g) || []).length;
  assert(
    'Hero exposes exactly two CTA anchors',
    actionButtons === 2,
    `Expected 2 hero CTA anchors, found ${actionButtons}`
  );
});

group('I8b · JSON-LD is valid and parseable in built output', () => {
  // Only run if dist exists (build has been run)
  const distEN = read('dist/en/index.html');
  if (!distEN) {
    assert('[built] JSON-LD parse (skipped — run --built)', true);
    return;
  }
  const blocks = [...distEN.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  assert('dist/en JSON-LD blocks found', blocks.length > 0, 'No JSON-LD script tags in built EN HTML');
  if (blocks.length === 0) return;
  const person = blocks.find(b => Array.isArray(b['@type']) && b['@type'].includes('Person'));
  assert('dist/en primary JSON-LD @type includes Person', !!person, 'No JSON-LD block with @type array containing Person');
  if (person) {
    assert('JSON-LD @type array contains Person', person['@type'].includes('Person'), `Got: ${JSON.stringify(person['@type'])}`);
    assert('JSON-LD has makesOffer array', Array.isArray(person.makesOffer), 'makesOffer missing or not array');
    assert('JSON-LD primary block has no itemListElement', !('itemListElement' in person), 'Primary block should not carry itemListElement');
  }
  const itemList = blocks.find(b => b['@type'] === 'ItemList');
  assert('dist/en has ItemList JSON-LD block', !!itemList, 'No JSON-LD block with @type ItemList');
  if (itemList) {
    assert('ItemList has 10 itemListElement entries', Array.isArray(itemList.itemListElement) && itemList.itemListElement.length === 10, `Got: ${itemList.itemListElement ? itemList.itemListElement.length : 'missing'}`);
  }
});

// ─── Built output checks (only with --built flag) ─────────────────────────

if (BUILT) {
  console.log('\n── BUILT OUTPUT CHECKS (dist/)');

  const distEN = read('dist/en/index.html') || '';
  const distES = read('dist/es/index.html') || '';
  const dist404 = read('dist/404.html') || '';
  const distPrivacyEN = read('dist/en/privacy/index.html') || '';
  const distPrivacyES = read('dist/es/privacy/index.html') || '';
  const distCookiesEN = read('dist/en/cookies/index.html') || '';
  const distCookiesES = read('dist/es/cookies/index.html') || '';
  const distTermsEN = read('dist/en/terms/index.html') || '';
  const distTermsES = read('dist/es/terms/index.html') || '';

  assert(
    '[built] dist/en/index.html exists',
    distEN.length > 0,
    'dist/en/index.html not found — run npm run build first'
  );
  assert(
    '[built] dist/es/index.html exists',
    distES.length > 0,
    'dist/es/index.html not found'
  );
  for (const [path, html] of [
    ['dist/404.html', dist404],
    ['dist/en/privacy/index.html', distPrivacyEN],
    ['dist/es/privacy/index.html', distPrivacyES],
    ['dist/en/cookies/index.html', distCookiesEN],
    ['dist/es/cookies/index.html', distCookiesES],
    ['dist/en/terms/index.html', distTermsEN],
    ['dist/es/terms/index.html', distTermsES],
  ]) {
    assert(
      `[built] ${path} exists`,
      html.length > 0,
      `${path} not found in built output`
    );
  }
  assert(
    '[built] EN page title contains Tooltician',
    distEN.includes('Tooltician'),
    'EN title in built output does not contain Tooltician'
  );
  assert(
    '[built] EN page has og:image metadata',
    distEN.includes('property="og:image"'),
    'og:image metadata missing from built EN page'
  );
  assert(
    '[built] EN page has sitemap link in robots.txt',
    existsSync(join(ROOT, 'dist/sitemap-index.xml')),
    'dist/sitemap-index.xml not found — sitemap integration may not be configured'
  );
  assert(
    '[built] No carlosortega77@gmail.com in built EN page',
    !distEN.includes('carlosortega77@gmail.com'),
    'Gmail address still present in built EN output'
  );
  assert(
    '[built] No spin-ring in built EN CSS',
    !distEN.includes('spin-ring'),
    'spin-ring animation still in built output'
  );
  assert(
    '[built] Services section before Portfolio section in EN HTML',
    (() => {
      const portfolioId = distEN.indexOf('id="portfolio"');
      const servicesId  = distEN.indexOf('id="services"');
      return portfolioId > -1 && servicesId > -1 && servicesId < portfolioId;
    })(),
    'Services section does not precede Portfolio section in built EN HTML'
  );
  assert(
    '[built] No 580M in built EN HTML',
    !distEN.includes('580M'),
    '580M claim still in built EN output'
  );
  assert(
    '[built] Portfolio cards render Why it mattered / Built / Verified result',
    distEN.includes('Why it mattered') && distEN.includes('Built') && distEN.includes('Verified result'),
    'Built EN portfolio markup missing structured project scan labels'
  );
  assert(
    '[built] Contact section exposes primary email CTA',
    distEN.includes('Email instead'),
    'Built EN contact section missing primary email CTA'
  );
  assert(
    '[built] EN homepage exposes policy links and disclosure note',
    distEN.includes('/en/privacy/') && distEN.includes('/en/cookies/') && distEN.includes('/en/terms/') && distEN.includes('Formspree') && distEN.includes('Calendly'),
    'Built EN homepage is missing policy links or the contact disclosure note'
  );
  assert(
    '[built] ES page title contains Tooltician',
    distES.includes('Tooltician'),
    'ES title in built output does not contain Tooltician'
  );
  assert(
    '[built] Portfolio Manager renders in EN and ES output',
    distEN.includes('Portfolio Manager') && distES.includes('Portfolio Manager'),
    'Built localized pages are missing the Portfolio Manager content'
  );
  assert(
    '[built] chile-hub renders in EN and ES output',
    distEN.includes('chile-hub') && distES.includes('chile-hub'),
    'Built localized pages are missing the chile-hub content'
  );
  assert(
    '[built] LinkedIn Spam Blocker renders in EN and ES output',
    distEN.includes('LinkedIn Spam Blocker') && distES.includes('LinkedIn Spam Blocker'),
    'Built localized pages are missing the LinkedIn Spam Blocker content'
  );
  assert(
    '[built] EN privacy page references core data services',
    distPrivacyEN.includes('Formspree') && distPrivacyEN.includes('Calendly') && distPrivacyEN.includes('Google Analytics 4'),
    'Built EN privacy page is missing one or more core service references'
  );
  assert(
    '[built] ES cookies page references local storage and Calendly',
    distCookiesES.includes('almacenamiento local') && distCookiesES.includes('Calendly'),
    'Built ES cookies page is missing expected browser-storage disclosures'
  );
  assert(
    '[built] EN page links the EN résumé and not the ES one',
    distEN.includes('/assets/docs/carlos-ortega-resume.pdf') && !distEN.includes('carlos-ortega-resume-es.pdf'),
    'EN locale CV href wrong'
  );
  assert(
    '[built] ES page links the ES résumé',
    distES.includes('/assets/docs/carlos-ortega-resume-es.pdf'),
    'ES locale CV href wrong'
  );
  assert(
    '[built] home cards carry service scope + engage stamps',
    distEN.includes('data-service-id="automation"') && distEN.includes('data-service-engage') && distES.includes('data-service-id="automation"'),
    'home service stamps missing from dist'
  );
  const distGuide = read('dist/es/guias/automatizar-reportes-excel-python/index.html') || '';
  assert(
    '[built] guide carries service scope + engage stamps',
    distGuide.includes('data-service-id="automation"') && distGuide.includes('data-service-engage'),
    'guide stamps missing from dist'
  );
}

group('H-04 · Staged pricing labels on home, services, and HTW', () => {
  const esHome = read('dist/es/index.html');
  const enHome = read('dist/en/index.html');
  if (!esHome || !enHome) {
    assert('[built] H-04 pricing checks (skipped — run --built)', true);
    return;
  }
  const esService = read('dist/es/servicios/automatizacion-python/index.html') || '';
  const enService = read('dist/en/services/python-automation/index.html') || '';
  const esHtw = read('dist/es/servicios/higiene-tecnica-web/index.html') || '';
  const enHtw = read('dist/en/services/web-technical-hygiene/index.html') || '';

  assert(
    'H-04 ES home shows staged amounts (Diagnóstico + Construcción)',
    esHome.includes('Diagnóstico') && esHome.includes('Construcción'),
    'ES home is missing a stage label'
  );
  assert(
    'H-04 EN home shows staged amounts (Diagnostic + Build)',
    enHome.includes('Diagnostic') && enHome.includes('Build'),
    'EN home is missing a stage label'
  );
  assert('H-04 ES HTW pairs 1 UF with Diagnóstico', esHtw.includes('Diagnóstico 1 UF'), 'ES HTW is missing its exact diagnostic pair');
  assert('H-04 EN HTW pairs $69 with Diagnostic', enHtw.includes('Diagnostic ($69, credited toward implementation)'), 'EN HTW is missing its exact diagnostic pair');
});

group('PRICING · Exact stage/amount pairs per service and locale', () => {
  const enPages = {
    automation: 'dist/en/services/python-automation/index.html',
    'recurring-data': 'dist/en/services/recurring-data-collection/index.html',
    'internal-tools': 'dist/en/services/internal-tools/index.html',
    financial: 'dist/en/services/financial-tooling/index.html',
    web: 'dist/en/services/static-sites/index.html',
  };
  const esPages = {
    automation: 'dist/es/servicios/automatizacion-python/index.html',
    'recurring-data': 'dist/es/servicios/recoleccion-recurrente-datos/index.html',
    'internal-tools': 'dist/es/servicios/herramientas-internas/index.html',
    financial: 'dist/es/servicios/herramientas-financieras/index.html',
    web: 'dist/es/servicios/sitios-web/index.html',
  };
  const amounts = {
    automation:     { en: ['$290', '$1,500', '$3,200', '$290/mo'],  es: ['3 UF', '30 UF', '60 UF', '6 UF/mes'] },
    // recurring-data reuses the automation price band by design (see services.ts); values equal automation's.
    'recurring-data': { en: ['$290', '$1,500', '$3,200', '$290/mo'],  es: ['3 UF', '30 UF', '60 UF', '6 UF/mes'] },
    'internal-tools': { en: ['$290', '$1,800', '$3,600', '$290/mo'], es: ['3 UF', '35 UF', '70 UF', '6 UF/mes'] },
    financial:      { en: ['$390', '$2,400', '$4,800', '$390/mo'],  es: ['4 UF', '45 UF', '90 UF', '8 UF/mes'] },
    web:            { en: ['$190', '$1,200', '$2,600', '$150/mo'],  es: ['2 UF', '25 UF', '50 UF', '3 UF/mes'] },
  };
  const enPatterns = (a) => [
    `Diagnostic from ${a[0]}`,
    `From ${a[1]} (one-time)`,
    `From ${a[2]} (one-time)`,
    `From ${a[3]} (per month)`,
  ];
  const esPatterns = (a) => [
    `Diagnóstico desde ${a[0]}`,
    `Desde ${a[1]} (por proyecto)`,
    `Desde ${a[2]} (por proyecto)`,
    `Desde ${a[3]} (por mes)`,
  ];
  for (const [key, path] of Object.entries(enPages)) {
    const html = read(path);
    if (!html) { assert(`[built] ${key} EN page (skipped — run --built)`, true); continue; }
    enPatterns(amounts[key].en).forEach((pattern) => {
      assert(`EN ${key}: contains "${pattern}"`, html.includes(pattern), `Missing exact pair in ${path}`);
    });
  }
  for (const [key, path] of Object.entries(esPages)) {
    const html = read(path);
    if (!html) { assert(`[built] ${key} ES page (skipped — run --built)`, true); continue; }
    esPatterns(amounts[key].es).forEach((pattern) => {
      assert(`ES ${key}: contains "${pattern}"`, html.includes(pattern), `Missing exact pair in ${path}`);
    });
  }
});

group('H-13 · Recurring-data pages carry collection copy, not automation copy', () => {
  const enRecurring = read('dist/en/services/recurring-data-collection/index.html');
  const esRecurring = read('dist/es/servicios/recoleccion-recurrente-datos/index.html');
  if (!enRecurring || !esRecurring) {
    assert('[built] H-13 recurring-data copy checks (skipped — run --built)', true);
    return;
  }
  const enAutomation = read('dist/en/services/python-automation/index.html') || '';
  const esAutomation = read('dist/es/servicios/automatizacion-python/index.html') || '';

  assert('H-13 EN recurring page has no bankrecon leak', !enRecurring.includes('bankrecon'), 'automation whyNote proof leaked');
  assert('H-13 EN recurring page has no rutificador leak', !enRecurring.includes('rutificador'), 'automation whyNote proof leaked');
  assert('H-13 EN recurring page has no automation availability', !enRecurring.includes('2–3 new builds per month'), 'automation availability leaked');
  assert('H-13 EN recurring page has no automation process step', !enRecurring.includes('Automation scoping'), 'automation process copy leaked');
  assert('H-13 ES recurring page has no bankrecon leak', !esRecurring.includes('bankrecon'), 'automation whyNote proof leaked');
  assert('H-13 ES recurring page has no rutificador leak', !esRecurring.includes('rutificador'), 'automation whyNote proof leaked');
  assert('H-13 ES recurring page has no automation availability', !esRecurring.includes('2–3 proyectos nuevos al mes'), 'automation availability leaked');
  assert('H-13 ES recurring page has no automation process step', !esRecurring.includes('Diagnóstico de automatización'), 'automation process copy leaked');
  assert('H-13 EN recurring page carries collection availability', enRecurring.includes('2–3 new collectors per month'), 'collection availability missing');
  assert('H-13 ES recurring page carries collection availability', esRecurring.includes('2–3 colectores nuevos al mes'), 'collection availability missing');

  assert('H-13 EN automation page still carries its availability marker', enAutomation.includes('2–3 new builds per month'), 'automation marker changed — update H-13');
  assert('H-13 EN automation page still carries its process marker', enAutomation.includes('Automation scoping'), 'automation marker changed — update H-13');
  assert('H-13 EN automation page still cites bankrecon', enAutomation.includes('bankrecon'), 'automation marker changed — update H-13');
  assert('H-13 EN automation page still cites rutificador', enAutomation.includes('rutificador'), 'automation marker changed — update H-13');
  assert('H-13 ES automation page still carries its availability marker', esAutomation.includes('2–3 proyectos nuevos al mes'), 'automation marker changed — update H-13');
  assert('H-13 ES automation page still carries its process marker', esAutomation.includes('Diagnóstico de automatización'), 'automation marker changed — update H-13');
  assert('H-13 ES automation page still cites bankrecon', esAutomation.includes('bankrecon'), 'automation marker changed — update H-13');
  assert('H-13 ES automation page still cites rutificador', esAutomation.includes('rutificador'), 'automation marker changed — update H-13');
});

group('H-10 · Accessible per-field errors in the intake form', () => {
  const src = intakeForm();
  const js = read('public/assets/js/intake-form.js') || '';
  assert(
    'H-10 IntakeForm ships per-field error elements and a summary',
    src.includes('form-group__error') && src.includes('intake-form__summary') && src.includes('data-summary-template'),
    'Missing field error elements, summary, or summary template'
  );
  assert(
    'H-10 controls carry localized error messages',
    src.includes('data-error-required=') && src.includes('data-error-type='),
    'Expected data-error-required / data-error-type attributes on controls'
  );
  assert(
    'H-10 markup no longer forces novalidate (JS owns progressive enhancement)',
    !src.includes('novalidate'),
    'novalidate should be set by intake-form.js at init, not hardcoded in the form'
  );
  assert(
    'H-10 JS sets novalidate at init and manages aria state',
    js.includes("setAttribute('novalidate'") && js.includes('aria-invalid') && js.includes('aria-describedby'),
    'Expected novalidate-at-init plus aria-invalid / aria-describedby wiring'
  );
  assert(
    'H-10 JS no longer relies on native reportValidity bubbles',
    !js.includes('reportValidity('),
    'reportValidity() should be replaced by the custom accessible layer'
  );
  assert(
    'H-10 submit button keeps its localized pending label',
    src.includes('data-sending={c.submitSending}')
  );
});

group('H-03 · Service CTAs carry unique accessible names', () => {
  const src = services();
  assert(
    'H-03 ServicesSection qualifies the CTA with the service title',
    src.includes('visually-hidden') && src.includes('{svc.title}'),
    'Expected a visually-hidden service name inside the CTA link'
  );
  assert(
    'H-03 visually-hidden utility exists in global.css',
    globalCss().includes('.visually-hidden'),
    'Missing .visually-hidden utility'
  );

  const enHome = read('dist/en/index.html');
  const esHome = read('dist/es/index.html');
  if (!enHome || !esHome) {
    assert('[built] H-03 accessible-name checks (skipped — run --built)', true);
    return;
  }
  const accessibleNames = (html, prefix) => {
    const names = [];
    const re = /<a[^>]*class="[^"]*svc-inline-cta[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    for (const match of html.matchAll(re)) {
      const text = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      names.push(`${prefix}: ${text}`);
    }
    return names;
  };
  const enNames = accessibleNames(enHome, 'en');
  const esNames = accessibleNames(esHome, 'es');
  assert('H-03 EN home renders six service CTAs', enNames.length === 6, `Got ${enNames.length}`);
  assert('H-03 ES home renders six service CTAs', esNames.length === 6, `Got ${esNames.length}`);
  const unique = (list) => new Set(list).size === list.length;
  assert('H-03 EN CTA names are unique', unique(enNames), JSON.stringify(enNames));
  assert('H-03 ES CTA names are unique', unique(esNames), JSON.stringify(esNames));
  assert(
    'H-03 each CTA names its service',
    enNames.every((name) => name.length > 'en: View service: '.length + 2) &&
      esNames.every((name) => name.length > 'es: Ver servicio: '.length + 2),
    JSON.stringify({ enNames, esNames })
  );
});

group('H-12 · Guides expose a contextual CTA at the start and end', () => {
  const guideSlugs = [
    'auditoria-tecnica-web-negocios-pequenos',
    'automatizar-reportes-excel-python',
    'pagina-web-estatica-cuando-conviene',
  ];
  for (const slug of guideSlugs) {
    const src = read(`src/pages/es/guias/${slug}/index.astro`) || '';
    assert(`H-12 ${slug} imports ArticleCta`, src.includes('import ArticleCta'), 'Missing ArticleCta import');
    assert(
      `H-12 ${slug} renders both variants`,
      src.includes('variant="top"') && src.includes('variant="bottom"'),
      'Expected a top and a bottom ArticleCta'
    );
  }
  const built = guideSlugs.map((slug) => read(`dist/es/guias/${slug}/index.html`));
  if (built.every((html) => Boolean(html))) {
    built.forEach((html, index) => {
      const count = (html.match(/article-cta/g) || []).length;
      assert(`H-12 built ${guideSlugs[index]} has two CTAs`, count >= 2, `Found ${count} article-cta occurrences`);
    });
  } else {
    assert('[built] H-12 guide CTA checks (skipped — run --built)', true);
  }
});

group('H-06 · Case studies carry role, verification date, and a per-case CTA', () => {
  const src = caseStudies();
  const count = (re) => (src.match(re) || []).length;
  assert('H-06 every case declares a role', count(/role: '/g) >= 20, `Found ${count(/role: '/g)}`);
  assert('H-06 every case declares a verification month', count(/verifiedAt: '/g) >= 20, `Found ${count(/verifiedAt: '/g)}`);
  assert('H-06 every case belongs to a group', count(/group: '/g) >= 20, `Found ${count(/group: '/g)}`);
  assert('H-06 every case links its service', count(/serviceHref: '/g) >= 20, `Found ${count(/serviceHref: '/g)}`);
  assert('H-06 no placeholder verification dates', !/verifiedAt: '(TBD|TODO)/.test(src), 'Replace placeholders with a real month');

  const enWork = read('dist/en/work/index.html');
  const esWork = read('dist/es/trabajo/index.html');
  if (!enWork || !esWork) {
    assert('[built] H-06 work-page evidence checks (skipped — run --built)', true);
    return;
  }
  const metaCount = (html) => (html.match(/class="project-meta"/g) || []).length;
  const ctaCount = (html) => (html.match(/data-track-loc="work_/g) || []).length;
  assert('H-06 EN work renders 10 role/date metas', metaCount(enWork) >= 10, `Found ${metaCount(enWork)}`);
  assert('H-06 ES work renders 10 role/date metas', metaCount(esWork) >= 10, `Found ${metaCount(esWork)}`);
  assert('H-06 EN work renders 10 per-case CTAs', ctaCount(enWork) >= 10, `Found ${ctaCount(enWork)}`);
  assert('H-06 ES work renders 10 per-case CTAs', ctaCount(esWork) >= 10, `Found ${ctaCount(esWork)}`);
  assert(
    'H-06 EN work states the public-evidence note',
    enWork.includes('Ten public projects, each with verifiable evidence.')
  );
  assert(
    'H-06 ES work states the public-evidence note',
    esWork.includes('Diez proyectos públicos, cada uno con evidencia verificable.')
  );
});

group('H-05 · Root renders as a bilingual x-default landing', () => {
  const root = read('dist/index.html');
  if (!root) {
    assert('[built] H-05 root landing checks (skipped — run --built)', true);
    return;
  }
  const h1s = (root.match(/<h1/g) || []).length;
  assert('H-05 root has exactly one H1', h1s === 1, `Found ${h1s}`);
  assert('H-05 root links both locale briefs', root.includes('/en/#contact') && root.includes('/es/#contact'));
  assert('H-05 root has no meta refresh', !/http-equiv=["']?refresh/.test(root));

  const blocks = [...root.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
    .filter(Boolean);
  assert('H-05 root JSON-LD parses with WebSite', blocks.some((block) => block['@type'] === 'WebSite'));
  assert('H-05 root JSON-LD parses with Organization', blocks.some((block) => block['@type'] === 'Organization'));

  const alternates = [...root.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)]
    .map(([, lang, href]) => `${lang}=${href}`)
    .sort();
  const expected = [
    'en=https://tooltician.com/en/',
    'es=https://tooltician.com/es/',
    'x-default=https://tooltician.com/',
  ].sort();
  assert(
    'H-05 root alternates are en/es/x-default',
    JSON.stringify(alternates) === JSON.stringify(expected),
    JSON.stringify(alternates)
  );
});

group('H-09 · Work pages group projects under thematic H2 headings', () => {
  const pages = [
    { file: 'dist/en/work/index.html', labels: ['Python & Data', 'Web & Apps', 'CLI & Tools', 'Products & Extensions'] },
    { file: 'dist/es/trabajo/index.html', labels: ['Python y Datos', 'Web y Apps', 'CLI y Herramientas', 'Productos y Extensiones'] },
  ];
  const built = pages.map((page) => ({ ...page, html: read(page.file) }));
  if (!built.every((page) => page.html)) {
    assert('[built] H-09 heading outline checks (skipped — run --built)', true);
    return;
  }
  built.forEach((page) => {
    const html = page.html;
    const h1 = (html.match(/<h1/g) || []).length;
    const h2 = (html.match(/<h2/g) || []).length;
    const h3 = (html.match(/<h3/g) || []).length;
    const firstH1 = html.indexOf('<h1');
    const firstH2 = html.indexOf('<h2');
    const firstH3 = html.indexOf('<h3');
    assert(
      `H-09 ${page.file} has 1 H1, 4 H2, 10 H3`,
      h1 === 1 && h2 === 4 && h3 === 10,
      `h1=${h1} h2=${h2} h3=${h3}`
    );
    assert(
      `H-09 ${page.file} order is H1 → H2 → H3`,
      firstH1 > -1 && firstH1 < firstH2 && firstH2 < firstH3,
      `h1=${firstH1} h2=${firstH2} h3=${firstH3}`
    );
    assert(
      `H-09 ${page.file} shows the four group labels`,
      page.labels.every((label) => html.includes(label.replace(/&/g, '&amp;'))),
      JSON.stringify(page.labels.filter((label) => !html.includes(label.replace(/&/g, '&amp;'))))
    );
  });
});

group('H-08 · Guides hub, internal links, and contextual CTAs', () => {
  const hubSrc = read('src/pages/es/guias/index.astro') || '';
  const resourcesSrc = read('src/components/ResourcesSection.astro') || '';
  const guidesSrc = read('src/data/guides.ts') || '';
  const esHomeSrc = pageES();
  assert(
    'H-08 guide index lists the three guides',
    guidesSrc.includes('/es/guias/auditoria-tecnica-web-negocios-pequenos/') &&
      guidesSrc.includes('/es/guias/automatizar-reportes-excel-python/') &&
      guidesSrc.includes('/es/guias/pagina-web-estatica-cuando-conviene/'),
    'src/data/guides.ts is missing one of the three guide entries'
  );
  assert('H-08 hub consumes the shared guide index', hubSrc.includes("from '../../../data/guides'"));
  assert('H-08 home resources strip links the hub', resourcesSrc.includes('/es/guias/'));
  assert('H-08 ES home renders the resources strip', esHomeSrc.includes('<ResourcesSection'));

  const hub = read('dist/es/guias/index.html');
  const esHome = read('dist/es/index.html');
  if (!hub || !esHome) {
    assert('[built] H-08 hub checks (skipped — run --built)', true);
    return;
  }
  const blocks = [...hub.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
    .filter(Boolean);
  assert('H-08 hub JSON-LD has CollectionPage', blocks.some((block) => block['@type'] === 'CollectionPage'));
  assert('H-08 hub links the three guides', ['auditoria-tecnica-web-negocios-pequenos', 'automatizar-reportes-excel-python', 'pagina-web-estatica-cuando-conviene'].every((slug) => hub.includes(`/es/guias/${slug}/`)));
  assert('H-08 ES home links the hub', esHome.includes('/es/guias/'));
  const sitemap = read('dist/sitemap-0.xml') || '';
  assert('H-08 sitemap includes the hub', sitemap.includes('https://tooltician.com/es/guias/'));
  for (const slug of ['auditoria-tecnica-web-negocios-pequenos', 'automatizar-reportes-excel-python', 'pagina-web-estatica-cuando-conviene']) {
    const guide = read(`dist/es/guias/${slug}/index.html`) || '';
    assert(`H-08 ${slug} links back to the hub`, guide.includes('/es/guias/'));
    const ctaCount = (guide.match(/article-cta/g) || []).length;
    assert(`H-08 ${slug} has top and bottom CTAs`, ctaCount >= 2, `Found ${ctaCount}`);
  }
});

// Generic routes decision (Plans 024/033): /pricing, /docs, /login, and /demo
// stay 404, unlinked, and out of the sitemap — they do not represent a real
// capability. Recorded here so future audits do not "fix" the 404s by
// inventing pages that the offer cannot back.
group('H-11 · Structured-data parity across home, work, and root', () => {
  const parse = (html) =>
    [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
      .filter(Boolean);

  const workPages = ['dist/en/work/index.html', 'dist/es/trabajo/index.html'];
  const built = workPages.map((file) => ({ file, html: read(file) }));
  if (!built.every((page) => page.html)) {
    assert('[built] H-11 schema checks (skipped — run --built)', true);
    return;
  }
  built.forEach((page) => {
    const blocks = parse(page.html);
    const collection = blocks.find((block) => block['@type'] === 'CollectionPage');
    const breadcrumb = blocks.find((block) => block['@type'] === 'BreadcrumbList');
    const itemList = blocks.find((block) => block['@type'] === 'ItemList');
    assert(
      `H-11 ${page.file} has CollectionPage + BreadcrumbList + ItemList`,
      Boolean(collection) && Boolean(breadcrumb) && Boolean(itemList),
      JSON.stringify(blocks.map((block) => block['@type']))
    );
    if (!itemList) return;
    assert(
      `H-11 ${page.file} ItemList has 10 entries`,
      itemList.itemListElement.length === 10,
      `Found ${itemList.itemListElement.length}`
    );
    const titles = [...page.html.matchAll(/<h3 class="project-title"[^>]*>([^<]*)</g)].map((match) =>
      match[1].replace(/&amp;/g, '&')
    );
    const names = itemList.itemListElement.map((entry) => entry.item.name);
    assert(
      `H-11 ${page.file} ItemList names match rendered H3s`,
      JSON.stringify(names) === JSON.stringify(titles),
      `names=${JSON.stringify(names)} titles=${JSON.stringify(titles)}`
    );
  });

  const root = read('dist/index.html');
  if (root) {
    const blocks = parse(root);
    const website = blocks.find((block) => block['@type'] === 'WebSite');
    const organization = blocks.find((block) => block['@type'] === 'Organization');
    assert(
      'H-11 root WebSite declares both locales',
      Boolean(website) && Array.isArray(website.inLanguage) && website.inLanguage.includes('en') && website.inLanguage.includes('es')
    );
    assert(
      'H-11 root Organization carries sameAs',
      Boolean(organization) && Array.isArray(organization.sameAs) && organization.sameAs.length >= 2
    );
  } else {
    assert('[built] H-11 root schema checks (skipped — run --built)', true);
  }
});

// ─── Sprint 0 (corrected) · Service/lead analytics wiring ───────────────────

group('S0 · Service registry, transport, and declarative wiring', () => {
  const registryRaw = read('src/data/service-registry.json');
  let registry = null;
  try { registry = JSON.parse(registryRaw || 'null'); } catch { registry = null; }
  assert('service-registry.json parses', !!registry && Array.isArray(registry.services), 'Invalid JSON');
  const ids = registry ? registry.services.map(t => t.service_id).sort() : [];
  assert(
    'registry holds the 6 real service_ids',
    JSON.stringify(ids) === JSON.stringify(['automation', 'financial', 'htw', 'internal-tools', 'recurring-data', 'web']),
    `Got: ${JSON.stringify(ids)}`
  );
  assert('registry uses service_* keys (no tool_* vocabulary)', registryRaw.includes('"service_id"') && !registryRaw.includes('tool_'), 'Stale keys');
  if (registry) {
    for (const t of registry.services) {
      assert(
        `registry routes exist as pages: ${t.service_id}`,
        read(`src/pages${t.route_en}index.astro`) !== null && read(`src/pages${t.route_es}index.astro`) !== null,
        `${t.route_en} / ${t.route_es}`
      );
    }
  }

  const productJs = read('public/assets/js/product-analytics.js') || '';
  const trackJs = read('public/assets/js/track.js') || '';
  const intakeJs = read('public/assets/js/intake-form.js') || '';
  assert(
    'canonical layer uses service/lead events only',
    ['service_view', 'service_engage', 'brief_start', 'brief_submit', 'brief_success', 'brief_error', 'book_call', 'email_copy', 'proof_click', 'portfolio_click', 'cv_download', 'template_open', 'language_select', 'contact_intent'].every(e => productJs.includes(e)) &&
      !productJs.includes('tool_') && !productJs.includes('result_action'),
    'Stale or missing event name'
  );
  assert('track.js passes service params through', trackJs.includes('CANONICAL_PARAMS') && trackJs.includes('service_id'), 'No pass-through');
  assert('track.js carries no tool_* params', !/'tool_id'|'tool_category'|'action_type'|'page_path'|'execution_mode'|'execution_stage'/.test(trackJs), 'Stale param');
  assert('track.js keeps legacy tt_* mapping', trackJs.includes('tt_location') && trackJs.includes('ttTrack = track'), 'Legacy contract broken');
  assert('intake mirrors brief lifecycle', intakeJs.includes("funnel('briefStart'") && intakeJs.includes("funnel('briefSubmit'") && intakeJs.includes("funnel('briefSuccess'") && intakeJs.includes("funnel('briefError'"), 'Missing funnel call');
  assert('intake keeps legacy form_* events', intakeJs.includes('form_start') && intakeJs.includes('form_submit_success') && intakeJs.includes('form_submit_error'), 'Legacy form events removed');

  const baseLayout = read('src/layouts/BaseLayout.astro') || '';
  assert('BaseLayout loads track.js then product-analytics.js', baseLayout.indexOf('/assets/js/track.js') > -1 && baseLayout.indexOf('/assets/js/product-analytics.js') > baseLayout.indexOf('/assets/js/track.js'), 'Script wiring wrong');
  assert('BaseLayout GA4 stub untouched (CSP hash)', baseLayout.includes('cookie_expires: 60 * 60 * 24 * 395'), 'GA4 stub changed — CSP hash would break');

  const servicePage = read('src/components/ServicePage.astro') || '';
  assert('ServicePage stamps data-service-id', servicePage.includes('data-service-id={serviceKey}'), 'Missing scope attr');
  assert('ServicePage uses service-engage + book-call semantics', servicePage.includes('data-service-engage') && servicePage.includes('data-book-call'), 'Stale attrs');
  const htwEN = read('src/pages/en/services/web-technical-hygiene/index.astro') || '';
  const htwES = read('src/pages/es/servicios/higiene-tecnica-web/index.astro') || '';
  assert('HTW pages stamp htw scope', htwEN.includes('data-service-id="htw"') && htwES.includes('data-service-id="htw"'), 'HTW scope missing');
  const gateway = read('src/pages/index.astro') || '';
  assert('gateway loads analytics + tracks language choice', gateway.includes('/assets/js/product-analytics.js') && gateway.includes('data-language-select'), 'Gateway wiring missing');
  const navbarSrc = read('src/components/Navbar.astro') || '';
  assert('Navbar CTA carries brief intent with navbar placement', navbarSrc.includes('data-contact-intent="send_brief"') && navbarSrc.includes('data-track-loc="navbar"'), 'Navbar CTA stamp missing');
});

group('EM · Résumés wired per locale', () => {
  const about = read('src/components/AboutSection.astro') || '';
  const footer = read('src/components/Footer.astro') || '';
  assert(
    'About resolves the CV per locale',
    about.includes('carlos-ortega-resume.pdf') && about.includes('carlos-ortega-resume-es.pdf') && about.includes('lang === \'en\''),
    'About CV href not locale-aware'
  );
  assert(
    'Footer resolves the CV per locale',
    footer.includes('carlos-ortega-resume.pdf') && footer.includes('carlos-ortega-resume-es.pdf') && footer.includes('lang === \'en\''),
    'Footer CV href not locale-aware'
  );
});

group('S0b · Home service cards and guide CTAs carry canonical service context', () => {
  const servicesSection = read('src/components/ServicesSection.astro') || '';
  const registry = JSON.parse(read('src/data/service-registry.json'));
  const registryIds = registry.services.map((s) => s.service_id).sort();
  const stampedIds = [...servicesSection.matchAll(/serviceId: '([^']+)'/g)].map((m) => m[1]);
  assert('every card/chip serviceId exists in the registry', stampedIds.every((id) => registryIds.includes(id)), JSON.stringify(stampedIds));
  assert('cards are stamped with data-service-id', servicesSection.includes('data-service-id={svc.serviceId}'), 'missing card scope');
  assert('card CTAs + chips engage the service', (servicesSection.match(/data-service-engage/g) || []).length === 2, 'engage stamps');
  assert('example badges count as outbound portfolio clicks', (servicesSection.match(/data-portfolio-click/g) || []).length === 2, 'badge stamps');
  assert('calendly chip books a call', servicesSection.includes('data-book-call={s.bookCall'), 'chip book-call missing');
  assert('service-less chip is not swallowed by the engage branch', servicesSection.includes("data-service-engage={s.serviceId ? '' : undefined}"), 'chip engage gate missing');

  const articleCta = read('src/components/ArticleCta.astro') || '';
  assert('ArticleCta carries a service scope on section, card, and alt link', articleCta.includes('serviceId?: string') && (articleCta.match(/data-service-id=\{serviceId\}/g) || []).length === 3, 'ArticleCta scope missing');
  assert('ArticleCta anchors engage the service', (articleCta.match(/data-service-engage/g) || []).length === 3, 'ArticleCta engage stamps');

  for (const rel of [
    'src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro',
    'src/pages/es/guias/automatizar-reportes-excel-python/index.astro',
    'src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro',
  ]) {
    const src = read(rel) || '';
    assert(`${rel} passes serviceId twice`, (src.match(/serviceId=/g) || []).length === 2, 'ArticleCta props');
  }
});

group('D6b · Home proof division of labor', () => {
  const hero = read('src/components/HeroSection.astro') || '';
  const band = read('src/components/ResultsBand.astro') || '';
  assert(
    'hero names the live store exactly once per locale (text + href)',
    (hero.match(/elrincondeebano/g) || []).length === 4,
    `elrincondeebano occurrences: ${(hero.match(/elrincondeebano/g) || []).length}`
  );
  assert('hero does not repeat the quantified band stats', !hero.includes('100+ SKUs'), 'Hero still repeats the SKU count');
  assert('proof band owns the quantified stats', band.includes("value: '100+'") && band.includes("unit: 'SKUs'"), 'ResultsBand stats missing');
});

group('H-14 · Legal pages emit ISO-8601 dates in schema and OG meta', () => {
  const pages = [
    { rel: 'dist/en/privacy/index.html', iso: '2026-09-01' },
    { rel: 'dist/es/privacy/index.html', iso: '2026-09-01' },
    { rel: 'dist/en/cookies/index.html', iso: '2026-08-21' },
    { rel: 'dist/es/cookies/index.html', iso: '2026-08-21' },
    { rel: 'dist/en/terms/index.html', iso: '2026-05-17' },
    { rel: 'dist/es/terms/index.html', iso: '2026-05-17' },
    { rel: 'dist/en/engagement/index.html', iso: '2026-05-27' },
    { rel: 'dist/es/engagement/index.html', iso: '2026-05-27' },
  ];
  const first = read(pages[0].rel);
  if (!first) {
    assert('[built] H-14 ISO date checks (skipped — run --built)', true);
    return;
  }
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  for (const { rel, iso } of pages) {
    const html = read(rel) || '';
    const jsonLd = (html.match(/"datePublished":"([^"]*)"/) || [])[1] || '';
    const og = (html.match(/article:published_time" content="([^"]*)"/) || [])[1] || '';
    assert(`${rel} JSON-LD datePublished is ISO ${iso}`, jsonLd === iso && isoRe.test(jsonLd), `got ${JSON.stringify(jsonLd)}`);
    assert(`${rel} OG article:published_time is ISO ${iso}`, og === iso && isoRe.test(og), `got ${JSON.stringify(og)}`);
  }
  const enPrivacy = read('dist/en/privacy/index.html') || '';
  const esPrivacy = read('dist/es/privacy/index.html') || '';
  assert('H-14 EN privacy still shows the human date', enPrivacy.includes('Last updated') && enPrivacy.includes('1 Sep 2026'), 'visible EN label changed');
  assert('H-14 ES privacy still shows the human date', esPrivacy.includes('Última actualización') && esPrivacy.includes('1 de septiembre de 2026'), 'visible ES label changed');
});

group('055 · JSON-LD guards and HTW schema price parity', () => {
  const parse = (html) =>
    [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
      .filter(Boolean);

  const enHome = read('dist/en/index.html');
  const esHome = read('dist/es/index.html');
  const enWork = read('dist/en/work/index.html');
  const esWork = read('dist/es/trabajo/index.html');
  const enHtw = read('dist/en/services/web-technical-hygiene/index.html');
  const esHtw = read('dist/es/servicios/higiene-tecnica-web/index.html');
  if (!enHome || !esHome || !enWork || !esWork || !enHtw || !esHtw) {
    assert('[built] 055 JSON-LD guard checks (skipped — run --built)', true);
    return;
  }

  for (const [label, html] of [['dist/en/index.html', enHome], ['dist/es/index.html', esHome]]) {
    const blocks = parse(html);
    const person = blocks.find((b) => Array.isArray(b['@type']) && b['@type'].includes('Person'));
    assert(`055 ${label} Person makesOffer exists`, !!person && Array.isArray(person.makesOffer), 'Person block or makesOffer missing');
    if (!person || !Array.isArray(person.makesOffer)) continue;
    person.makesOffer.forEach((offer, i) => {
      assert(
        `055 ${label} offer[${i}] has a non-empty description`,
        typeof offer.description === 'string' && offer.description.length > 0,
        `offer[${i}] (${offer.name || 'unnamed'}) is missing its description`
      );
      assert(
        `055 ${label} offer[${i}] url starts with https://tooltician.com/`,
        typeof offer.url === 'string' && offer.url.startsWith('https://tooltician.com/'),
        `offer[${i}] url was ${JSON.stringify(offer.url)}`
      );
    });
  }

  for (const [label, html] of [['dist/en/work/index.html', enWork], ['dist/es/trabajo/index.html', esWork]]) {
    const blocks = parse(html);
    const itemList = blocks.find((b) => b['@type'] === 'ItemList');
    assert(`055 ${label} ItemList exists`, !!itemList && Array.isArray(itemList.itemListElement), 'ItemList missing');
    if (!itemList || !Array.isArray(itemList.itemListElement)) continue;
    itemList.itemListElement.forEach((entry, i) => {
      const item = entry.item || {};
      assert(
        `055 ${label} item[${i}] has a non-empty name`,
        typeof item.name === 'string' && item.name.length > 0,
        `item[${i}] is missing its name`
      );
      if ('url' in item) {
        assert(
          `055 ${label} item[${i}] url is non-empty and starts with http`,
          typeof item.url === 'string' && item.url.length > 0 && item.url.startsWith('http'),
          `item[${i}] url was ${JSON.stringify(item.url)}`
        );
      } else {
        assert(`055 ${label} item[${i}] omits empty url instead of emitting ""`, true);
      }
    });
  }

  const htwPrices = (html) => {
    const blocks = parse(html);
    const service = blocks.find((b) => b['@type'] === 'Service');
    const offers = service?.hasOfferCatalog?.itemListElement || [];
    return offers.map((o) => o.price);
  };
  assert(
    '055 EN HTW JSON-LD prices match pricing.ts bands',
    JSON.stringify(htwPrices(enHtw)) === JSON.stringify(['69', '499', '899', '999', '279']),
    `Got ${JSON.stringify(htwPrices(enHtw))}`
  );
  assert(
    '055 ES HTW JSON-LD prices match pricing.ts bands',
    JSON.stringify(htwPrices(esHtw)) === JSON.stringify(['1', '7', '13', '15', '4']),
    `Got ${JSON.stringify(htwPrices(esHtw))}`
  );
});

// ─── Summary ──────────────────────────────────────────────────────────────

const total = passed + failed;
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed}/${total} passed`);
if (failed > 0) {
  console.log(`\nFailed checks (${failed}):`);
  failures.forEach(f => console.log(`  • ${f}`));
  console.log('');
  process.exit(1);
} else {
  console.log('All checks passed.\n');
  process.exit(0);
}
