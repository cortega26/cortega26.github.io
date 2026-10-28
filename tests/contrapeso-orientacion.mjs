import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const prototype = join(root, 'public/venezuela-lab');
const read = (path) => readFileSync(join(root, path), 'utf8');
const charter = read('docs/editorial/contrapeso-principios.md');
const manual = read('docs/editorial/contrapeso-manual.md');
const contracts = read('docs/editorial/contrapeso-contratos-publicacion.md');
const method = read('public/venezuela-lab/metodo/index.html');

for (const doc of [charter, manual, contracts]) {
  assert.ok(doc.includes('libertad individual') || doc.includes('Libertad individual'), 'Libertad individual en normas');
  assert.ok(doc.includes('propiedad privada') || doc.includes('Propiedad privada'), 'Propiedad privada en normas');
  assert.ok(doc.includes('control del poder') || doc.includes('Control del poder') || doc.includes('control institucional del poder'), 'Control del poder en normas');
}
assert.ok(method.includes('id="orientacion"'), 'El método publica la orientación editorial');

const pages = readdirSync(prototype, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => join(entry.parentPath, entry.name));
assert.ok(pages.length >= 10, 'El barrido cubre 10 páginas HTML incluido perfil.html');

for (const file of pages) {
  const source = readFileSync(file, 'utf8');
  assert.ok(source.includes('name="robots" content="noindex,nofollow,noarchive"'), 'Robots: ' + file);
  if (!file.endsWith('/metodo/index.html')) {
    assert.ok(
      source.includes('href="/venezuela-lab/metodo/"') ||
        source.includes('href="/venezuela-lab/metodo/#orientacion"'),
      'Enlace a método: ' + file,
    );
  }
  if (process.argv.includes('--built')) {
    const builtPath = file.replace(prototype, join(root, 'dist/venezuela-lab'));
    const built = readFileSync(builtPath, 'utf8');
    assert.ok(built.includes('name="robots" content="noindex,nofollow,noarchive"'), 'Robots en build: ' + file);
  }
}

assert.ok(read('public/venezuela-lab/actualidad/regreso-machado-2026/index.html').includes('controles independientes'), 'Noticia: revisión institucional');
assert.ok(read('public/venezuela-lab/explicadores/actas-28j-2024/index.html').includes('control del poder electoral'), '28J: control del poder');
assert.ok(read('public/venezuela-lab/explicadores/sentencias-155-156-2017/index.html').includes('separación de poderes'), 'TSJ: separación de poderes');
assert.ok(contracts.includes('aplica con evidencia / no aplica / requiere investigación'), 'Contrato de revisión por principio');
assert.ok(manual.includes('registros dinámicos'), 'Fichas individuales pendientes de revisión factual');
console.log('Contrapeso orientación editorial: principios, enlaces y robots PASS');
