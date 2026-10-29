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
assert.ok(cases2001.length >= 16, 'Conservar trece fichas previas y tres casos nominales de enero 2001');
assert.ok(index.includes('href="/venezuela-lab/museo/victimas/2001/"'), 'Navegación al capítulo 2001');
assert.ok(Object.hasOwn(EPISODES, '2001'), 'Episodio anual 2001 disponible en filtros');
assert.ok(year2001.includes('noindex,nofollow,noarchive'), 'No indexar el capítulo 2001');
assert.equal((year2001.match(/class="year-roster-item"/g) || []).length, cases2001.length, 'El registro HTML de 2001 coincide con el dataset');
for (const person of cases2001) {
  assert.ok(year2001.includes(person.name), `Nombre 2001 en página anual: ${person.name}`);
  assert.ok(year2001.includes(`perfil.html?id=${person.id}`), `Enlace individual 2001: ${person.name}`);
  assert.ok(person.sources.some(key => ['US2001','HRW2001','PRO2001'].includes(key)), `Fuente 2001 atribuida a: ${person.name}`);
}
for (const name of ['Jesús Alberto Febres', 'Luis Fernando Briceño', 'Ángel Alberto Ardila', 'Ericson José Parra', 'Juan Pablo Arroyave']) {
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
// Cuarta unidad documental: anexo PROVEA p. 461, registros 69–73.
const febres2001 = cases2001.find(p => p.id === 'jesus-alberto-febres');
assert.equal(febres2001?.date, '2001-01-31', 'Fecha de muerte de Febres, distinta del incidente del 10 de enero');
assert.deepEqual(febres2001?.sources, ['US2001', 'PRO2001'], 'Doble fuente para Febres Narváez');
assert.ok(febres2001?.note.includes('Febres Narváez'), 'Variante nominal documentada por PROVEA');
for (const [id, date, category] of [
  ['jose-gregorio-castillo-2001', '2001-01-10', 'policial'],
  ['luis-enrique-gonzalez-2001', '2001-01-10', 'policial'],
  ['pablo-jose-marcano-franco', '2001-01-11', 'investigacion']
]) {
  const matches = cases2001.filter(p => p.id === id);
  assert.equal(matches.length, 1, `Una ficha sin duplicados para ${id}`);
  assert.equal(matches[0].date, date, `Fecha PROVEA p. 461 para ${id}`);
  assert.equal(matches[0].category, category, `Atribución PROVEA p. 461 para ${id}`);
  assert.deepEqual(matches[0].sources, ['PRO2001'], `Fuente inspeccionada para ${id}`);
  assert.ok(year2001.includes(`perfil.html?id=${id}`), `Enlace a ficha de ${id}`);
}
assert.ok(year2001.includes('Jorge Luis Aponte') && year2001.includes('corroboración causal'), 'El registro 70 no se contabiliza sin corroborar el nexo causal');
assert.ok(SOURCES.PRO2001.title.includes('460–476'), 'Cita PROVEA vigente tras decimosexta unidad');
assert.ok(year2001.includes('201 como ejecuciones'), '241 casos PROVEA incluyen 201 ejecuciones, no 241 ejecuciones');
assert.ok(!year2001.includes('241 ejecuciones extrajudiciales'), 'No inflar la categoría de ejecuciones');
assert.ok(SOURCES.PRO2001.title.includes('p. 485'), 'Fuente precisa del desglose de 241 casos');
assert.ok(SOURCES.PRO2001.url.includes('archivo.provea.org/wp-content/uploads/01_anexos0001.pdf'), 'Anexo PROVEA 2000-2001 accesible');
assert.ok(SOURCES.HRW2001.url.includes('hrw.org/legacy/spanish/inf_anual/2002/venezuela.html'), 'HRW 2002 sobre hechos de 2001');
assert.ok(SOURCES.US2001.url.includes('refworld.org/reference/annualreport/usdos/2002/31349'), 'Fuente archivada verificable de 2001');
assert.ok(year2001.includes('octubre de 2000–septiembre de 2001'), 'No convertir la cifra PROVEA 241 en total de año calendario');
assert.ok(year2001.includes('registro es parcial') || year2001.includes('registro es parcial'.replace('r','R')), 'Advertencia de no exhaustividad');
assert.ok(year2001.includes('href="/venezuela-lab/metodo/"'), 'Método editorial accesible desde 2001');


// Quinta unidad documental: PROVEA, p. 462, registros 74–83 (18 de enero de 2001).
const fifthBatch2001 = [["edward-jose-morales","Edward José Morales","2001-01-11","policial"],["julio-hurtado-2001","Julio Hurtado","2001-01-11","policial"],["roger-eduardo-castillo-castillo","Roger Eduardo Castillo Castillo","2001-01-14","policial"],["jeimon-rodriguez-2001","Jeimon Rodríguez","2001-01-14","policial"],["jhonny-m-meneses","Jhonny M. Meneses","2001-01-14","policial"],["darwin-maita","Darwin Maita","2001-01-14","policial"],["hector-jose-bolivar-2001","Héctor José Bolívar","2001-01-15","policial"],["raul-alberto-villegas","Raúl Alberto Villegas","2001-01-16","investigacion"],["luis-alfredo-carrera-yeguez","Luis Alfredo Carrera Yéguez","2001-01-17","policial"],["danilo-enrique-martinez-carrillo","Danilo Enrique Martínez Carrillo","2001-01-18","policial"]];
assert.ok(cases2001.length >= 26, 'No perder las 26 fichas documentadas hasta PROVEA n.º 83');
for (const [id, name, date, category] of fifthBatch2001) {
  const matches = cases2001.filter(person => person.id === id);
  assert.equal(matches.length, 1, `Ficha única PROVEA p. 462: ${id}`);
  assert.equal(matches[0].name, name, `Nombre cotejado PROVEA p. 462: ${id}`);
  assert.equal(matches[0].date, date, `Fecha PROVEA p. 462: ${id}`);
  assert.equal(matches[0].category, category, `Atribución categórica: ${id}`);
  assert.deepEqual(matches[0].sources, ['PRO2001'], `Documento nominal enlazado: ${id}`);
  assert.ok(year2001.includes(`perfil.html?id=${id}`), `Enlace nominal visible: ${id}`);
}
for (const id of ['julio-hurtado-2001', 'hector-jose-bolivar-2001']) {
  assert.ok(cases2001.find(p => p.id === id)?.note.includes('sin circunstancias') || cases2001.find(p => p.id === id)?.note.includes('sin relato individual'), `No inventar hechos en registro colectivo: ${id}`);
}
assert.ok(SOURCES.PRO2001.title.includes('460–476'), 'Cobertura acumulada PROVEA hasta p. 472');
assert.ok(year2001.includes('Los registros 62–'), 'Cobertura del anexo p. 462 explicitada');

// Sexta unidad: PROVEA p. 463, registros 84–91 (20–25 de enero de 2001).
const sixthBatch2001 = [["eduardo-jesus-marchan","Eduardo Jesús Marchán","2001-01-20","policial"],["pedro-antonio-anzola","Pedro Antonio Anzola","2001-01-20","policial"],["juan-quintero-2001","Juan Quintero","2001-01-20","policial"],["luis-marin-2001","Luis Marín","2001-01-20","policial"],["reuca-jose-mijares-e","Reuca José Mijares E.","2001-01-21","custodia"],["darwin-edison-rodriguez-cedeno","Darwin Edison Rodríguez Cedeño","2001-01-23","policial"],["manuel-guevara-pino","Manuel Guevara Pino","2001-01-24","policial"],["juan-carlos-garcia-mejias","Jean Carlos García Mejías","2001-01-25","policial"]];
assert.equal(sixthBatch2001.length, 8, 'Ocho registros nominales nuevos en PROVEA p. 463');
assert.ok(cases2001.length >= 34, 'Conservar 34 fichas documentadas hasta el registro 91');
for (const [id, name, date, category] of sixthBatch2001) {
  const matches = cases2001.filter(person => person.id === id);
  assert.equal(matches.length, 1, `Una ficha para PROVEA p. 463: ${id}`);
  assert.equal(matches[0].name, name, `Nombre cotejado con PROVEA p. 463: ${id}`);
  assert.equal(matches[0].date, date, `Fecha de PROVEA p. 463: ${id}`);
  assert.equal(matches[0].category, category, `Categoría con cautela probatoria: ${id}`);
  assert.deepEqual(matches[0].sources, ['PRO2001'], `Fuente documental p. 463: ${id}`);
  assert.ok(year2001.includes(`perfil.html?id=${id}`), `Perfil anual enlazado: ${id}`);
}
assert.ok(cases2001.find(p => p.id === 'reuca-jose-mijares-e')?.note.includes('literalmente «MIJARES E. Reuca José»'), 'No resolver por conjetura la grafía ni inicial de Mijares');
assert.equal(cases2001.find(p => p.id === 'reuca-jose-mijares-e')?.category, 'custodia', 'Muerte en prisión bajo custodia');
assert.ok(year2001.includes('Los registros 62–') && SOURCES.PRO2001.title.includes('460–'), 'Cobertura del sexto lote explícita');
assert.ok(year2001.includes('El registro es parcial') || year2001.includes('El registro es parcial'.toLowerCase()), 'Sin declarar exhaustividad anual');

// Séptima unidad: PROVEA p. 464, registros 92–99 (25–31 de enero de 2001).
const seventhBatch2001 = [["elvis-torres","Elvis Torres","2001-01-25","policial"],["argenis-ramon-sanchez","Argenis Ramón Sánchez","2001-01-25","policial"],["david-enrique-merga","David Enrique Merga","2001-01-25","policial"],["sergio-antonio-aristiguetas","Sergio Antonio Aristiguetas","2001-01-26","policial"],["jose-gregorio-rangel-lopez","José Gregorio Rangel López","2001-01-30","policial"],["luis-miguel-castaneda-angulo","Luis Miguel Castañeda Angulo","2001-01-31","investigacion"],["oscar-ramon-rodriguez-2001","Oscar Ramón Rodríguez","2001-01-31","investigacion"],["wilfredo-velasquez-soler","Wilfredo Velásquez Soler","2001-01-31","policial"]];
assert.equal(seventhBatch2001.length,8,'Ocho casos de PROVEA p. 464');
assert.ok(cases2001.length>=48,'Conservar al menos 42 fichas de 2001, no balance anual');
assert.ok(CASES.length>=349,'Conservar el dataset completo en futuras unidades');
for (const [id,name,date,category] of seventhBatch2001) {
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`Ficha única: ${id}`);
 assert.equal(matches[0].name,name,`Nombre: ${id}`);
 assert.equal(matches[0].date,date,`Fecha: ${id}`);
 assert.equal(matches[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(matches[0].sources,['PRO2001'],`Fuente: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace: ${id}`);
}
for (const id of ['argenis-ramon-sanchez','david-enrique-merga']) {
 const p=cases2001.find(x=>x.id===id);
 assert.ok(p.note.includes('denuncia') && p.note.includes('sentencia'),`Denuncia sin sentencia: ${id}`);
}
for (const id of ['luis-miguel-castaneda-angulo','oscar-ramon-rodriguez-2001'])
 assert.equal(cases2001.find(p=>p.id===id)?.category,'investigacion','Sin autoría judicial del Grupo Exterminio');
assert.ok(year2001.includes('Los registros 62–') && SOURCES.PRO2001.title.includes('460–'),'Cobertura del lote');
assert.ok(year2001.includes('No es un balance anual exhaustivo'),'No declarar exhaustividad');

// Octava unidad: PROVEA p. 465, registros 100–106. Ardila ya estaba documentado.
const eighthBatch2001 = [["yohanny-roseliano-rodriguez-pina","Yohanny Roseliano Rodríguez Piña","2001-02-02","policial"],["juan-francisco-maestracci","Juan Francisco Maestracci","2001-02-04","policial"],["jean-pier-marshal","Jean Pier Marshal","2001-02-04","policial"],["jesus-alberto-galindez","Jesús Alberto Galíndez","2001-02-05","investigacion"],["pedro-eduardo-santil","Pedro Eduardo Santil","2001-02-07","policial"],["ramon-antonio-granado","Ramón Antonio Granado","2001-02-07","policial"]];
assert.equal(eighthBatch2001.length,6,'Seis nuevas personas, no siete: registro 100 es la misma víctima que Ardilla');
assert.ok(cases2001.length>=48,'Conservar 48 fichas del octavo lote');
assert.ok(CASES.length>=349,'Conservar 349 fichas del octavo lote');
for (const [id,name,date,category] of eighthBatch2001) {
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`Ficha única PROVEA p. 465: ${id}`);
 assert.equal(found[0].name,name,`Nombre PROVEA: ${id}`);
 assert.equal(found[0].date,date,`Fecha PROVEA: ${id}`);
 assert.equal(found[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace estable: ${id}`);
}
const ardila=cases2001.find(p=>p.id==='angel-ardilla');
assert.equal(ardila?.name,'Ángel Alberto Ardila','Identidad del registro 100 corregida según PROVEA');
assert.deepEqual(ardila?.sources,['US2001','PRO2001'],'Ambos documentos, una persona');
assert.ok(ardila.note.includes('Angel Ardilla') && ardila.note.includes('n.º 100'),'Registrar variante y deduplicación');
assert.ok(!cases2001.some(p=>p.id==='angel-alberto-ardila'),'No crear segunda ficha de Ardila');
const jean=cases2001.find(p=>p.id==='juan-carlos-garcia-mejias');
assert.equal(jean?.name,'Jean Carlos García Mejías','Corregir el registro 91 según imagen primaria');
assert.ok(jean.note.includes('Juan Carlos') && year2001.includes('Jean Carlos García Mejías'),'Trazabilidad de corrección y enlace estable');
for (const id of ['pedro-eduardo-santil','ramon-antonio-granado']) {
 const note=cases2001.find(p=>p.id===id)?.note||'';
 assert.ok(note.includes('sin relato individual') && note.includes('Humanas Dignitas'),'No convertir denuncias genéricas en sentencias');
}
assert.ok(year2001.includes('Los registros 62–') && SOURCES.PRO2001.title.includes('460–'),'Cobertura exacta del anexo');
assert.ok(year2001.includes('No es un balance anual exhaustivo'),'Sin declarar cierre del año');

// Novena unidad: PROVEA p. 466, registros 107–116 (febrero 2001).
const ninthBatch2001 = [
  ["argenis-gonzalez-2001","Argenis González","2001-02-09","policial"],
  ["jose-raul-cumare-jimenez","José Raúl Cumare Jiménez","2001-02-09","investigacion"],
  ["williams-gonzalez-2001","Williams González","2001-02-10","policial"],
  ["dairilis-yulibet-sanchez-perez","Dairilis Yulibet Sánchez Pérez","2001-02-14","investigacion"],
  ["jose-david-gallardo-gomez","José David Gallardo Gómez","2001-02-14","investigacion"],
  ["jose-alberto-figueroa-2001","José Alberto Figueroa","2001-02-16","policial"],
  ["edison-alvarez-2001","Edison Álvarez","2001-02-17","policial"],
  ["carlos-a-villanueva","Carlos A. Villanueva","2001-02-17","investigacion"],
  ["pedro-antonio-belisario","Pedro Antonio Belisario","2001-02-17","policial"],
  ["joel-carlitos-alay-perez","Joel Carlitos Alay Pérez","2001-02-18","policial"],
];
assert.equal(ninthBatch2001.length,10,'Diez registros individuales nuevos');
assert.ok(cases2001.length>=58,'Preservar las 58 fichas del noveno lote');
assert.ok(CASES.length>=359,'Preservar las 359 fichas del noveno lote');
for(const [id,name,date,category] of ninthBatch2001) {
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`Ficha única: ${id}`);
 assert.equal(found[0].name,name,`Nombre PROVEA: ${id}`);
 assert.equal(found[0].date,date,`Fecha PROVEA: ${id}`);
 assert.equal(found[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace nominal: ${id}`);
}
for(const id of ['williams-gonzalez-2001','pedro-antonio-belisario'])
 assert.ok(cases2001.find(p=>p.id===id)?.note.includes('sin relato individual'),`Denuncia sin relato: ${id}`);
assert.ok(cases2001.find(p=>p.id==='edison-alvarez-2001')?.note.includes('asterisco pendiente de cotejo'),'Incertidumbre de fecha');
assert.ok(cases2001.find(p=>p.id==='carlos-a-villanueva')?.note.includes('no se expande'),'No inventar segundo nombre');
assert.ok(year2001.includes('Los registros 62–') && SOURCES.PRO2001.title.includes('460–'),'Cobertura actualizada');
assert.ok(year2001.includes('No es un balance anual exhaustivo'),'2001 sigue abierto');


// Décima unidad: PROVEA p. 467, registros 117–121. Fecha y grafía pendientes explícitos.
const tenthBatch2001 = [["amable-jerry-useche","Amable Jerry Useche","2001-02-18","policial"],["wuilkenfer-antonio-gutierrez-lunar","Wuilkenfer Antonio Gutiérrez Lunar","2001-02-25","policial"],["franklin-manuel-alejos-rondon","Franklin Manuel Alejos Rondón","2001-02-27","investigacion"],["miguel-antonio-torres-2001","Miguel Antonio Torres","2001-02-28","investigacion"],["hector-cabrera-2001","Héctor Cabrera","2001-02-03","policial"]];
assert.equal(tenthBatch2001.length,5,'Cinco registros nominales en PROVEA p. 467');
assert.ok(cases2001.length>=63,'Preservar las 63 fichas del décimo lote, registro parcial');
assert.ok(CASES.length>=364,'Preservar las 364 fichas del décimo lote');
for (const [id,name,date,category] of tenthBatch2001) {
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`Ficha única: ${id}`);
 assert.equal(found[0].name,name,`Nombre PROVEA: ${id}`);
 assert.equal(found[0].date,date,`Fecha fuente: ${id}`);
 assert.equal(found[0].category,category,`Categoría sin sentencia presunta: ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente nominal: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual: ${id}`);
}
assert.ok(cases2001.find(p=>p.id==='hector-cabrera-2001')?.note.includes('03.02.01*'),'No ocultar fecha con asterisco');
assert.ok(cases2001.find(p=>p.id==='wuilkenfer-antonio-gutierrez-lunar')?.note.includes('grafía Wuilkenfer'),'Corroboración nominal pendiente');
assert.ok(year2001.includes('Los registros 62–') && SOURCES.PRO2001.title.includes('460–'),'Cobertura del anexo actualizada');
assert.ok(year2001.includes('No es un balance anual exhaustivo'),'Sin cierre falso del año');

// Undécima unidad: PROVEA p. 468, registros 122–124, tres víctimas del mismo episodio.
const eleventhBatch2001 = [["yavidilex-placencio-borges","Yavidilex Placencio Borges","2001-03-01","policial"],["wilmer-villarroel-2001","Wilmer Villarroel","2001-03-01","policial"],["rafael-leonardo-moreno","Rafael Leonardo Moreno","2001-03-01","policial"]];
assert.ok(cases2001.length>=66,'Preservar 66 fichas de 2001 tras el undécimo lote');
assert.ok(CASES.length>=367,'Preservar 367 fichas totales');
for(const [id,name,date,category] of eleventhBatch2001) {
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`Ficha única PROVEA p. 468: ${id}`);
 assert.equal(matches[0].name,name,`Identidad PROVEA: ${id}`);
 assert.equal(matches[0].date,date,`Fecha: ${id}`);
 assert.equal(matches[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(matches[0].sources,['PRO2001','COF2001'],`Fuentes reconciliadas: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Perfil enlazado: ${id}`);
}
assert.ok(cases2001.find(p=>p.id==='rafael-leonardo-moreno')?.note.includes('denuncia'), 'No presentar ejecución denunciada como sentencia');
assert.ok(year2001.includes('versión oficial sostuvo enfrentamiento'), 'Versión oficial registrada con atribución');
assert.ok(year2001.includes('No es un balance anual exhaustivo'), '2001 no cerrado');

// Duodécima unidad: PROVEA p. 468, registros 125–131; seis atribuciones documentales y una denuncia policial.
const twelfthBatch2001 = [["ismael-g-rodriguez-t","Ismael G. Rodríguez T.","2001-03-01","investigacion"],["miguel-angel-castillo-2001","Miguel Ángel Castillo","2001-03-02","investigacion"],["daniel-evaristo-penuela-pina","Daniel Evaristo Peñuela Piña","2001-03-03","investigacion"],["luis-o-zabaleta-f","Luis O. Zabaleta F.","2001-03-03","investigacion"],["melkis-emilio-silva-sanchez","Melkis Emilio Silva Sánchez","2001-03-03","investigacion"],["juan-carlos-colmenares-2001","Juan Carlos Colmenares","2001-03-06","investigacion"],["juan-ramon-hernandez-guindano","Juan Ramón Hernández Guindano","2001-03-08","policial"]];
assert.equal(twelfthBatch2001.length,7,'Siete registros nominales PROVEA p. 468');
assert.ok(cases2001.length>=73,'Preservar al menos 73 fichas nominales de 2001; año abierto');
assert.ok(CASES.length>=374,'Preservar al menos 374 fichas totales tras el duodécimo lote');
for(const [id,name,date,category] of twelfthBatch2001) {
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`Ficha única: ${id}`);
 assert.equal(matches[0].name,name,`Nombre exacto PROVEA: ${id}`);
 assert.equal(matches[0].date,date,`Fecha del anexo: ${id}`);
 assert.equal(matches[0].category,category,`Categoría documental: ${id}`);
 assert.deepEqual(matches[0].sources,['PRO2001'],`Fuente primaria: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual: ${id}`);
 assert.ok(matches[0].note.includes('p. 468') && matches[0].note.includes('n.º'),`Registro nominal: ${id}`);
}
for(const [id] of twelfthBatch2001.slice(0,6)) {
 const p=cases2001.find(x=>x.id===id);
 assert.ok(p.note.includes('Grupo Exterminio') && p.note.includes('sentencia'),`Atribución documental, no condena: ${id}`);
}
const extortion2001=cases2001.find(x=>x.id==='juan-ramon-hernandez-guindano');
assert.ok(extortion2001.note.includes('versión oficial') && extortion2001.note.includes('alegaciones') && extortion2001.note.includes('sentencia'),'No elevar denuncia a sentencia en registro 131');
assert.ok(extortion2001.note.includes('Hernández recibió Bs. 5.000 de un funcionario') && !extortion2001.note.includes('entregó Bs. 5.000 a un funcionario'),'La víctima recibió dinero del funcionario, no al revés');
assert.ok(year2001.includes('un funcionario entregó Bs. 5.000 a Hernández'),'La página anual preserva el sentido de la transacción');
assert.ok(cases2001.find(x=>x.id==='ismael-g-rodriguez-t').name.includes('G.') && cases2001.find(x=>x.id==='luis-o-zabaleta-f').name.includes('F.'),'No expandir iniciales sin fuente');
const sourceRangeUpper2001 = Number(year2001.match(/Los registros 62–(\d+)/)?.[1] ?? 0);
assert.ok(sourceRangeUpper2001>=131 && SOURCES.PRO2001.scope.includes(`n.os 62–${sourceRangeUpper2001}`),'Cobertura nominal desde 62 hasta al menos 131, consistente con fuente');
assert.ok(year2001.includes('No es un balance anual exhaustivo') && year2001.includes('noindex,nofollow,noarchive'),'Año abierto y no indexable');

// Decimotercera unidad: PROVEA p. 469, registros 132–136 (15–18 de marzo de 2001).
const thirteenthBatch2001=[["jose-luis-cabrera-gonzalez","José Luis Cabrera González","2001-03-15","investigacion"],["carlos-jesus-riera-perozo","Carlos Jesús Riera Perozo","2001-03-15","investigacion"],["wilmar-avileny-veliz-pina","Wilmar Avileny Véliz Piña","2001-03-16","policial"],["jose-gregorio-subero","José Gregorio Subero","2001-03-17","policial"],["alexis-mujica","Alexis Mujica","2001-03-18","policial"]];
assert.equal(thirteenthBatch2001.length,5,'Cinco registros nominales de PROVEA p. 469');
assert.ok(cases2001.length>=78 && CASES.length>=379,'Conservar 78 fichas de 2001 y 379 totales');
for(const [id,name,date,category] of thirteenthBatch2001){
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`Identificador único p. 469: ${id}`);
 assert.equal(matches[0].name,name,`Nombre cotejado p. 469: ${id}`);
 assert.equal(matches[0].date,date,`Fecha cotejada p. 469: ${id}`);
 assert.equal(matches[0].category,category,`Categoría documental p. 469: ${id}`);
 assert.deepEqual(matches[0].sources,['PRO2001'],`Fuente única p. 469: ${id}`);
 assert.ok(matches[0].note.includes('p. 469') && matches[0].note.includes('n.º'),`Localizador nominal p. 469: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Perfil anual p. 469: ${id}`);
}
assert.ok(cases2001.find(p=>p.id==='wilmar-avileny-veliz-pina').note.includes('Su madre denunció'),'No afirmar como probado el supuesto cobro en registro 134');
assert.ok(cases2001.find(p=>p.id==='jose-gregorio-subero').note.includes('versión oficial sostuvo un enfrentamiento'),'Registrar versión oficial n.º 135');
const mujica2001=cases2001.find(p=>p.id==='alexis-mujica');
assert.ok(mujica2001.note.includes('versión oficial sostuvo que Mujica se suicidó') && mujica2001.note.includes('no de peritajes inspeccionados'),'No sustituir suicidio oficial por enfrentamiento ni afirmar peritaje');
assert.ok(SOURCES.PRO2001.title.includes('460–476') && SOURCES.PRO2001.scope.includes('n.os 62–194'),'Alcance fuente actualizado hasta 164');
assert.ok(year2001.includes('Los registros 62–194') && year2001.includes('No es un balance anual exhaustivo'),'Cobertura parcial declarada');

// Decimocuarta unidad: PROVEA p. 470, registros 137–143.
const fourteenthBatch2001=[["jose-martin-rodriguez-2001","José Martín Rodríguez","2001-03-18","policial"],["nino-antonio-gonzalez","Nino Antonio González","2001-03-20","investigacion"],["jose-gregorio-colmenarez","José Gregorio Colmenárez","2001-03-20","investigacion"],["regulo-bello","Régulo Bello","2001-03-24","policial"],["jesus-barroso","Jesús Barroso","2001-03-24","policial"],["ali-gonzalez-2001","Alí González","2001-03-24","policial"],["rafael-simon-colmenares","Rafael Simón Colmenares","2001-03-25","investigacion"]];
assert.ok(cases2001.length>=85,'Conservar las 85 fichas previas de 2001, registro parcial');
assert.ok(CASES.length>=386,'Conservar las 386 fichas previas');
for(const [id,name,date,category] of fourteenthBatch2001){
 const m=cases2001.filter(x=>x.id===id);
 assert.equal(m.length,1,`ID único: ${id}`);
 assert.equal(m[0].name,name,`Nombre: ${id}`);
 assert.equal(m[0].date,date,`Fecha: ${id}`);
 assert.equal(m[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(m[0].sources,['PRO2001'],`Fuente: ${id}`);
 assert.ok(m[0].note.includes('p. 470')&&m[0].note.includes('n.º'),`Localizador: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace: ${id}`);
}
assert.ok(cases2001.find(x=>x.id==='jesus-barroso').note.includes('24.03.01*'),'Asterisco n.º 141');
assert.ok(SOURCES.PRO2001.title.includes('460–476')&&SOURCES.PRO2001.scope.includes('n.os 62–194'),'Alcance PROVEA');
assert.ok(year2001.includes('Los registros 62–194')&&year2001.includes('No es un balance anual exhaustivo'),'Registro no exhaustivo');

// Decimoquinta unidad: PROVEA p. 471, registros 144–153; n.º 151 sin identidad.
const fifteenthBatch2001 = [["ramon-jose-zambrano-garcia","Ramón José Zambrano García","2001-04-01","policial",144],["luis-felipe-bolivar-hernandez","Luis Felipe Bolívar Hernández","2001-04-01","policial",145],["jhonathan-david-silva-bermudez","Jhonathan David Silva Bermúdez","2001-04-04","policial",146],["carlos-alberto-campos-2001","Carlos Alberto Campos","2001-04-05","investigacion",147],["elio-jose-abreu-ovalles","Elio José Abreu Ovalles","2001-04-05","investigacion",148],["jose-alirio-garcia-segura","José Alirio García Segura","2001-04-05","investigacion",149],["jose-empireo-posa-bustillos","José Empíreo Posa Bustillos","2001-04-05","investigacion",150],["antonio-jose-zambrano-2001","Antonio José Zambrano","2001-04-05","investigacion",152],["carlos-a-oliveros-c","Carlos A. Oliveros C.","2001-04-05","investigacion",153]];
assert.ok(cases2001.length>=121,'114 fichas de 2001; registro parcial');
assert.ok(CASES.length>=422,'415 fichas totales');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'114 enlaces nominales del capítulo anual');
for(const [id,name,date,category,number] of fifteenthBatch2001){
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`ID único: ${id}`);
 assert.equal(matches[0].name,name,`Nombre: ${id}`);
 assert.equal(matches[0].date,date,`Fecha: ${id}`);
 assert.equal(matches[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(matches[0].sources,['PRO2001'],`Fuente PROVEA: ${id}`);
 assert.ok(matches[0].note.includes('p. 471')&&matches[0].note.includes(`n.º ${number}`),`Localizador documental: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace nominal: ${id}`);
}
assert.ok(!cases2001.some(p=>p.name==='S/I'),'No convertir el registro anónimo 151 en ficha nominal');
assert.ok(cases2001.find(p=>p.id==='jose-empireo-posa-bustillos').note.includes('Farfán Bustillos'),'Variante nominal n.º 150 preservada');
assert.ok(cases2001.find(p=>p.id==='carlos-a-oliveros-c').name.includes('C.'),'No expandir iniciales n.º 153');
assert.ok(cases2001.find(p=>p.id==='jhonathan-david-silva-bermudez').note.includes('versión oficial'),'Denuncia y versión oficial n.º 146');
assert.ok(SOURCES.PRO2001.title.includes('460–476')&&SOURCES.PRO2001.scope.includes('n.os 62–194'),'Cobertura actualizada hasta p. 471');
assert.ok(year2001.includes('n.º 151')&&year2001.includes('No es un balance anual exhaustivo'),'Registro sin nombre excluido y límites preservados');
assert.ok(year2001.includes('noindex,nofollow,noarchive'),'No indexar capítulo');

// Decimosexta unidad: PROVEA p. 472; n.º 162 retenido por posible duplicidad.
const sixteenthBatch2001 = [["darlius-antonio-silva-gonzalez","Darlius Antonio Silva González","2001-04-05","investigacion",154],["jose-javier-amaya-sanchez","José Javier Amaya Sánchez","2001-04-05","investigacion",155],["jairo-e-amaya-s","Jairo E. Amaya S.","2001-04-05","investigacion",156],["pablo-de-la-cruz-medina-perez","Pablo de la Cruz Medina Pérez","2001-04-05","investigacion",157],["ricardo-freites-boscan","Ricardo Freites Boscán","2001-04-06","policial",158],["endis-segundo-fonseca-tovar","Endis Segundo Fonseca Tovar","2001-04-06","policial",159],["ender-jose-mavarez-yanez","Ender José Mavárez Yánez","2001-04-06","policial",160],["jose-antonio-cuicas","José Antonio Cuicas","2001-04-06","policial",161],["haron-ely-rojas-medina","Haron Ely Rojas Medina","2001-04-17","policial",163],["luis-gregorio-ojeda-fajardo","Luis Gregorio Ojeda Fajardo","2001-04-20","investigacion",164]];
for(const [id,name,date,category,number] of sixteenthBatch2001){
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`ID único: ${id}`);
 assert.equal(found[0].name,name,`Nombre: ${id}`);
 assert.equal(found[0].date,date,`Fecha: ${id}`);
 assert.equal(found[0].category,category,`Categoría: ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente: ${id}`);
 assert.ok(found[0].note.includes('p. 472')&&found[0].note.includes(`n.º ${number}`),`Fuente nominal: ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual: ${id}`);
}
assert.ok(!cases2001.some(p=>p.name==='Jonathan David Silva'),'No duplicar el n.º 162 sin corroboración');
assert.ok(SOURCES.PRO2001.scope.includes('n.º 162')&&year2001.includes('El n.º 162'),'Posible duplicidad 146/162 documentada');
for(const id of ['ricardo-freites-boscan','endis-segundo-fonseca-tovar','ender-jose-mavarez-yanez','jose-antonio-cuicas']){
 assert.ok(cases2001.find(p=>p.id===id).note.includes('06.04.01*'),'Asterisco pendiente de cotejo');
}
assert.ok(cases2001.find(p=>p.id==='luis-gregorio-ojeda-fajardo').note.includes('no establece quién disparó'),'No atribuir disparos sin prueba');
assert.ok(year2001.includes('noindex,nofollow,noarchive'),'Robots preservados');

// Decimoséptima unidad: PROVEA p. 473, registros 165–174.
const seventeenthBatch2001=[["luis-emiro-perez-briceno","Luis Emiro Pérez Briceño","2001-04-20","policial",165],["orlando-jose-perez-rodriguez","Orlando José Pérez Rodríguez","2001-04-23","investigacion",166],["jose-miguel-camacho-2001","José Miguel Camacho","2001-04-23","investigacion",167],["rene-alexander-castro-medina","René Alexander Castro Medina","2001-04-27","policial",168],["ramon-alexis-chirinos","Ramón Alexis Chirinos","2001-04-28","policial",169],["rafael-angarita-2001","Rafael Angarita","2001-05-03","policial",170],["pablo-sanchez-2001","Pablo Sánchez","2001-05-03","policial",171],["nelson-sanchez-2001","Nelson Sánchez","2001-05-03","policial",172],["alexander-lago-2001","Alexander Lago","2001-05-03","policial",173],["angel-r-marquez-h","Ángel R. Márquez H.","2001-05-05","investigacion",174]];
assert.ok(cases2001.length>=121,'114 fichas de 2001, registro parcial');
assert.ok(CASES.length>=422,'415 fichas totales');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'114 enlaces anuales');
for(const [id,name,date,category,num] of seventeenthBatch2001){
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`ID único PROVEA ${num}`);
 assert.equal(found[0].name,name,`Nombre p. 473 ${id}`);
 assert.equal(found[0].date,date,`Fecha p. 473 ${id}`);
 assert.equal(found[0].category,category,`Categoría p. 473 ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente p. 473 ${id}`);
 assert.ok(found[0].note.includes('p. 473')&&found[0].note.includes(`n.º ${num}`),`Localizador p. 473 ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace p. 473 ${id}`);
}
assert.ok(cases2001.find(p=>p.id==='rene-alexander-castro-medina').note.includes('No se imputa a policías el disparo inicial'),'Separar disparo del comerciante de denuncia contra policías');
assert.ok(cases2001.find(p=>p.id==='alexander-lago-2001').note.includes('Lago/Lagos'),'Variante nominal preservada');
assert.ok(cases2001.find(p=>p.id==='rafael-angarita-2001').note.includes('03.05.01*'),'Asterisco sin resolver');
assert.ok(['rafael-angarita-2001','pablo-sanchez-2001','nelson-sanchez-2001','alexander-lago-2001'].every(id=>cases2001.find(p=>p.id===id).note.includes('versión oficial')),'Versión oficial documentada para los cuatro');
assert.ok(SOURCES.PRO2001.title.includes('460–476')&&SOURCES.PRO2001.scope.includes('n.os 165–174'),'Cobertura fuente hasta p. 473');
assert.ok(year2001.includes('Los registros 62–194')&&year2001.includes('No es un balance anual exhaustivo'),'Límites de cobertura');
assert.ok(year2001.includes('noindex,nofollow,noarchive'),'Noindex conservado');

// Decimoctava unidad: PROVEA p. 474, n.os 175–181, y p. 475, n.º 182.
const eighteenthBatch2001=[["luis-joel-ramirez","Luis Joel Ramírez","2001-05-08","policial",176],["oscar-ramirez-2001","Óscar Ramírez","2001-05-08","policial",177],["vladimir-gomez-2001","Vladimir Gómez","2001-05-09","policial",178],["freddy-caraballo-2001","Freddy Caraballo","2001-05-11","policial",179],["italo-mujica-2001","Ítalo Mujica","2001-05-12","policial",180],["raul-alexander-nieves-palma","Raúl Alexander Nieves Palma","2001-05-13","policial",181],["william-jaramillo-2001","William Jaramillo","2001-05-13","policial",182]];
assert.ok(cases2001.length>=121,'121 fichas de 2001; registro parcial');
assert.ok(CASES.length>=422,'422 fichas totales');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'121 enlaces anuales');
for(const [id,name,date,category,num] of eighteenthBatch2001){
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`ID único PROVEA ${num}`);
 assert.equal(found[0].name,name,`Nombre p. 474–475 ${id}`);
 assert.equal(found[0].date,date,`Fecha ${id}`);
 assert.equal(found[0].category,category,`Categoría ${id}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente ${id}`);
 assert.ok(found[0].note.includes(`n.º ${num}`),`Localizador documental ${id}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual ${id}`);
}
assert.ok(!cases2001.some(p=>p.id==='sin-informacion-embrion'),'No inventar ficha del registro 175 sin identidad');
assert.ok(cases2001.find(p=>p.id==='freddy-caraballo-2001').note.includes('11.05.01*'),'Asterisco de fecha n.º 179 preservado');
assert.ok(cases2001.find(p=>p.id==='raul-alexander-nieves-palma').note.includes('versión oficial'),'Versión oficial del episodio Nieves-Jaramillo');
assert.ok(SOURCES.PRO2001.scope.includes('n.os 62–194'),'Cobertura nominal parcial actualizada');
assert.ok(year2001.includes('Los registros 62–194')&&year2001.includes('No es un balance anual exhaustivo'),'Alcance limitado');
assert.ok(year2001.includes('noindex,nofollow,noarchive'),'Robots preservados');

// Decimonovena unidad: PROVEA p. 475, n.os 183–188. El n.º 184 ya existía: no duplicar.
const nineteenthBatch2001 = [["celso-david-rodriguez-salas","Celso David Rodríguez Salas","2001-05-13","investigacion",183],["jhonny-brito-salazar","Jhonny Brito Salazar","2001-05-15","policial",185],["franklin-salazar-2001","Franklin Salazar","2001-05-15","policial",186],["alfredo-antonio-rojas-2001","Alfredo Antonio Rojas","2001-05-16","investigacion",187],["henry-german-aponte-requena","Henry Germán Aponte Requena","2001-05-17","policial",188]];
assert.ok(cases2001.length>=126,'Conservar las 126 fichas del hito anterior');
assert.ok(CASES.length>=427,'Conservar las 427 fichas del hito anterior');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces del año y dataset coinciden');
for(const [id,name,date,category,num] of nineteenthBatch2001){
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`Ficha única PROVEA ${num}`);
 assert.equal(found[0].name,name,`Nombre original ${num}`);
 assert.equal(found[0].date,date,`Fecha PROVEA ${num}`);
 assert.equal(found[0].category,category,`Categoría ${num}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente ${num}`);
 assert.ok(found[0].note.includes('p. 475')&&found[0].note.includes(`n.º ${num}`),`Localizador ${num}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace nominal ${num}`);
}
const reconciled184=cases2001.filter(p=>p.name==='José Ramón Rodríguez'&&p.year===2001);
assert.equal(reconciled184.length,1,'El n.º 184 ya documentado no se duplica');
assert.ok(reconciled184[0].sources.includes('HRW2001')&&reconciled184[0].sources.includes('PRO2001'),'Doble fuente para José Ramón Rodríguez');
assert.ok(cases2001.find(p=>p.id==='jhonny-brito-salazar').note.includes('versión oficial')&&cases2001.find(p=>p.id==='franklin-salazar-2001').note.includes('versión oficial'),'Preservar versión oficial del episodio 185–186');
assert.ok(cases2001.find(p=>p.id==='henry-german-aponte-requena').note.includes('Familiares')&&cases2001.find(p=>p.id==='henry-german-aponte-requena').note.includes('No se inspeccionaron peritajes'),'Discrepancia probatoria n.º 188');
assert.ok(SOURCES.PRO2001.scope.includes('n.os 62–194')&&year2001.includes('Los registros 62–194'),'Cobertura parcial coherente');
assert.ok(!year2001.includes('ciento catorce')&&year2001.includes(`<strong>${cases2001.length}</strong>`)&&year2001.includes(`${cases2001.length} FICHAS NOMINALES`),'Sin contador textual obsoleto');
assert.ok(year2001.includes('noindex,nofollow,noarchive')&&year2001.includes('No es un balance anual exhaustivo'),'Prototipo y límites preservados');

// Vigésima unidad: PROVEA p. 476, n.os 189–194; 191 y 194 ya estaban reconciliados.
const twentiethBatch2001=[["alexis-jose-torres-2001","Alexis José Torres","2001-05-17",189],["juan-arevalo-arias-lugo","Juan Arévalo Arias Lugo","2001-05-17",190],["rafael-antonio-lazaro-dobables","Rafael Antonio Lázaro Dobables","2001-05-26",192],["prospero-sumoza-gonzalez","Próspero Sumoza González","2001-05-27",193]];
assert.ok(cases2001.length>=130,'Conservar 130 fichas del hito previo; no exhaustivo');
assert.ok(CASES.length>=431,'Conservar 431 fichas previas sin duplicar');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces anuales exactos');
for(const [id,name,date,num] of twentiethBatch2001){
 const found=cases2001.filter(p=>p.id===id);
 assert.equal(found.length,1,`ID único ${num}`);
 assert.equal(found[0].name,name,`Nombre ${num}`);
 assert.equal(found[0].date,date,`Fecha ${num}`);
 assert.equal(found[0].category,'policial',`Categoría ${num}`);
 assert.deepEqual(found[0].sources,['PRO2001'],`Fuente ${num}`);
 assert.ok(found[0].note.includes('p. 476')&&found[0].note.includes(`n.º ${num}`),`Localizador ${num}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace ${num}`);
}
assert.equal(cases2001.filter(p=>p.id==='belmiro-alexander-gutierrez').length,1,'N.º 191 no duplicado');
assert.equal(cases2001.filter(p=>p.id==='ericson-jose-parra').length,1,'N.º 194 no duplicado');
assert.ok(!cases2001.some(p=>p.id==='edixon-parra-2001'),'Variante Ericson/Edixon sin resolver');
assert.ok(cases2001.find(p=>p.id==='prospero-sumoza-gonzalez').note.includes('fecha exacta de la muerte'),'No inferir fecha de fallecimiento');
assert.ok(SOURCES.PRO2001.scope.includes('n.os 62–194')&&year2001.includes('Los registros 62–194'),'Cobertura');
assert.ok(year2001.includes('noindex,nofollow,noarchive')&&year2001.includes('No es un balance anual exhaustivo'),'Robots y límites');

// Vigésima primera unidad: p. 477, adultos n.os 198 y 201; adolescentes diferidos por privacidad.
const twentyFirstBatch2001=[["hidublis-diaz-acosta","Hidublis Díaz Acosta","2001-06-11",198],["franklin-rafael-salazar-perez","Franklin Rafael Salazar Pérez","2001-06-12",201]];
// Hito mínimo de 136 fichas, no techo: futuros lotes deben seguir pasando sin alterar la auditoría de este hito.
assert.ok(cases2001.length>=136,'136 fichas de 2001; registro parcial');
assert.equal(new Set(CASES.map(p=>p.id)).size,CASES.length,'IDs globales únicos');
assert.ok(CASES.length>=437,'Preservar 437 fichas previas');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces nominales sincronizados con dataset');
for(const [id,name,date,num] of twentyFirstBatch2001){
 const m=cases2001.filter(p=>p.id===id);
 assert.equal(m.length,1,`ID único ${num}`);
 assert.equal(m[0].name,name,`Nombre PROVEA ${num}`);
 assert.equal(m[0].date,date,`Fecha evento ${num}`);
 assert.equal(m[0].category,'policial',`Categoría ${num}`);
 assert.deepEqual(m[0].sources,['PRO2001'],`Fuente ${num}`);
 assert.ok(m[0].note.includes('p. 477')&&m[0].note.includes(`n.º ${num}`),`Pasaje ${num}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace ${num}`);
}
assert.ok(cases2001.find(p=>p.id==='hidublis-diaz-acosta').note.includes('infarto')&&cases2001.find(p=>p.id==='hidublis-diaz-acosta').note.includes('asterisco'),'Conservar versión oficial y fecha no confirmada');
assert.ok(cases2001.find(p=>p.id==='franklin-rafael-salazar-perez').note.includes('funcionarios alegaron'),'No convertir denuncia en sentencia');
assert.ok(SOURCES.PRO2001.title.includes('477')&&SOURCES.PRO2001.scope.includes('n.º 197')&&year2001.includes('n.º 197'),'Anthony Salazar pendiente de evaluación');
assert.ok(year2001.includes(`<strong>${cases2001.length}</strong>`)&&year2001.includes(`${cases2001.length} FICHAS NOMINALES`),'Contadores concordantes con dataset');
assert.ok(year2001.includes('noindex,nofollow,noarchive')&&year2001.includes('No es un balance anual exhaustivo'),'Prototipo y cautelas');

// Auditoría transversal de tres fichas existentes de marzo de 2001: COFAVIC vs. PROVEA.
const elTigre=[["yavidilex-placencio-borges","Yavidilex Placencio Borges"],["wilmer-villarroel-2001","Wilmer Villarroel"],["rafael-leonardo-moreno","Rafael Leonardo Moreno"]];
assert.ok(cases2001.length>=136,'Preservar hito de 136 fichas al cotejar El Tigre');
assert.ok(CASES.length>=437,'Preservar hito global de 437 fichas');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces sincronizados tras cotejo El Tigre');
assert.ok(SOURCES.COF2001.url.includes('6-COF-HIS.pdf'),'Fuente COFAVIC identificada');
for(const [id,name] of elTigre){
 const match=cases2001.filter(p=>p.id===id);
 assert.equal(match.length,1,`Una sola ficha para ${name}`);
 assert.equal(match[0].name,name,`Conservar etiqueta nominal PROVEA ${name}`);
 assert.equal(match[0].date,'2001-03-01',`Fecha del registro PROVEA, no consenso ${name}`);
 assert.deepEqual(match[0].sources,['PRO2001','COF2001'],`Dos documentos ${name}`);
 assert.ok(match[0].note.includes('01-03-2001')&&match[0].note.includes('10-03-2001'),`Fechas discrepantes visibles ${name}`);
 assert.ok(match[0].note.includes('anulada en apelación'),`No convertir condena anulada en firme ${name}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace conservado ${name}`);
}
assert.ok(cases2001.find(p=>p.id==='yavidilex-placencio-borges').note.includes('Yavidilet Katiuska Placeres Borges'),'Variante nominal adolescente atribuida');
assert.ok(cases2001.find(p=>p.id==='wilmer-villarroel-2001').note.includes('24 años'),'Discrepancia de edad preservada');
assert.ok(cases2001.find(p=>p.id==='rafael-leonardo-moreno').note.includes('Moreno Villarroel'),'Variante de apellido preservada');
assert.ok(year2001.includes('COFAVIC')&&year2001.includes('condena inicial')&&year2001.includes('noindex,nofollow,noarchive'),'Cotejo público y robots');

// Auditoría de los primos Carmona: PROVEA p. 477, n.os 199–200, y COFAVIC anexo 1 p. 51.
for(const [id,name,num] of [['jose-daniel-carmona-yaguaracuto','José Daniel Carmona Yaguaracuto',199],['hector-luis-carmona-2001','Héctor Luis Carmona',200]]){
 const matches=cases2001.filter(p=>p.id===id);
 assert.equal(matches.length,1,`Sin duplicidad de ${num}`);
 const p=matches[0];
 assert.equal(p.name,name,`Nombre documental ${num}`);
 assert.equal(p.date,'2001-06-12',`Fecha compartida ${num}`);
 assert.deepEqual(p.sources,['PRO2001','COF2001'],`Dos fuentes ${num}`);
 assert.equal(p.category,'policial',`Sin condena inferida ${num}`);
 assert.ok(p.note.includes('p. 477')&&p.note.includes(`n.º ${num}`)&&p.note.includes('p. 51'),`Localizadores ${num}`);
 assert.ok(p.note.includes('discrep')&&p.note.includes('sentencia firme'),`Contradicciones y límites ${num}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual ${num}`);
}
assert.ok(cases2001.length>=136,'Preservar hito de 136 fichas tras cotejo Carmona');
assert.ok(CASES.length>=437,'Preservar hito global tras cotejo Carmona');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces exactos tras cotejo Carmona');
assert.ok(year2001.includes('14/15 frente a 15/16')&&year2001.includes('noindex,nofollow,noarchive'),'Discrepancias y robots visibles');

// Unidad 24: adolescentes de San Juan, dos fuentes documentales y sentencia anulada.
for(const [id,name,num] of [['danner-pastor-barreto-torres','Danner Pastor Barreto Torres',195],['luis-javier-gimenez-2001','Luis Javier Giménez',196]]){
 const match=cases2001.filter(p=>p.id===id);
 assert.equal(match.length,1,`Sin duplicidad del registro ${num}`);
 const p=match[0];
 assert.equal(p.name,name,`Nombre PROVEA ${num}`);
 assert.equal(p.date,'2001-06-05',`Fecha PROVEA ${num}`);
 assert.equal(p.category,'policial',`Sin atribución penal automática ${num}`);
 assert.deepEqual(p.sources,['PRO2001','COVICIL2001'],`Fuentes de ${num}`);
 assert.ok(p.note.includes('p. 477')&&p.note.includes('anulada')&&p.note.includes('04-06-2001')&&p.note.includes('05-06-2001'),`Contradicción y estado judicial ${num}`);
 assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual ${num}`);
}
assert.ok(cases2001.length>=136,'Preservar al menos 136 fichas parciales de 2001');
assert.ok(CASES.length>=437,'Preservar al menos 437 fichas nominales');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,cases2001.length,'Enlaces anuales sincronizados con dataset');
assert.ok(SOURCES.COVICIL2001.url.includes('poderesimpunidad.pdf')&&year2001.includes('poderesimpunidad.pdf#page=198'),'COVICIL enlazado y localizado');
assert.ok(year2001.includes('noindex,nofollow,noarchive')&&year2001.includes('No es un balance anual exhaustivo'),'Robots y alcance parcial');
// Unidad PROVEA p. 478: cuatro personas adultas, registros 202–205; no elevar denuncias a sentencias.
const provea478 = [
  ['arnaldo-rosas-2001','Arnaldo Rosas','2001-06-13',202],
  ['carlos-enrique-santana-redondo','Carlos Enrique Santana Redondo','2001-06-15',203],
  ['eduardo-jose-mejicano-garcia','Eduardo José Mejicano García','2001-06-18',204],
  ['edgar-antonio-pereira-2001','Edgar Antonio Pereira','2001-06-20',205]
];
for (const [id,name,date,num] of provea478) {
  const matches=cases2001.filter(p=>p.id===id);
  assert.equal(matches.length,1,`Una ficha por registro PROVEA ${num}`);
  const p=matches[0];
  assert.equal(p.name,name,`Nombre cotejado en p. 478 n.º ${num}`);
  assert.equal(p.date,date,`Fecha del anexo n.º ${num}`);
  assert.equal(p.category,'policial',`No atribuir sentencia ${num}`);
  assert.deepEqual(p.sources,['PRO2001'],`Una fuente documental declarada ${num}`);
  assert.ok(p.note.includes('p. 478')&&p.note.includes(`n.º ${num}`),`Localizador exacto ${num}`);
  assert.ok(p.note.includes('No se inspeccionaron')||p.note.includes('no se inspeccionaron'),`Límites probatorios ${num}`);
  assert.ok(year2001.includes(`perfil.html?id=${id}`),`Enlace anual ${num}`);
}
assert.equal(cases2001.length,142,'142 fichas parciales 2001 tras PROVEA p. 479');
assert.equal(CASES.length,443,'443 fichas totales tras PROVEA p. 479');
assert.equal((year2001.match(/class="year-roster-item"/g)||[]).length,142,'Roster anual exacto');
assert.ok(SOURCES.PRO2001.title.includes('478')&&SOURCES.PRO2001.scope.includes('n.º 206'),'Fuente y casos reservados');
assert.ok(cases2001.find(p=>p.id==='edgar-antonio-pereira-2001').note.includes('compañera')&&cases2001.find(p=>p.id==='edgar-antonio-pereira-2001').note.includes('a la mujer en un brazo')&&!cases2001.find(p=>p.id==='edgar-antonio-pereira-2001').note.includes('madre'),'Distinguir lesión de compañera y muerte de Pereira, sin inventar parentesco');
assert.ok(year2001.includes('142 FICHAS NOMINALES')&&year2001.includes('<strong>142</strong>'),'Contadores visibles');
assert.ok(year2001.includes('noindex,nofollow,noarchive')&&year2001.includes('No es un balance anual exhaustivo'),'Robots y cautelas');

// PROVEA p. 478, n.º 207: un adulto, atribución documental sin convertirla en condena; n.º 206 pendiente.
const anderson2001 = cases2001.filter(p=>p.id==='anderson-garcia-orellana-2001');
assert.equal(anderson2001.length,1,'No duplicar a Anderson García Orellana');
assert.equal(anderson2001[0].name,'Anderson García Orellana');
assert.equal(anderson2001[0].date,'2001-06-21');
assert.deepEqual(anderson2001[0].sources,['PRO2001'],'URRU es listado derivado, no corroboración independiente');
assert.ok(anderson2001[0].note.includes('n.º 207')&&anderson2001[0].note.includes('versión oficial')&&anderson2001[0].note.includes('No se inspeccionaron'),'Pasaje, versión y límites');
assert.ok(!cases2001.some(p=>p.name==='Alberto Díaz López'),'No incorporar al adolescente sin auditoría adicional');
assert.ok(anderson2001[0].note.includes('adolescente del n.º 206')&&!anderson2001[0].note.includes('Díaz López'),'Referencia documental sin identificar al menor pendiente');
assert.ok(SOURCES.PRO2001.scope.includes('n.º 206 (adolescente de 16 años)')&&!SOURCES.PRO2001.scope.includes('Díaz López'),'Fuente canónica con reserva de identidad');
assert.ok(!year2001.includes('Díaz López'),'La página pública no identifica al adolescente pendiente');
assert.ok(year2001.includes('perfil.html?id=anderson-garcia-orellana-2001')&&year2001.includes('n.º 206 (adolescente)'),'Enlace y pendiente visibles');

// PROVEA p. 479, n.os 208 y 211: deduplicación documental y denuncia atribuida.
const arroyave2001=cases2001.filter(x=>x.id==='juan-pablo-arroyave');
assert.equal(arroyave2001.length,1);
assert.deepEqual(arroyave2001[0].sources,['US2001','PRO2001']);
assert.ok(arroyave2001[0].note.includes('Arroyabe Corrales')&&arroyave2001[0].note.includes('n.º 208')&&arroyave2001[0].note.includes('situación judicial posterior'));
const gamez2001=cases2001.filter(x=>x.id==='isidro-rafael-gamez-salazar-2001');
assert.equal(gamez2001.length,1);
assert.equal(gamez2001[0].date,'2001-06-29');
assert.deepEqual(gamez2001[0].sources,['PRO2001']);
assert.ok(gamez2001[0].note.includes('n.º 211')&&gamez2001[0].note.includes('versión oficial')&&gamez2001[0].note.includes('no se inspeccionaron'));
assert.ok(html2001.includes('perfil.html?id=isidro-rafael-gamez-salazar-2001'));
assert.ok(!cases2001.some(x=>x.id==='juan-pablo-arroyabe-corrales'));
