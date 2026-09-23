// Sitemap i18n validator — Plan 025.
//
// Run after `npm run build`. Asserts that:
//   1. the route registry itself is coherent (unique ids/paths, x-default set);
//   2. dist/sitemap-0.xml has no duplicate hreflang per URL;
//   3. every sitemap URL matches the registry's alternate set exactly;
//   4. en/es alternates are reciprocal (A→B implies B→A);
//   5. every built HTML page in a group is in the sitemap exactly once and
//      its <link rel="alternate"> set equals the sitemap set (HTML↔XML parity).
//
// Exit 0 with a PASS summary, or exit 1 with a named failure list.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  routeGroups,
  SITE_ORIGIN,
  alternatesFor,
  groupForPath,
} from '../src/data/routes.ts';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DIST = join(ROOT, 'dist');
const SITEMAP = join(DIST, 'sitemap-0.xml');

const failures = [];
const fail = (name, detail = '') => {
  failures.push(name);
  console.error(`✗ ${name}${detail ? `\n    → ${detail}` : ''}`);
};
const ok = (name) => console.log(`✓ ${name}`);

const normalizeUrl = (url) => (url.endsWith('/') ? url : `${url}/`);
const pathOf = (url) => {
  const pathname = new URL(url).pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

// ── 1. Registry coherence ────────────────────────────────────────────────────
{
  const ids = routeGroups.map((group) => group.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    fail('registry: unique group ids', `duplicates in ${JSON.stringify(ids)}`);
  } else {
    ok(`registry: ${ids.length} unique group ids`);
  }

  const paths = routeGroups.flatMap((group) =>
    [group.paths.en, group.paths.es].filter((path) => Boolean(path))
  );
  if (new Set(paths).size !== paths.length) {
    fail('registry: no path belongs to two groups');
  } else {
    ok('registry: every localized path is unique');
  }

  const missingXDefault = routeGroups.filter((group) => !group.paths.xDefault);
  if (missingXDefault.length > 0) {
    fail('registry: every group has x-default', missingXDefault.map((g) => g.id).join(', '));
  } else {
    ok('registry: every group defines x-default');
  }
}

// ── Parse the built sitemap ──────────────────────────────────────────────────
if (!existsSync(SITEMAP)) {
  fail('dist/sitemap-0.xml exists', 'run `npm run build` first');
  console.error('\nFAIL: cannot validate without a built sitemap.');
  process.exit(1);
}

const xml = readFileSync(SITEMAP, 'utf8');
const sitemapEntries = new Map(); // normalized loc URL → [{lang, url}]
for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const block = match[1];
  const loc = normalizeUrl(/<loc>(.*?)<\/loc>/.exec(block)?.[1] ?? '');
  if (!loc) continue;
  const links = [...block.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(([, lang, url]) => ({
    lang,
    url: normalizeUrl(url),
  }));
  if (sitemapEntries.has(loc)) {
    fail('sitemap: no duplicate <loc>', loc);
  }
  sitemapEntries.set(loc, links);
}

// ── 2. No duplicate hreflang per URL ─────────────────────────────────────────
{
  let duplicates = 0;
  for (const [loc, links] of sitemapEntries) {
    const langs = links.map((link) => link.lang);
    if (new Set(langs).size !== langs.length) {
      duplicates++;
      fail('sitemap: unique hreflang per URL', `${loc} → ${JSON.stringify(langs)}`);
    }
  }
  if (duplicates === 0) ok(`sitemap: no duplicate hreflang across ${sitemapEntries.size} URLs`);
}

// ── 3. Registry parity + 4. Reciprocity ──────────────────────────────────────
{
  let mismatches = 0;
  let nonReciprocal = 0;
  const seen = new Set();
  for (const [loc, links] of sitemapEntries) {
    const group = groupForPath(pathOf(loc));
    if (!group) {
      mismatches++;
      fail('sitemap: every URL belongs to a registry group', loc);
      continue;
    }
    seen.add(group.id);
    const expected = alternatesFor(group.id)
      .map(({ hreflang, href }) => `${hreflang}=${normalizeUrl(href)}`)
      .sort()
      .join('|');
    const actual = links
      .map(({ lang, url }) => `${lang}=${normalizeUrl(url)}`)
      .sort()
      .join('|');
    if (expected !== actual) {
      mismatches++;
      fail('sitemap: alternate set matches registry', `${loc}\n      expected ${expected}\n      actual   ${actual}`);
      continue;
    }

    for (const { lang, url } of links) {
      if (lang === 'x-default') continue;
      const reciprocal = sitemapEntries.get(url);
      if (!reciprocal || !reciprocal.some((link) => normalizeUrl(link.url) === normalizeUrl(loc))) {
        nonReciprocal++;
        fail('sitemap: en/es alternates are reciprocal', `${loc} → ${lang}:${url} does not point back`);
      }
    }
  }
  if (mismatches === 0) ok('sitemap: every URL matches its registry alternate set');
  if (nonReciprocal === 0) ok('sitemap: en/es alternates are reciprocal');

  const missingGroups = routeGroups.filter((group) => !seen.has(group.id));
  if (missingGroups.length > 0) {
    fail('sitemap: every registry group has at least one URL', missingGroups.map((g) => g.id).join(', '));
  } else {
    ok('sitemap: every registry group is represented');
  }
}

// ── 5. HTML↔XML parity ───────────────────────────────────────────────────────
function walkHtml(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) files.push(...walkHtml(abs));
    else if (entry.endsWith('.html')) files.push(abs);
  }
  return files;
}

{
  const htmlFiles = walkHtml(DIST);
  let checked = 0;
  let problems = 0;
  for (const file of htmlFiles) {
    const rel = relative(DIST, file);
    if (rel === '404.html') continue;
    const html = readFileSync(file, 'utf8');
    const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/.exec(html)?.[1];
    if (!canonical || !canonical.startsWith(SITE_ORIGIN)) continue;

    const loc = normalizeUrl(canonical);
    const group = groupForPath(pathOf(loc));
    if (!group) {
      problems++;
      fail('html: every page belongs to a registry group', rel);
      continue;
    }

    const htmlLinks = [...html.matchAll(/<link\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => /\brel="alternate"/.test(tag) && /\bhreflang="/.test(tag))
      .map((tag) => ({
        lang: /\bhreflang="([^"]+)"/.exec(tag)?.[1] ?? '',
        url: normalizeUrl(/\bhref="([^"]+)"/.exec(tag)?.[1] ?? ''),
      }))
      .sort((a, b) => a.lang.localeCompare(b.lang));

    const sitemapLinks = [...(sitemapEntries.get(loc) ?? [])].sort((a, b) => a.lang.localeCompare(b.lang));
    const htmlKey = htmlLinks.map(({ lang, url }) => `${lang}=${url}`).join('|');
    const xmlKey = sitemapLinks.map(({ lang, url }) => `${lang}=${url}`).join('|');
    if (htmlKey !== xmlKey) {
      problems++;
      fail('html↔xml parity', `${rel}\n      html    ${htmlKey}\n      sitemap ${xmlKey}`);
      continue;
    }
    if (!sitemapEntries.has(loc)) {
      problems++;
      fail('html: canonical appears in the sitemap', rel);
      continue;
    }
    checked++;
  }
  if (problems === 0) ok(`html↔xml parity across ${checked} grouped pages`);
}

// ── Summary ──────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`\nFAIL: ${failures.length} sitemap i18n check(s) failed.`);
  process.exit(1);
}
console.log('\nPASS: registry, sitemap, and HTML hreflang are consistent.');
