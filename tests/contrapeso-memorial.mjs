import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { CASES, SOURCES, CATEGORIES } from '../public/venezuela-lab/museo/victimas/data.js';

const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url),'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url),'utf8');
const index = readFileSync(new URL('../public/venezuela-lab/museo/victimas/index.html', import.meta.url),'utf8');
const profile = readFileSync(new URL('../public/venezuela-lab/museo/victimas/perfil.html', import.meta.url),'utf8');
const script = readFileSync(new URL('../public/venezuela-lab/museo/victimas/app.js', import.meta.url),'utf8');
const style = readFileSync(new URL('../public/venezuela-lab/museo/victimas/memorial.css', import.meta.url),'utf8');

assert.ok(CASES.length >= 70, 'Cobertura inaugural con 70 o más personas documentadas');
const ids = CASES.map(person => person.id);
assert.equal(new Set(ids).size,CASES.length,'Identificadores únicos');
assert.equal(new Set(CASES.map(person => person.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase())).size,CASES.length,'No duplicar nombres');
assert.equal(CASES.filter(person => person.category === 'custodia').length,22,'22 casos de custodia en el informe OVP');
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
  if(person.biography)assert.ok(person.biography.startsWith('https://es.wikipedia.org/wiki/'),`Biografía externa verificable: ${person.name}`);
}
for(const source of Object.values(SOURCES))assert.ok(source.url.startsWith('https://') && source.scope.length > 30,'Fuente con alcance explícito');
for(const text of [index,profile])assert.ok(text.includes('noindex,nofollow,noarchive'),'Memorial no indexable');
assert.ok(home.includes('href="/venezuela-lab/museo/victimas/"'),'Entrada desde portada');
assert.ok(museum.includes('href="/venezuela-lab/museo/victimas/"'),'Entrada desde museo');
assert.ok(index.includes('Los muertos del chavismo') && museum.includes('Los muertos'),'Nombre editorial');
assert.ok(index.includes('no todas tienen la misma atribución') && index.includes('no prueba por sí sola homicidio'),'Prohibir afirmación indiscriminada de asesinato');
assert.ok(script.includes("new URLSearchParams") && script.includes("person.id"),'Perfiles individuales enlazables');
assert.ok(index.includes('id="search"') && index.includes('data-filter="custodia"') && index.includes('id="year"'),'Búsqueda y filtros');
assert.ok(style.includes('@media (width <= 600px)') && !style.includes('@import'),'Responsive y sin solicitudes externas de tipografías');
for (const oldId of ['expediente-2024','expediente-barbados','expediente-2017','expediente-represion-2017']) {
  assert.ok(museum.includes(`id="${oldId}"`),`Preservar expediente previo ${oldId}`);
}
console.log(`Contrapeso memorial: ${CASES.length} casos con fuentes, biografías, navegación y accesibilidad PASS`);
