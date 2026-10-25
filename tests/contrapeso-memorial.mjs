import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { CASES, SOURCES, CATEGORIES, EPISODES } from '../public/venezuela-lab/museo/victimas/data.js';

const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url),'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url),'utf8');
const index = readFileSync(new URL('../public/venezuela-lab/museo/victimas/index.html', import.meta.url),'utf8');
const profile = readFileSync(new URL('../public/venezuela-lab/museo/victimas/perfil.html', import.meta.url),'utf8');
const script = readFileSync(new URL('../public/venezuela-lab/museo/victimas/app.js', import.meta.url),'utf8');
const style = readFileSync(new URL('../public/venezuela-lab/museo/victimas/memorial.css', import.meta.url),'utf8');

assert.ok(CASES.length >= 230, 'La colección ampliada exige al menos 230 registros documentales');
assert.equal(CASES.filter(p=>p.episode==='2002-11A').length,19,'Las 19 víctimas nominales del 11A deben figurar');
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
