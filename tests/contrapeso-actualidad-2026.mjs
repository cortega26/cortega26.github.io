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
assert.ok((grid.match(/class="story-card"/g) || []).length >= 11, 'Conserva las tarjetas previas');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 1, 'Una muestra');
const card = grid.split('data-search="maria corina machado regresa venezuela octubre 2026')[1]?.split('</article>')[0];
assert.ok(card.includes(`href="${path}"`) && !card.includes('demo-tag') && !card.includes('data-article='), 'Noticia enlazada y no demostrativa');
assert.ok(home.includes(`${(grid.match(/<article class="story-card"/g) || []).length - (grid.match(/class="demo-tag"/g) || []).length} CONTENIDOS CON FUENTES · ${(grid.match(/class="demo-tag"/g) || []).length} MUESTRA`), 'Balance editorial actualizado');
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
assert.ok(marchCard?.includes(`href="${marchPath}"`) && !marchCard.includes('demo-tag'), 'Tarjeta de actualidad enlaza a noticia real');
assert.equal((grid.match(/data-category="Actualidad"/g) || []).length, prototypeOnlyRoutes.filter((r) => r.id.startsWith('contrapeso:news:')).length, 'Portada incluye todas las noticias del inventario');
if (process.argv.includes('--built')) {
  const builtMarch = readFileSync(new URL('../dist/venezuela-lab/actualidad/marcha-miraflores-28oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtMarch) && builtMarch.includes('Miraflores'), 'Build conserva noticia y noindex');
}

const assetsPath = '/venezuela-lab/actualidad/activos-estatales-29oct-2026/';
const assets = readFileSync(new URL('../public/venezuela-lab/actualidad/activos-estatales-29oct-2026/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.path === assetsPath), 'Nueva noticia en inventario de prototipo');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(assetsPath)), 'Nueva noticia excluida de sitemap');
assert.ok(hasNoindexMeta(assets) && assets.includes('noindex,nofollow,noarchive'), 'Robots completos');
assert.match(assets, /Hecho: 29 de octubre de 2026/, 'Fecha del hecho');
assert.match(assets, /Publicado: 29 de octubre de 2026/, 'Fecha de edición');
assert.match(assets, /Revisado: 29 de octubre de 2026/, 'Fecha de revisión');
assert.match(assets, /sin reporteo propio/, 'No inventar reporteo');
assert.match(assets, /Qué falta verificar/, 'Límites materiales');
assert.match(assets, /No se inspeccionó una transcripción oficial íntegra/, 'Fuente primaria no inspeccionada declarada');
assert.ok(assets.includes('https://www.reuters.com/world/americas/venezuela-offer-state-assets-private-sector-president-rodriguez-says-2026-10-29/'), 'Reuters');
assert.ok(assets.includes('https://elpais.com/america/2026-10-29/delcy-rodriguez-se-erige-como-unica-garante-de-un-cambio-democratico-en-venezuela-y-promete-elecciones-con-una-autoridad-renovada.html'), 'El País');
assert.ok(!/<script\b|<form\b/i.test(assets), 'Sin scripts ni formularios');
const assetsCard = grid.split('data-search="activos estatales delcy propiedad privada')[1]?.split('</article>')[0];
assert.ok(assetsCard?.includes(`href="${assetsPath}"`) && !assetsCard.includes('demo-tag'), 'Tarjeta real enlazada');
if (process.argv.includes('--built')) {
  const builtAssets = readFileSync(new URL('../dist/venezuela-lab/actualidad/activos-estatales-29oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtAssets), 'Build noindex');
}

const calendarPath = '/venezuela-lab/actualidad/calendario-electoral-29oct-2026/';
const calendar = readFileSync(new URL('../public/venezuela-lab/actualidad/calendario-electoral-29oct-2026/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.id === 'contrapeso:news:calendario-electoral-29oct-2026' && r.path === calendarPath), 'Calendario en inventario del prototipo');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(calendarPath)), 'Calendario fuera de sitemap');
assert.ok(hasNoindexMeta(calendar) && calendar.includes('noindex,nofollow,noarchive'), 'Robots de noticia electoral');
assert.match(calendar, /Hecho: 29 de octubre de 2026/, 'Fecha del hecho electoral');
assert.match(calendar, /Publicado: 30 de octubre de 2026/, 'Fecha de edición diferenciada');
assert.match(calendar, /Revisado: 30 de octubre de 2026/, 'Fecha de revisión');
assert.match(calendar, /sin reporteo propio/, 'No se inventa reporteo');
assert.match(calendar, /no hay confirmación independiente de un calendario formal/, 'Propuesta no es calendario oficial');
assert.match(calendar, /No se inspeccionaron los videos o transcripciones oficiales/, 'Límite de acceso original');
assert.match(calendar, /Qué falta verificar/, 'Límites editoriales');
assert.ok(calendar.includes('https://www.reuters.com/world/americas/us-has-proposed-venezuela-elections-2027-opposition-leader-says-2026-10-29/') && calendar.includes('https://apnews.com/article/venezuela-maria-corina-machado-elections-b2b023d18eadfa57e701bd554503017a') && calendar.includes('https://www.emol.com/noticias/Internacional/2026/10/29/1215549/delcy-rodriguez-elecciones-venezuela.html'), 'Fuentes independientes');
assert.ok(!/<script\b|<form\b/i.test(calendar), 'Sin scripts ni formularios');
const calendarCard = grid.split('data-search="machado rodriguez elecciones 2027 calendario')[1]?.split('</article>')[0];
assert.ok(calendarCard?.includes(`href="${calendarPath}"`) && !calendarCard.includes('demo-tag'), 'Tarjeta electoral real enlazada');
if (process.argv.includes('--built')) {
  const builtCalendar = readFileSync(new URL('../dist/venezuela-lab/actualidad/calendario-electoral-29oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtCalendar), 'Build de noticia electoral noindex');
}

console.log('Contrapeso actualidad 2026: género, fuentes, límites, portada, ruta y noindex PASS');

const oilPath = '/venezuela-lab/actualidad/petroleo-nabep-30oct-2026/';
const oil = readFileSync(new URL('../public/venezuela-lab/actualidad/petroleo-nabep-30oct-2026/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.id === 'contrapeso:news:petroleo-nabep-30oct-2026' && r.path === oilPath), 'Noticia petrolera inventariada');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(oilPath)), 'Noticia petrolera fuera de sitemap');
assert.ok(hasNoindexMeta(oil) && oil.includes('noindex,nofollow,noarchive'), 'Robots completos de petróleo');
assert.match(oil, /Hecho: investigación publicada el 30 de octubre de 2026/, 'Fecha de la investigación');
assert.match(oil, /Publicado: 30 de octubre de 2026/, 'Fecha editorial');
assert.match(oil, /Revisado: 30 de octubre de 2026/, 'Revisión fechada');
assert.match(oil, /sin reporteo propio/, 'No inventar reporteo');
assert.match(oil, /Qué falta verificar/, 'Límites explícitos');
assert.match(oil, /objetivo, no resultado/, 'Meta no confundida con producción');
assert.ok(oil.includes('https://www.reuters.com/legal/litigation/trump-touted-record-venezuela-oil-deal-now-reality-is-setting-2026-10-30/') && oil.includes('https://news.bloomberglaw.com/environment-and-energy/trumps-venezuela-oil-venture-eyes-150-output-hike-by-2028-1'), 'Fuentes fechadas y separadas');
assert.ok(!/<script\\b|<form\\b/i.test(oil), 'Sin JS ni captación');
const oilCard = grid.split('data-search="petroleo nabep venezuela 17 campos')[1]?.split('</article>')[0];
assert.ok(oilCard?.includes(`href="${oilPath}"`) && !oilCard.includes('demo-tag'), 'Tarjeta real enlazada');
if (process.argv.includes('--built')) {
  const builtOil = readFileSync(new URL('../dist/venezuela-lab/actualidad/petroleo-nabep-30oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtOil), 'Build petrolero conserva noindex');
}

const warrantsPath = '/venezuela-lab/actualidad/detenciones-orden-judicial-31oct-2026/';
const warrants = readFileSync(new URL('../public/venezuela-lab/actualidad/detenciones-orden-judicial-31oct-2026/index.html', import.meta.url), 'utf8');
assert.ok(prototypeOnlyRoutes.some((r) => r.id === 'contrapeso:news:detenciones-orden-judicial-31oct-2026' && r.path === warrantsPath), 'Noticia de detenciones inventariada');
assert.ok(!routeGroups.some((g) => Object.values(g.paths).includes(warrantsPath)), 'Noticia de detenciones fuera de sitemap');
assert.ok(hasNoindexMeta(warrants) && warrants.includes('noindex,nofollow,noarchive'), 'Robots completos en noticia de detenciones');
assert.match(warrants, /Hecho: alocución del 29 de octubre y respuesta del 30 de octubre de 2026/, 'Fechas de hechos diferenciadas');
assert.match(warrants, /Publicado: 31 de octubre de 2026/, 'Fecha editorial');
assert.match(warrants, /sin reporteo propio/, 'Procedencia explícita');
assert.match(warrants, /Qué falta verificar/, 'Límites de evidencia');
assert.ok(warrants.includes('https://efe.com/mundo/2026-10-29/venezuela-discurso-delcy-rodriguez-medidas-machado/') && warrants.includes('https://eldiario.com/2026/10/30/foropanal-represion-politica/') && warrants.includes('https://www.bcn.cl/procesoconstituyente/comparadordeconstituciones/constitucion/ven'), 'Fuente de anuncio, respuesta y norma');
assert.ok(!/<script\b|<form\b/i.test(warrants), 'Sin JS ni captación');
const warrantsCard = grid.split('data-search="orden judicial detenciones foro penal 30 octubre 2026')[1]?.split('</article>')[0];
assert.ok(warrantsCard?.includes(`href="${warrantsPath}"`) && !warrantsCard.includes('demo-tag'), 'Tarjeta real enlazada');
if (process.argv.includes('--built')) {
  const builtWarrants = readFileSync(new URL('../dist/venezuela-lab/actualidad/detenciones-orden-judicial-31oct-2026/index.html', import.meta.url), 'utf8');
  assert.ok(hasNoindexMeta(builtWarrants), 'Build conserva noindex de detenciones');
}

const featured = home.split('<section class="wrap feature-section"')[1]?.split('</section>')[0] ?? '';
assert.ok(featured.includes('href="/venezuela-lab/actualidad/tps-fallo-30oct-2026/"') && featured.includes('href="/venezuela-lab/explicadores/sentencias-155-156-2017/"'), 'Destacados conducen a dos publicaciones reales');
assert.ok(!featured.includes('demo-tag') && !featured.includes('data-article='), 'Destacados no ofrecen muestras ficticias');
assert.ok(home.includes('<a class="nav-cta" href="/venezuela-lab/metodo/">NUESTRO MÉTODO'), 'CTA principal lleva a una función disponible, no al boletín inactivo');
const newsCards = [...grid.matchAll(/<article class="story-card" data-category="Actualidad"[\s\S]*?<\/article>/g)].map((m) => m[0]);
const newsDates = newsCards.map((card) => Number(card.match(/<span>ACTUALIDAD · (\d+) OCT 2026<\/span>/)?.[1]));
assert.ok(newsDates.length >= 7 && newsDates.every(Number.isFinite) && newsDates.every((day, i) => i === 0 || newsDates[i - 1] >= day), 'Portada muestra Actualidad en orden cronológico descendente');
