// Primera ficha con atribución verificable: proteger cifras, enlaces y condición de prototipo.
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const html = readFileSync(new URL('../public/venezuela-lab/museo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/venezuela-lab/museo/museum.css', import.meta.url), 'utf8');
const source = 'https://www.cartercenter.org/publication/final-report-observacion-de-las-elecciones-presidenciales-en-venezuela-julio-de-2024/';
assert.equal((html.match(/id="expediente-2024"/g) || []).length, 1, 'Un expediente 2024');
assert.ok(html.includes('href="#expediente-2024"'), 'Accesible desde sala electoral');
assert.ok(html.includes(source), 'Fuente primaria en español enlazada');
for (const value of ['51,2 %','44,2 %','30,4 %','67,1 %','81,7 %','24.532','30.026','3.915.001','3.576.544']) {
  assert.ok(html.includes(value), 'Falta dato documentado: ' + value);
}
assert.ok(html.includes('resume una investigación ajena'), 'La ficha debe declarar límites de verificación');
assert.ok(html.includes('noindex,nofollow,noarchive'), 'El prototipo no debe indexarse');
assert.ok(css.includes('.museum-casefile') && css.includes('@media(max-width:800px)'), 'Estilo y adaptación móvil de ficha');
console.log('Contrapeso: expediente electoral y salvaguardas de atribución PASS');
