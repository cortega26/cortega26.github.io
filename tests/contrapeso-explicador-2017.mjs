import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { prototypeOnlyRoutes, routeGroups } from '../src/data/routes.ts';
import { hasNoindexMeta } from '../scripts/check-production.mjs';

const html = readFileSync(new URL('../public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/explicadores/explicadores.css', import.meta.url), 'utf8');
const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');

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
}

assert.ok(hasNoindexMeta(html), 'La comprobación de producción acepta el noindex real del prototipo');
assert.ok(!hasNoindexMeta('<meta name="robots" content="index,follow">'), 'La comprobación rechaza páginas sin noindex');
assert.match(html, /<html lang="es">/, 'Idioma principal claro');
assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/, 'Mantener prototipo no indexable');
assert.match(html, /EXPLICADOR HISTÓRICO/, 'Género editorial diferenciado de noticia');
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
  assert.ok(html.includes(url), 'Falta fuente auditada: ' + url);
}
assert.ok(museum.includes('/venezuela-lab/explicadores/sentencias-155-156-2017/'), 'Enlace de acceso desde el Museo');
assert.ok(css.includes('@media (max-width: 540px)') && css.includes('@media (max-width: 800px)'), 'Adaptación móvil y tableta');
assert.ok(!/<script\b/i.test(html), 'Sin nueva superficie de JS o cambios de CSP');
assert.ok(html.includes('href="../explicadores.css"'), 'Stylesheet local');
console.log('Contrapeso explicador TSJ 2017: contrato editorial, rutas y estilos PASS');
