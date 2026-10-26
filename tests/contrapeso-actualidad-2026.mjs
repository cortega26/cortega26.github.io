import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const path = '/venezuela-lab/actualidad/regreso-machado-2026/';
const html = readFileSync(new URL('../public/venezuela-lab/actualidad/regreso-machado-2026/index.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.id === 'contrapeso:news:regreso-machado-2026' && r.path === path), 'Inventario de prototipo');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(path)), 'Excluida de sitemap');
assert.ok(hasNoindexMeta(html), 'Noindex');
assert.match(html, /<html lang="es">/, 'Idioma');
assert.match(html, /ACTUALIDAD/, 'Género de noticia');
assert.match(html, /Hecho: 25 de octubre de 2026/, 'Fecha del hecho');
assert.match(html, /Publicado y revisado: 26 de octubre de 2026/, 'Fecha de revisión');
assert.match(html, /sin reporteo propio/, 'Sin atribución falsa de reporteo');
assert.match(html, /No verificado aquí:/, 'Límites explícitos');
assert.match(html, /no se había anunciado una fecha/, 'Estado temporal atribuido');
for (const url of [
  'https://apnews.com/article/venezuela-maria-corina-machado-return-democracy-maduro-e6eff0c2ff962fd9b0f87270b24ef567',
  'https://elpais.com/america/2026-10-25/maria-corina-machado-regresa-a-venezuela.html',
  'https://www.theguardian.com/world/2026/oct/25/exiled-venezuelan-opposition-leader-maria-corina-machado-announces-her-return'
]) assert.ok(html.includes(url), `Fuente inspeccionada: ${url}`);
assert.ok(!/<script\b|<form\b/i.test(html), 'Sin JS ni captación de datos');
assert.ok(html.includes('href="/venezuela-lab/explicadores/explicadores.css"'), 'Reutiliza CSS existente');
const grid = home.split('<div class="articles-grid" id="article-list">')[1].split('</div><p id="no-results"')[0];
assert.equal((grid.match(/class="story-card"/g) || []).length, 6, 'Seis tarjetas');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 1, 'Una muestra');
const card = grid.split('<article class="story-card" data-category="Actualidad"')[1].split('</article>')[0];
assert.ok(card.includes(`href="${path}"`) && !card.includes('demo-tag') && !card.includes('data-article='), 'Noticia enlazada y no demostrativa');
assert.ok(home.includes('5 CONTENIDOS CON FUENTES · 1 MUESTRA'), 'Balance editorial actualizado');
if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/actualidad/regreso-machado-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built) && built.includes('María Corina Machado regresa'), 'Build de noticia noindex');
}
console.log('Contrapeso actualidad 2026: género, fuentes, límites, portada, ruta y noindex PASS');
