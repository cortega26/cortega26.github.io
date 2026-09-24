# Roadmap — execution guide, waves & scoreboard

**Status authority is `plans/README.md`** (per-plan rows, dependencies,
rejected findings). This file is the operational view: how to execute the
active series efficiently, in what order, with which gates, and where each
plan stands.

- **Active series:** deep audit 2026-09-23, plans **042–063**, planned
  against `be975ef`.
- **Completed history (001–041):** DONE and archived — see
  `plans/README.md` series tables and `plans/archive/`.

## How to use this file

- **Operator:** work wave by wave, top to bottom. Waves are **sequential**;
  within a wave, plans execute in the listed order. Do not start a wave
  until the previous wave's exit gate holds.
- **Executor:** always read the full plan file before starting — the
  one-liners here are gates, not instructions. Honor each plan's STOP
  conditions. Update **both** this scoreboard and the plan's row in
  `plans/README.md` when a plan lands.
- **Status values:** `TODO | IN PROGRESS | DONE | BLOCKED (reason) |
  REJECTED (rationale)`.

### Execution protocol (per wave)

Waves are merged batches: **one branch/worktree per wave** is the default
(fewer setup/merge cycles, one `npm ci` + build, coherent testing). If you
prefer one dispatch per plan, keep the same order and branch per plan.

```bash
# once per wave
git worktree add /tmp/opencode/wave-N -b advisor/wave-N be975ef   # or current master
cd /tmp/opencode/wave-N && npm ci && npx --no-install astro build
```

Rules that apply everywhere:

- Never run `npm run build` in a worktree — it rewrites the committed
  `src/data/github-stats.json`. Use `npx --no-install astro build`.
- `npm test` includes built-output checks; build before running it.
- **Shared-file reconciliation:** later plans in a wave (and later waves)
  will see earlier plans' edits in shared files (`tests/run.js`,
  `deploy.yml`, `global.css`, service pages). A plan's drift check is
  *semantic*: line numbers may shift; only a real content mismatch is a
  STOP. Reconcile the excerpt and proceed.
- The operator merges each wave after the reviewer/executor gate; nothing
  in this repo pushes automatically.

### Verification commands (baseline executed at `be975ef`)

| Purpose        | Command                              | Provenance | Expected |
|----------------|--------------------------------------|------------|----------|
| Install        | `npm ci`                             | declared   | exit 0 |
| Build          | `npx --no-install astro build`       | executed   | `[build] Complete!`, 30 pages |
| Typecheck      | `npm run check`                      | executed   | 0 errors / 0 warnings / 0 hints |
| Source suite   | `node tests/run.js`                  | executed   | `All checks passed.` (218/218 baseline) |
| Built suite    | `node tests/run.js --built`          | executed   | `All checks passed.` (247/247 baseline) |
| Analytics      | `node tests/analytics-service-funnel.mjs` | executed | `77 passed, 0 failed` |
| Sitemap i18n   | `node tests/sitemap-i18n.mjs`        | executed   | `PASS` |
| HTW snapshot   | `node test-htw-snapshot.mjs`         | executed   | `en: no diff`, `es: no diff` |
| Behavioral     | `node test-behavioral.mjs`           | executed   | `PASS … 0 failures` |
| Full gate      | `npm test`                           | executed   | exit 0 |
| CSP hashes     | `node scripts/check-csp-hashes.mjs`  | executed   | `MATCH` per page |
| Links/SEO      | `node scripts/check-links-seo.js`    | executed   | `0/0/0` |
| Prod check     | `node scripts/check-production.mjs`  | executed   | `PRODUCTION CHECK: PASS` |
| Audit          | `npm audit` / `--omit=dev`           | executed   | 0 vulnerabilities |

Counts grow as waves add assertions; treat the baseline as a floor, never
a ceiling.

---

## Waves

### Wave 1 — Correctness & measurement (P1)

**Plans (in order):** `042` → `044` → `045` → `049` → `055`

| # | Plan | Why in this wave |
|---|------|------------------|
| 042 | Analytics integrity | `service_view` corruption, legacy PII, Navbar CTA |
| 044 | Recurring-data copy | live page renders automation's copy |
| 045 | Legal ISO dates | invalid schema/OG dates on 8 pages |
| 049 | Pricing assertions | replaces a heuristic that misses swapped prices |
| 055 | JSON-LD hardening | HTW schema prices drift from `pricing.ts`; unchecked lookups |

Grouping rationale: all five append to `tests/run.js` (sequential inside
one worktree), all are small, and none share production files with each
other. One worktree, one merge.

Goto:

```bash
npm run check && npm test
grep -c "priceValue: '" src/pages/en/services/web-technical-hygiene/index.astro   # 0 after 055
grep -n "querySelector('\[data-service-id\]')" public/assets/js/product-analytics.js   # no match after 042
```

Exit gate: full suite green; recurring-data pages contain no automation
markers; legal pages emit ISO dates; new pricing group catches a mutated
amount (recorded).

### Wave 2 — UI correctness & performance (P1/P2)

**Plans (in order):** `046` → `050` → `058`

| # | Plan | Why in this wave |
|---|------|------------------|
| 046 | Above-fold reveal | H1/LCP no longer gated on JS |
| 050 | Intake hardening | `page` survives reset; Formspree honeypot |
| 058 | Perf hygiene | mono preload, logo priority, preconnect, scroll bar |

Grouping rationale: `046` and `058` both edit `src/styles/global.css` and
`ServicePage.astro`; `050` edits `test-behavioral.mjs`, which `051`
(wave 3) also edits — keeping `050` before `051` in wave order makes the
import-line change trivial. Sequential inside one worktree.

Goto:

```bash
npm run check && npm test && node scripts/check-csp-hashes.mjs
grep -rn '<h1[^>]*reveal' dist --include="*.html"    # no matches after 046
grep -c 'name="_gotcha"' dist/en/index.html          # >= 1 after 050
grep -c 'formspree.io' dist/en/work/index.html       # 0 after 058
```

Exit gate: full suite green; CSP `MATCH`; behavioral second-submit case
passes (red-then-green recorded); no `<h1>` carries `reveal`.

### Wave 3 — Security, CI & test spine (P1/P2)

**Plans (in order):** `043` → `047` → `051` → `052` → `053` → `054` → `056`

| # | Plan | Why in this wave |
|---|------|------------------|
| 043 | CSP production integrity | script ordering + wider hash check + doc |
| 047 | CI hardening | least-privilege permissions + Playwright cache |
| 051 | Test hygiene | deletes legacy scripts; fixes `CLAUDE.md:11` |
| 052 | Intake attribution + CI | adds the `Contract tests` CI step |
| 053 | caseStudies invariants | extends the CI step (needs 052) |
| 054 | Root landing | extends the CI step (needs 052) |
| 056 | Script guard tests | extends the CI step (needs 052) |

Grouping rationale: every plan edits `deploy.yml`, `package.json`, or the
test entry points; executing them as one batch avoids seven separate
worktrees and keeps the CI step growing coherently. `052` must precede
`053`/`054`/`056` (they extend its step). `051` before `059` (wave 5).

Goto:

```bash
npm run check && npm test
node tests/analytics-intake-attribution.mjs && node tests/case-studies-invariants.mjs \
  && node tests/script-guards.mjs && node tests/root-language-decision.mjs
node scripts/check-csp-hashes.mjs
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const s=w.jobs.build.steps.find(x=>x.name==='Contract tests');if(!s||!s.run.includes('script-guards'))process.exit(1);console.log('CI OK')"
```

Exit gate: all contract suites green and wired into `deploy.yml`; hash
check covers all 30 pages; build job holds only `contents: read`; legacy
scripts gone; operator CSP application reported (Step 7 of 043).

### Wave 4 — Single-sourcing (P2)

**Plans (in order):** `048` → `057`

| # | Plan | Why in this wave |
|---|------|------------------|
| 048 | Names single-source | registry → services/llms/ServicesSection |
| 057 | Routes single-source | registry → 12 pages/ServicesSection |

Grouping rationale: both touch `ServicesSection.astro` (and `048` touches
`ServicePage.astro`, edited by wave 2); sequential in one worktree avoids
the cross-file merge. `044` (wave 1) also touched `services.ts` —
reconcile, don't stop.

Goto:

```bash
npm run check && npm test && node tests/sitemap-i18n.mjs && node scripts/check-links-seo.js
grep -c "Financial & Audit Tooling\|Sitios Web y Frontends" src/data/services.ts   # 0
grep -rn "const canonical = 'https://tooltician.com" src/pages/en/services src/pages/es/servicios   # no matches
```

Exit gate: sitemap `PASS`, links `0/0/0`, name/route parity tests green.

### Wave 5 — Docs & runner quality (P2/P3)

**Plans (in order):** `059` → `060`

| # | Plan | Why in this wave |
|---|------|------------------|
| 059 | Docs truth sweep | CLAUDE/README/CHANGELOG/contradictions (needs 051) |
| 060 | `run.js` quality | fail on missing reads; drop 10 vacuous skips |

Grouping rationale: both are cleanup plans with no production impact; `060`
touches `tests/run.js`, which every earlier wave also edited — last is the
cheapest place for it.

Goto:

```bash
npm test
rm -rf dist && node tests/run.js --built; echo "exit=$?"   # must be 1; then rebuild
npx --no-install astro build
grep -c "Superseded 2026-09-23" docs/tasks/tooltician-strategy-execution-plan.md   # >= 5
```

Exit gate: docs greps pass; `--built` fails without `dist/`; full suite
green after rebuild.

### Wave 6 — Direction & decisions (P3, gated)

**Plans (in order):** `061` → `062` → `063`

| # | Plan | Why in this wave |
|---|------|------------------|
| 061 | OG card spike | decision checkpoint before wiring |
| 062 | About trajectory | decision-gated design |
| 063 | Backlink runbook | operator pass, no site code |

Grouping rationale: all three are design/spike/runbook deliverables that
end at maintainer decisions; they can be executed together and closed as
DONE or BLOCKED (decision) without blocking code work.

Goto:

```bash
npm test
ls docs/tasks/og-card-decision.md docs/tasks/about-trajectory-proposal.md docs/tasks/backlink-execution-2026-09.md
```

Exit gate: deliverables exist; decisions recorded (or BLOCKED with the
question); no production file touched by an unapproved change.

---

## Scoreboard

Update after every plan. `Verified by` records the evidence (commands /
counts), not prose.

| # | Plan | Wave | Pri | Eff | Status | Verified by |
|---|------|------|-----|-----|--------|-------------|
| 042 | Analytics integrity | 1 | P1 | S | TODO | |
| 044 | Recurring-data copy | 1 | P1 | M | TODO | |
| 045 | Legal ISO dates | 1 | P1 | S | TODO | |
| 049 | Pricing assertions | 1 | P1 | S | TODO | |
| 055 | JSON-LD hardening | 1 | P1 | S | TODO | |
| 046 | Above-fold reveal | 2 | P1 | S | TODO | |
| 050 | Intake hardening | 2 | P1 | M | TODO | |
| 058 | Perf hygiene | 2 | P2 | S | TODO | |
| 043 | CSP production integrity | 3 | P1 | M | TODO | |
| 047 | CI hardening | 3 | P1 | S | TODO | |
| 051 | Test hygiene | 3 | P1 | S | TODO | |
| 052 | Intake attribution + CI | 3 | P1 | M | TODO | |
| 053 | caseStudies invariants | 3 | P1 | S | TODO | |
| 054 | Root landing | 3 | P1 | M | TODO | |
| 056 | Script guard tests | 3 | P2 | M | TODO | |
| 048 | Names single-source | 4 | P1 | M | TODO | |
| 057 | Routes single-source | 4 | P2 | M | TODO | |
| 059 | Docs truth sweep | 5 | P2 | M | TODO | |
| 060 | run.js quality | 5 | P3 | M | TODO | |
| 061 | OG card spike | 6 | P2 | M | TODO | |
| 062 | About trajectory | 6 | P3 | S | TODO | |
| 063 | Backlink runbook | 6 | P3 | S | TODO | |

Progress: **0/22 DONE** · 0 IN PROGRESS · 0 BLOCKED.

## Cross-wave dependency notes

- `052` → `053`/`054`/`056` (CI step). Same wave, order fixed.
- `051` → `059` (CLAUDE.md ownership). Wave 3 before wave 5.
- `044` → `048` (both edit `services.ts`). Wave 1 before wave 4.
- `046`/`050` → `058` (`global.css`, `ServicePage`, `site-layout.js`,
  `test-behavioral.mjs`). Same wave, order fixed.
- `043` → `047` (both edit `deploy.yml`); `047` → `052` (step insertion
  style). Same wave, order fixed.
- `048`/`057` both touch `ServicesSection.astro`; `057` also touches the 12
  service pages (wave 2 touched `ServicePage.astro` and HTW pages).
- `042` and `052` touch analytics tests in different files — parallel-safe
  if the operator splits a wave.
- Everything else is file-disjoint.

## Backlog (accepted, not yet planned)

- [x] **Orphaned component cleanup** (036/040) — DONE via plan 041.
- [ ] **Case-study depth** (direction D3) — PARKED as a personal habit, not
  code work. Blocked on a willing client; add a testimonial/case ask to the
  project closeout habit. Effort M when unblocked.
- [ ] **Per-service IntakeForm options** (007) — DATA-GATED: revisit after
  ~30 days of per-service GA4 data (~mid-October 2026). Effort S.
- [ ] **GA4-ID rotation friction** (015 Step-2 STOP) — DORMANT: the ID is
  pasted in six places in `siteDocuments.ts`; if it rotates, hand-edit or
  re-plan with a copy-approved fallback sentence. Effort S when triggered.
- [ ] **README/CLAUDE/AGENTS lane split** — OPPORTUNISTIC; plan 059 fixes
  accuracy, not the split. Fold into the next docs touch.

## Rejected (do not re-propose without new evidence)

- HTW bespoke pages → `ServicePage` migration (HIGH risk / L effort; the
  003 snapshot net holds).
- A general performance pass (four concrete items are owned by plan 058;
  no architectural win beyond them).
- Dependency migration as a project (advisories fixed 2026-09-23; hold
  TypeScript at 6.x until `@astrojs/check` widens its peer range).
- Making the link audit or CSP check CI-blocking (flake rate first).
- Server-side analytics fallback; `report-uri` for the CSP.
- Full root-gateway de-fork, HTW JSON-LD builder consolidation, wholesale
  copy-pin→snapshot migration (all deferred inside plans 054/055/060).
- `.editorconfig`/format gate (low impact at current consistency).

## Completed history (001–041)

| Series | Plans | Status |
|--------|-------|--------|
| Deep audit 2026-07-10 | 001–004 | DONE |
| GA4 migration | 006 | DONE |
| Deep audit 2026-09-16 | 007–016 | DONE |
| Trust transfer | 017–020 | DONE |
| Growth pilot | 021–023 | DONE |
| Content audit 2026-09-23 | 024–034 | DONE |
| Direction "next" audit | 035–040 | DONE |
| Reconcile harvest | 041 | DONE (merged as `be975ef`) |

Detailed records: `plans/README.md` (series tables, findings considered and
rejected) and `plans/archive/` (every plan file).
