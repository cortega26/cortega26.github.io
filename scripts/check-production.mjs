import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  routeGroups,
  SITE_ORIGIN,
  alternatesFor,
  groupForPath,
} from '../src/data/routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSP_DOC_PATH = path.resolve(__dirname, '../docs/cloudflare-security-headers.md');

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeUrl = (url) => (url.endsWith('/') ? url : `${url}/`);
const normalizePath = (pathname) => {
  if (!pathname) return '/';
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
};

function parseBase(argv) {
  const flagIndex = argv.indexOf('--base');
  const raw = flagIndex === -1 ? SITE_ORIGIN : argv[flagIndex + 1];
  if (!raw) throw new Error('--base requires a URL argument');
  const url = new URL(raw);
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

async function drain(response) {
  try {
    await response.body?.cancel();
  } catch {
    // response already consumed or unusable — nothing to drain
  }
}

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
      await drain(response);
    } catch (error) {
      lastError = error;
    }
    if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }
  throw lastError;
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((match) => match[1]);
}

function extractFirstDataLayerStub(html) {
  const regex = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const inner = match[2];
    if (inner.includes('window.dataLayer')) return inner;
  }
  return null;
}

function sha256Base64(text) {
  return 'sha256-' + createHash('sha256').update(text, 'utf8').digest('base64');
}

function linkTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
}

function attr(tag, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  return match ? match[1] : undefined;
}

const failures = [];

function fail(name, detail = '') {
  failures.push(name);
  console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function main() {
  const base = parseBase(process.argv.slice(2));
  console.log(`Production check: ${base} (route registry: ${SITE_ORIGIN})\n`);

  const expectedPaths = new Set();
  for (const group of routeGroups) {
    for (const p of [group.paths.en, group.paths.es, group.paths.xDefault]) {
      if (p) expectedPaths.add(normalizePath(p));
    }
  }

  let liveUrls = null;
  try {
    const indexResponse = await fetchWithRetry(`${base}/sitemap-index.xml`);
    if (indexResponse.status !== 200) {
      fail('sitemap: sitemap-index.xml reachable', `expected 200, got ${indexResponse.status}`);
    } else {
      const children = extractLocs(await indexResponse.text());
      if (children.length === 0) {
        fail('sitemap: sitemap-index.xml lists child sitemaps', 'no <loc> found');
      } else {
        const collected = [];
        let childrenOk = true;
        for (const child of children) {
          try {
            const childResponse = await fetchWithRetry(child);
            if (childResponse.status !== 200) {
              fail('sitemap: child sitemap reachable', `${child} → expected 200, got ${childResponse.status}`);
              childrenOk = false;
              continue;
            }
            collected.push(...extractLocs(await childResponse.text()));
          } catch (error) {
            fail('sitemap: child sitemap reachable', `${child} → ${error.message}`);
            childrenOk = false;
          }
        }
        if (childrenOk) liveUrls = [...new Set(collected.map(normalizeUrl))];
      }
    }
  } catch (error) {
    fail('sitemap: sitemap-index.xml reachable', error.message);
  }

  if (liveUrls !== null) {
    const livePaths = new Set(liveUrls.map((url) => normalizePath(new URL(url).pathname)));
    const missing = [...expectedPaths].filter((p) => !livePaths.has(p)).sort();
    const extra = [...livePaths].filter((p) => !expectedPaths.has(p)).sort();
    if (missing.length === 0 && extra.length === 0) {
      pass(`sitemap set matches route registry (${livePaths.size} URLs)`);
    } else {
      if (missing.length > 0) fail('sitemap: no missing URLs', `missing: ${missing.join(', ')}`);
      if (extra.length > 0) fail('sitemap: no extra URLs', `extra: ${extra.join(', ')}`);
    }

    const total = liveUrls.length;
    let ok200 = 0;
    let parityOk = 0;
    for (const url of liveUrls) {
      const normalizedUrl = normalizeUrl(url);
      let response;
      try {
        response = await fetch(normalizedUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      } catch (error) {
        fail(`http: ${normalizedUrl}`, error.message);
        continue;
      }
      if (response.status !== 200) {
        fail(`http: ${normalizedUrl}`, `expected 200, got ${response.status}`);
        await drain(response);
        continue;
      }
      ok200 += 1;
      const html = await response.text();
      const tags = linkTags(html);

      const canonical = tags
        .map((tag) => ({ rel: attr(tag, 'rel'), href: attr(tag, 'href') }))
        .find((link) => link.rel === 'canonical')?.href;
      let canonicalOk = false;
      if (!canonical) {
        fail(`canonical: ${normalizedUrl}`, 'no <link rel="canonical">');
      } else if (!canonical.startsWith(SITE_ORIGIN)) {
        fail(`canonical: ${normalizedUrl}`, `href does not start with ${SITE_ORIGIN} (${canonical})`);
      } else if (normalizeUrl(canonical) !== normalizedUrl) {
        fail(`canonical: ${normalizedUrl}`, `href ${canonical} does not match fetched URL`);
      } else {
        canonicalOk = true;
      }

      const group = groupForPath(normalizePath(new URL(normalizedUrl).pathname));
      let hreflangOk = false;
      if (!group) {
        fail(`hreflang: ${normalizedUrl}`, 'path is not in the route registry');
      } else {
        const expected = alternatesFor(group.id)
          .map(({ hreflang, href }) => `${hreflang}=${normalizeUrl(href)}`)
          .sort()
          .join('|');
        const actual = tags
          .map((tag) => ({ rel: attr(tag, 'rel'), lang: attr(tag, 'hreflang'), href: attr(tag, 'href') }))
          .filter((link) => link.rel === 'alternate' && link.lang && link.href)
          .map(({ lang, href }) => `${lang}=${normalizeUrl(href)}`)
          .sort()
          .join('|');
        if (expected !== actual) {
          fail(`hreflang: ${normalizedUrl}`, `expected ${expected} — actual ${actual}`);
        } else {
          hreflangOk = true;
        }
      }

      if (canonicalOk && hreflangOk) parityOk += 1;
    }
    if (total > 0 && ok200 === total) pass(`${ok200}/${total} URLs returned 200`);
    if (total > 0 && parityOk === total) pass(`hreflang/canonical parity for ${parityOk} pages`);
  }

  let homeHtml = null;
  try {
    const response = await fetchWithRetry(`${base}/`);
    if (response.status !== 200) {
      fail('headers: GET /', `expected 200, got ${response.status}`);
      await drain(response);
    } else {
      homeHtml = await response.text();
      const required = [
        ['content-security-policy', null],
        ['strict-transport-security', null],
        ['x-content-type-options', 'nosniff'],
        ['referrer-policy', null],
        ['permissions-policy', null],
      ];
      const problems = [];
      for (const [name, expectedValue] of required) {
        const value = response.headers.get(name);
        if (!value) problems.push(`${name} missing`);
        else if (expectedValue !== null && value.trim() !== expectedValue) {
          problems.push(`${name}: expected "${expectedValue}", got "${value}"`);
        }
      }
      if (problems.length === 0) pass('security headers present on /');
      else fail('security headers on /', problems.join('; '));
    }
  } catch (error) {
    fail('headers: GET /', error.message);
  }

  if (homeHtml !== null) {
    const stub = extractFirstDataLayerStub(homeHtml);
    if (stub === null) {
      fail('CSP inline stub hash', 'no inline <script> containing window.dataLayer in / HTML');
    } else {
      const computed = sha256Base64(stub);
      let pinned = [];
      try {
        const doc = await fs.readFile(CSP_DOC_PATH, 'utf8');
        pinned = doc.match(/sha256-[A-Za-z0-9+/=]+/g) || [];
      } catch (error) {
        fail('CSP inline stub hash', `cannot read ${CSP_DOC_PATH}: ${error.message}`);
      }
      if (pinned.length > 0) {
        if (pinned.includes(computed)) pass('CSP inline stub hash matches pinned doc');
        else fail('CSP inline stub hash', `live=${computed} pinned=[${pinned.join(', ')}]`);
      }
    }
  }

  {
    const problems = [];
    try {
      const robots = await fetchWithRetry(`${base}/robots.txt`);
      if (robots.status !== 200) {
        problems.push(`/robots.txt → expected 200, got ${robots.status}`);
        await drain(robots);
      } else {
        const body = await robots.text();
        if (!body.includes('Sitemap:')) problems.push('/robots.txt body does not include "Sitemap:"');
      }
    } catch (error) {
      problems.push(`/robots.txt → ${error.message}`);
    }

    try {
      const llms = await fetchWithRetry(`${base}/llms.txt`);
      if (llms.status !== 200) problems.push(`/llms.txt → expected 200, got ${llms.status}`);
      await drain(llms);
    } catch (error) {
      problems.push(`/llms.txt → ${error.message}`);
    }

    try {
      const pricing = await fetchWithRetry(`${base}/pricing/`);
      if (pricing.status !== 404) problems.push(`/pricing/ → expected 404, got ${pricing.status}`);
      await drain(pricing);
    } catch (error) {
      problems.push(`/pricing/ → ${error.message}`);
    }

    if (problems.length === 0) pass('fixed paths (/robots.txt, /llms.txt, /pricing/ → 404)');
    else fail('fixed paths', problems.join('; '));
  }

  console.log('');
  if (failures.length > 0) {
    console.error(`FAIL: ${failures.length} production check(s) failed.`);
    console.error('PRODUCTION CHECK: FAIL');
    process.exit(1);
  }
  console.log('PRODUCTION CHECK: PASS');
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
