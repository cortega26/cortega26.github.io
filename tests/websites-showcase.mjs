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
  assert.ok(site.benefit.en?.length > 35 && site.benefit.es?.length > 35, `Client outcome: ${site.id}`);
  assert.equal(site.capabilities.es?.length, 2, `Spanish deliverables: ${site.id}`);
  assert.equal(site.capabilities.en?.length, 2, `English deliverables: ${site.id}`);
  assert.ok(site.tags.length > 0, `Nonempty tags: ${site.id}`);
  assert.ok(['checked', 'unverified'].includes(site.status), `Verification status: ${site.id}`);
  if (site.repo) assert.ok(site.repo.startsWith('https://github.com/cortega26/'), `Source repo: ${site.id}`);
}
for (const domain of ['noticiencias.com', 'monedario.cl', 'casabea.cl', 'elrincondeebano.com', 'nohemipalencia.com', 'tooltician.com']) {
  assert.ok(websites.some((s) => s.domain === domain), `Present domain: ${domain}`);
}
assert.ok(websites.some((s) => s.id === 'chile-hub'), 'Include public chile-hub portal');
assert.ok(websites.every((s) => s.status === 'checked'), 'Every displayed site must have been verified');
assert.ok(!websites.some((s) => s.domain === 'casabeya.cl'), 'Do not publish the misspelled bakery domain');
assert.equal(websites.find((s) => s.id === 'nohemi')?.status, 'checked', 'Artist custom domain verified reachable 2026-10-22');
const alternates = alternatesFor('websites');
assert.deepEqual(alternates.map((a) => a.hreflang), ['en','es','x-default']);
assert.deepEqual(alternates.map((a) => new URL(a.href).pathname), ['/en/sites/','/es/sitios/','/en/sites/']);
for (const path of ['src/pages/en/sites/index.astro', 'src/pages/es/sitios/index.astro']) {
  const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.ok(src.includes("alternatesFor('websites')"), `Correct hreflang group: ${path}`);
  assert.ok(src.includes('<WebsitesGallery'), `Shared component: ${path}`);
}
const gallery = readFileSync(new URL('../src/components/WebsitesGallery.astro', import.meta.url), 'utf8');
const visual = readFileSync(new URL('../src/components/WebsitePreview.astro', import.meta.url), 'utf8');
assert.ok(gallery.includes('<WebsitePreview'), 'Each card includes a representative UI preview');
assert.ok(gallery.includes('site.benefit[lang]') && gallery.includes('site.capabilities[lang]'), 'Client-facing proof appears on cards');
assert.ok(!gallery.includes('<aside'), 'No unrelated or speculative domain is promoted');
assert.ok(visual.includes("object-fit:contain"), 'Artwork is displayed uncropped');
for (const id of websites.map((site) => site.id)) {
  assert.ok(visual.includes("site.id === '" + id + "'"), 'Dedicated visual concept: ' + id);
}
assert.ok(!visual.includes('<iframe'), 'Do not embed third-party sites in frames');
assert.ok(!gallery.includes('neareo.cl') && !visual.includes('neareo.cl'), 'Unrelated domain never mentioned');
assert.ok(visual.includes('shot-news__feature') && visual.includes('shot-news__edition'), 'Noticiencias uses a news-led editorial composition');
assert.ok(visual.includes('shot-money__indicators') && visual.includes('shot-money__mark'), 'Monedario shows its actual financial indicators and logo mark');
assert.ok(visual.includes('#1a4f8a'), 'Monedario identity uses its real blue brand color');
assert.ok(visual.includes('Ciencia y tecnología para leer con criterio.') && visual.includes('Decisiones de <em>plata</em> en Chile.'), 'Previews reflect verified homepage headlines');
assert.ok(visual.indexOf('.shot-news__feature') !== visual.indexOf('.shot-money__content'), 'Previews have separate, site-specific layouts');
console.log('PASS: 7 bilingual website cases, visual previews, verified ownership, delivery proof and routes.');
