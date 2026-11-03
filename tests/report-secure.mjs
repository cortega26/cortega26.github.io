import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const base='public/reportes/hp-pavilion-f77576d7da04c4894b90';
const expiry=Date.parse('2027-02-01T03:00:00Z');
if(!existsSync(base+'/index.html')){assert.ok(Date.now()>=expiry,'Report removed before 90 days');process.exit(0);}
const html=readFileSync(base+'/index.html','utf8'),js=readFileSync(base+'/access.js','utf8'),payload=JSON.parse(readFileSync(base+'/payload.json','utf8'));
assert.match(html,/noindex,nofollow/);assert.match(html,/access\.js/);
assert.doesNotMatch(html,/Jessica Moreno|bthmodem\.sys|30\.000 peces|\$65\.000/);
assert.doesNotMatch(js,/Jessica Moreno|7782|bthmodem\.sys/);
assert.equal(payload.id,'TT-SOP-20261103-01');assert.equal(payload.expires,'2027-02-01');assert.equal(payload.iterations,600000);
assert.match(payload.ciphertext,/^[A-Za-z0-9_-]{4000,}$/);
assert.doesNotMatch(JSON.stringify(payload),/Jessica Moreno|7782|bthmodem\.sys/);
const wf=readFileSync('.github/workflows/retire-hp-report.yml','utf8');
assert.match(wf,/git rm -f --ignore-unmatch/);assert.match(wf,/git diff --cached --quiet/);
console.log('Encrypted report invariants: PASS');
