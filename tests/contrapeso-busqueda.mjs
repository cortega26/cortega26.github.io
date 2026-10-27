import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { runInNewContext } from 'node:vm';

const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../public/venezuela-lab/app.js', import.meta.url), 'utf8');
const entries = [...home.matchAll(/<article class="story-card" data-category="([^"]+)" data-search="([^"]+)"/g)];
assert.equal(entries.length, 6, 'Se prueban las seis tarjetas reales de portada');
const control = () => ({
  handlers: {},
  addEventListener(type, fn) { this.handlers[type] = fn; },
  setAttribute(name, value) { this[name] = value; },
  classList: { toggle() {} },
});
const cards = entries.map((entry, i) => ({
  dataset: { category: entry[1], search: entry[2] },
  innerText: entry[2],
  hidden: false,
  querySelector(selector) {
    const end = entries[i + 1]?.index ?? home.indexOf('</div><p id="no-results"');
    return selector === '.demo-tag' && home.slice(entry.index, end).includes('class="demo-tag"') ? {} : null;
  },
}));
const buttons = ['Todas', 'Actualidad', 'Explicadores', 'Opinión', 'Expedientes', 'Archivo']
  .map(filter => Object.assign(control(), { dataset: { filter } }));
const search = Object.assign(control(), { value: '' });
const count = { textContent: '' };
const noResults = { hidden: true };
const dialog = Object.assign(control(), { showModal() {}, close() {} });
const elements = {
  '#article-search': search,
  '#result-count': count,
  '#no-results': noResults,
  '#reader-dialog': dialog,
  '.dialog-close': control(),
  '.dialog-done': control(),
};
const collections = {
  '.story-card': cards,
  '[data-filter]': buttons,
  '[data-nav-filter]': [],
  '[data-article]': [],
};
const document = {
  querySelectorAll(selector) { return collections[selector] ?? []; },
  querySelector(selector) { return elements[selector] ?? null; },
  createElement() { return { textContent: '' }; },
};
runInNewContext(app, { document });
assert.equal(count.textContent, '6 contenidos: 5 con fuentes y 1 muestra');
function searchFor(query, expected) {
  search.value = query;
  search.handlers.input();
  assert.equal(cards.filter(card => !card.hidden).length, expected, 'Resultados de búsqueda: ' + query);
  assert.equal(noResults.hidden, expected !== 0, 'Mensaje sin resultados: ' + query);
}
searchFor('garantias', 1);
searchFor('observacion', 1);
searchFor('OPINION', 1);
searchFor('inexistente', 0);
searchFor('', 6);
buttons.find(button => button.dataset.filter === 'Opinión').handlers.click();
assert.equal(count.textContent, '1 contenido: 0 con fuentes y 1 muestra', 'El filtro distingue demostraciones');
console.log('Contrapeso: búsqueda sin tildes, filtros y recuento PASS');
