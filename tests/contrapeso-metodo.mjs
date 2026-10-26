import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../public/venezuela-lab/metodo/index.html');
const home = read('../public/venezuela-lab/index.html');
const explainer = read('../public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html');
const css = read('../public/venezuela-lab/explicadores/explicadores.css');
const path = '/venezuela-lab/metodo/';

assert.ok(prototypeOnlyRoutes.some((route) => route.id === 'contrapeso:method' && route.path === path),
  'La página metodológica está inventariada solo como prototipo');
assert.ok(!routeGroups.some((group) => Object.values(group.paths).includes(path)),
  'La política del prototipo no debe incluirse en sitemap/hreflang');
assert.ok(hasNoindexMeta(html), 'La página conserva meta robots noindex');
assert.match(html, /<html lang="es">/, 'Idioma identificado');
assert.match(html, /<main id="contenido"/, 'Destino de salto accesible');
assert.match(html, /M[eé]todo y rectificaciones/i, 'Género y propósito explícitos');
assert.match(html, /26 de octubre de 2026/, 'Fecha de revisión visible');
assert.match(html, /Hecho documentado:/, 'Diferencia hechos');
assert.match(html, /Denuncia o testimonio:/, 'Diferencia alegaciones');
assert.match(html, /Opinión:/, 'Diferencia valoraciones');
assert.match(html, /contenido anterior, modificación y motivo/, 'Política de rectificación auditable');
assert.match(html, /no ofrece un historial público verificable/, 'No inventa registro de correcciones');
assert.match(html, /no dispone aquí de un formulario de denuncias/, 'No anuncia recepción de datos inexistente');
assert.ok(!/<form\b|<script\b/i.test(html), 'Sin formulario ni JavaScript ni cambio CSP');
assert.ok(!/Jamás entregarle al chavismo ni un milímetro/.test(html), 'Sin consignas internas publicadas');
assert.ok(html.includes('href="../explicadores/explicadores.css"') && css.includes('@media (width <= 540px)'),
  'Reutiliza estilos existentes con adaptación móvil');
assert.ok(home.includes('href="/venezuela-lab/metodo/"'), 'La portada enlaza al método');
assert.ok(explainer.includes('href="/venezuela-lab/metodo/"'), 'La publicación real enlaza al método');
if (process.argv.includes('--built')) {
  const built = read('../dist/venezuela-lab/metodo/index.html');
  assert.ok(hasNoindexMeta(built), 'El build conserva la directiva noindex');
  assert.ok(built.includes('Rectificaciones y actualizaciones'), 'El build incluye la política pública');
}
console.log('Contrapeso método y rectificaciones: rutas, transparencia, enlaces y noindex PASS');
