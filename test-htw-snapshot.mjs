// Characterization snapshot for the flagship web-technical-hygiene pages.
// Loads the BUILT html and captures a SEMANTIC fingerprint — page title,
// canonical, heading text, link hrefs, form field names, and JSON-LD. These
// are all static: the page's runtime scripts only toggle reveal/visible
// classes and set a hidden field's value property, none of which appear in the
// fingerprint, so the snapshot is deterministic (JS left enabled). Run with
// --update to (re)generate the committed baseline; run without it to check drift.
//
//   node test-htw-snapshot.mjs --update   # regenerate baseline
//   node test-htw-snapshot.mjs            # fail (exit 1) on any drift
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const UPDATE = process.argv.includes('--update');
const SNAP_DIR = resolve('tests/snapshots');

const PAGES = [
  { lang: 'en', file: 'dist/en/services/web-technical-hygiene/index.html' },
  { lang: 'es', file: 'dist/es/servicios/higiene-tecnica-web/index.html' },
];

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function fingerprint(page, fileAbs) {
  await page.goto(pathToFileURL(fileAbs).href, { waitUntil: 'domcontentloaded' });
  return page.evaluate(() => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main');
    const texts = (sel) =>
      Array.from((main || document).querySelectorAll(sel)).map((el) => clean(el.textContent)).filter(Boolean);
    return {
      title: clean(document.title),
      canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') || null,
      headings: texts('h1, h2, h3'),
      links: Array.from((main || document).querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
      formFields: Array.from((main || document).querySelectorAll('[name]')).map((el) => el.getAttribute('name')),
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
        try { return JSON.parse(s.textContent); } catch { return { PARSE_ERROR: clean(s.textContent).slice(0, 80) }; }
      }),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

let failures = 0;
if (UPDATE && !existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

for (const { lang, file } of PAGES) {
  const fileAbs = resolve(file);
  if (!existsSync(fileAbs)) {
    console.error(`✗ ${lang}: built file missing (${file}) — run 'npm run build' first`);
    failures++;
    continue;
  }
  const current = await fingerprint(page, fileAbs);
  const snapPath = resolve(SNAP_DIR, `htw-${lang}.json`);

  if (UPDATE) {
    writeFileSync(snapPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
    console.log(`✓ ${lang}: baseline written → ${snapPath} (${current.headings.length} headings, ${current.links.length} links, ${current.jsonLd.length} json-ld)`);
    continue;
  }

  if (!existsSync(snapPath)) {
    console.error(`✗ ${lang}: no baseline at ${snapPath}. Run: node test-htw-snapshot.mjs --update`);
    failures++;
    continue;
  }
  const baseline = JSON.parse(readFileSync(snapPath, 'utf8'));
  const a = JSON.stringify(baseline);
  const b = JSON.stringify(current);
  if (a === b) {
    console.log(`✓ ${lang}: no diff (${current.headings.length} headings)`);
  } else {
    failures++;
    console.error(`✗ ${lang}: OUTPUT CHANGED vs baseline. Per-field diff:`);
    for (const key of Object.keys(baseline)) {
      if (JSON.stringify(baseline[key]) !== JSON.stringify(current[key])) {
        console.error(`  • ${key} changed`);
      }
    }
    console.error('  If the change is intentional, re-run with --update and commit the new baseline.');
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
