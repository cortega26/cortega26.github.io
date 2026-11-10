import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const index = readFileSync(join(root, 'public/venezuela-lab/museo/victimas/index.html'), 'utf8');
const fallback = index.match(/<div id="cases"[^>]*>([\s\S]*?)<\/div>/)?.[1];
assert.ok(fallback, 'Existe el contenedor de casos');
assert.match(fallback, /requiere JavaScript/, 'El fallback explica su límite');
for (const year of [1999, 2000, 2001, 2002, 2003]) {
  const href = `/venezuela-lab/museo/victimas/${year}/`;
  assert.ok(fallback.includes(`href="${href}"`), `Fallback enlaza capítulo ${year}`);
  assert.ok(existsSync(join(root, `public${href}index.html`)), `Capítulo ${year} existe`);
}
assert.match(index, /name="robots" content="noindex,nofollow,noarchive"/, 'Prototipo no indexable');
assert.ok(!index.includes('2002 · CINCO VÍCTIMAS DOCUMENTADAS EN ACARIGUA'), 'Rótulo anual no se limita a un episodio');
console.log('Contrapeso memorial fallback: PASS');
