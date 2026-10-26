import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const path = '/venezuela-lab/explicadores/actas-28j-2024/';
const html = readFileSync(new URL('../public/venezuela-lab/explicadores/actas-28j-2024/index.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/explicadores/explicadores.css', import.meta.url), 'utf8');

assert.ok(prototypeOnlyRoutes.some((route) => route.id === 'contrapeso:explainer:actas-28j-2024' && route.path === path),
  'Explicador inventariado exclusivamente como prototipo');
assert.ok(!routeGroups.some((group) => Object.values(group.paths).includes(path)),
  'El explicador no entra en sitemap/hreflang');
assert.ok(hasNoindexMeta(html), 'Noindex explícito');
assert.match(html, /<html lang="es">/, 'Idioma español');
assert.match(html, /EXPLICADOR HISTÓRICO/, 'No se presenta como noticia reciente');
assert.match(html, /26 de octubre de 2026/, 'Fecha de revisión');
assert.match(html, /81,7 % de las mesas/, 'Cobertura medida en mesas, no en votos');
assert.match(html, /muestra aleatoria de 100 mesas/, 'Límite de verificación de transcripciones');
assert.match(html, /24\.533 actas.*24\.532/s, 'Transparencia sobre discrepancia interna del informe');
assert.match(html, /ciberataque/, 'Versión del CNE atribuida');
assert.match(html, /no es una segunda auditoría independiente/i, 'Límite de corroboración CIDH');
assert.ok(!/<script\b|<form\b/i.test(html), 'Sin JS ni captura de datos');
assert.ok(html.includes('href="../explicadores.css"') && css.includes('@media (width <= 540px)'),
  'Estilos responsive existentes');

const gonzalez = 7156462;
const maduro = 3241461;
const missingRegistered = 3576544;
const margin = gonzalez - maduro;
assert.equal(margin, 3915001, 'Diferencia calculada a partir de actas');
assert.equal(margin - missingRegistered, 338457, 'Cota conservadora de la ventaja');
for (const number of ['7.156.462', '3.241.461', '3.915.001', '3.576.544', '338.457']) {
  assert.ok(html.includes(number), `Falta cifra trazable: ${number}`);
}
for (const source of [
  'https://www.cartercenter.org/wp-content/uploads/2025/02/venezuela-final-report-2025.pdf',
  'https://www.cartercenter.org/news/venezuela-073024/',
  'https://scm.oas.org/pdfs/2025/CP50866e.pdf'
]) {
  assert.ok(html.includes(source), `Falta fuente documental: ${source}`);
}
assert.ok(museum.includes(`href="${path}"`), 'Expediente del Museo enlaza al explicador');
const grid = home.split('<div class="articles-grid" id="article-list">')[1]?.split('</div><p id="no-results"')[0];
assert.ok(grid, 'Portada conserva grilla');
assert.equal((grid.match(/class="story-card"/g) || []).length, 6, 'Se conservan seis tarjetas');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 4, 'Cuatro muestras claramente rotuladas');
assert.equal((grid.match(/data-category="Explicadores"/g) || []).length, 2, 'Dos explicadores reales en el filtro');
const realCard = grid.split('<article class="story-card" data-category="Explicadores" data-search="28j')[1]?.split('</article>')[0];
assert.ok(realCard && realCard.includes(`href="${path}"`), 'Enlace real desde tarjeta');
assert.ok(!realCard.includes('demo-tag') && !realCard.includes('data-article='), 'No es un modal demostrativo');
assert.ok(home.includes('2 EXPLICADORES DOCUMENTADOS · 4 MUESTRAS'), 'Recuento editorial visible');
assert.ok(home.includes('noindex,nofollow,noarchive'), 'Portada no indexable');

if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/explicadores/actas-28j-2024/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built), 'Build conserva noindex');
  assert.ok(built.includes('3.915.001') && built.includes('338.457'), 'Build contiene prueba aritmética');
}
console.log('Contrapeso 28J: fuentes, cota matemática, rutas, tarjetas, noindex y build PASS');
