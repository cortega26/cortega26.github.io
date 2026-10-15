// Regression: the language switch must open the equivalent blog page, not the home page.
// Run against Astro's built HTML. Also verifies reciprocal canonical/hreflang pairs.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const origin = 'https://tooltician.com';
const pairs = [
  { es: '/blog/', en: '/en/blog/', esHeading: 'Construir. Medir. Comprobar.', enHeading: 'Build. Measure. Verify.' },
  { es: '/blog/python-313-vs-314-vs-315/', en: '/en/blog/python-313-vs-314-vs-315/', esHeading: '¿De verdad gana el más nuevo?', enHeading: 'Does newer really mean faster?' },
];

function attribute(html, name) {
  return new RegExp('\\b' + name + '="([^"]+)"').exec(html)?.[1];
}
function readPage(path) {
  const file = join(root, 'dist', path.slice(1), 'index.html');
  assert.ok(existsSync(file), `Built page missing: ${path}`);
  return readFileSync(file, 'utf8');
}
let checks = 0;
for (const pair of pairs) {
  for (const [lang, path, target, heading] of [
    ['es', pair.es, pair.en, pair.esHeading],
    ['en', pair.en, pair.es, pair.enHeading],
  ]) {
    const html = readPage(path);
    assert.match(html, new RegExp(`<html[^>]*lang="${lang}"`), `${path}: wrong document language`);
    assert.ok(html.includes(heading), `${path}: missing translated heading`);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}"`), `${path}: incorrect canonical`);
    for (const [code, alternatePath] of [['es', pair.es], ['en', pair.en], ['x-default', pair.es]]) {
      assert.ok(html.includes(`hreflang="${code}" href="${origin}${alternatePath}"`),
        `${path}: missing hreflang=${code} for ${alternatePath}`);
    }
    const switchTags = [...html.matchAll(/<a\b[^>]*data-language-preference="(?:en|es)"[^>]*>/g)].map(match => match[0]);
    assert.equal(switchTags.length, 2, `${path}: expected navbar and footer language switches`);
    for (const anchor of switchTags) {
      assert.equal(attribute(anchor, 'href'), target, `${path}: language switch does not keep page context`);
      assert.equal(attribute(anchor, 'hreflang'), lang === 'es' ? 'en' : 'es', `${path}: wrong target language`);
    }
    checks++;
  }
}
const englishArticle = readPage('/en/blog/python-313-vs-314-vs-315/');
for (const required of [
  '14 workloads', '18,144 internal samples', 'The statistical detail',
  '0.25', '1.0', 'Data, source code and reproduction',
  'consolidado.json', 'resumen_multisesion.csv',
]) {
  assert.ok(englishArticle.includes(required), `English article missing substantive content: ${required}`);
}
const spanishArticle = readPage('/blog/python-313-vs-314-vs-315/');
assert.equal((englishArticle.match(/<tbody>\s*<tr>/g) || []).length, 14,
  'English comparison table must contain all 14 workloads');
assert.equal((spanishArticle.match(/<tbody>\s*<tr>/g) || []).length, 14,
  'Spanish comparison table must contain all 14 workloads');
console.log(`PASS: ${checks} localized pages, reciprocal links, hreflang, and complete benchmark tables.`);
