# Plan 003: Add a characterization snapshot for the flagship web-technical-hygiene pages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 676bd14..HEAD -- src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro`
> If either page changed since this plan was written, that is fine — this plan
> only *captures* whatever they currently render. But if `package.json`,
> `test-*.mjs`, or `scripts/` changed, re-read the "Current state" section.
> This plan **must be executed before** any refactor of these two pages, so the
> baseline reflects the pre-refactor output.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW (adds test files only; touches no site source)
- **Depends on**: none (needs `npm run build`, which already exists; pairs well after plans/001)
- **Category**: tests
- **Planned at**: commit `676bd14`, 2026-07-10

## Why this matters

Eight of the ten service pages are 23-line wrappers over the shared
`src/components/ServicePage.astro` template (fed by `src/data/services.ts`).
The flagship **web-technical-hygiene** pair is the exception: it is hand-built,
imports `BaseLayout` directly, and is `1203` lines (EN) / `1965` lines (ES) —
and the two locales have drifted `762` lines apart. There are **no tests** on
these pages. Anyone who later migrates them onto `ServicePage` (a real but
risky future refactor — see plan note below) has no way to prove the new
output preserves the old content. This plan builds that safety net: a
characterization snapshot of the current rendered output (headings, links, form
fields, JSON-LD) that fails loudly if any of it changes. **It does not perform
the migration** — it only creates the net so the migration can be reviewed
safely later.

## Current state

- `src/pages/en/services/web-technical-hygiene/index.astro` — bespoke page:
  `<main id="main">` (line 248), one `<h1>` (line 253), 8 `<h2>` section titles
  (all carrying `reveal` classes toggled at runtime by
  `public/assets/js/site-layout.js`), an `<IntakeForm ... formId="htw-brief">`
  (line 583), and 3 `application/ld+json` blocks (lines 241–243). It imports
  `BaseLayout` directly (line 2), **not** `ServicePage`.
- `src/pages/es/servicios/higiene-tecnica-web/index.astro` — the Spanish
  counterpart, structurally similar but larger.
- The `<h2>`s use IntersectionObserver-driven `reveal` → `visible` classes, so
  capturing raw `class` attributes or computed styles would be
  viewport-dependent and flaky. This plan instead captures only **static
  semantic fields** — page title, canonical, heading *text*, link hrefs, form
  field *names*, and JSON-LD — none of which the page's runtime scripts mutate
  (`intake-form.js` only sets a hidden field's `value` *property*;
  `site-layout.js` only toggles classes). So the fingerprint is deterministic
  with JavaScript left enabled.
- Existing test convention: root-level `test-*.mjs` scripts run directly with
  `node`, `import { chromium } from 'playwright'`. `playwright` resolves
  (`node_modules/playwright/`) and browsers are already cached locally. Follow
  this pattern (plain node script, no test runner).
- `dist/` is produced by `npm run build` and already contains
  `dist/en/services/web-technical-hygiene/index.html`.

## Commands you will need

| Purpose                | Command                     | Expected on success                    |
|------------------------|-----------------------------|----------------------------------------|
| Build the site         | `npx astro build`           | exit 0, writes `dist/`                 |
| Generate the baseline  | `node test-htw-snapshot.mjs --update` | writes 2 snapshot JSON files |
| Run the check          | `npm run test:htw`          | exit 0, `no diff`                      |
| (if browsers missing)  | `npx playwright install chromium` | downloads the browser            |

> Use `npx astro build`, **not** `npm run build`, throughout this plan.
> `npm run build` also runs `scripts/fetch-github-stats.js`, which rewrites
> `src/data/github-stats.json` from the live GitHub API — an unrelated
> side-effect that would dirty a file outside this plan's scope. `npx astro
> build` renders `dist/` without the fetch.

## Scope

**In scope** (create these files; modify only `package.json` for the script):
- `test-htw-snapshot.mjs` (create) — the snapshot harness.
- `tests/snapshots/htw-en.json` (create) — generated baseline, committed.
- `tests/snapshots/htw-es.json` (create) — generated baseline, committed.
- `package.json` — add one `test:htw` script.

**Out of scope** (do NOT touch):
- `src/pages/en/services/web-technical-hygiene/index.astro` and
  `src/pages/es/servicios/higiene-tecnica-web/index.astro` — this plan
  characterizes them; it must not change them. **Do not start the migration to
  `ServicePage`.**
- `ServicePage.astro`, `services.ts` — untouched.
- The other `test-*.mjs` scripts and CI (`deploy.yml`) — do not wire this into
  CI in this plan.

## Git workflow

- Branch: `advisor/003-htw-characterization`
- One commit; Conventional Commits style, e.g.
  `test(htw): add characterization snapshot for flagship service pages`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Build the site

```bash
npx astro build
```

**Verify**: exit 0 and `ls dist/en/services/web-technical-hygiene/index.html dist/es/servicios/higiene-tecnica-web/index.html` lists both files.

### Step 2: Create the snapshot harness

Create `test-htw-snapshot.mjs` at the repo root with exactly this content:

```js
// Characterization snapshot for the flagship web-technical-hygiene pages.
// Loads the BUILT html and captures a SEMANTIC fingerprint — page title,
// canonical, heading text, link hrefs, form field names, and JSON-LD. These
// are all static: the page's runtime scripts only toggle reveal/visible
// classes and set a hidden field's value property, none of which appear in the
// fingerprint, so the snapshot is deterministic (JS left enabled). Run with
// --update to (re)generate the committed baseline; run without it to check drift.
//
//   node test-htw-snapshot.mjs --update   # regenerate baseline
//   node test-htw-snapshot.mjs            # fail (exit 1) on any drift
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const UPDATE = process.argv.includes('--update');
const SNAP_DIR = resolve('tests/snapshots');

const PAGES = [
  { lang: 'en', file: 'dist/en/services/web-technical-hygiene/index.html' },
  { lang: 'es', file: 'dist/es/servicios/higiene-tecnica-web/index.html' },
];

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function fingerprint(page, fileAbs) {
  await page.goto(pathToFileURL(fileAbs).href, { waitUntil: 'domcontentloaded' });
  return page.evaluate(() => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main');
    const texts = (sel) =>
      Array.from((main || document).querySelectorAll(sel)).map((el) => clean(el.textContent)).filter(Boolean);
    return {
      title: clean(document.title),
      canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') || null,
      headings: texts('h1, h2, h3'),
      links: Array.from((main || document).querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
      formFields: Array.from((main || document).querySelectorAll('[name]')).map((el) => el.getAttribute('name')),
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
        try { return JSON.parse(s.textContent); } catch { return { PARSE_ERROR: clean(s.textContent).slice(0, 80) }; }
      }),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

let failures = 0;
if (UPDATE && !existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

for (const { lang, file } of PAGES) {
  const fileAbs = resolve(file);
  if (!existsSync(fileAbs)) {
    console.error(`✗ ${lang}: built file missing (${file}) — run 'npm run build' first`);
    failures++;
    continue;
  }
  const current = await fingerprint(page, fileAbs);
  const snapPath = resolve(SNAP_DIR, `htw-${lang}.json`);

  if (UPDATE) {
    writeFileSync(snapPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
    console.log(`✓ ${lang}: baseline written → ${snapPath} (${current.headings.length} headings, ${current.links.length} links, ${current.jsonLd.length} json-ld)`);
    continue;
  }

  if (!existsSync(snapPath)) {
    console.error(`✗ ${lang}: no baseline at ${snapPath}. Run: node test-htw-snapshot.mjs --update`);
    failures++;
    continue;
  }
  const baseline = JSON.parse(readFileSync(snapPath, 'utf8'));
  const a = JSON.stringify(baseline);
  const b = JSON.stringify(current);
  if (a === b) {
    console.log(`✓ ${lang}: no diff (${current.headings.length} headings)`);
  } else {
    failures++;
    console.error(`✗ ${lang}: OUTPUT CHANGED vs baseline. Per-field diff:`);
    for (const key of Object.keys(baseline)) {
      if (JSON.stringify(baseline[key]) !== JSON.stringify(current[key])) {
        console.error(`  • ${key} changed`);
      }
    }
    console.error('  If the change is intentional, re-run with --update and commit the new baseline.');
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
```

**Verify**: `node -e "require('fs').accessSync('test-htw-snapshot.mjs')" && echo ok` → prints `ok`.

### Step 3: Add the npm script

Add to the `scripts` block in `package.json` (keep alphabetical-ish grouping
with any `test:*` scripts from plan 001):

```json
    "test:htw": "node test-htw-snapshot.mjs",
```

**Verify**: `node -e "if(!require('./package.json').scripts['test:htw'])process.exit(1);console.log('ok')"` → prints `ok`.

### Step 4: Generate the committed baseline

```bash
node test-htw-snapshot.mjs --update
```

**Verify**: exits 0 and both `tests/snapshots/htw-en.json` and
`tests/snapshots/htw-es.json` now exist and are non-empty:
`node -e "const f=require('fs');for(const l of['en','es']){const j=JSON.parse(f.readFileSync('tests/snapshots/htw-'+l+'.json'));if(!j.headings.length||!j.jsonLd.length)process.exit(1);}console.log('baselines ok')"` → prints `baselines ok`

> If either page yields `0` headings or `0` json-ld, the selector or the built
> path is wrong — STOP and report (do not commit an empty baseline).

### Step 5: Prove the check passes against an unchanged build, then prove it catches drift

```bash
npm run test:htw
```

**Verify**: exits 0 and prints `✓ en: no diff` and `✓ es: no diff`.

Then confirm it actually detects changes (do NOT leave this edit in place):
temporarily edit one heading in
`src/pages/en/services/web-technical-hygiene/index.astro` (e.g. append ` X` to
the `<h1>` on line ~253), run `npx astro build && npm run test:htw`, and confirm
it now **exits 1** with `✗ en: OUTPUT CHANGED`. Then **revert** the edit
(`git checkout -- src/pages/en/services/web-technical-hygiene/index.astro`),
rebuild (`npx astro build`), and confirm `npm run test:htw` is green again.

**Verify**: the drift run exited 1; after revert + rebuild, `npm run test:htw`
exits 0. `git status` shows no changes under `src/`.

## Test plan

- The deliverable *is* the test. The two committed baselines
  (`tests/snapshots/htw-*.json`) are the characterization records.
- Coverage captured per page: page title, canonical URL, all h1/h2/h3 text,
  all in-page link hrefs, all form field names, and all JSON-LD blocks.
- Step 5 is the meta-test: it proves the harness is green on no-change and red
  on a deliberate content change (then reverted).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test-htw-snapshot.mjs` exists at repo root
- [ ] `tests/snapshots/htw-en.json` and `tests/snapshots/htw-es.json` exist,
      each with non-empty `headings` and `jsonLd`
- [ ] `package.json` has a `test:htw` script
- [ ] `npm run test:htw` exits 0 against the unchanged build
- [ ] The Step 5 drift test exited 1 on a temporary heading change, and the
      change was reverted (no `src/` changes remain in `git status`)
- [ ] Only `test-htw-snapshot.mjs`, `tests/snapshots/*.json`, and
      `package.json` are added/modified (`git status`)
- [ ] `plans/README.md` status row for 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `playwright` cannot be imported or no browser is available and
  `npx playwright install chromium` fails.
- Either built page produces `0` headings or `0` JSON-LD blocks (selector/path
  mismatch — do not commit an empty or partial baseline).
- The snapshot for a page is enormous/unstable across two consecutive
  `--update` runs on the same build (indicates non-determinism in the captured
  fields) — report before committing.
- You are tempted to "just also do" the ServicePage migration — that is
  explicitly a different, higher-risk task and out of scope here.

## Maintenance notes

For the human/agent who owns this after the change lands:

- **This net exists specifically for the future migration** of the flagship
  web-technical-hygiene pages onto `src/components/ServicePage.astro`. That
  migration is real debt but was assessed HIGH risk / L effort and deferred:
  the bespoke page carries richer content than the current 23-line-wrapper
  template exposes, so the migration means *extending* `ServiceContent` in
  `src/data/services.ts`, not a mechanical move. When that migration happens,
  run `npm run test:htw` before and after; a green result means the rendered
  content survived. Any diff must be reviewed field-by-field and, if
  intentional, re-baselined with `--update`.
- The EN/ES 762-line drift is the thing to watch: the migration is also the
  opportunity to reconcile the two locales onto one template + two content
  records.
- The baseline is intentionally *semantic* (text/links/fields/JSON-LD), not a
  byte-for-byte HTML diff, so cosmetic class/whitespace changes from a template
  swap won't create noise — only content changes fail the check.
- If you later want this in CI, note it needs `npx playwright install chromium`
  and a prior `npm run build`; that wiring was deferred (see plan 001's notes).
