# Plan 059: Reconcile living docs with the shipped site

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- CLAUDE.md README.md docs/CHANGELOG.md docs/analytics-sprint-0.md docs/tasks/tooltician-strategy-execution-plan.md docs/tasks/tooltician-refresh-backlog.md docs/tasks/higiene-tecnica-web-backlog.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 051 (CLAUDE.md:11), 041 (component deletions)
- **Category**: docs
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Agents and contributors orient from `CLAUDE.md` and `README.md`; the
strategy/refresh docs still contain imperative sections describing a
pre-GA4, pre-refresh site. Plan 036 re-baselined status cells but left the
operational prose reading as current instructions, and plan 041 deleted two
components still referenced by name. Acting on the stale text means
re-wiring Plausible, instrumenting obsolete events, or chasing files that
no longer exist.

## Current state (verified at `be975ef`)

**CLAUDE.md**
- `:19-23` lists 3 routes; `src/pages` has 23 `.astro` files (6 EN + 6 ES
  service pages, work, guides, legal, 404, root).
- `:27-35` lists 7 components; there are 13 (`ServicePage`, `IntakeForm`,
  `ResultsBand`, `FaqSection`, `ResourcesSection`, `ArticleCta` missing).
- `:37-38` lists only `siteDocuments.ts`; `src/data` has 9 files
  (`pricing.ts`, `routes.ts`, `services.ts`, `guides.ts`, `caseStudies.ts`,
  `jsonld.ts`, `service-registry.json`, `github-stats.json`).
- `:20` says the root has "auto-redirect from browser language" — plan 031
  removed that; only a stored preference redirects.
- `:60` says "Playwright scripts in `./test-*.mjs` are ad-hoc" — after plan
  051 the wired suites are `test-htw-snapshot.mjs` and
  `test-behavioral.mjs` (which self-spawns its server).

**README.md**
- `:64` — "`npm test` — full gate: source tests, built-output tests, HTW
  snapshot" omits analytics (2 suites), sitemap-i18n, and behavioral.
- `:73` — "four blocking gates — Source tests → Build → Built tests → HTW
  snapshot"; `deploy.yml:42-68` runs **seven** blocking steps (Type check,
  Source tests, Build, Built tests, Sitemap i18n, HTW, Behavioral) plus
  informational Link/SEO and CSP.

**docs/analytics-sprint-0.md:348-353**
```
- Guide/work page granularity: resolved (plan 038) — guide CTAs are
  service-scoped; work-page case CTAs and project links already emit
  canonical events.
...
  ProofSection was removed from the home in `79b5347`; its file is orphaned.
```
The per-case CTA is **not** canonical (plan 038 deferred it; the component
carries only legacy `data-track`), and `ProofSection.astro` was deleted in
plan 041.

**docs/tasks/higiene-tecnica-web-backlog.md**
- `:322` — "Ahrefs Analytics, already installed, only reports page views"
  and recommends Plausible; the site is GA4-only since Plan 006.
- `:346` — Key Files table lists `src/components/ServiceSpotlight.astro`
  ("Featured service callout on ES home"); deleted in `3cc2e5c`.

**docs/tasks/tooltician-strategy-execution-plan.md**
- `:47-49` claims `track.js` is a no-op to `window.plausible`, Ahrefs is
  installed, the résumé is unlinked, and the home repeats proof across
  `Proof`/`ServiceSpotlight` — all false at HEAD.
- `:120` declares §4 "la **fuente única de verdad** de la analítica" while
  §0/§11 declare it superseded; `:323` (Plausible stub), `:387`/`:399`
  ("Tracking (no-op)", "CV (huérfano)"), `:452` ("Empieza por `TS-001`",
  done).

**docs/tasks/tooltician-refresh-backlog.md**
- `:128-137` §4 control panel still shows `Pending` for the OG card and
  root URL; `:457-467` §13 says start Wave 1 with five done tasks.

**Broken plan links** (`plans/006-…` → `plans/archive/006-…`):
`docs/CHANGELOG.md:19`, `docs/cloudflare-security-headers.md:25`,
`docs/tasks/tooltician-strategy-execution-plan.md:177`.

## Commands you will need

| Purpose   | Command                                     | Provenance | Expected on success |
|-----------|---------------------------------------------|------------|---------------------|
| Full tests| `npm test`                                  | executed   | exit 0 (docs-only change) |
| Grep gate | see Step 5                                  | executed   | all listed greps as specified |

## Scope

**In scope**: the seven files in the drift check.
**Out of scope**:
- `plans/**` — the ledger is the record; do not edit archived plans.
- `docs/content-audit/**`, `docs/geo-opt-bugs*.md`,
  `docs/tooltician-repositioning-audit.md` — historical records.
- `docs/tasks/keyword-research-es.md`, runbooks — verified accurate.

## Git workflow

- Branch: `advisor/059-docs-truth-sweep`
- Conventional commits, e.g. `docs: reconcile living docs with shipped state`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: CLAUDE.md truth

- Replace the routes list (`:19-23`) with a short pointer: "Routes live in
  `src/pages/` (23 pages: root gateway, EN/ES homes, 6 EN + 6 ES service
  pages, work pages, 3 ES guides, legal pages, 404)." — do not enumerate.
- Replace the component list (`:27-35`) with the 13 actual components
  (see Current state) and a one-line description each, or a pointer to
  `src/components/`.
- Replace the data list (`:37-38`) with the 9 actual files and a one-line
  role each.
- `:20` → "root language gateway; returning visitors with a stored
  preference are forwarded, first-time visitors choose explicitly (Plan
  031)".
- `:60` → "Wired browser suites: `test-htw-snapshot.mjs` and
  `test-behavioral.mjs` (self-spawns its preview server); run via
  `npm test`."

### Step 2: README truth

- `:64` → list all seven chain steps: "`npm test` — full gate: source
  tests, analytics contract suites, built-output tests, sitemap i18n, HTW
  snapshot, behavioral tests".
- `:73` → "CI (`master` → GitHub Pages) runs seven blocking gates — Type
  check → Source tests → Analytics contract tests → Build → Built tests →
  Sitemap i18n → HTW snapshot → Behavioral — plus non-blocking Link & SEO
  and CSP checks." (Adjust the wording to exactly the steps present in
  `deploy.yml` **after** plans 052/053/054/056 have landed; if they have
  not, describe the steps as they exist at your HEAD.)

### Step 3: Dated correction notes in the task docs

Add a dated banner directly under the section heading (find with
`grep -n "^## "`), keeping the original text below:

- `docs/analytics-sprint-0.md` §14: correct the two lines —
  "work-page case CTAs are **not** canonical (deferred, plan 038)" and
  "`ProofSection.astro` was deleted in plan 041".
- `docs/tasks/higiene-tecnica-web-backlog.md` §8 (`:322`): "Superseded
  2026-09-23: analytics is GA4-only (Plan 006); Plausible/Ahrefs are not
  installed. See `docs/analytics-sprint-0.md`."
- Same file §10 (`:346`): delete the `ServiceSpotlight.astro` row.
- `docs/tasks/tooltician-strategy-execution-plan.md`: add to §1, §4, §9,
  §12, §16: "> **Superseded 2026-09-23** — this section predates the GA4
  migration (Plan 006) and the 2026-09 content refresh; see §0, §11, and
  `plans/README.md` for the shipped state." Fix `:47-49`'s four false
  claims inline (one sentence each) or replace the bullets with a pointer.
- `docs/tasks/tooltician-refresh-backlog.md`: same banner on §4 and §13,
  noting the `Pending` cells are historical and `plans/README.md` is the
  status authority.

### Step 4: CHANGELOG + link fixes

- Add a `## 2026-09-23 — Content/measurement refresh (plans 024–041)`
  entry at the top of `docs/CHANGELOG.md` summarizing: i18n route registry
  + sitemap hreflang, staged pricing, accessible CTAs and intake errors,
  case-study evidence model + work H2 groups, root x-default landing,
  guides hub, structured-data parity, real EN/ES résumés, analytics
  coverage, orphan-component deletion.
- Fix the three `plans/006-…` links to `plans/archive/006-…`.

### Step 5: Verification

```bash
grep -c "plans/006-plausible" docs/CHANGELOG.md docs/cloudflare-security-headers.md docs/tasks/tooltician-strategy-execution-plan.md   # 0 0 0
grep -c "Superseded 2026-09-23" docs/tasks/tooltician-strategy-execution-plan.md docs/tasks/tooltician-refresh-backlog.md   # >= 5 and >= 2
grep -c "ServiceSpotlight" docs/tasks/higiene-tecnica-web-backlog.md   # 0
grep -c "ProofSection" docs/analytics-sprint-0.md   # only the corrected "deleted in plan 041" mention
grep -n "2026-09-23" docs/CHANGELOG.md   # >= 1
npm test   # exit 0 (docs-only; suites unaffected)
```

## Test plan

Docs-only; the grep gates above are the machine checks. `npm test` must
stay green (proves no code was touched).

## Done criteria

ALL must hold:

- [ ] All Step 5 greps match their expected values
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only the seven in-scope
      docs plus `plans/README.md`
- [ ] `plans/README.md` status row for 059 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- A target section cannot be located (the doc was restructured).
- A correction would contradict a fresh live fact (e.g. you cannot verify
  that `ProofSection` is deleted) — report instead of writing it.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `plans/README.md` is the status authority; task docs carry history with
  dated banners.
- **Deferred:** a docs lint that fails CI when living docs name deleted
  files — cheap idea, no owner yet.
