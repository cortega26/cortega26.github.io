import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(join(root, 'public/venezuela-lab/archivo/2016-2017-cidh-separacion-poderes/index.html'), 'utf8');
const notes = readFileSync(join(root, 'public/venezuela-lab/archivo/2016-2017-cidh-separacion-poderes.md'), 'utf8');
assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/);
assert.match(html, /PROTOTIPO DOCUMENTAL/);
assert.match(html, /<h1>[^<]+<\/h1>/);
assert.match(html, /\/venezuela-lab\/metodo\//);
assert.match(html, /\/venezuela-lab\/explicadores\/sentencias-155-156-2017\//);
for (const [id, year] of [['132', '2016'], ['041', '2017']]) {
  const url = `https://www.oas.org/es/cidh/prensa/comunicados/${year}/${id}.asp`;
  assert.ok(html.includes(url), `HTML cita CIDH ${id}/${year}`);
  assert.ok(notes.includes(url), `Ficha cita CIDH ${id}/${year}`);
}
assert.match(html, /no una condena penal/);
assert.match(html, /cotejo íntegro continúa pendiente/);
assert.doesNotMatch(html, /<form\b|<script\b/i);
console.log('Contrapeso archivo CIDH: source guard PASS');
