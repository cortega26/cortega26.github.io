// Website showcase contract: inventory, ownership-safe links, localizations and routes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { websites, websiteGroups } from '../src/data/websites.ts';
import { alternatesFor } from '../src/data/routes.ts';

assert.equal(websites.length, 7, 'Seven explicitly documented site projects');
const uniqueIds = new Set(websites.map((site) => site.id));
assert.equal(uniqueIds.size, websites.length, 'No duplicate projects');
for (const site of websites) {
  assert.ok(websiteGroups.includes(site.group), `Known group: ${site.id}`);
  assert.equal(new URL(site.url).protocol, 'https:', `HTTPS target: ${site.id}`);
  assert.ok(site.description.en?.length > 30 && site.description.es?.length > 30, `Bilingual copy: ${site.id}`);
  assert.ok(site.highlight.en?.length > 5 && site.highlight.es?.length > 5, `Visual title: ${site.id}`);
  assert.ok(site.tags.length > 0, `Nonempty tags: ${site.id}`);
  assert.ok(['checked', 'unverified'].includes(site.status), `Verification status: ${site.id}`);
  if (site.repo) assert.ok(site.repo.startsWith('https://github.com/cortega26/'), `Source repo: ${site.id}`);
}
for (const domain of ['noticiencias.com', 'monedario.cl', 'casabea.cl', 'elrincondeebano.com', 'nohemipalencia.com', 'tooltician.com']) {
  assert.ok(websites.some((s) => s.domain === domain), `Present domain: ${domain}`);
}
assert.ok(websites.some((s) => s.id === 'chile-hub'), 'Include public chile-hub portal');
assert.ok(!websites.some((s) => s.domain === 'neareo.cl'), 'Unverified/unmatched domain is not presented as delivered');
assert.ok(!websites.some((s) => s.domain === 'casabeya.cl'), 'Do not publish the misspelled bakery domain');
assert.equal(websites.find((s) => s.id === 'nohemi')?.status, 'unverified', 'Artist custom domain not presented as live-verified');
const alternates = alternatesFor('websites');
assert.deepEqual(alternates.map((a) => a.hreflang), ['en','es','x-default']);
assert.deepEqual(alternates.map((a) => new URL(a.href).pathname), ['/en/sites/','/es/sitios/','/en/sites/']);
for (const path of ['src/pages/en/sites/index.astro', 'src/pages/es/sitios/index.astro']) {
  const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.ok(src.includes("alternatesFor('websites')"), `Correct hreflang group: ${path}`);
  assert.ok(src.includes('<WebsitesGallery'), `Shared component: ${path}`);
}
console.log('PASS: 7 bilingual website records, domain provenance, routes, and accessible page integration.');
