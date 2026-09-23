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

## Follow-up series — trust transfer (017–020, all DONE)

Wave 5, all scopes file-disjoint (parallel-safe). Archived under
`plans/archive/`.

| Plan | Title | Pri | Eff | Status |
|------|-------|-----|-----|--------|
| 017 | Employer route (resume link, PDF freshness-gated) | P1 | S | DONE |
| 018 | Claim reword (verbatim replacements baked in) | P1 | S | DONE |
| 019 | Backlink recon + scope template | P2 | M | DONE |
| 020 | Freshness runbook | P3 | S | DONE |

Progress (follow-up): 4/4 DONE.

## Growth series (021–023, all DONE)

Protective tests + ES-first organic engine (pilot with kill switch).

| Plan | Title | Pri | Eff | Status |
|------|-------|-----|-----|--------|
| 021 | Behavioral funnel tests | P1 | M | DONE (red-then-green proven, orphans verified absent) |
| 022 | ES-first keyword research | P1 | S | DONE (10 rows, 8 ES, 3 picks with kills) |
| 023 | Pilot batch (3 ES articles, needs 022) | P2 | M | DONE (sitemap-covered, suites green; snapshot rebased +1 link) |

Progress (growth): 3/3 DONE.

## Content audit 2026-09-23 series (024–034)

Source: `docs/content-audit/audits/audit-20260923.md`. Reconciliation and the
finding→plan matrix: `docs/content-audit/audits/audit-20260923-response.md`.
All 024–034 plans are archived under `plans/archive/`. Status authority is
`plans/README.md`.

### Wave 0 — Reconcile (DONE)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 024 — Audit reconciliation + response doc | `plans/archive/024-audit-reconciliation.md` | `advisor/024-audit-reconciliation` | Executed during plan authoring: live H-01/H-07 stale, four decisions locked, response doc written |

Exit gate: response doc exists; every finding maps to a plan or a documented
no-action. Holds.

### Wave 1 — Clarity spine (DONE 2026-09-23)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 025 — i18n registry + sitemap hreflang | `plans/archive/025-i18n-routes-sitemap.md` | `advisor/025-i18n-routes-sitemap` | Only plan touching `package.json` + `deploy.yml` |
| 026 — Staged pricing pattern | `plans/archive/026-pricing-pattern.md` | `advisor/026-pricing-pattern` | HTW snapshot may be regenerated |
| 028 — Accessible intake errors | `plans/archive/028-accessible-intake-errors.md` | `advisor/028-accessible-intake-errors` | External JS only (CSP-safe) |

Goto:
```
node tests/run.js
npm run build && node tests/run.js --built && node tests/sitemap-i18n.mjs
node test-htw-snapshot.mjs && node test-behavioral.mjs
```
Exit gate: all three DONE; sitemap validator green; no duplicate `en` on `/`;
every amount carries a stage label; empty submit focuses the first invalid
field with `aria-invalid`. Holds (verified 2026-09-23: `npm test` green end
to end — 144/144 src, 169/169 built, sitemap PASS, HTW no drift, behavioral
PASS).

### Wave 2 — Evidence & entry (DONE 2026-09-23)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 027 — Accessible service CTAs | `plans/archive/027-accessible-service-ctas.md` | `advisor/027-accessible-service-ctas` | Requires 026 DONE (same file) |
| 029 — Case-study evidence model | `plans/archive/029-case-study-evidence.md` | `advisor/029-case-study-evidence` | Repoints existing `tests/run.js` groups |
| 031 — Root x-default landing | `plans/archive/031-root-x-default-landing.md` | `advisor/031-root-x-default-landing` | Requires 025; keep GA4 stub byte-identical |

Goto:
```
npm run check && node tests/run.js && node tests/run.js --built
node scripts/check-csp-hashes.mjs   # expect MATCH (031)
node test-behavioral.mjs            # filters unaffected by 029
```
Exit gate: six unique CTA names; work cards show role + verified date + CTA;
root renders the landing with `WebSite`/`Organization` and no auto-redirect.
Holds (verified 2026-09-23: `npm test` green end to end — 179/179 src,
204/204 built, sitemap PASS, HTW no drift, behavioral PASS; CSP MATCH).

### Wave 3 — Discovery & schema (DONE 2026-09-23)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 030 — Work H2 groups | `plans/archive/030-work-heading-groups.md` | `advisor/030-work-heading-groups` | Requires 029; updates filter JS + behavioral test |
| 032 — Guides hub + internal links | `plans/archive/032-guides-hub-internal-links.md` | `advisor/032-guides-hub-internal-links` | Requires 025 + 027 |
| 033 — Structured-data parity | `plans/archive/033-structured-data-parity.md` | `advisor/033-structured-data-parity` | Requires 025 + 029 |

Goto:
```
npm run build && node tests/run.js --built && node tests/sitemap-i18n.mjs
node test-behavioral.mjs && node scripts/check-links-seo.js
```
Exit gate: work pages 1 H1 → 4 H2 → 10 H3; hub in sitemap with `es` +
`x-default`; work JSON-LD names equal rendered H3s. Holds (verified
2026-09-23: `npm test` green — 207/207 src, 232/232 built, sitemap PASS,
HTW no drift, behavioral PASS; link checker 0/0/0; CSP MATCH).

### Wave 4 — Closeout (DONE 2026-09-23)

| Plan | Entry point | Branch | Note |
|------|-------------|--------|------|
| 034 — Audit closeout | `plans/archive/034-audit-verification-closeout.md` | `advisor/034-audit-verification-closeout` | Requires 025–033 DONE; docs + verification only |

Goto:
```
npm test
node scripts/check-links-seo.js && node scripts/check-csp-hashes.mjs
```
Exit gate: all 12 audit §8 criteria verified and recorded; response doc has
no `TODO` rows; plans 024–033 archived.

## Scoreboard

| Plan | Wave | Pri | Eff | Status | Verified by |
|------|------|-----|-----|--------|-------------|
| 024 | 0 | P1 | S | DONE | live H-01/H-07 re-verified via curl; response doc + locked decisions (2026-09-23) |
| 025 | 1 | P1 | M | DONE | `tests/sitemap-i18n.mjs` PASS (28 URLs, HTML↔XML parity); red-then-green proven; 144/144 src, 169/169 built |
| 026 | 1 | P1 | M | DONE | `H-04` 8/8 green; home shapes + 6 services staged; HTW snapshot no drift |
| 027 | 2 | P1 | S | DONE | H-03 (6 unique names EN/ES) + H-12 (2 CTAs per guide) green; 179/179 src, 204/204 built |
| 028 | 1 | P1 | M | DONE | behavioral validation case green (0 POST invalid, focus + aria, 1 POST valid); negative control proven |
| 029 | 2 | P1 | M | DONE | `caseStudies.ts` + 10 role/date metas + 10 CTAs per work page; H-06 green; existing groups repointed |
| 030 | 3 | P1 | S | DONE | H-09 (1/4/10 headings) + behavioral outline/group checks green |
| 031 | 2 | P1 | M | DONE | H-05 green; root landing + WebSite/Organization; CSP MATCH; 0 broken links |
| 032 | 3 | P2 | M | DONE | H-08 green; hub in sitemap (es + x-default); link checker 0/0/0 |
| 033 | 3 | P2 | S | DONE | H-11 green (CollectionPage + ItemList names == rendered H3 order); root schema via builders |
| 034 | 4 | P2 | M | DONE | 12 criterios §8 verificados; `llms.txt`/`llms-full.txt` actualizados; response doc cerrado; planes archivados |

Progress (audit series): 11/11 DONE.

## Direction series — "next" audit (035–040, closed)

Planned 2026-09-23 against `1508fa2`. Source: direction-only audit. Status
authority is `plans/README.md`; **all six plans are DONE and archived under
`plans/archive/`**.

| Plan | Entry point | Landed as | Note |
|------|-------------|-----------|------|
| 035 — Live-host production verification | `plans/archive/035-production-verification.md` | `30e93e3` | New script + separate scheduled workflow; never gates deploy |
| 036 — Docs re-baseline | `plans/archive/036-rebaseline-strategy-docs.md` | `408cfd1` | Docs only; ran first |
| 037 — Content measurement loop | `plans/archive/037-content-measurement-loop.md` | `d673512` | Operator runbook; day-60 checkpoint `2026-11-15` |
| 038 — Analytics coverage | `plans/archive/038-analytics-coverage.md` | `c51eabd` | No new events/dimensions |
| 039 — Real EN/ES résumés | `plans/archive/039-employer-route-placeholder.md` | `fae35af` | Replaced placeholder with real EN PDF; added ES PDF; locale-aware links |
| 040 — Home proof dedup | `plans/archive/040-home-proof-dedup.md` | `3ee99dd` | Hero copy + `D6b` test only |

Goto (post-close verification):

```
node tests/run.js && npm run check
npm run build && node tests/run.js --built && node test-behavioral.mjs
npm run check:prod
```

Exit gate: met 2026-09-23 — 6/6 DONE; weekly production check green; strategy/
refresh docs reconciled; content-review runbook scheduled; home cards and
guide CTAs stamped; real EN/ES résumés wired per locale; `D6b` green.

## Backlog (accepted, not yet planned)

Sourced from the `**Deferred:**` lines in the plans and the audit's
direction notes. Verdicts reviewed with the maintainer 2026-09-16: one item
is next-series candidate, two are opportunistic/data-gated, two moved to
Rejected below, two parked. Do NOT silently absorb these into past waves.

- [x] **Behavioral form/filter tests** (from 008/009) — DONE via Plan 021
  (submit-count + filter interaction) and extended by Plan 028 (accessible
  validation case). No open work remains.
- [ ] **Case-study depth** (direction D3) — PARKED as personal habit, not
  code work. Blocked on a willing client. Action: add a testimonial/case
  ask to the project closeout habit; the quarterly runbook review is the
  trigger. Effort M when unblocked (design/spike, not a build). Plan 029
  shipped the role/verification-date layer; quantified results remain
  data-gated.
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
- Dependency migration as a project (superseded 2026-09-23: Dependabot
  advisories on dev dependencies were fixed with a lockfile-only
  `npm audit fix` — Astro 7.3.4, sharp 0.35.4, svgo 4.1.0, smol-toml 1.9.0;
  `npm audit` back to 0 and the full suite green. Reopen only if a major
  upgrade is required by a real constraint).
- Making the link audit or CSP check CI-blocking (flake rate must be
  addressed first — see 010/015 maintenance notes).
- Server-side analytics fallback (rejected 2026-09-16: needs an owned
  endpoint + privacy-copy rework to recover ad-blocked visits on a
  portfolio site; revisit only if conversion data shows a material blind
  spot).
- `report-uri` for the CSP (rejected 2026-09-16: the in-repo hash check +
  non-blocking CI step already cover realistic stub-drift failures;
  revisit only on an otherwise-unexplained analytics drop).
