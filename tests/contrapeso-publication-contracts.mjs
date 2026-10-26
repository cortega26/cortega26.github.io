import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prototype = join(root, 'public/venezuela-lab');
const routes = readFileSync(join(root, 'src/data/routes.ts'), 'utf8');
const indexable = routes.split('export const routeGroups')[1]?.split('export const prototypeOnlyRoutes')[0] ?? '';
const inventory = routes.split('export const prototypeOnlyRoutes')[1]?.split('] as const')[0] ?? '';

function pages(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? pages(path) : entry.name === 'index.html' ? [path] : [];
  });
}

function genreChecks(genre, metadata, kicker) {
  const issues = [];
  if (genre === 'news') {
    if (!/Hecho:\s*[^<]*20\d{2}/.test(metadata)) issues.push('news-event-date');
    if (!/Publicado y revisado:\s*[^<]*20\d{2}/.test(metadata)) issues.push('news-review-date');
  }
  if (genre === 'explainer') {
    if (!/HISTÓRICO/.test(kicker)) issues.push('historical-label');
    if (!/históric|historia|no es actualidad|noticia de última hora/i.test(metadata)) issues.push('historical-context');
  }
  if (genre === 'opinion') {
    if (!/(?:Firma|Autoría):\s*[^<]+/i.test(metadata)) issues.push('opinion-signature');
    if (!/(?:Publicado|Revisado):\s*[^<]*20\d{2}/i.test(metadata)) issues.push('opinion-review-date');
  }
  return issues;
}

function validatePublication(html, genre, route) {
  const errors = [];
  function requireCheck(condition, code) { if (!condition) errors.push(code); }
  requireCheck(/<html lang="es">/.test(html), 'language');
  requireCheck(hasNoindexMeta(html), 'robots');
  requireCheck(/<meta name="description" content="[^"]+">/.test(html), 'description');
  requireCheck((html.match(/<h1\b/g) ?? []).length === 1, 'single-h1');
  requireCheck(/<article\b/.test(html) && /class="article-header"/.test(html), 'article-layout');
  requireCheck(/class="prototype"/.test(html), 'prototype-label');
  requireCheck(!/<script\b|<form\b/i.test(html), 'no-collection-or-script');
  requireCheck(/href="\/venezuela-lab\/metodo\/"/.test(html), 'corrections-link');
  const metadata = html.match(/<div class="article-meta">([\s\S]*?)<\/div>/)?.[1] ?? '';
  requireCheck(/20\d{2}/.test(metadata), 'dated-metadata');
  const kicker = html.match(/class="kicker"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
  const labels = { news: /ACTUALIDAD/, explainer: /EXPLICADOR/, opinion: /OPINI[ÓO]N/ };
  requireCheck(labels[genre].test(kicker), 'genre-label');
  const sources = html.match(/<section\b[^>]*class="[^"]*\bsources\b[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  requireCheck(Boolean(sources), 'sources-section');
  const external = new Set([...sources.matchAll(/href="(https:\/\/[^"]+)"/g)].map((match) => match[1]));
  requireCheck(external.size >= (genre === 'opinion' ? 1 : 2), 'source-links');
  requireCheck(/<section\b[^>]*class="[^"]*\bmethod\b[^"]*"/.test(html), 'limits-section');
  errors.push(...genreChecks(genre, metadata, kicker));
  requireCheck(inventory.includes(`path: '${route}'`), 'prototype-inventory');
  requireCheck(!indexable.includes(route), 'sitemap-exclusion');
  return errors;
}

let checked = 0;
for (const [directory, genre] of [['actualidad', 'news'], ['explicadores', 'explainer'], ['opinion', 'opinion']]) {
  for (const file of pages(join(prototype, directory))) {
    const route = `/venezuela-lab/${relative(prototype, file).split(sep).join('/').replace(/index\.html$/, '')}`;
    const html = readFileSync(file, 'utf8');
    assert.deepEqual(validatePublication(html, genre, route), [], `Contrato editorial: ${route}`);
    if (process.argv.includes('--built')) {
      const built = join(root, 'dist', route.slice(1), 'index.html');
      assert.ok(existsSync(built), `Build presente: ${route}`);
      assert.ok(hasNoindexMeta(readFileSync(built, 'utf8')), `Build noindex: ${route}`);
    }
    checked++;
  }
}
assert.ok(checked >= 3, 'Se validan al menos las tres publicaciones reales existentes');
const news = readFileSync(join(prototype, 'actualidad/regreso-machado-2026/index.html'), 'utf8');
const newsRoute = '/venezuela-lab/actualidad/regreso-machado-2026/';
assert.ok(validatePublication(news.replace('noindex,nofollow,noarchive', 'index,follow'), 'news', newsRoute).includes('robots'), 'El guard rechaza indexación accidental');
assert.ok(validatePublication(news.replace('Hecho: 25 de octubre de 2026', 'Episodio: 25 de octubre de 2026'), 'news', newsRoute).includes('news-event-date'), 'El guard rechaza noticia sin fecha del hecho');
assert.ok(validatePublication(news.replace('class="sources"', 'class="references"'), 'news', newsRoute).includes('sources-section'), 'El guard rechaza ausencia de fuentes');
console.log(`Contrapeso CP-011: ${checked} páginas con contratos por género y pruebas negativas PASS`);
