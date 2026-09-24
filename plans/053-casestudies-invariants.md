# Plan 053: Add data-invariant tests for case studies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/data/caseStudies.ts src/data/routes.ts src/data/github-stats.json package.json .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 052 (CI step; see Step 3 — if 052 is not DONE, add the step yourself)
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

`caseStudies.ts` feeds the work cards, the thematic groups, the per-case
CTA, and the JSON-LD. Its contract is documented but unenforced:

- `verifiedAt` must be `YYYY-MM` (`caseStudies.ts:39`), but nothing checks
  it — `'2026-13'` ships silently.
- `serviceHref` must be a localized service page (`:42-43`); a typo ships
  a 404 "Describe this problem" CTA (the link audit is informational, not
  blocking).
- `repoMap` (`:598-609`) keys must match `src/data/github-stats.json`
  keys or the ★/fork enrichment silently disappears
  (`PortfolioSection.astro:38-41`).
- EN/ES must stay structurally aligned; nothing compares the two locales.

Node 24 (the repo's engine) can import the `.ts` files directly via type
stripping — verified at `be975ef`:
`node -e "import('./src/data/caseStudies.ts').then(m=>console.log(Object.keys(m)))"`
prints `casesByLocale,filterLabels,groupLabels,groupOrder,orderedCasesForWork,repoMap`;
`routes.ts` imports the same way. (Note: `services.ts` cannot be imported
this way — it uses extensionless imports; do not try.)

## Current state (verified at `be975ef`)

`src/data/caseStudies.ts:22-46` (the contract):

```ts
  /** What Tooltician did on this project — derived from existing copy only. */
  role: string;
  /** Month the claim was last re-verified (YYYY-MM). */
  verifiedAt: string;
  group: CaseGroup;
  /** Localized service page for the "describe this problem" CTA. */
  serviceHref: string;
```

`:48` `groupOrder`; `:598-609` `repoMap`. `src/data/routes.ts:105-110`
`groupForPath` / `routeGroups` define every valid localized path.
`tests/run.js` H-06 only counts `role:`/`verifiedAt:` occurrences.

## Commands you will need

| Purpose     | Command                                          | Provenance | Expected on success |
|-------------|--------------------------------------------------|------------|---------------------|
| Install     | `npm ci`                                         | declared   | exit 0 |
| New suite   | `node tests/case-studies-invariants.mjs`         | executed   | all pass |
| Full tests  | `npm test`                                       | executed   | exit 0 |

## Scope

**In scope**:
- `tests/case-studies-invariants.mjs` (create)
- `package.json` (test chain only)
- `.github/workflows/deploy.yml` (extend the contract-test step; see Step 3)
- `plans/README.md` (status row only)

**Out of scope**:
- `src/data/caseStudies.ts` and all content — this plan adds tests only.
  If an invariant fails, STOP and report; do not fix data in this plan.
- `src/components/PortfolioSection.astro`.

## Git workflow

- Branch: `advisor/053-casestudies-invariants`
- Conventional commits, e.g. `test(work): enforce case-study data invariants`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `node -e "import('./src/data/caseStudies.ts').then(m=>console.log(Object.keys(m).length))"`
(prints a number) → `npm test`.

**Verify**: all green; the TS import works. If the import fails, STOP and
report (Node version/type-stripping assumption broken).

### Step 1: Write the invariant suite

Create `tests/case-studies-invariants.mjs`:

```js
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

assert('repoMap keys match github-stats.json keys', JSON.stringify(Object.keys(repoMap).sort()) === JSON.stringify(statsKeys.sort()), `repoMap=${Object.keys(repoMap)} stats=${statsKeys}`);

console.log(`\nResults: ${passed}/${passed + failed} passed`);
if (failed) { console.log('\nFailed:'); failures.forEach((f) => console.log('  • ' + f)); process.exit(1); }
console.log('All checks passed.');
```

**Verify**: `node tests/case-studies-invariants.mjs` → all pass. If any
invariant fails, STOP and report which case/field — do not edit the data.

### Step 2: Wire into `npm test`

In `package.json:15`, insert `node tests/case-studies-invariants.mjs`
after the analytics suites (before `node tests/run.js --built`).

**Verify**: `npm test` exits 0 and includes the new suite.

### Step 3: Wire into CI

If plan 052 is DONE, extend its step in `.github/workflows/deploy.yml`:

```yaml
      - name: Contract tests
        run: node tests/analytics-service-funnel.mjs && node tests/analytics-guard.mjs && node tests/analytics-intake-attribution.mjs && node tests/case-studies-invariants.mjs
```

If 052 is not DONE, add the step after `Source tests` with just
`node tests/case-studies-invariants.mjs`.

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const step=w.jobs.build.steps.find(s=>s.name==='Contract tests');if(!step||!step.run.includes('case-studies-invariants'))process.exit(1);console.log('ci step OK')"
```

→ `ci step OK`.

### Step 4: Full gate

`npm run check && npm test`

**Verify**: exit 0.

## Test plan

The suite itself is the test; it must run without a build or browser.
Sensitivity check: temporarily change a copy of the data? Do NOT edit
`caseStudies.ts`. Instead, verify sensitivity by reasoning + one manual
probe: run `node -e` with a mutated object in memory to confirm each
assertion shape is falsifiable, and report how you did it.

## Done criteria

ALL must hold:

- [ ] `node tests/case-studies-invariants.mjs` exits 0
- [ ] `npm test` exits 0 and includes the new suite
- [ ] Step 3's `ci step OK` one-liner prints `ci step OK`
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 053 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- Any invariant fails on the current data — report the exact case/field
  (the data is the finding, not something to patch here).
- The `.ts` import fails (Node type-stripping assumption broken).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- New case fields with invariants should extend this suite.
- `repoMap` is the enrichment contract; adding a repo to
  `scripts/fetch-github-stats.js` without adding it to `repoMap` (or vice
  versa) now fails.
- **Deferred:** asserting that every `serviceHref` page actually exists in
  `dist/` — needs a built-output run; the path-set check covers typos.
