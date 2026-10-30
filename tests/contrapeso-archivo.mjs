import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../public/venezuela-lab/app.js', import.meta.url));
assert.ok(home.includes('<span>Tooltician / laboratorio editorial</span>'), 'El banner informativo no debe aparentar un enlace inexistente');
assert.ok(home.includes('<span class="locale">EN ESPAÑOL</span>'), 'El idioma estático no debe aparentar un selector inexistente');
const appHash = createHash('sha1').update(`blob ${app.length}\0`).update(app).digest('hex').slice(0, 8);
assert.ok(home.includes(`src="./app.js?v=${appHash}"`), 'La portada debe invalidar caché cuando cambia el JS del filtro');
const memorial = readFileSync(new URL('../public/venezuela-lab/museo/victimas/index.html', import.meta.url), 'utf8');
const grid = home.split('<div class="articles-grid" id="article-list">')[1]?.split('</div><p id="no-results"')[0];
assert.ok(grid, 'La portada conserva la grilla de publicaciones');
const card = grid.split('<article class="story-card" data-category="Archivo"')[1]?.split('</article>')[0];
assert.ok(card, 'Existe una tarjeta de Archivo');
assert.ok(card.includes('Los muertos del chavismo: memorial documental'), 'Título preciso del destino');
assert.ok(card.includes('REGISTRO NOMINAL') && card.includes('EN CONSTRUCCIÓN'), 'El archivo se presenta como índice en desarrollo');
assert.ok(card.includes('no exhaustivo'), 'No promete exhaustividad');
assert.ok(card.includes('href="/venezuela-lab/museo/victimas/"'), 'La tarjeta conduce al memorial existente');
assert.ok(!card.includes('demo-tag') && !card.includes('data-article='), 'El enlace real no abre un modal de ejemplo');
assert.equal((grid.match(/class="story-card"/g) || []).length, 10, 'Diez tarjetas conservadas');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 1, 'Solo Opinión sigue como ejemplo');
assert.ok(home.includes('9 CONTENIDOS CON FUENTES · 1 MUESTRA'), 'Balance real sin llamar noticia al memorial');
assert.ok(home.includes('10 contenidos: 9 con fuentes y 1 muestra'), 'Recuento inicial consistente');
assert.ok(home.includes('data-filter="Archivo"'), 'Filtro Archivo disponible');
assert.ok(hasNoindexMeta(home) && hasNoindexMeta(memorial), 'Ambas páginas permanecen noindex');
assert.ok(memorial.includes('REGISTRO ABIERTO Y NO EXHAUSTIVO'), 'Destino confirma alcance limitado');
assert.ok(memorial.includes('por sí sola no prueba homicidio'), 'Destino distingue muerte en custodia de homicidio');
assert.ok(memorial.includes('id="nombres"') && memorial.includes('id="fuentes"'), 'Destino incluye índice y referencias');
if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/museo/victimas/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built) && built.includes('id="nombres"'), 'Build preserva memorial noindex');
}
console.log('Contrapeso Archivo: enlace a memorial, filtros, límites y noindex PASS');
