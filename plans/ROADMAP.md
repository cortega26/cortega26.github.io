# Roadmap — 2026-09-16 plan series

Backlog, implementation plan, scoreboard, and goto for plans `007`–`016`
(planned against commit `79b5347`; full per-plan specs live alongside this
file, status authority is `plans/README.md`).

Prior series (`001`–`004`, `006`) is DONE and out of scope here except where
a wave explicitly builds on it.

## How to use this file

- **Operator**: work top-to-bottom, one wave at a time. Don't start a wave
  until the previous wave's exit gate holds.
- **Executor**: each wave tells you which plan file to read first and the
  exact verification commands. Always read the full plan file before
  starting — the one-liners here are gates, not instructions.
- Status values: `TODO | IN PROGRESS | DONE | BLOCKED (reason) | REJECTED (rationale)`.
  Update BOTH this file's scoreboard AND `plans/README.md` when a plan lands.

## Waves

### Wave 1 — Stop the bleeding (P1 correctness, parallelizable)

User-facing bugs, independent of each other. Land both before anything else.

| Plan | Entry point | Branch |
|------|-------------|--------|
| 007 — Service context into IntakeForm | `plans/archive/007-service-context.md` | `advisor/007-service-context` |
| 008 — Remove duplicate Formspree submit | `plans/archive/008-double-submit.md` | `advisor/008-double-submit` |

Goto:
```
git diff --stat 79b5347..HEAD -- src/components/ServicePage.astro src/components/IntakeForm.astro public/assets/js/contact-section.js
node tests/run.js   # record counts; expect pre-009 baseline (was 90/106)
```

Exit gate: both DONE; `npm run check` green; `node tests/run.js` failure set
unchanged from baseline (the suite is stale by design until Wave 2);
10 built service pages carry their own `data-track-form`; `fetch(` gone from
`contact-section.js`.

### Wave 2 — Lock it in (verification spine, STRICTLY sequential)

| Order | Plan | Entry point | Branch |
|-------|------|-------------|--------|
| 2a | 009 — Rewrite stale suite assertions | `plans/archive/009-stale-suite.md` | `advisor/009-stale-suite` |
| 2b | 010 — Gate deploys on the suite | `plans/archive/010-ci-gates.md` | `advisor/010-ci-gates` |

009 requires 007+008 DONE (it locks in their intended effects — running it
early means re-touching it later). 010 requires 009 DONE (never gate deploys
on a red suite — hard precondition in the plan).

Goto:
```
node tests/run.js                    # expect exit 0 after 009
npm run build && node tests/run.js --built && node test-htw-snapshot.mjs
```

Exit gate: source suite green, built suite green, HTW snapshot green, CI
runs source → build → built → HTW (blocking) + link audit (non-blocking +
artifact). After this wave, every later wave is verifiable end-to-end.

### Wave 3 — Measurement & build reliability (parallelizable)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 011 — Queue analytics events until gtag ready | `plans/archive/011-track-queue.md` | `advisor/011-track-queue` | Needs 007 DONE (satisfied in Wave 1) |
| 012 — Harden GitHub stats fetch | `plans/archive/012-stats-fetch.md` | `advisor/012-stats-fetch` | Independent; restores `github-stats.json` if dirtied |

Goto:
```
node --check public/assets/js/track.js && node /tmp/opencode/track-queue-test.mjs
node scripts/fetch-github-stats.js && git status --short src/data/github-stats.json
```

Exit gate: both DONE; suite still green; stats file untouched-or-legitimately-updated
(never committed with zeros).

### Wave 4 — Cleanup & hardening (parallelizable, 015 last-touch on CI)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 013 — Generate portfolio impact counts | `plans/archive/013-portfolio-counts.md` | `advisor/013-portfolio-counts` | Step 3 conditional on 009 (DONE by now) → apply it |
| 014 — Contact CTAs → `#contact` | `plans/archive/014-contact-anchors.md` | `advisor/014-contact-anchors` | Independent |
| 016 — Rewrite stale README | `plans/archive/016-readme.md` | `advisor/016-readme` | Read `deploy.yml` live (post-010 step list) |
| 015 — CSP hash check + single-source GA4 ID | `plans/archive/015-csp-hashes.md` | `advisor/015-csp-hashes` | Touches `deploy.yml` — land AFTER 010 and insert adjacent to its steps |

Goto:
```
npm run build && node scripts/check-links-seo.js   # expect 0 internal issues (014)
npm run build && node scripts/check-csp-hashes.mjs # expect MATCH (015)
grep -rn "npx serve ." README.md                   # expect no hits (016)
```

Exit gate: all four DONE; full gate chain green
(`check` → source tests → build → built tests → HTW → CSP/link informational);
built EN/ES pages show live star counts; no CTA points at `#contact-form`.

## Scoreboard

| Plan | Wave | Pri | Eff | Status | Verified by |
|------|------|-----|-----|--------|-------------|
| 007 | 1 | P1 | S | DONE | per-page `data-track-form` greps (10/10 + home/htw unchanged, verified 2026-09-16) |
| 008 | 1 | P1 | S | DONE | `fetch(` count = 0, clipboard intact (verified 2026-09-16) |
| 009 | 2a | P1 | M | DONE | suite green 109/109 src, 134/134 built (verified 2026-09-16) |
| 010 | 2b | P2 | S | DONE | 4 gates in order, YAML parses, artifact pinned to SHA (verified 2026-09-16) |
| 011 | 3 | P2 | S | DONE | harness green (order/bound/null-safety), suite green (verified 2026-09-16) |
| 012 | 3 | P2 | S | DONE | 9/10 live run, byte-identical JSON, suite green (verified 2026-09-16) |
| 013 | 4 | P3 | S | DONE | live counts, zero ★0, 134/134 built (verified 2026-09-16) |
| 014 | 4 | P3 | S | DONE | link checker 0/0/0 re-run, suite green (verified 2026-09-16) |
| 015 | 4 | P3 | S | DONE | MATCH both pages, YAML OK (verified 2026-09-16; Step-2 ID derivation STOPped per plan — see backlog) |
| 016 | 4 | P3 | S | DONE | single-hunk docs diff, links resolve, suite green (verified 2026-09-16) |

Progress: 10/10 DONE (all waves complete).

## Follow-up series — trust transfer (017–020, all TODO)

Wave 5, all scopes file-disjoint (parallel-safe). Entry points use
`plans/<file>` until archived.

| Plan | Title | Pri | Eff | Status |
|------|-------|-----|-----|--------|
| 017 | Employer route (resume link, PDF freshness-gated) | P1 | S | DONE |
| 018 | Claim reword (verbatim replacements baked in) | P1 | S | DONE |
| 019 | Backlink recon + scope template | P2 | M | DONE |
| 020 | Freshness runbook | P3 | S | DONE |

Progress (follow-up): 4/4 DONE.

## Backlog (accepted, not yet planned)

Sourced from the `**Deferred:**` lines in the plans and the audit's
direction notes. Verdicts reviewed with the maintainer 2026-09-16: one item
is next-series candidate, two are opportunistic/data-gated, two moved to
Rejected below, two parked. Do NOT silently absorb these into past waves.

- [ ] **Behavioral form/filter tests** (from 008/009) — NEXT-SERIES
  CANDIDATE. Playwright submit-count test (exactly one POST per brief) +
  filter-interaction test. Effort M. Infra cost already sunk (Playwright is
  a devDependency and CI installs the browser for the HTW step). The
  double-submit bug class has no automated coverage today.
- [ ] **Case-study depth** (direction D3) — PARKED as personal habit, not
  code work. Blocked on a willing client. Action: add a testimonial/case
  ask to the project closeout habit; the quarterly runbook review is the
  trigger. Effort M when unblocked (design/spike, not a build).
- [ ] **Per-service IntakeForm options** (from 007) — DATA-GATED. Revisit
  only after ~30 days of per-service GA4 data (now collected via 007+011):
  tailor a service's options only if its briefs prove unqualified. Effort S.
- [ ] **README/CLAUDE.md/AGENTS.md lane split** (from 016) —
  OPPORTUNISTIC. Fold into the next docs touch; never its own dispatch.
- [ ] **GA4-ID rotation friction** (from 015 Step-2 STOP) — DORMANT. The
  measurement ID remains pasted in six places in `siteDocuments.ts`
  because no fallback preserves the legal sentences' grammar. If the ID
  ever rotates, either hand-edit the six spots or re-plan with a
  copy-approved fallback sentence. Effort S when triggered.

## Rejected (do not re-propose without new evidence)

- HTW bespoke pages → `ServicePage` migration (HIGH risk / L effort; gated
  behind the 003 snapshot net, which holds).
- Performance optimization pass (no architectural win found).
- Dependency migration (`npm audit` clean, Astro 7 current).
- Making the link audit or CSP check CI-blocking (flake rate must be
  addressed first — see 010/015 maintenance notes).
- Server-side analytics fallback (rejected 2026-09-16: needs an owned
  endpoint + privacy-copy rework to recover ad-blocked visits on a
  portfolio site; revisit only if conversion data shows a material blind
  spot).
- `report-uri` for the CSP (rejected 2026-09-16: the in-repo hash check +
  non-blocking CI step already cover realistic stub-drift failures;
  revisit only on an otherwise-unexplained analytics drop).
