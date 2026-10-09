#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { casesByLocale, repoMap, groupOrder } from '../src/data/caseStudies.ts';
import { routeGroups } from '../src/data/routes.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
const failures = [];
const assert = (name, condition, detail = '') => {
  if (condition) { console.log(`  ✓  ${name}`); passed++; }
  else { console.log(`  ✗  ${name}${detail ? `\n       → ${detail}` : ''}`); failed++; failures.push(name); }
};

const validPaths = new Set(routeGroups.flatMap((g) => Object.values(g.paths)));
const monthRe = /^\d{4}-(0[1-9]|1[0-2])$/;
const statsKeys = Object.keys(JSON.parse(readFileSync(join(ROOT, 'src/data/github-stats.json'), 'utf8')));

for (const lang of ['en', 'es']) {
  const cases = casesByLocale[lang];
  for (const c of cases) {
    assert(`${lang}/${c.id}: verifiedAt is YYYY-MM`, monthRe.test(c.verifiedAt), c.verifiedAt);
    assert(`${lang}/${c.id}: serviceHref is a known localized path`, validPaths.has(c.serviceHref), c.serviceHref);
    assert(`${lang}/${c.id}: role is non-empty`, typeof c.role === 'string' && c.role.trim().length > 0);
    assert(`${lang}/${c.id}: group is known`, groupOrder.includes(c.group), c.group);
  }
}

const ids = (lang) => casesByLocale[lang].map((c) => c.id).sort();
assert('EN/ES case id sets match', JSON.stringify(ids('en')) === JSON.stringify(ids('es')), `${ids('en')} vs ${ids('es')}`);
const groups = (lang) => casesByLocale[lang].map((c) => `${c.id}:${c.group}`).sort();
assert('EN/ES group assignment matches', JSON.stringify(groups('en')) === JSON.stringify(groups('es')));
const featured = (lang) => casesByLocale[lang].filter((c) => c.featured).map((c) => c.id).sort();
assert('EN/ES featured sets match', JSON.stringify(featured('en')) === JSON.stringify(featured('es')));

const caseIds = casesByLocale.en.map((c) => c.id).sort();
assert('repoMap keys are case ids', JSON.stringify(Object.keys(repoMap).sort()) === JSON.stringify(caseIds), `repoMap keys=${Object.keys(repoMap).sort()} caseIds=${caseIds}`);
assert('repoMap values match github-stats.json keys', JSON.stringify(Object.values(repoMap).sort()) === JSON.stringify(statsKeys.sort()), `repoMap values=${Object.values(repoMap).sort()} stats=${statsKeys.sort()}`);

// A featured engineering story must be reachable in both languages from its
// corresponding work card, with its route registered for hreflang and sitemap.
const storyRoute = routeGroups.find((group) => group.id === 'case-study:chile-hub');
assert('chile-hub story has bilingual route', Boolean(storyRoute?.paths.en && storyRoute?.paths.es));
for (const lang of ['en', 'es']) {
  const item = casesByLocale[lang].find((entry) => entry.id === 'chile-hub');
  const localizedPath = storyRoute?.paths[lang];
  assert(`${lang}: chile-hub card links to localized case study`,
    Boolean(item?.links.some((link) => link.href === localizedPath)));
}

console.log(`\nResults: ${passed}/${passed + failed} passed`);
if (failed) { console.log('\nFailed:'); failures.forEach((f) => console.log('  • ' + f)); process.exit(1); }
console.log('All checks passed.');
