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
const teaser = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');
const teaserCss = readFileSync(new URL('../public/venezuela-lab/styles.css', import.meta.url), 'utf8');
assert.ok(teaser.includes('<strong>PROHIBIDO<br>OLVIDAR<span>.</span></strong>'), 'El teaser del museo debe decir Prohibido olvidar');
assert.ok(html.includes('aria-label="Composición gráfica tipográfica: Prohibido olvidar"'), 'Accesibilidad del lema del museo');
assert.ok(html.includes('<div class="poster-word">PROHIBIDO<br><i>OL</i>VIDAR</div>'), 'El cartel del museo debe decir Prohibido olvidar');
assert.ok(!/No olvidar|NO<br>OLVIDAR|NO<br><i>OL<\/i>VI<br>DAR/i.test(teaser + html), 'No debe persistir la frase antigua');
assert.ok(teaserCss.includes('clamp(32px,8.6vw,64px)') && css.includes('clamp(30px,8vw,55px)'), 'Ajustes responsive de los carteles');
console.log('Contrapeso: expediente electoral y salvaguardas de atribución PASS');
