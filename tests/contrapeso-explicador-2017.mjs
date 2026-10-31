import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const html = readFileSync(new URL('../public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/explicadores/explicadores.css', import.meta.url), 'utf8');
const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const frontpage = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const frontpageScript = readFileSync(new URL('../public/venezuela-lab/app.js', import.meta.url), 'utf8');

const editorialPath = '/venezuela-lab/explicadores/sentencias-155-156-2017/';
assert.ok(
  prototypeOnlyRoutes.some((route) => route.id === 'contrapeso:explainer:tsj-2017' && route.path === editorialPath),
  'Nueva página inscrita en inventario explícito de prototipos'
);
assert.ok(
  !routeGroups.some((group) => Object.values(group.paths).includes(editorialPath)),
  'Prototipo no debe estar en grupos SEO/sitemap indexables'
);
if (process.argv.includes('--built')) {
  const built = readFileSync(new URL('../dist/venezuela-lab/explicadores/sentencias-155-156-2017/index.html', import.meta.url), 'utf8');
  assert.ok(built.includes('noindex,nofollow,noarchive'), 'Build conserva noindex');
  assert.ok(built.includes('Sentencias 155 y 156'), 'La página se empaquetó correctamente');
  const built28j = readFileSync(new URL('../dist/venezuela-lab/explicadores/actas-28j-2024/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(built28j), 'El segundo explicador conserva noindex tras el build');
  assert.ok(built28j.includes('3.915.001') && built28j.includes('338.457'), 'El segundo explicador conserva la cuenta en el build');
}

assert.ok(hasNoindexMeta(html), 'La comprobación de producción acepta el noindex real del prototipo');
assert.ok(!hasNoindexMeta('<meta name="robots" content="index,follow">'), 'La comprobación rechaza páginas sin noindex');
assert.match(html, /<html lang="es">/, 'Idioma principal claro');
assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/, 'Mantener prototipo no indexable');
assert.match(html, /EXPLICADOR HISTÓRICO/, 'Género editorial diferenciado de noticia');
assert.match(html, /el TSJ se atribuyó funciones parlamentarias y luego retrocedió/, 'Titular directo y documental');
assert.ok(!/Conviene distinguir|Sería incorrecto|No es una inferencia basada únicamente/.test(html), 'Sin prosa defensiva redundante');
assert.ok(frontpage.includes('Sentencias 155 y 156: el TSJ se atribuyó funciones parlamentarias y luego retrocedió'), 'Portada alineada con titular documental');
assert.match(html, /28 de marzo de 2017/, 'Fecha 155');
assert.match(html, /29 de marzo/, 'Fecha 156');
assert.match(html, /1 de abril/, 'Fecha de rectificaciones');
assert.match(html, /en parte, sí/i, 'Reconocer las rectificaciones');
assert.match(html, /no respondieron durante nuestra consulta/, 'Distinguir originales inaccesibles de reproducciones');
assert.ok(!html.includes('Jamás entregarle al chavismo ni un milímetro'), 'La directriz interna no es eslogan público');
for (const url of [
  'https://www.oas.org/es/cidh/prensa/comunicados/2017/041.asp',
  'https://accesoalajusticia.org/tsj-anula-acuerdo-de-la-an-sobre-activacion-carta-democratica-interamericana-y-ordena-cambio-de-legislacion-en-materia-de-seguridad/',
  'https://accesoalajusticia.org/autorizacion-del-tsj-por-encima-de-la-an-al-ejecutivo-para-crear-empresas-mixtas/',
  'https://elpitazo.net/politica/tsj-se-retracta-echa-atras-decisiones-la-asamblea-nacional/'
]) {
  assert.ok(html.includes(url), `Falta fuente auditada: ${url}`);
}
assert.ok(museum.includes('/venezuela-lab/explicadores/sentencias-155-156-2017/'), 'Enlace de acceso desde el Museo');
assert.ok(css.includes('@media (width <= 540px)') && css.includes('@media (width <= 800px)'), 'Adaptación móvil y tableta');
assert.ok(!/<script\b/i.test(html), 'Sin nueva superficie de JS o cambios de CSP');
assert.ok(html.includes('href="../explicadores.css"'), 'Stylesheet local');
const articleGrid = frontpage.split('<div class="articles-grid" id="article-list">')[1]?.split('</div><p id="no-results"')[0];
assert.ok(articleGrid, 'La portada mantiene la grilla de publicaciones');
assert.equal((articleGrid.match(/class="story-card"/g) || []).length, 11, 'Se conservan once tarjetas y el layout');
assert.equal((articleGrid.match(/class="demo-tag"/g) || []).length, 1, 'Solo Opinión se identifica como muestra');
const realCard = articleGrid.split('<article class="story-card" data-category="Explicadores"')[1]?.split('</article>')[0];
assert.ok(realCard, 'Existe una tarjeta de explicador real con género identificable');
assert.ok(realCard.includes(`href="${editorialPath}"`), 'La tarjeta enlaza al explicador documentado');
assert.ok(!realCard.includes('data-article=') && !realCard.includes('demo-tag'), 'El artículo real no abre un modal demostrativo ni se etiqueta EJEMPLO');
assert.ok(frontpage.includes('data-filter="Explicadores"'), 'El filtro permite encontrar explicadores');
assert.ok(frontpage.includes(`${(articleGrid.match(/<article class="story-card"/g) || []).length - (articleGrid.match(/class="demo-tag"/g) || []).length} CONTENIDOS CON FUENTES · ${(articleGrid.match(/class="demo-tag"/g) || []).length} MUESTRA`), 'La portada diferencia contenido real de muestras');
assert.ok(frontpage.includes('noindex,nofollow,noarchive'), 'La portada sigue no indexable');
assert.ok(!frontpage.includes('TODOS LOS ARTÍCULOS SON DEMOSTRATIVOS'), 'No se atribuye carácter ficticio al artículo real');
assert.ok(!frontpageScript.includes("+' de ejemplo'"), 'El contador dinámico no llama ejemplos a los resultados reales');
console.log('Contrapeso explicador TSJ 2017 y portada mixta: contratos, rutas y estilos PASS');
