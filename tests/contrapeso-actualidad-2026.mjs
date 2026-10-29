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
assert.match(html, /María Corina Machado regresó a Venezuela\. <em>Las elecciones presidenciales siguen sin fecha\./, 'Titular directo y fechado');
assert.doesNotMatch(html, /no equivale por sí mismo|no significa que exista un pacto definitivo|no una crónica desde el lugar de los hechos|este prototipo no pudo inspeccionar/i, 'Sin prosa defensiva redundante');
assert.match(html, /Es una atribución de Rubio/, 'Atribución explícita de declaraciones');
assert.match(html, /no acreditan un acuerdo privado de seguridad/, 'No inferir garantías privadas');
assert.match(html, /mensaje original de Machado en X no fue inspeccionado directamente/, 'Límite material de fuente primaria');
assert.match(html, /content="noindex,nofollow,noarchive"/, 'Tres directivas robots');

for (const url of [
  'https://apnews.com/article/venezuela-maria-corina-machado-return-democracy-maduro-e6eff0c2ff962fd9b0f87270b24ef567',
  'https://elpais.com/america/2026-10-25/maria-corina-machado-regresa-a-venezuela.html',
  'https://www.theguardian.com/world/2026/oct/25/exiled-venezuelan-opposition-leader-maria-corina-machado-announces-her-return'
]) assert.ok(html.includes(url), `Fuente inspeccionada: ${url}`);
assert.ok(!/<script\b|<form\b/i.test(html), 'Sin JS ni captación de datos');
assert.ok(html.includes('href="/venezuela-lab/explicadores/explicadores.css"'), 'Reutiliza CSS existente');
const grid = home.split('<div class="articles-grid" id="article-list">')[1].split('</div><p id="no-results"')[0];
assert.equal((grid.match(/class="story-card"/g) || []).length, 7, 'Siete tarjetas');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 1, 'Una muestra');
const card = grid.split('<article class="story-card" data-category="Actualidad"')[1].split('</article>')[0];
assert.ok(card.includes(`href="${path}"`) && !card.includes('demo-tag') && !card.includes('data-article='), 'Noticia enlazada y no demostrativa');
assert.ok(home.includes('6 CONTENIDOS CON FUENTES · 1 MUESTRA'), 'Balance editorial actualizado');
if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/actualidad/regreso-machado-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built) && built.includes('María Corina Machado regresó'), 'Build de noticia noindex');
}

const marchPath = '/venezuela-lab/actualidad/marcha-miraflores-28oct-2026/';
const march = readFileSync(new URL('../public/venezuela-lab/actualidad/marcha-miraflores-28oct-2026/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.id === 'contrapeso:news:marcha-miraflores-28oct-2026' && r.path === marchPath), 'Segunda noticia en inventario');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(marchPath)), 'Segunda noticia fuera de sitemap');
assert.ok(hasNoindexMeta(march) && march.includes('noindex,nofollow,noarchive'), 'Robots completos de segunda noticia');
assert.match(march, /Hecho: 28 de octubre de 2026/, 'Fecha del hecho actual');
assert.match(march, /Publicado: 28 de octubre de 2026/, 'Fecha de publicación original');
assert.match(march, /Revisado: 29 de octubre de 2026/, 'Fecha de revisión diferenciada');
assert.match(march, /sin reporteo propio/, 'No se inventa reporteo');
assert.match(march, /Qué falta verificar/, 'Límites documentados');
assert.ok(march.includes('https://eldiario.com/2026/10/28/represion-policial-marcha/'), 'Fuente local consultada');
assert.ok(march.includes('https://runrun.es/noticias/623963/pnb-bloquea-a-manifestantes-sindicales-y-familiares-de-presos-politicos-antes-de-llegar-a-miraflores/'), 'Tercera fuente sobre versiones de acceso');
assert.match(march, /dos versiones incompatibles/, 'Contradicción material explícita');
assert.ok(march.includes('https://www.infobae.com/america/agencias/2026/10/28/activistas-exigen-presidenciales-y-un-indulto-masivo-para-presos-politicos-en-venezuela/'), 'Despacho EFE consultado');
assert.ok(!/<script\b|<form\b/i.test(march), 'Sin JS ni formularios nuevos');
const marchCard = grid.split('data-search="marcha miraflores 28 octubre 2026')[1]?.split('</article>')[0];
assert.ok(marchCard?.includes('href="' + marchPath + '"') && !marchCard.includes('demo-tag'), 'Tarjeta de actualidad enlaza a noticia real');
assert.equal((grid.match(/data-category="Actualidad"/g) || []).length, 2, 'Dos noticias reales en Actualidad');
if (process.argv.includes('--built')) {
  const builtMarch = readFileSync(new URL('../dist/venezuela-lab/actualidad/marcha-miraflores-28oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtMarch) && builtMarch.includes('Miraflores'), 'Build conserva noticia y noindex');
}

console.log('Contrapeso actualidad 2026: género, fuentes, límites, portada, ruta y noindex PASS');
