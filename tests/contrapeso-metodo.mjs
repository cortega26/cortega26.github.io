import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const html = readFileSync(new URL('../public/venezuela-lab/metodo/index.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const explainer = readFileSync(new URL('../public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/explicadores/explicadores.css', import.meta.url), 'utf8');
const path = '/venezuela-lab/metodo/';
const charter = readFileSync(new URL('../docs/editorial/contrapeso-principios.md', import.meta.url), 'utf8');
const manual = readFileSync(new URL('../docs/editorial/contrapeso-manual.md', import.meta.url), 'utf8');
assert.match(charter, /Libertad individual/, 'Carta editorial incluye libertad individual');
assert.match(charter, /Propiedad privada/, 'Carta editorial incluye propiedad privada');
assert.match(charter, /Control del poder/, 'Carta editorial incluye límites institucionales al poder');
assert.match(manual, /Principios editoriales declarados/, 'Manual aplica la carta a las publicaciones');

assert.ok(prototypeOnlyRoutes.some((route) => route.id === 'contrapeso:method' && route.path === path),
  'La página metodológica está inventariada solo como prototipo');
assert.ok(!routeGroups.some((group) => Object.values(group.paths).includes(path)),
  'La política del prototipo no debe incluirse en sitemap/hreflang');
assert.ok(hasNoindexMeta(html), 'La página conserva meta robots noindex');
assert.match(html, /<html lang="es">/, 'Idioma identificado');
assert.match(html, /<main id="contenido"/, 'Destino de salto accesible');
assert.match(html, /M[eé]todo y rectificaciones/i, 'Género y propósito explícitos');
assert.match(html, /Hechos con pruebas\.\s*<em>Errores con rectificación visible\./,
  'El titular comunica el método con voz directa');
assert.match(html, /sin fingir equidistancia:[^<]+afirmamos lo que las pruebas sostienen/,
  'La bajada expone la postura editorial y el estándar probatorio sin defensividad');
assert.doesNotMatch(html, /Esto <strong>no significa que esté libre de errores<\/strong>|No se presenta un registro vacío como prueba de exactitud/,
  'El método evita descargos redundantes sin ocultar el estado real del registro');
assert.match(html, /meta name="robots" content="noindex,nofollow,noarchive"/,
  'La página conserva las tres directivas de robots');
assert.match(html, /28 de octubre de 2026/, 'Fecha de revisión visible');
assert.match(html, /id="orientacion"/, 'Principios accesibles desde el método público');
for (const principle of ['Libertad individual:', 'Propiedad privada:', 'Control del poder:']) {
  assert.ok(html.includes(principle), `Principio público explícito: ${principle}`);
}
assert.match(html, /no deciden los hechos por adelantado/, 'Los principios no sustituyen la verificación');
assert.doesNotMatch(html, /\blibertari[oa]s?\b/i, 'El prototipo no adopta la etiqueta doctrinaria');
assert.match(home, /Libertades y límites al poder/, 'Portada refleja el marco editorial sin etiqueta ideológica');
assert.match(home, /Libertad individual, propiedad privada y rendición de cuentas/, 'La síntesis pública declara principios');
assert.match(html, /Hecho documentado:/, 'Diferencia hechos');
assert.match(html, /Denuncia o testimonio:/, 'Diferencia alegaciones');
assert.match(html, /Opinión:/, 'Diferencia valoraciones');
assert.match(html, /contenido anterior, modificación y motivo/, 'Política de rectificación auditable');
assert.match(html, /no ofrece un historial público verificable/, 'No inventa registro de correcciones');
assert.match(html, /no dispone aquí de un formulario de denuncias/i, 'No anuncia recepción de datos inexistente');
assert.ok(!/<form\b|<script\b/i.test(html), 'Sin formulario ni JavaScript ni cambio CSP');
assert.ok(!/Jamás entregarle al chavismo ni un milímetro/.test(html), 'Sin consignas internas publicadas');
assert.ok(html.includes('href="../explicadores/explicadores.css"') && css.includes('@media (width <= 540px)'),
  'Reutiliza estilos existentes con adaptación móvil');
assert.ok(home.includes('href="/venezuela-lab/metodo/"'), 'La portada enlaza al método');
assert.ok(explainer.includes('href="/venezuela-lab/metodo/"'), 'La publicación real enlaza al método');
if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/metodo/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built), 'El build conserva la directiva noindex');
  assert.ok(built.includes('Rectificaciones y actualizaciones'), 'El build incluye la política pública');
  assert.ok(built.includes('Errores con rectificación visible.'), 'El build conserva el nuevo titular');
}
console.log('Contrapeso método y rectificaciones: rutas, transparencia, enlaces y noindex PASS');
