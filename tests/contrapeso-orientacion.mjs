import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const prototype = join(root, 'public/venezuela-lab');
const read = (path) => readFileSync(join(root, path), 'utf8');
const charter = read('docs/editorial/contrapeso-principios.md');
const manual = read('docs/editorial/contrapeso-manual.md');
const contracts = read('docs/editorial/contrapeso-contratos-publicacion.md');
const method = read('public/venezuela-lab/metodo/index.html');

for (const [name, doc] of [['carta', charter], ['manual', manual], ['contratos', contracts]]) {
  assert.match(doc, /libertad individual/i, `${name}: libertad individual`);
  assert.match(doc, /propiedad privada/i, `${name}: propiedad privada`);
  assert.match(doc, /control del poder|control institucional del poder|control institucional/i, `${name}: control del poder`);
}
assert.match(method, /id="orientacion"/, 'El método publica la orientación editorial');
for (const principle of ['Libertad individual:', 'Propiedad privada:', 'Control del poder:']) {
  assert.ok(method.includes(principle), `El método publica: ${principle}`);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const path = join(dir, item.name);
    return item.isDirectory() ? htmlFiles(path) : item.name.endsWith('.html') ? [path] : [];
  });
}

const pages = htmlFiles(prototype);
assert.ok(pages.length >= 10, 'El barrido cubre las diez superficies HTML actuales, incluido perfil.html');
for (const file of pages) {
  const path = relative(prototype, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/,
    `${path}: preserva robots de prototipo`);
  if (path !== 'metodo/index.html') {
    assert.match(html, /href="\/venezuela-lab\/metodo\/(?:#orientacion)?"/,
      `${path}: enlaza a principios y rectificaciones`);
  }
  if (process.argv.includes('--built')) {
    const built = readFileSync(join(root, 'dist/venezuela-lab', path), 'utf8');
    assert.match(built, /<meta name="robots" content="noindex,nofollow,noarchive">/,
      `${path}: build preserva robots`);
  }
}

for (const [path, marker] of [
  ['public/venezuela-lab/actualidad/regreso-machado-2026/index.html', 'controles independientes'],
  ['public/venezuela-lab/explicadores/actas-28j-2024/index.html', 'control del poder electoral'],
  ['public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html', 'separación de poderes'],
]) {
  assert.ok(read(path).includes(marker), `${path}: contextualización institucional revisada`);
}
assert.match(contracts, /aplica con evidencia \/ no aplica \/ requiere investigación/i,
  'Los contratos contemplan pertinencia, inaplicabilidad y necesidad de investigación');
assert.match(manual, /registros dinámicos/i, 'La auditoría de fichas requiere revisión individual');
console.log(`Contrapeso orientación editorial: carta, método, ${pages.length} páginas, contratos y robots PASS`);
