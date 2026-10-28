import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { CASES, SOURCES, CATEGORIES, EPISODES } from '../public/venezuela-lab/museo/victimas/data.js';

const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url),'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url),'utf8');
const index = readFileSync(new URL('../public/venezuela-lab/museo/victimas/index.html', import.meta.url),'utf8');
const profile = readFileSync(new URL('../public/venezuela-lab/museo/victimas/perfil.html', import.meta.url),'utf8');
const script = readFileSync(new URL('../public/venezuela-lab/museo/victimas/app.js', import.meta.url),'utf8');
const style = readFileSync(new URL('../public/venezuela-lab/museo/victimas/memorial.css', import.meta.url),'utf8');
const year1999 = readFileSync(new URL('../public/venezuela-lab/museo/victimas/1999/index.html', import.meta.url),'utf8');

assert.ok(CASES.length >= 230, 'La colección ampliada exige al menos 230 registros documentales');
assert.equal(CASES.filter(p=>p.episode==='2002-11A').length,19,'Las 19 víctimas nominales del 11A deben figurar');
assert.equal(CASES.filter(p=>p.episode==='1999').length,3,'Tres casos nominales de fallecimiento documentado en 1999');
assert.equal(CASES.find(p=>p.id==='jhon-alejandro-linares-pena')?.category,'policial','Jhon Linares no falleció durante una protesta');
assert.ok(index.includes('data-filter="policial"'),'Filtro específico de intervenciones policiales');
assert.equal(CASES.filter(p=>p.episode==='2009').length,7,'Siete fallecidos identificados por PROVEA en 2009');
assert.ok(CASES.some(p=>p.name==='Franklin José Brito Rodríguez' && p.sources.includes('CIDH_BRITO')),'Franklin Brito bajo custodia y con evaluación interamericana');
assert.equal(CASES.filter(p=>p.episode==='2019').length,38,'Los 38 nombres accesibles de la tabla de PROVEA deben figurar');
assert.equal(CASES.filter(p=>p.episode==='2024').length,25,'Relación de 25 víctimas de 2024');
assert.ok(CASES.filter(p=>p.episode==='2017-18').length>=95,'Ampliación de 2017-2018');
assert.ok(CASES.filter(p=>p.biography).length>=110,'Fichas externas con enlace directo cuando existen');
const ids = CASES.map(person => person.id);
assert.equal(new Set(ids).size,CASES.length,'Identificadores únicos');
assert.equal(new Set(CASES.map(person => person.name.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase())).size,CASES.length,'No duplicar nombres');
assert.ok(CASES.filter(person => person.category === 'custodia').length>=29,'Custodia ampliada mediante registro JEP 2026');
assert.equal(CASES.filter(person => person.category === 'operativo').length,7,'Siete personas de El Junquito según la CIDH');
assert.ok(CASES.filter(person => person.category === 'protesta').length >= 40,'Registros de manifestaciones');
assert.ok(CASES.some(person => person.name === 'Óscar Alberto Pérez' && person.biography),'Óscar Pérez y su biografía documentada');
assert.ok(CASES.some(person => person.name === 'Fernando Albán'),'Fernando Albán incluido');
assert.ok(CASES.some(person => person.name === 'Rafael Acosta Arévalo'),'Rafael Acosta Arévalo incluido');
assert.ok(CASES.some(person => person.name === 'Raúl Isaías Baduel'),'Raúl Isaías Baduel incluido');
for (const person of CASES) {
  assert.ok(person.id && person.name && Number.isInteger(person.year) && person.year >= 1999 && person.year <= 2026,'Metadatos completos y fecha válida');
  assert.ok(Object.hasOwn(CATEGORIES,person.category),`Categoría válida: ${person.name}`);
  assert.ok(person.note.length > 35,`Descripción con alcance: ${person.name}`);
  assert.ok(person.sources.length > 0,`Fuente: ${person.name}`);
  for(const key of person.sources)assert.ok(Object.hasOwn(SOURCES,key),`Fuente ${key} para ${person.name}`);
  if(person.biography)assert.ok(person.biography.startsWith('https://es.wikipedia.org/wiki/') || person.biography.startsWith('https://www.jepvenezuela.com/museo-de-la-memoria-y-la-represion/caidos/'),`Perfil externo de origen identificado: ${person.name}`);
  assert.ok(Object.hasOwn(EPISODES,person.episode),`Episodio válido: ${person.name}`);
}
for(const source of Object.values(SOURCES))assert.ok(source.url.startsWith('https://') && source.scope.length > 30,'Fuente con alcance explícito');
for(const text of [index,profile])assert.ok(text.includes('noindex,nofollow,noarchive'),'Memorial no indexable');
assert.ok(home.includes('href="/venezuela-lab/museo/victimas/"'),'Entrada desde portada');
assert.ok(museum.includes('href="/venezuela-lab/museo/victimas/"'),'Entrada desde museo');
assert.ok(index.includes('Los muertos del chavismo') && museum.includes('Los muertos'),'Nombre editorial');
assert.ok(index.includes('otros casos tienen denuncias') || index.includes('Otros casos tienen denuncias'), 'No igualar casos con atribuciones distintas');
assert.ok(index.includes('por sí sola no prueba homicidio'), 'No presumir homicidio a partir de custodia');
assert.ok(script.includes("new URLSearchParams") && script.includes("person.id"),'Perfiles individuales enlazables');
assert.ok(index.includes('id="search"') && index.includes('data-filter="custodia"') && index.includes('id="year"') && index.includes('id="episode"'),'Búsqueda y filtros');
assert.ok(index.includes('id="load-more"') && script.includes('limit+=24'),'Paginación de archivos');
assert.ok(index.includes('data-open-2002') && script.includes("episode.value='2002-11A'"),'Acceso rápido al 11 de abril');
assert.ok(style.includes('@media (width <= 600px)') && !style.includes('@import'),'Responsive y sin solicitudes externas de tipografías');
for (const oldId of ['expediente-2024','expediente-barbados','expediente-2017','expediente-represion-2017']) {
  assert.ok(museum.includes(`id="${oldId}"`),`Preservar expediente previo ${oldId}`);
}
console.log(`Contrapeso memorial: ${CASES.length} casos, ${CASES.filter(p=>p.biography).length} perfiles externos y filtros históricos PASS`);

// La línea editorial es una norma interna, no un lema del sitio.
for (const page of [home, museum, index, profile]) {
  assert.ok(!page.includes('Jamás entregarle al chavismo ni un milímetro'), 'El principio interno no debe publicarse como eslogan');
  assert.ok(!page.includes('Sin concesiones innecesarias.'), 'Eliminar meta-consignas de las páginas');
}
assert.ok(museum.includes('Una proclamación sin resultados por mesa no se puede auditar'), 'Argumentos verificables en vez de manifiestos');
assert.ok(home.includes('el CNE proclamó un ganador sin publicar resultados por mesa'), 'Portada basada en hechos');
assert.ok(index.includes('La CIDH calificó las siete muertes de El Junquito'), 'Atribuir expresamente conclusiones internacionales');

assert.ok(index.includes('href="/venezuela-lab/museo/victimas/1999/"'), 'Acceso editorial a 1999 desde el memorial');
for (const p of [
  'Ángel Luis Castillo Muñoz',
  'Oswaldo Blanco',
  'Jhon Alejandro Linares Peña'
]) {
  assert.ok(CASES.some(person=>person.name===p && person.year===1999),`Caso comprobado 1999 ausente: ${p}`);
  assert.ok(year1999.includes(p),`Ficha histórica 1999 debe mostrar: ${p}`);
}
for (const person of [
  'Óscar José Blanco Romero',
  'Roberto Javier Hernández Paz',
  'José Francisco Rivas Fernández'
]) {
  assert.ok(year1999.includes(person), `Desaparición de Vargas ausente: ${person}`);
  assert.ok(!CASES.some(p=>p.name===person), `No contabilizar desaparición no confirmada como muerte: ${person}`);
}
assert.ok(year1999.includes('No se contabilizan aquí como fallecimientos confirmados'),'Desaparición y fallecimiento separados');
assert.ok(year1999.includes('Caldera y Chávez'), 'No atribuir a una sola administración un período que abarca dos');
assert.ok(year1999.includes('no se transforman aquí en 78 asesinatos policiales'),'No convertir muertes carcelarias en asesinatos estatales');
assert.ok(year1999.includes('noindex,nofollow,noarchive'),'Conservar restricción de indexación');
assert.ok(Object.hasOwn(EPISODES,'1999'),'Filtro histórico 1999 presente');

const year2000 = readFileSync(new URL('../public/venezuela-lab/museo/victimas/2000/index.html', import.meta.url),'utf8');
const cases2000 = CASES.filter(p => p.year===2000);
assert.ok(cases2000.length >= 50, 'Conservar las 50 fichas nominales iniciales de 2000 sin bloquear ampliaciones');
// Conservar cada identificador del inventario auditado, sin impedir futuras incorporaciones.
const baselineIds = JSON.parse(readFileSync(new URL('./fixtures/contrapeso-baseline-ids.json', import.meta.url), 'utf8'));
assert.ok(baselineIds.length > 0, 'Inventario de referencia no vacío');
assert.equal(new Set(baselineIds).size, baselineIds.length, 'Inventario de referencia sin duplicados');
for (const id of baselineIds) {
  assert.ok(ids.includes(id), `Ficha histórica eliminada o identificador modificado sin revisión: ${id}`);
}
assert.ok(CASES.length >= baselineIds.length, 'No perder registros nominales de la línea base');
assert.ok(index.includes('href="/venezuela-lab/museo/victimas/2000/"'),'Acceso a la página anual de 2000');
assert.ok(Object.hasOwn(EPISODES,'2000'),'Filtro por episodio 2000');
for (const person of cases2000) {
  assert.ok(year2000.includes(person.name),`Ficha 2000 en página anual: ${person.name}`);
  assert.ok(year2000.includes(`perfil.html?id=${person.id}`),`Enlace individual: ${person.name}`);
  assert.ok(person.sources.includes('PRO2000'),'Anexo PROVEA referenciado en cada ficha del año 2000');
  assert.ok(['custodia','policial'].includes(person.category),'Categoría veraz del caso 2000');
}
for (const name of ['Jaime Hilarión Pálima Domínguez','Richard Lucambio','Guillerma Colmenares','Ronny José Tovar','Francisco José Mister','Luis Alberto Hernández']) {
  assert.ok(cases2000.some(p=>p.name===name),`Caso corroborado por segundo informe: ${name}`);
}
assert.ok(year2000.includes('no a todo el año calendario 2000'),'Desglose de ventanas temporales');
assert.ok(year2000.includes('edades de Ronny Tovar, Francisco Mister y Luis Hernández'),'Conflicto entre edades documentado');
assert.ok(year2000.includes('No se atribuye a todos los casos una motivación política'),'No inferir motivación común');
assert.ok(year2000.includes('noindex,nofollow,noarchive'),'Preservación de noindex');

const year2001 = readFileSync(new URL('../public/venezuela-lab/museo/victimas/2001/index.html', import.meta.url), 'utf8');
const cases2001 = CASES.filter(p => p.year === 2001);
assert.ok(cases2001.length >= 13, 'Conservar siete fichas iniciales y seis casos nominales de enero 2001');
assert.ok(index.includes('href="/venezuela-lab/museo/victimas/2001/"'), 'Navegación al capítulo 2001');
assert.ok(Object.hasOwn(EPISODES, '2001'), 'Episodio anual 2001 disponible en filtros');
assert.ok(year2001.includes('noindex,nofollow,noarchive'), 'No indexar el capítulo 2001');
assert.equal((year2001.match(/class="year-roster-item"/g) || []).length, cases2001.length, 'El registro HTML de 2001 coincide con el dataset');
for (const person of cases2001) {
  assert.ok(year2001.includes(person.name), `Nombre 2001 en página anual: ${person.name}`);
  assert.ok(year2001.includes(`perfil.html?id=${person.id}`), `Enlace individual 2001: ${person.name}`);
  assert.ok(person.sources.some(key => ['US2001','HRW2001','PRO2001'].includes(key)), `Fuente 2001 atribuida a: ${person.name}`);
}
for (const name of ['Jesús Alberto Febres', 'Luis Fernando Briceño', 'Ángel Ardilla', 'Ericson José Parra', 'Juan Pablo Arroyave']) {
  assert.ok(cases2001.some(p => p.name === name), `Caso nominal 2001 ausente: ${name}`);
}
const jose2001 = cases2001.find(p => p.name === 'José Ramón Rodríguez');
const belmiro2001 = cases2001.find(p => p.name === 'Belmiro Alexander Gutiérrez');
assert.ok(jose2001?.sources.includes('HRW2001') && jose2001?.sources.includes('PRO2001'), 'José Ramón con doble fuente');
assert.ok(belmiro2001?.sources.includes('HRW2001') && belmiro2001?.sources.includes('PRO2001'), 'Belmiro con doble fuente');
assert.equal(jose2001?.category, 'investigacion', 'No presumir autoría individual de José Ramón');
assert.equal(belmiro2001?.category, 'investigacion', 'No presumir autoría individual de Belmiro');
assert.ok(index.includes('data-filter="investigacion"'), 'Filtro para asesinatos sin autoría individual acreditada');
assert.equal(cases2001.find(p => p.name === 'José Ramón Rodríguez')?.date, '2001-05-15', 'Fecha cotejada en PROVEA');
assert.equal(cases2001.find(p => p.name === 'Belmiro Alexander Gutiérrez')?.date, '2001-05-19', 'Fecha y nombre completo cotejados en PROVEA');
assert.ok(cases2001.filter(p => p.sources.includes('PRO2001')).length >= 2, 'Doble fuente HRW/PROVEA');
assert.ok(cases2001.find(p => p.id === 'ericson-jose-parra')?.note.includes('Edixon Parra'), 'Registrar discrepancia nominal sin duplicar víctima');
assert.deepEqual(cases2001.find(p => p.id === 'ericson-jose-parra')?.sources, ['US2001', 'PRO2001'], 'La ficha de Parra enlaza ambos documentos que explican la discrepancia');
assert.ok(!cases2001.some(p => p.id === 'edixon-parra'), 'No duplicar identidad Parra pendiente de cotejo');
const early2001 = [
  ['juan-carlos-castillo-romero', '2001-01-02', 'investigacion'],
  ['jose-gregorio-pastrana', '2001-01-05', 'policial'],
  ['miguel-angel-matos-idrogo', '2001-01-05', 'policial'],
  ['annelk-luis-martinez-yaguaran', '2001-01-05', 'policial'],
  ['oswaldo-jose-herrera-gurgos', '2001-01-07', 'investigacion'],
  ['alexander-sandoval', '2001-01-09', 'policial']
];
for (const [id, date, category] of early2001) {
  const matches = cases2001.filter(person => person.id === id);
  assert.equal(matches.length, 1, `Una ficha para ${id}, sin duplicados`);
  assert.equal(matches[0].date, date, `Fecha del anexo PROVEA, p. 460: ${id}`);
  assert.equal(matches[0].category, category, `No confundir denuncia de grupo con autoría probada: ${id}`);
  assert.deepEqual(matches[0].sources, ['PRO2001'], `Fuente primaria inspeccionada: ${id}`);
  assert.ok(year2001.includes(`perfil.html?id=${id}`), `Perfil enlazado desde 2001: ${id}`);
}
assert.ok(year2001.includes('201 como ejecuciones'), '241 casos PROVEA incluyen 201 ejecuciones, no 241 ejecuciones');
assert.ok(!year2001.includes('241 ejecuciones extrajudiciales'), 'No inflar la categoría de ejecuciones');
assert.ok(SOURCES.PRO2001.title.includes('p. 485'), 'Fuente precisa del desglose de 241 casos');
assert.ok(SOURCES.PRO2001.url.includes('archivo.provea.org/wp-content/uploads/01_anexos0001.pdf'), 'Anexo PROVEA 2000-2001 accesible');
assert.ok(SOURCES.HRW2001.url.includes('hrw.org/legacy/spanish/inf_anual/2002/venezuela.html'), 'HRW 2002 sobre hechos de 2001');
assert.ok(SOURCES.US2001.url.includes('refworld.org/reference/annualreport/usdos/2002/31349'), 'Fuente archivada verificable de 2001');
assert.ok(year2001.includes('octubre de 2000–septiembre de 2001'), 'No convertir la cifra PROVEA 241 en total de año calendario');
assert.ok(year2001.includes('registro es parcial') || year2001.includes('registro es parcial'.replace('r','R')), 'Advertencia de no exhaustividad');
assert.ok(year2001.includes('href="/venezuela-lab/metodo/"'), 'Método editorial accesible desde 2001');
