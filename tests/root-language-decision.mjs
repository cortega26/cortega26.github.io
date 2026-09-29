#!/usr/bin/env node
/**
 * Root language-decision tests (Plan 054).
 *
 * Guards the Plan 031 decision: the root is a real bilingual x-default
 * landing — first-time visitors stay and choose explicitly; only a stored
 * `tooltician-language` preference forwards. The old browser-language
 * auto-redirect is gone by design.
 *
 * Run: node tests/root-language-decision.mjs
 *
 * - vm redirect cases (4): null → no replace; 'es' → /es/; 'en' → /en/;
 *   'fr' → no replace. Modeled on tests/analytics-guard.mjs.
 * - Source guard: none of root-language-redirect.js,
 *   root-language-picker.js, site-layout.js contains navigator.language
 *   or navigator.languages.
 * - Key agreement: all three files use the `tooltician-language` key and
 *   none mentions `autoredirect` (dead key removed).
 * - Head metadata (built): if dist/index.html exists, assert it contains
 *   name="referrer", llms.txt, og:locale, rel="me"; otherwise skip.
 *
 * No browser needed.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const REDIRECT_SRC = read('public/assets/js/root-language-redirect.js');

let passed = 0;
let failed = 0;
function assert(name, ok, detail = '') {
  if (ok) {
    console.log(`  ✓  ${name}`);
    passed++;
  } else {
    console.log(`  ✗  ${name}${detail ? `\n       → ${detail}` : ''}`);
    failed++;
  }
}
function group(label, fn) {
  console.log(`\n── ${label}`);
  fn();
}

function runRedirect(storedValue) {
  let replaced = null;
  const window = {
    localStorage: {
      getItem: () => storedValue,
    },
    location: {
      replace: (url) => {
        replaced = url;
      },
    },
  };
  vm.runInNewContext(REDIRECT_SRC, { window });
  return replaced;
}

group('vm · stored preference decides (first-time visitors stay)', () => {
  assert(
    'null (first visit) → no redirect',
    runRedirect(null) === null,
    `expected no replace, got ${JSON.stringify(runRedirect(null))}`,
  );
  assert(
    "'es' → replace('/es/')",
    runRedirect('es') === '/es/',
    `got ${JSON.stringify(runRedirect('es'))}`,
  );
  assert(
    "'en' → replace('/en/')",
    runRedirect('en') === '/en/',
    `got ${JSON.stringify(runRedirect('en'))}`,
  );
  assert(
    "'fr' (unsupported) → no redirect",
    runRedirect('fr') === null,
    `got ${JSON.stringify(runRedirect('fr'))}`,
  );
});

group('source guard · no browser-language detection', () => {
  const files = [
    'public/assets/js/root-language-redirect.js',
    'public/assets/js/root-language-picker.js',
    'public/assets/js/site-layout.js',
  ];
  for (const file of files) {
    const src = read(file);
    assert(
      `${file} has no navigator.language`,
      !src.includes('navigator.language'),
    );
    assert(
      `${file} has no navigator.languages`,
      !src.includes('navigator.languages'),
    );
  }
});

group('key agreement · one preference key, no dead key', () => {
  const files = [
    'public/assets/js/root-language-redirect.js',
    'public/assets/js/root-language-picker.js',
    'public/assets/js/site-layout.js',
  ];
  for (const file of files) {
    const src = read(file);
    assert(
      `${file} uses tooltician-language`,
      src.includes('tooltician-language'),
    );
    assert(
      `${file} has no autoredirect key`,
      !src.includes('autoredirect'),
    );
  }
});

group('head metadata (built)', () => {
  const builtPath = join(ROOT, 'dist/index.html');
  if (!existsSync(builtPath)) {
    console.log('  …  skipped — dist/index.html missing (run a build first)');
    return;
  }
  const html = read('dist/index.html');
  assert('built root has referrer policy', html.includes('name="referrer"'));
  assert('built root links llms.txt', html.includes('llms.txt'));
  assert('built root has og:locale', html.includes('og:locale'));
  assert('built root has rel="me" identity links', html.includes('rel="me"'));
});

console.log(failed ? `\n${failed} FAILED (${passed} passed)` : `\nAll passed (${passed} passed)`);
process.exit(failed ? 1 : 0);
