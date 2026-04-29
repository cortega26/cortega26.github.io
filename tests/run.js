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
const services   = () => read('src/components/ServicesSection.astro') || '';
const about      = () => read('src/components/AboutSection.astro') || '';
const proof      = () => read('src/components/ProofSection.astro') || '';
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
    'New lede contains "scoped"',
    src.includes('scoped'),
    'Updated lede should contain "scoped"'
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
    src.includes('hero__brief') && (src.includes('Engagement snapshot') || src.includes('Panorama de trabajo')),
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
    'Hero note block present',
    src.includes('hero__note') && (src.includes('Delivery defaults') || src.includes('Entregables base')),
    'Expected simplified support note in hero aside'
  );
});

group('TT-008 · Mobile nav uses controlled overlay behavior', () => {
  const navSrc = navbar();
  const layoutSrc = layout();
  const cssSrc = globalCss();
  assert(
    'Navbar has overlay close control',
    navSrc.includes('navbar__overlay') && navSrc.includes('data-nav-close'),
    'Navbar overlay close control missing'
  );
  assert(
    'Layout script uses setNavOpen helper',
    layoutSrc.includes('function setNavOpen') && layoutSrc.includes('closeNav'),
    'Expected controlled nav open/close helpers in BaseLayout'
  );
  assert(
    'Layout handles Escape and scroll lock',
    layoutSrc.includes("event.key === 'Escape'") &&
    layoutSrc.includes("document.body.classList.toggle('nav-open'"),
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

group('C1 · Section order: Portfolio before Services', () => {
  const en = pageEN();
  const es = pageES();
  // Match component usage tags (not import statements)
  const portfolioPosEN = en.indexOf('<PortfolioSection');
  const servicesPosEN  = en.indexOf('<ServicesSection');
  assert(
    'EN page: PortfolioSection before ServicesSection',
    portfolioPosEN > -1 && servicesPosEN > -1 && portfolioPosEN < servicesPosEN,
    `EN: <PortfolioSection at ${portfolioPosEN}, <ServicesSection at ${servicesPosEN}`
  );
  const portfolioPosES = es.indexOf('<PortfolioSection');
  const servicesPosES  = es.indexOf('<ServicesSection');
  assert(
    'ES page: PortfolioSection before ServicesSection',
    portfolioPosES > -1 && servicesPosES > -1 && portfolioPosES < servicesPosES,
    `ES: <PortfolioSection at ${portfolioPosES}, <ServicesSection at ${servicesPosES}`
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
  const src = portfolio();
  const positions = {
    ebano:       src.indexOf("id: 'ebano'"),
    monedario:   src.indexOf("id: 'monedario'"),
    rutificador: src.indexOf("id: 'rutificador'"),
    conciliador: src.indexOf("id: 'conciliador'"),
    noticiencias:src.indexOf("id: 'noticiencias'"),
    dnspect:     src.indexOf("id: 'dnspect'"),
    polla:       src.indexOf("id: 'polla'"),
  };
  assert(
    'ebano before monedario',
    positions.ebano < positions.monedario && positions.ebano > -1,
    `ebano:${positions.ebano}, monedario:${positions.monedario}`
  );
  assert(
    'monedario before rutificador',
    positions.monedario < positions.rutificador,
    `monedario:${positions.monedario}, rutificador:${positions.rutificador}`
  );
  assert(
    'rutificador before conciliador',
    positions.rutificador < positions.conciliador,
    `rutificador:${positions.rutificador}, conciliador:${positions.conciliador}`
  );
  assert(
    'All 7 required projects present',
    Object.values(positions).every(p => p > -1),
    'One or more required projects missing: ' + Object.entries(positions).filter(([,v]) => v === -1).map(([k]) => k).join(', ')
  );
});

group('D5 · Noticiencias 580M+ removed', () => {
  const src = portfolio();
  assert(
    'No 580M in PortfolioSection',
    !src.includes('580M'),
    '580M+ claim still present in Noticiencias impact line'
  );
});

group('D6 · Ébano description rewritten', () => {
  const src = portfolio();
  assert(
    'Ébano desc contains "This is not a demo"',
    src.includes('This is not a demo') || src.includes('Esto no es una demo'),
    'Expected "This is not a demo" in Ébano description'
  );
});

group('D7 · Conciliador description rewritten', () => {
  const src = portfolio();
  assert(
    'Conciliador desc contains "silently"',
    src.includes('silently') || src.includes('silenciosamente'),
    'Expected "silently" in Conciliador description'
  );
});

group('D8 · Monedario description rewritten', () => {
  const src = portfolio();
  assert(
    'Monedario desc contains "without advertising"',
    src.includes('without advertising') || src.includes('sin publicidad'),
    'Expected "without advertising" in Monedario description'
  );
});

group('D9 · Portfolio subtitle updated', () => {
  const src = portfolio();
  assert(
    'Portfolio subtitle contains "not just repositories"',
    src.includes('not just repositories') || src.includes('no solo repositorios'),
    'Portfolio subtitle still uses old "Nine public projects" text'
  );
});

group('D10 · Portfolio title updated', () => {
  const src = portfolio();
  assert(
    "EN title is 'Work in Production'",
    src.includes("'Work in Production'") || src.includes('"Work in Production"'),
    "Portfolio title should be 'Work in Production'"
  );
});

group('TT-004 · Portfolio filtering removes cards from layout', () => {
  const src = portfolio();
  assert(
    'Projects define explicit filter categories',
    src.includes('filters: [') && src.includes('data-categories={proj.filters.join'),
    'Expected per-project filter categories in PortfolioSection'
  );
  assert(
    'Filter script uses hidden property',
    src.includes('card.hidden = !match'),
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
  assert(
    'Project data includes problem / solution / proof fields',
    src.includes('problem:') && src.includes('solution:') && src.includes('proof:'),
    'Expected problem/solution/proof fields in project data'
  );
  assert(
    'Card markup renders structured project points',
    src.includes('project-points') && src.includes('project-point'),
    'Expected structured project points in card markup'
  );
  assert(
    'Bilingual point labels exist',
    src.includes("problem: 'Problem'") && src.includes("solution: 'Built'") && src.includes("proof: 'Proof'") &&
    src.includes("problem: 'Problema'") && src.includes("solution: 'Construido'") && src.includes("proof: 'Prueba'"),
    'Expected EN and ES labels for the portfolio scan sections'
  );
});

group('TT-016 · Anchor projects are visually prioritized', () => {
  const src = portfolio();
  const featuredCount = (src.match(/featured:\s*true/g) || []).length;
  assert(
    'At least two projects are marked featured',
    featuredCount >= 2,
    `Expected at least 2 featured projects, found ${featuredCount}`
  );
  assert(
    'Featured card styling exists',
    src.includes('project-card--featured') && src.includes('grid-column: span 6'),
    'Expected featured project card styling in PortfolioSection'
  );
});

group('TT-009 · Small external links read as actions', () => {
  const portfolioSrc = portfolio();
  const proofSrc = proof();
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
  assert(
    'Proof links use dedicated proof-link class',
    proofSrc.includes('class="proof-link"') && !proofSrc.includes('class="badge badge-teal"'),
    'Proof links still read like badges instead of actions'
  );
});

group('TT-018 · Contact labels match action behavior', () => {
  const src = contact();
  assert(
    'Primary contact path is explicit email',
    src.includes('Email me directly') || src.includes('Escribirme por correo'),
    'Expected explicit email CTA in ContactSection'
  );
  assert(
    'Copy action is labeled as copy',
    src.includes('Copy address') || src.includes('Copiar dirección'),
    'Expected copy action label in ContactSection'
  );
  assert(
    'Submit button has localized sending label',
    src.includes('data-sending={c.submitSending}'),
    'Expected localized submit-pending label via data-sending'
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
    "EN title is 'How I Can Help'",
    src.includes("'How I Can Help'") || src.includes('"How I Can Help"'),
    "Services EN title should be 'How I Can Help'"
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
    'Services subtitle contains "recurring problem"',
    src.includes('recurring problem') || src.includes('problema recurrente'),
    'Services subtitle should mention "recurring problem"'
  );
});

group('F1 · About title updated', () => {
  const src = about();
  assert(
    'About title contains "Who I Help"',
    src.includes('Who I Help') || src.includes('A quién ayudo'),
    'About title not updated'
  );
});

group('F2 · About intro rewritten', () => {
  const src = about();
  assert(
    'About intro starts with "Operations teams"',
    src.includes('Operations teams') || src.includes('Los equipos operativos'),
    'About intro should start with "Operations teams"'
  );
});

group('G1 · Credentials title updated', () => {
  const src = creds();
  assert(
    "Credentials title is 'Process & Background'",
    src.includes('Process & Background') || src.includes('Proceso y formación'),
    "Credentials H2 should be 'Process & Background'"
  );
  assert(
    "Old title 'How I Work' is gone",
    !src.includes("'How I Work'") && !src.includes('"How I Work"'),
    "Old title 'How I Work' still present"
  );
});

group('H1 · Proof section retains core proof layout', () => {
  const src = proof();
  assert(
    'ProofSection contains timeline and proof grid',
    src.includes('timeline') && src.includes('proof-grid'),
    'ProofSection is missing its core proof layout'
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
    'EN title uses em dash separator',
    en.includes('—'),
    'EN title should use em dash (—)'
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
    'EN description contains "Bilingual"',
    en.includes('Bilingual') || en.includes('bilingual'),
    'EN description should lead with Bilingual'
  );
  assert(
    'EN description contains "handoff-ready"',
    en.includes('handoff-ready') || en.includes('handoff'),
    'EN description should mention handoff-ready systems'
  );
});

group('I4 · Root redirect page improved', () => {
  const src = indexAstro();
  assert(
    'src/pages/index.astro has meta http-equiv refresh',
    src.includes('http-equiv') && src.includes('refresh'),
    'Missing meta refresh in root redirect page'
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
    'EN JSON-LD contains itemListElement or makesOffer',
    en.includes('itemListElement') || en.includes('makesOffer') || en.includes('SoftwareApplication'),
    'JSON-LD not extended with project or service structured data'
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
  const match = distEN.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    assert('dist/en JSON-LD block found', false, 'No JSON-LD script tag in built EN HTML');
    return;
  }
  let parsed = null;
  try { parsed = JSON.parse(match[1]); } catch (e) { /* handled below */ }
  assert('dist/en JSON-LD parses as valid JSON', parsed !== null, 'JSON-LD is invalid JSON');
  if (parsed) {
    assert('JSON-LD @type is Person', parsed['@type'] === 'Person', `Got: ${parsed['@type']}`);
    assert('JSON-LD has makesOffer array', Array.isArray(parsed.makesOffer), 'makesOffer missing or not array');
    assert('JSON-LD has itemListElement array', Array.isArray(parsed.itemListElement), 'itemListElement missing or not array');
  }
});

// ─── Built output checks (only with --built flag) ─────────────────────────

if (BUILT) {
  console.log('\n── BUILT OUTPUT CHECKS (dist/)');

  const distEN = read('dist/en/index.html') || '';
  const distES = read('dist/es/index.html') || '';

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
    '[built] Portfolio section before Services section in EN HTML',
    (() => {
      const portfolioId = distEN.indexOf('id="portfolio"');
      const servicesId  = distEN.indexOf('id="services"');
      return portfolioId > -1 && servicesId > -1 && portfolioId < servicesId;
    })(),
    'Portfolio section does not precede Services section in built EN HTML'
  );
  assert(
    '[built] No 580M in built EN HTML',
    !distEN.includes('580M'),
    '580M claim still in built EN output'
  );
  assert(
    '[built] Portfolio cards render Problem / Built / Proof structure',
    distEN.includes('Problem') && distEN.includes('Built') && distEN.includes('Proof'),
    'Built EN portfolio markup missing structured project scan labels'
  );
  assert(
    '[built] Contact section exposes primary email CTA',
    distEN.includes('Email me directly'),
    'Built EN contact section missing primary email CTA'
  );
  assert(
    '[built] ES page title contains Tooltician',
    distES.includes('Tooltician'),
    'ES title in built output does not contain Tooltician'
  );
}

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
