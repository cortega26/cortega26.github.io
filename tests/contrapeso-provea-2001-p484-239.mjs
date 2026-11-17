// Regression guard for the source-audited PROVEA annex 3, row 239 extraction.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = readFileSync('public/venezuela-lab/museo/victimas/data.js', 'utf8');
const chapter = readFileSync('public/venezuela-lab/museo/victimas/2001/index.html', 'utf8');
const id = 'hermer-suarez-bravo-2001';
assert.equal(data.split(`"id":"${id}"`).length - 1, 1, 'one canonical case');
assert.equal(chapter.split(`perfil.html?id=${id}`).length - 1, 1, 'one chapter entry');
assert.match(data, /"id":"hermer-suarez-bravo-2001"[^\n]*"year":2001/);
assert.match(data, /16\.10\.01/);
assert.doesNotMatch(data.match(/\{"id":"hermer-suarez-bravo-2001"[^\n]*/)?.[0] ?? '', /"date":/);
assert.match(chapter, /158 FICHAS NOMINALES/);
assert.match(chapter, /<strong>158<\/strong>/);
assert.match(chapter, /noindex,nofollow,noarchive/);
console.log('PROVEA row 239 source guard: OK');
