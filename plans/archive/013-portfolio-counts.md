# Plan 013: Generate portfolio impact lines from stats (fix ES drift)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- src/components/PortfolioSection.astro src/data/github-stats.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (complements Plan 012; neither blocks the other)
- **Category**: tech-debt
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

Portfolio project `impact` lines hardcode star/fork counts (`★ 58`,
`12 stars · 3 forks`) that `enrichProjects` then regex-replaces at render
time from `github-stats.json` (live: chile-hub 79 stars, 10 forks). The
source copy is therefore ALWAYS wrong, the regexes are fragile
(locale-specific `stars`/`estrellas` patterns), and the Spanish entries mix
languages (`12 estrellas · 3 forks`). Generating the count-bearing lines
from the stats — the way `chile-hub` already is — removes the drift class
entirely instead of patching individual strings.

## Current state

The facts the executor needs, inlined — `src/components/PortfolioSection.astro`:

- `repoMap` (`lines 474-485`) maps project `id` → GitHub repo name:
  `ebano→elrincondeebano`, `portfolio-manager-unified→portfolio-manager-server`,
  `chile-hub`, `monedario→tuplatainforma`, `stop-spam-linkedin`,
  `conciliador→conciliador_bancario`, `rutificador`, `dnspect→DNSpect`,
  `polla`, `noticiencias`.
- `enrichProjects` (lines 487-560): reads `stats` per repo; the chile-hub
  branch (lines 501-507) REPLACES impact+proof from stats; the generic branch
  (lines 508-514) regex-swaps counts inside the hardcoded string:
  ```
  const starWord = currentLang === 'en' ? 'stars' : 'estrellas';
  const forkLabel = `${forks} fork${forks !== 1 ? 's' : ''}`;
  newImpact = newImpact
    .replace(new RegExp(`\\d+\\s+${starWord}`), `${stars} ${starWord}`)
    .replace(/\d+\s+forks?/, forkLabel);
  ```
- Star/fork evidence chips (lines 519-551) are already fully generated
  (upsert by `type`) — the CORRECT pattern to extend.
- Offending hardcoded strings: EN `projectsEN` — `★ 58 stars · ...`
  (chile-hub line 82), `12 stars · 3 forks` (rutificador line 166),
  `5 stars · 1 fork` (polla line 202); ES `projectsES` — `★ 58 estrellas`
  (line 289), `12 estrellas · 3 forks` (line 373), `5 estrellas · 1 fork`
  (line 410). Note the ES lines embed the English noun `fork(s)`.
- Deliberate vocabulary verdict (advisor decision, do NOT relitigate):
  `fork(s)` is kept as an untranslated industry loanword in BOTH locales
  (matches GitHub's own UI and the existing EN copy); `stars` ↔ `estrellas`
  stays translated. The bug being fixed is COUNT DRIFT + regex fragility,
  not the loanword.
- Convention: `filterLabels[lang]`-style locale branching already in file;
  `astro check` runs with `noUncheckedIndexedAccess` (index carefully).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline (see note) |
| Build | `npm run build` | declared | exit 0 |

Note: Plan 009 (suite rewrite) asserts on some of these exact strings
(`D4` order, impact copy). Read Plan 009's status from `plans/README.md`
first: if DONE, update the affected assertions in `tests/run.js` as part of
Step 3 (test-only follow-up, allowed here ONLY for assertions this plan
invalidates — list each one in the commit message).

## Scope

**In scope** (the only files you should modify):
- `src/components/PortfolioSection.astro` — generate count-bearing impact
  lines; remove hardcoded counts.
- `tests/run.js` — ONLY IF Plan 009 is DONE and only the assertions this
  plan's copy changes invalidate.

**Out of scope** (do NOT touch):
- `src/data/github-stats.json` values (Plan 012 owns the fetch).
- Proof/summary/problem/solution copy — only `impact` lines with embedded
  counts change.
- `portfolioJsonLd` in `src/pages/en|es/index.astro` (count-free already).
- Translating `fork(s)` — settled above as loanword.

## Git workflow

- Branch: `advisor/013-portfolio-counts`
- Commit as one unit (plus optional second test-only commit if Plan 009 is
  DONE); conventional commits (e.g. `fix(portfolio): generate impact counts from github stats`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`node tests/run.js` → record counts. Read `plans/README.md` for Plan 009
status (DONE or not — determines Step 3).

**Verify**: baseline recorded; 009 status known.

### Step 1: Replace hardcoded counts with generated impact lines

In `src/components/PortfolioSection.astro`:

1. Change the hardcoded count segments in `projectsEN`/`projectsES` to
   count-free base strings that name the KIND but not the NUMBER, e.g. EN
   rutificador impact → `Published on PyPI · GitHub stars & forks` is
   FORBIDDEN (vague). Instead: keep the full sentence shape but with a
   `{stars}`/`{forks}`-style placeholder the generator fills — simplest
   correct approach: extend the chile-hub pattern. For EVERY project with a
   `repoMap` entry, build impact in `enrichProjects` from stats:
   - EN: `` `★ ${stars} stars · ${forks} fork${forks !== 1 ? 's' : ''} · <suffix>` ``
     where `<suffix>` is a new static per-project field (e.g. rutificador:
     `Published on PyPI`; polla: `Recurring production pipeline`).
   - ES: `` `★ ${stars} estrellas · ${forks} fork${forks !== 1 ? 's' : ''} · <suffix-es>` ``.
   Add a `suffix`/`suffixEs`-style static field (name it `impactSuffix` +
   keep both locales in the two arrays, mirroring the existing EN/ES array
   pattern) and DELETE the numeric literals from source.
2. Projects WITHOUT meaningful counts (0 stars/0 forks, e.g. private
   `tuplatainforma`, `elrincondeebano`): keep their existing static impact
   strings untouched (no fake `★ 0` lines). The generator must skip
   zero-count repos for impact (chips already handle this: only added when
   `stars > 0` / `forks > 0`).
3. DELETE the generic regex branch (lines 508-514) once no hardcoded counts
   remain; keep the chile-hub-style generation as the single path.
4. The `(githubStats as any)` cast at line 492: replace with a typed lookup
   (`Record<string, { stars: number; forks: number }>`). This is a
   no-behavior type-hygiene fix in the touched function — allowed.

**Verify**: `npm run check` → exit 0; `grep -n "★ 58\|12 stars\|12 estrellas\|5 stars\|5 estrellas" src/components/PortfolioSection.astro` → no matches.

### Step 2: Confirm rendered output

1. `npm run build` → exit 0.
2. `grep -o "★ [0-9]* stars" dist/en/index.html | sort -u` shows live counts
   (chile-hub 79 at plan time — read CURRENT `github-stats.json`, don't
   assume); ES page shows `estrellas` with the same numbers.
3. `grep -o "[0-9]* fork" dist/es/index.html` → loanword present, numbers
   match `github-stats.json`; no `estrellas.*forks` MIX is introduced beyond
   the settled loanword pattern (i.e. `12 estrellas · 3 forks` shape with
   LIVE numbers).
4. `node tests/run.js` → failure set identical to Step 0 baseline, EXCEPT
   assertions that read the changed impact strings (list them; they are fixed
   in Step 3 iff Plan 009 is DONE — otherwise they were already failing at
   baseline and stay failing, which is EXPECTED pre-009).

**Verify**: checks above hold.

### Step 3 (conditional): update invalidated suite assertions

ONLY if Plan 009 status is DONE: update in `tests/run.js` the assertions
that read the exact impact strings changed in Step 1 (e.g. any `★ 58` /
`12 stars` literals), following Plan 009's own conventions. If Plan 009 is
NOT done, skip this step entirely (the suite is already red; Plan 009 will
absorb these strings when it runs — note that in the commit message).

**Verify**: `node tests/run.js` failure set is (baseline − fixed) or
unchanged; NEVER worse than baseline.

## Test plan

- `npm run check` (type safety incl. `noUncheckedIndexedAccess` on the new
  lookup) + build-output greps (Step 2) + suite baseline comparison.
- Pattern: existing `D4` order assertions in `tests/run.js` (project-id
  order) remain valid — do not touch project ORDER.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check` exits 0
- [ ] No hardcoded star/fork numerals remain in `PortfolioSection.astro` (grep)
- [ ] Built EN/ES pages show live counts from `github-stats.json`
- [ ] `node tests/run.js` is no worse than the Step 0 baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only `src/components/PortfolioSection.astro` (+ `tests/run.js` iff Step 3 ran)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The file doesn't match "Current state" (drift — e.g. counts already
  regenerated differently).
- Any project's rendered impact would newly show `★ 0` / `0 forks`
  (zero-count guard missing — fix the guard, don't ship zeros).
- Plan 009 is DONE but its assertions can't be found where expected (drift
  in `tests/run.js`) — report, don't invent new assertion styles.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Counts now refresh with the daily stats build automatically — no copy edit
  needed when a repo gains stars. Never hand-write a number into an `impact`
  line again; put static context in the new suffix field.
- `fork(s)` stays English in ES copy BY DECISION (loanword, GitHub UI
  parity). If a native speaker objects, the single place to change it is the
  generator's ES template — one line, both locales consistent.
- **Deferred:** nothing. This plan fully closes its finding.
