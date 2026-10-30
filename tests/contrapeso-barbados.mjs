
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const museum = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const museumCss = readFileSync(new URL('../public/venezuela-lab/museo/museum.css', import.meta.url), 'utf8');
const editorial = readFileSync(new URL('../docs/editorial/contrapeso-principios.md', import.meta.url), 'utf8');

assert.equal((museum.match(/id="expediente-barbados"/g) || []).length, 1, 'Solo un expediente de Barbados');
assert.equal((museum.match(/class="barbados-entry"/g) || []).length, 4, 'Cuatro compromisos comparables');
assert.ok(museum.includes('17 OCT 2023'), 'Fecha del documento');
assert.ok(museum.includes('28 de julio de 2024'), 'Fecha del evento electoral');
for (const marker of ['TERCERO, NUMERAL 1', 'PRIMERO Y TERCERO, NUMERAL 11', 'TERCERO, NUMERAL 2', 'TERCERO, NUMERAL 4']) {
  assert.ok(museum.includes(marker), `Falta cláusula ${marker}`);
}
for (const url of [
  'https://accesoalajusticia.org/acuerdo-parcial-sobre-la-promocion-de-derechos-politicos-y-garantias-electorales-para-todos/',
  'https://www.regjeringen.no/en/topics/foreign-affairs/peace-and-conflict-resolution/norways_engagement/venezuela_negotiations/id2674295/',
  'https://www.cartercenter.org/news/venezuela-073024/',
  'https://www.cartercenter.org/news/venezuela-062124/',
  'https://www.eeas.europa.eu/delegations/un-geneva/hrc56-interactive-dialogue-report-high-commissioner-situation-human-rights-bolivarian-republic_en'
]) {
  assert.ok(museum.includes(url), `Falta enlace a fuente: ${url}`);
}
assert.ok(museum.includes('No todos los numerales constituían obligaciones directas'), 'Debe distinguir promover de obligarse');
assert.ok(museum.includes('avances parciales') && museum.includes('deficiencias acreditadas'), 'Declaración de límites');
assert.ok(museum.indexOf('id="expediente-2024"') < museum.indexOf('id="expediente-barbados"'), 'Expediente 002 después de 001');
assert.ok(home.includes('href="/venezuela-lab/museo/#expediente-barbados"'), 'Acceso 002 desde portada');
const grid = home.split('<div class="articles-grid" id="article-list">')[1].split('</div><p id="no-results"')[0];
const caseCard = grid.split('<article class="story-card" data-category="Expedientes"')[1]?.split('</article>')[0];
assert.ok(caseCard, 'Tarjeta Expedientes visible en portada');
assert.ok(caseCard.includes('Barbados: cuatro compromisos') && caseCard.includes('DOCUMENTADO'), 'Título y carácter documental, sin falsa actualidad');
assert.ok(caseCard.includes('href="/venezuela-lab/museo/#expediente-barbados"'), 'Tarjeta enlaza al expediente real');
assert.ok(!caseCard.includes('demo-tag') && !caseCard.includes('data-article='), 'Expediente no se presenta como modal ficticio');
assert.equal((grid.match(/class="demo-tag"/g) || []).length, 1, 'Solo Opinión es muestra');
assert.ok(home.includes('8 CONTENIDOS CON FUENTES · 1 MUESTRA'), 'Conteo documental actualizado');

assert.ok(home.includes('href="/venezuela-lab/museo/#expediente-2024"'), 'La portada conduce al 001 real');
assert.ok(!home.includes('data-article="actas"'), 'No presenta el expediente real como ejemplo');
assert.ok(museumCss.includes('.barbados-ledger') && museumCss.includes('@media (width <= 800px)'), 'Estilos adaptables');
assert.ok(museum.includes('noindex,nofollow,noarchive') && home.includes('noindex,nofollow,noarchive'), 'No indexar prototipo');
assert.ok(editorial.includes('Rigor no negociable'), 'Se mantiene el estándar editorial');
console.log('Contrapeso: expediente 002 Barbados y enlace portada PASS');
