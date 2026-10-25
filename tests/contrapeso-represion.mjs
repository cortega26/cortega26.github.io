import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/museo/museum.css', import.meta.url), 'utf8');
const sources = [
  'https://www.refworld.org/es/coi/pressre/ohchr/2017/es/126862',
  'https://www.oas.org/es/cidh/prensa/Comunicados/2017/058.asp',
  'https://www.hrw.org/es/report/2017/11/29/arremetida-contra-opositores/brutalidad-tortura-y-persecucion-politica-en',
  'https://acnudh.org/conclusiones-de-un-equipo-de-expertos-de-la-onu-apuntan-a-un-patron-de-violacion-de-derechos-humanos-durante-manifestaciones-de-venezuela/'
];
assert.equal((museum.match(/id="expediente-represion-2017"/g) || []).length, 1, 'Solo un expediente 004');
assert.equal((museum.match(/class="repression-finding"/g) || []).length, 4, 'Cuatro ámbitos documentados');
for (const n of ['124 muertes', '46', '27', '51', '1.958', '5.000', '609', '135 entrevistas', '36 personas fallecidas', '757 heridas']) {
  assert.ok(museum.includes(n), `Falta el dato: ${n}`);
}
for (const source of sources) assert.ok(museum.includes(source), `Falta la fuente: ${source}`);
assert.ok(museum.includes('46 + 27 + 51 = 124'), 'Consistencia del desglose');
assert.ok(museum.includes('no deben sumarse'), 'Evitar doble conteo');
assert.ok(museum.includes('No representan el total definitivo'), 'Corte histórico explícito');
assert.ok(museum.includes('no ha entrevistado a víctimas'), 'Límite de investigación independiente');
assert.ok(museum.includes('no es un registro oficial exhaustivo'), 'Cautela sobre estimaciones de ONG');
assert.ok(museum.includes('a distancia'), 'Limitación metodológica del ACNUDH');
assert.ok(museum.includes('href="#expediente-2017"'), 'Conexión institucional 2017');
assert.ok(home.includes('href="/venezuela-lab/museo/#expediente-represion-2017"'), 'Acceso desde portada');
assert.ok(css.includes('.repression-totals') && css.includes('@media (width <= 800px)'), 'Estilo responsivo');
for (const id of ['expediente-2024', 'expediente-barbados', 'expediente-2017']) {
  assert.ok(museum.includes(`id="${id}"`), `Expediente anterior ausente: ${id}`);
}
assert.ok(museum.includes('noindex,nofollow,noarchive') && home.includes('noindex,nofollow,noarchive'), 'Conservar noindex');
console.log('Contrapeso: expediente 004 sobre represión de 2017 PASS');
