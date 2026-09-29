#!/usr/bin/env node
// Guard tests for the build/verification scripts (plan 056).
// Fully offline: network and file writes are injected fakes.
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fetchStats } from '../scripts/fetch-github-stats.js';
import { verifyCspStub } from '../scripts/check-production.mjs';

let passed = 0, failed = 0;
const failures = [];
const assert = (name, condition, detail = '') => {
  if (condition) { console.log(`  ✓  ${name}`); passed++; }
  else { console.log(`  ✗  ${name}${detail ? `\n       → ${detail}` : ''}`); failed++; failures.push(name); }
};

const response = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body });
const offline = async () => { throw new Error('offline'); };

const tempStatsPath = () => {
  const dir = mkdtempSync(join(tmpdir(), 'script-guards-'));
  const path = join(dir, 'github-stats.json');
  writeFileSync(path, '{}', 'utf8');
  return { dir, path };
};

// ── fetch-github-stats guards ───────────────────────────────────────────────

{
  const { dir, path } = tempStatsPath();
  const writes = [];
  await fetchStats({
    fetchImpl: offline,
    writeImpl: (...args) => { writes.push(args); },
    statsFilePath: path,
    repos: ['alpha', 'beta'],
  });
  assert('stats all-fallback: resolves without writing', writes.length === 0, `writes=${writes.length}`);
  rmSync(dir, { recursive: true, force: true });
}

{
  const { dir, path } = tempStatsPath();
  const writes = [];
  await fetchStats({
    fetchImpl: async (url) =>
      url.includes('/repos/cortega26/alpha')
        ? response({ stargazers_count: 7, forks_count: 3 })
        : offline(),
    writeImpl: (...args) => { writes.push(args); },
    statsFilePath: path,
    repos: ['alpha', 'beta'],
  });
  const written = writes.length === 1 ? JSON.parse(writes[0][1]) : null;
  assert('stats partial: writes exactly once', writes.length === 1, `writes=${writes.length}`);
  assert(
    'stats partial: live repo keeps live counts, failed repo falls back to zeros',
    written && written.alpha?.stars === 7 && written.alpha?.forks === 3 &&
      written.beta?.stars === 0 && written.beta?.forks === 0,
    JSON.stringify(written)
  );
  rmSync(dir, { recursive: true, force: true });
}

{
  const { dir, path } = tempStatsPath();
  const writes = [];
  await fetchStats({
    fetchImpl: async (url) =>
      response(url.includes('alpha')
        ? { stargazers_count: 11, forks_count: 4 }
        : { stargazers_count: 2, forks_count: 1 }),
    writeImpl: (...args) => { writes.push(args); },
    statsFilePath: path,
    repos: ['alpha', 'beta'],
  });
  const written = writes.length === 1 ? JSON.parse(writes[0][1]) : null;
  assert(
    'stats success: all live values written',
    written && written.alpha?.stars === 11 && written.alpha?.forks === 4 &&
      written.beta?.stars === 2 && written.beta?.forks === 1,
    JSON.stringify(written)
  );
  rmSync(dir, { recursive: true, force: true });
}

// ── check-production CSP verifier ───────────────────────────────────────────

const stubHtml = '<html><head><script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}</script></head><body></body></html>';
const noStubHtml = '<html><head><script>console.log("no data layer here")</script></head></html>';
const probe = verifyCspStub(stubHtml, []);
const correctHash = probe.computed;

assert(
  'csp: computes a sha256- hash from the inline dataLayer stub',
  typeof correctHash === 'string' && correctHash.startsWith('sha256-'),
  JSON.stringify(probe)
);
assert('csp: correct pin matches', verifyCspStub(stubHtml, [correctHash]).ok === true);
assert(
  'csp: empty pin list fails (no silent skip)',
  verifyCspStub(stubHtml, []).ok === false && verifyCspStub(stubHtml, []).reason.includes('no sha256 tokens'),
  JSON.stringify(verifyCspStub(stubHtml, []))
);
assert(
  'csp: wrong pin fails',
  verifyCspStub(stubHtml, ['sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=']).ok === false
);
assert(
  'csp: missing stub fails with no computed hash',
  verifyCspStub(noStubHtml, [correctHash]).ok === false && verifyCspStub(noStubHtml, [correctHash]).computed === null
);

console.log(`\nResults: ${passed}/${passed + failed} passed`);
if (failed) { console.log('\nFailed:'); failures.forEach((f) => console.log('  • ' + f)); process.exit(1); }
console.log('All checks passed.');
