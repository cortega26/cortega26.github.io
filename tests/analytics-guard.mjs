#!/usr/bin/env node
/**
 * analytics-guard.js — GA4 must only be enabled on production hosts.
 * Run: node tests/analytics-guard.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const GA4 = 'G-TEST123456';

let failed = 0;
function assert(name, ok) {
  console.log(`  ${ok ? '✓' : '✗'}  ${name}`);
  if (!ok) failed++;
}

function runGuard({ hostname, protocol = 'https:', withId = true }) {
  const window = {};
  const sandbox = {
    window,
    location: { hostname, protocol },
    document: { currentScript: { getAttribute: (k) => (k === 'data-ga4-id' && withId ? GA4 : null) } },
  };
  vm.runInNewContext(read('public/assets/js/analytics-guard.js'), sandbox);
  return window;
}

console.log('\n── analytics-guard (environment gating)');
for (const host of ['tooltician.com', 'www.tooltician.com', 'TOOLTICIAN.com']) {
  const w = runGuard({ hostname: host });
  assert(`${host}: GA4 stays enabled`, !w['ga-disable-' + GA4]);
}
for (const host of ['localhost', '127.0.0.1', '192.168.1.10', 'cortega26.github.io', 'tooltician.com.evil.test', '']) {
  const w = runGuard({ hostname: host });
  assert(`"${host}": GA4 disabled`, w['ga-disable-' + GA4] === true);
}
assert('file: protocol disabled', runGuard({ hostname: '', protocol: 'file:' })['ga-disable-' + GA4] === true);
assert('missing data-ga4-id does not throw', runGuard({ hostname: 'localhost', withId: false })['ga-disable-undefined'] === undefined);

console.log('\n── wiring');
const stubBefore = (file) => {
  const s = read(file);
  const g = s.indexOf('/assets/js/analytics-guard.js');
  const i = s.indexOf("gtag('config'");
  return g > -1 && i > -1 && g < i && s.includes('data-ga4-id={ga4Id}');
};
assert('BaseLayout loads guard (with id) before the gtag stub', stubBefore('src/layouts/BaseLayout.astro'));
assert('gateway index loads guard (with id) before the gtag stub', stubBefore('src/pages/index.astro'));

console.log(failed ? `\n${failed} FAILED` : '\nAll passed');
process.exit(failed ? 1 : 0);
