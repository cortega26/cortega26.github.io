import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/venezuela-lab/museo/museum.css', import.meta.url), 'utf8');

const sources = [
  'https://www.oas.org/es/cidh/prensa/comunicados/2016/132.asp',
  'https://www.oas.org/es/cidh/prensa/comunicados/2017/041.asp',
  'https://www.oas.org/es/cidh/prensa/comunicados/2017/131.asp',
  'https://accesoalajusticia.org/tsj-anula-acuerdo-de-la-an-sobre-activacion-carta-democratica-interamericana-y-ordena-cambio-de-legislacion-en-materia-de-seguridad/',
  'https://accesoalajusticia.org/autorizacion-del-tsj-por-encima-de-la-an-al-ejecutivo-para-crear-empresas-mixtas/',
  'https://elpitazo.net/politica/estas-son-las-sentencias-157-y-158-del-tsj-que-suprimen-las-155-y-156/',
  'https://www.coe.int/en/web/portal/-/venezuelan-president-s-bid-for-new-constitution-lacks-credibility-venice-commission'
];

assert.equal((museum.match(/id="expediente-2017"/g) || []).length, 1, 'Un único expediente 003');
assert.equal((museum.match(/class="institutional-event"/g) || []).length, 4, 'Cuatro hitos con trazabilidad');
for (const marker of ['SENTENCIA 155', 'SENTENCIA 156', 'SENTENCIAS 157 Y 158', 'CONSTITUYENTE']) {
  assert.ok(museum.includes(marker), `Falta el hito: ${marker}`);
}
for (const source of sources) {
  assert.ok(museum.includes(source), `Falta fuente: ${source}`);
}
assert.ok(museum.includes('No se afirma una disolución formal'), 'Límite interpretativo explícito');
assert.ok(museum.includes('Corrección parcial acreditada'), 'Rectificaciones 157/158 reconocidas');
assert.ok(museum.includes('No puede afirmarse'), 'No presentar como vigentes disposiciones suprimidas');
assert.ok(museum.includes('valoraciones de un organismo internacional'), 'Atribución de interpretaciones');
assert.ok(museum.includes('Seis hitos respaldados'), 'Cronología ampliada');
assert.ok(museum.includes('href="#expediente-2017"'), 'Acceso desde la sala documental');
assert.ok(home.includes('href="/venezuela-lab/museo/#expediente-2017"'), 'Acceso desde la portada');
assert.ok(styles.includes('.institutional-events') && styles.includes('@media (width <= 800px)'), 'Responsive documental');
assert.ok(museum.includes('noindex,nofollow,noarchive') && home.includes('noindex,nofollow,noarchive'), 'Prototipo conserva noindex');
console.log('Contrapeso: expediente institucional 2017 y trazabilidad PASS');
