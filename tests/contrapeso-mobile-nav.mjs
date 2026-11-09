import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const script = readFileSync(new URL('../public/venezuela-lab/app.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../public/venezuela-lab/index.html', import.meta.url), 'utf8');

// Navigation links with filters retain their existing handler; ordinary anchors close <details>.
assert.match(script, /querySelectorAll\('\[data-nav-filter\]'\)/, 'Filtered navigation handler remains present');
assert.match(script, /querySelectorAll\('\.mobile-nav a:not\(\[data-nav-filter\]\)'\)/, 'Unfiltered mobile links have a dedicated handler');
assert.match(script, /link\.closest\('details'\)/, 'Mobile navigation closes the containing details');
assert.match(script, /menu\.open\s*=\s*false/, 'Mobile menu is closed on navigation');
assert.match(script, /details\.open\s*=\s*false/, 'Filtered links also close their menu');
assert.match(home, /class="mobile-nav"/, 'Mobile navigation exists in prototype');
console.log('Contrapeso mobile navigation regression checks passed');
