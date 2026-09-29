# Plan 060: Make the source suite fail on missing reads, remove vacuous built skips, and drop duplicated pins

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- tests/run.js`
> The file HAS changed since this plan was written (wave 1 appended the
> PRICING, H-13, H-14 and 055 groups). That drift is reconciled below —
> do NOT treat it as a STOP. Compare the "Current state" excerpts against
> the live code (they were re-verified 2026-09-28); on any FURTHER mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (drops some regression pins; do not drop more than listed)
- **Depends on**: none (plan 041 already removed the `proof()` helper)
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23
- **Reconciled**: 2026-09-28 at HEAD `25fd78f` — skip sites 10→15
  (wave-1 groups), baselines re-measured 361/361 + 390/390, S0 pins
  relocated, funnel baseline 77→82. Reconcile log: `plans/README.md`.

## Why this matters

`tests/run.js` has three self-inflicted weaknesses:

1. **Vacuous built checks.** Fifteen sites read `dist/` and, when a file is
   missing, emit `assert('… (skipped — run --built)', true)` — a *passing*
   assertion, even under `--built`. A missing build should fail. Eleven
   sites use a return-guard shape, two (H-12, H-11-root) an if/else shape,
   and two (PRICING EN/ES) a per-page `continue` loop shape. (The
   `if (BUILT)` preamble block at `:755-899` already asserts dist
   existence and fails cleanly — it needs NO changes; the templates below
   deliberately mirror its existence-assert pattern.)
2. **Silent source reads.** Helpers coerce missing files to `''`
   (`const hero = () => read(...) || ''`), so an assertion like
   "hero does not contain X" passes vacuously if the file is renamed.
   `rootHTML()` reads a repo-root `index.html` that does not exist, making
   its J1 assertion dead.
3. **Duplicated contract pins.** The `S0` group re-asserts by substring
   what `tests/analytics-service-funnel.mjs` proves by executing the code
   (event vocabulary, track allowlist, intake lifecycle). Two copies drift.

## Current state (re-verified 2026-09-28 at HEAD `25fd78f`)

Skip sites (all fifteen — `grep -n "skipped — run --built" tests/run.js`):

| Line | Group | Shape |
|------|-------|-------|
| 731 | I8b · JSON-LD parse | return-guard |
| 904 | H-04 · pricing | return-guard (2 vars) |
| 963 | PRICING · EN loop | per-page `continue` |
| 970 | PRICING · ES loop | per-page `continue` |
| 981 | H-13 · recurring-data copy | return-guard (2 vars) |
| 1058 | H-03 · accessible names | return-guard (2 vars), mixed group — source asserts precede |
| 1107 | H-12 · guide CTAs | if/else, mixed group — source asserts precede |
| 1123 | H-06 · case studies | return-guard (2 vars), mixed group — source asserts precede |
| 1145 | H-05 · root landing | return-guard |
| 1181 | H-09 · heading outline | return-guard (array) |
| 1229 | H-08 · hub | return-guard (2 vars), mixed group — source asserts precede |
| 1261 | H-11 · schema | return-guard (array) |
| 1305 | H-11 · root schema | if/else |
| 1430 | H-14 · ISO dates | return-guard (first-of-list) |
| 1460 | 055 · JSON-LD guards | return-guard (6 vars) |

Helper pattern (`:44-62`), e.g. `:44` `const hero = () => read('src/components/HeroSection.astro') || '';`
and `:56` `const rootHTML   = () => read('index.html') || '';` — the root
`index.html` does not exist (J1 at `:683-688` uses it).

`read()` at `:20-24` returns `null` for a missing file (`existsSync`
guard) — so `readRequired` can distinguish missing from empty.

Duplicated S0 assertions (`:1336-1346`, locate by assertion name — Steps 1-3
shift line numbers): "canonical layer uses service/lead events only",
"track.js passes service params through", "track.js carries no tool_*
params", "track.js keeps legacy tt_* mapping", "intake mirrors brief
lifecycle", "intake keeps legacy form_* events".
The unique pins to keep: registry parse/ids/routes, BaseLayout script order
+ GA4 stub bytes, ServicePage stamps/HTW scope/gateway wiring, and the
Navbar CTA pin (`:1361`, "Navbar CTA carries brief intent with navbar
placement", added by 042 after this plan was written — **explicit keep**,
it proves the 042 stamp and the funnel does not).

## Commands you will need

| Purpose       | Command                        | Provenance | Expected on success |
|---------------|--------------------------------|------------|---------------------|
| Install       | `npm ci`                       | declared   | exit 0 |
| Build         | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Source suite  | `node tests/run.js`            | executed   | `All checks passed.` |
| Built suite   | `node tests/run.js --built`    | executed   | `All checks passed.` |
| Full tests    | `npm test`                     | executed   | exit 0 |

## Scope

**In scope**: `tests/run.js`, `plans/README.md` (status row).
**Out of scope**:
- `tests/analytics-service-funnel.mjs` and the other suites — unchanged.
- The string-pin content assertions beyond the S0 duplicates (a wholesale
  migration to snapshots is deferred).

## Git workflow

- Branch: `advisor/060-runjs-quality`
- Conventional commits, e.g. `test(runner): fail on missing reads, drop vacuous built skips, dedupe S0`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline and count record

`npm ci` → `npx --no-install astro build` → `node tests/run.js` →
`node tests/run.js --built`. Record both counts (expected 361/361 and
390/390 at HEAD `25fd78f` with a fresh build, plus any assertions added by
earlier plans in this series).

**Verify**: both green; record the counts in your report. Always run the
suites with `dist/` freshly built — a stale `dist/` makes built-content
asserts fail for reasons unrelated to this plan.

### Step 1: Replace the fifteen vacuous skips

Three shapes, three templates. In every case the effect is the same:
source mode skips silently (no fake pass); `--built` fails when the
artifact is missing.

**Shape A — return-guard** (731, 904, 981, 1058, 1123, 1145, 1181, 1229,
1261, 1430, 1460). Change the guard to:

```js
if (!BUILT) return;
const esHome = read('dist/es/index.html');
assert('[built] dist/es/index.html exists', !!esHome, 'run npm run build first');
if (!esHome) return;
```

Rules:
- Place `if (!BUILT) return;` immediately before the FIRST `read('dist…`
  of the group — NOT at group top. Four groups (H-03, H-06, H-08, H-12)
  run source asserts before their dist reads; those must keep running in
  source mode.
- For multi-variable guards (H-04, H-13, H-11-work, 055, H-03, H-06,
  H-08, H-09-array), assert EVERY guarded variable's existence, then one
  combined `if (!a || !b) return;`. Asserting only the first file lets a
  missing second file crash on `.includes` instead of failing cleanly.
  (H-14 is in the site list for guard placement but uses the Special-case
  template below instead of this plain form.)
- H-11 needs only ONE `if (!BUILT) return;` (before the workPages section
  at ~1261); it covers the root section too. Convert both skips (1261,
  1305) to existence-fails — the `if (!BUILT) return;` inside the 1305
  block is then redundant but harmless; keep it for symmetry or drop it.

**Shape B — if/else** (1107 H-12, 1305 H-11-root). Invert the else branch
into an existence failure, keeping the structure:

```js
if (!BUILT) return;
const built = guideSlugs.map((slug) => read(`dist/es/guias/${slug}/index.html`));
const missing = guideSlugs.filter((_, i) => !built[i]);
assert('[built] guide pages exist', missing.length === 0, `missing: ${missing.join(', ')} — run npm run build first`);
if (missing.length) return;
built.forEach((html, index) => {
  // …unchanged asserts…
});
```

Same for the H-11-root block (`if (root)` → existence assert on `root`
+ early return; the two schema asserts unchanged).

**Shape C — per-page loop** (963 PRICING-EN, 970 PRICING-ES). NEVER paste
`return` here — it aborts the whole group instead of skipping one page.
Convert to:

```js
for (const [key, path] of Object.entries(enPages)) {
  if (!BUILT) continue;
  const html = read(path);
  assert(`[built] ${path} exists`, !!html, 'run npm run build first');
  if (!html) continue;
  enPatterns(amounts[key].en).forEach((pattern) => {
    // …unchanged asserts…
  });
}
```

Same for the ES loop. In `--built` with a missing page this fails that
page loudly and still checks the rest.

**Special case — H-14** (1430): the guard checks only `pages[0]` but the
loop reads every `rel` in `pages` (with `|| ''`, so a missing later page
fails its asserts without crashing). Assert the whole list up front:

```js
if (!BUILT) return;
const missing = pages.filter(({ rel }) => !read(rel)).map(({ rel }) => rel);
assert('[built] legal pages exist', missing.length === 0, `missing: ${missing.join(', ')} — run npm run build first`);
if (missing.length) return;
const first = read(pages[0].rel);
```

then the unchanged loop.

**Line-number note for Steps 2-4:** Step 1 inserts ~40 lines, so every
`:line` cited below refers to pre-Step-1 HEAD. Locate targets by the
quoted strings (all verified unique by grep) — e.g. `const rootHTML`,
`['index.html (root)', rootHTML()]`, the six S0 assertion names — not by
line number.

**Verify**:

```bash
grep -c "skipped — run --built" tests/run.js   # 0
node tests/run.js --built                       # green
rm -rf dist && node tests/run.js --built; echo "exit=$?"; npx --no-install astro build
```

→ `exit=1` without dist, then rebuild and confirm green again. (`dist/` is
gitignored and rebuildable.)

### Step 2: Fail on missing source files

Add next to `read()` (`:20-24`):

```js
function readRequired(relPath) {
  const content = read(relPath);
  if (content === null) throw new Error(`Required source file missing: ${relPath}`);
  return content;
}
```

Convert these helpers (`:44-62`) from `read(...) || ''` to
`readRequired(...)`: `hero`, `portfolio`, `caseStudies`, `services`,
`about`, `contact`, `footer`, `navbar`, `pageEN`, `pageES`, `astroConf`,
`indexAstro`, `layout`, `globalCss`, `siteLayoutJs`, `portfolioFiltersJs`,
`intakeForm`. Do **not** convert `creds` (its absence is asserted by G1) or
`rootHTML` (removed next).

**Verify**: `node tests/run.js` → green; then
`mv src/components/Footer.astro /tmp/Footer.astro.bak && node tests/run.js; echo "exit=$?"; mv /tmp/Footer.astro.bak src/components/Footer.astro`
→ exits non-zero with the "Required source file missing" error, then green
again.

### Step 3: Remove the dead `rootHTML` check

Delete the `rootHTML` helper (`:56`) and the `['index.html (root)', rootHTML()]`
entry in J1 (`:688`). Keep the other J1 entries.

**Verify**: `grep -c "rootHTML" tests/run.js` → 0; `node tests/run.js` green.

### Step 4: Drop the duplicated S0 pins

In the `S0` group, delete the six assertions listed in Current state
(`:1336-1346` at HEAD — **locate them by assertion name with grep, not by
line**: Steps 1-3 shift line numbers). Keep everything else in the group,
including the Navbar CTA pin (`:1361` at HEAD) — it is an explicit keep.

**Verify**: `node tests/run.js` → green with the source count reduced by
exactly 6 from the post-Step-3 count (record the Step 0→4 arithmetic in
your report: Step 1 gates built asserts out of source mode, so compare
Step 4 against post-Step-3, not against Step 0). Confirm the vm suite
still proves those contracts:
`node tests/analytics-service-funnel.mjs` → `82 passed, 0 failed`.

### Step 5: Full gate

`npm run check && npm test`

**Verify**: exit 0; built suite green; sitemap/HTW/behavioral pass.

## Test plan

No new tests; this plan strengthens the existing runner. Required
red-then-green evidence:
- `--built` without `dist/` exits non-zero (Step 1).
- A renamed source file makes `node tests/run.js` exit non-zero (Step 2).
- `analytics-service-funnel.mjs` still covers the removed S0 pins
  (Step 4).

## Done criteria

ALL must hold:

- [ ] `grep -c "skipped — run --built" tests/run.js` → 0
- [ ] `grep -c "rootHTML" tests/run.js` → 0
- [ ] `node tests/run.js` and `node tests/run.js --built` green with a build
      present; `--built` exits non-zero without `dist/`
- [ ] `node tests/analytics-service-funnel.mjs` → `82 passed, 0 failed`
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only `tests/run.js` and
      `plans/README.md`
- [ ] `plans/README.md` status row for 060 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `tests/run.js` changed BEYOND the 2026-09-28
  reconcile (wave-1 groups PRICING/H-13/H-14/055 + S0 Navbar pin). Compare
  against the Current-state excerpts above, not against `be975ef`.
- Any built group reads a file whose absence is legitimate (e.g. an
  optional page) — report the group instead of failing it.
- A group mixes source asserts before its dist reads and you are unsure
  where the `if (!BUILT) return;` goes — it goes immediately before the
  first `read('dist…`, never at group top. If in doubt, stop and report
  rather than dropping source asserts.
- Removing the S0 pins makes the source count drop by more or less than 6
  versus post-Step-3 — investigate and report.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `readRequired` is the default for must-exist sources; `read` stays for
  optional artifacts (`dist/`, retired components).
- Built groups must run only under `--built`; never reintroduce a passing
  "skipped" assertion.
- In mixed groups the `if (!BUILT) return;` sits after the source asserts,
  immediately before the first dist read. Per-page loops use `continue`,
  never `return`.
- **Deferred:** migrating the copy pins (132 `src.includes` assertions) to
  per-component snapshots — MED risk, M effort; do it group by group when
  copy churn next becomes painful.
