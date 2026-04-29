# Program Backlog: Tooltician Refresh

Version: `2026-04-29`  
Status: `Proposed`  
Scope: `tooltician.com` public portfolio refresh  
Primary goal: improve perceived professionalism, clarity, mobile UX, and performance without a full redesign.

## 1. Executive Overview

This document is the operational backlog for the Tooltician refresh program.
It is intended to be self-contained and executable without referring back to the original audit.

Current baseline from audit:

| Metric | Current baseline | Notes |
|---|---:|---|
| Perceived polish | `6/10` | Good technical base, weak first impression |
| Lighthouse mobile | `70` | Main issue is asset misuse and mobile hero UX |
| Lighthouse desktop | `87` | Good base, but avoidable waste remains |
| Initial payload | `~1.86 MB` | Dominated by oversized logo + favicon |
| Mobile CTA visibility | `0 hero CTAs above the fold` | At `360`, `390`, `414`, `768` |
| Horizontal overflow | `None detected` | Positive baseline, keep intact |
| CLS | `0` | Positive baseline, keep intact |
| Portfolio filter quality | `Visually broken` | Hidden cards still occupy layout space |

Program outcomes expected after implementation:

| Target area | Success target |
|---|---|
| First impression | Service is understood in `3–5 seconds` |
| Mobile hero | At least `1 CTA` visible above the fold |
| Payload | Reduce obvious waste from oversized branding assets |
| Performance | Improve Lighthouse mobile materially from current baseline |
| Portfolio UX | Filtering feels correct and polished |
| Brand perception | More sober, more consultative, more trustworthy |

## 2. Operating Principles

- Optimize for `sobriety`, `clarity`, `trust`, and `maintainability`.
- Prefer `incremental improvements` over speculative redesigns.
- Fix `first impression` and `mobile` before polishing lower sections.
- Fix `asset misuse` before spending time on micro-optimizations.
- Do not introduce visual novelty that weakens credibility.
- Each wave must leave the site deployable and measurably better.

## 3. Executive Method

### 3.1 Delivery model

Use a wave-based execution model with strict sequencing:

1. `Baseline`
2. `Wave 1 — Hero, CTA, and asset correction`
3. `Wave 2 — Mobile navigation, layout polish, and interaction cleanup`
4. `Wave 3 — Portfolio and proof refinement`
5. `Wave 4 — Performance hardening and technical cleanup`
6. `Wave 5 — SEO, metadata, and final polish`

Why this order:

- Wave 1 fixes the biggest business and perception losses.
- Wave 2 prevents mobile from undermining the new positioning.
- Wave 3 strengthens proof once the framing is correct.
- Wave 4 hardens what remains after structure is stable.
- Wave 5 closes metadata and public presentation with less rework.

### 3.2 WIP limits

- Never run more than `1 active wave` at a time.
- Never run more than `3 active tasks` inside a wave.
- Do not start downstream polish until the upstream gate is passed.

### 3.3 Change loop per task

For each task, execute this sequence:

1. confirm current baseline
2. implement smallest coherent change
3. validate visually at required breakpoints
4. run technical checks if relevant
5. record scoreboard update
6. only then move to next task

### 3.4 Exit gates

Each wave must pass all of these before the next wave starts:

- `npm run build` passes
- no new console errors
- no horizontal overflow in required breakpoints
- no regression in keyboard navigation
- core links still work
- wave scoreboard updated

### 3.5 Cadence

Recommended governance cadence:

| Cadence | Purpose | Output |
|---|---|---|
| Start of wave | confirm scope and success metrics | wave checklist |
| End of session | log status, blockers, next action | scoreboard update |
| End of wave | decide go/no-go for next wave | exit gate review |
| End of program | final validation and polish review | release checklist |

## 4. Program Scoreboard

Use this table as the top-level control panel.

| Dimension | Baseline | Target | Current status | Owner | Notes |
|---|---:|---:|---|---|---|
| Perceived polish | `6/10` | `8/10+` | `Pending` | `TBD` | subjective but guided by validation review |
| Lighthouse mobile | `70` | `80+` | `Pending` | `TBD` | exact final target may adjust after asset fixes |
| Lighthouse desktop | `87` | `90+` | `Pending` | `TBD` | should improve with low risk |
| Payload size | `~1.86 MB` | `meaningfully reduced` | `In progress` | `Codex` | oversized navbar logo and favicon requests removed from critical UI paths |
| Hero CTA visibility mobile | `0` | `>=1 visible` | `Done` | `Codex` | validated on `360`, `390`, `414`, `768` |
| Portfolio filter UX | `Broken` | `Clean reflow` | `Pending` | `TBD` | no empty slots after filtering |
| Social preview quality | `Weak` | `Professional OG card` | `Pending` | `TBD` | use existing OG asset |
| Contact clarity | `Mixed` | `Single clear path` | `Pending` | `TBD` | especially on hero and contact section |

## 5. Wave Scoreboards

## Wave 0 — Baseline and Safeguards

Objective: preserve a clean execution path and define measurable baselines before UI changes begin.

| Item | Status | Acceptance criteria |
|---|---|---|
| Baseline metrics captured | `Done` | audit numbers documented in this file |
| Required breakpoints defined | `Done` | `360`, `390/414`, `768`, `1366`, `1920` |
| Build path verified | `Done` | `npm run build` passes |
| Validation method defined | `Done` | manual + Lighthouse + link checks |

Wave gate:

- This document exists and is accepted as source of truth.

## Wave 1 — Positioning, Hero, and Critical Assets

Objective: fix what most harms first impression and mobile conversion.

Wave scoreboard:

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| H1 clarity | low | service-first | `Done` |
| Mobile first-pliegue clarity | low | clear service + CTA | `Done` |
| Hero CTA count | `4` | `2 primary max` | `Done` |
| Logo asset waste | extreme | corrected | `Done` |
| Favicon asset waste | extreme | corrected | `Done` |

Tasks:

| ID | Task | Priority | Effort | Dependency | Done when |
|---|---|---|---|---|---|
| `TT-001` | Reframe hero H1/subheadline around service | `P1` | `M` | none | service understood immediately |
| `TT-002` | Reorder mobile/tablet hero so copy comes before image/cards | `P1` | `M` | `TT-001` | copy and CTA visible sooner |
| `TT-003` | Reduce hero CTA count and define hierarchy | `P1` | `S` | `TT-001` | no CTA clutter, no awkward wrapping |
| `TT-005` | Replace oversized navbar logo asset | `P1` | `S` | none | navbar no longer downloads a huge image |
| `TT-005A` | Replace oversized favicon strategy | `P1` | `S` | none | favicon is lightweight and correct |

Wave gate:

- `H1` is service-first in both languages
- at least `1 CTA` is visible above the fold on `360`, `390`, `414`, and `768`
- oversized logo and favicon waste are removed

## Wave 2 — Mobile Navigation and Hero Credibility

Objective: make the mobile experience feel deliberate and professional.

Wave scoreboard:

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Mobile menu quality | weak overlay | robust overlay | `Done` |
| Hero visual credibility | mixed | sober/professional | `Done` |
| Hero clutter | high | reduced | `Done` |

Tasks:

| ID | Task | Priority | Effort | Dependency | Done when |
|---|---|---|---|---|---|
| `TT-006` | Replace or remove hero photo | `P1` | `M` | `TT-001` | visual tone matches professional positioning |
| `TT-007` | Simplify hero cards and reduce template feel | `P2` | `M` | `TT-002` | hero feels cleaner and less generic |
| `TT-008` | Upgrade mobile nav to proper overlay with backdrop and scroll lock | `P2` | `M` | none | mobile nav behaves like a controlled layer |
| `TT-014` | Add consistent `:focus-visible` states | `P2` | `S` | `TT-008` | all major interactive elements show clear focus |

Wave gate:

- mobile nav behaves cleanly on `360`, `390`, and `414`
- hero visual tone no longer undermines trust
- keyboard focus remains clear after nav updates

## Wave 3 — Portfolio, Proof, and Contact Clarity

Objective: strengthen proof of capability and remove interaction-level friction.

Wave scoreboard:

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Portfolio filter polish | broken | correct reflow | `Pending` |
| Project scanability | medium | high | `Pending` |
| Contact action clarity | mixed | clear | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Dependency | Done when |
|---|---|---|---|---|---|
| `TT-004` | Fix portfolio filtering so hidden cards leave the layout | `P1` | `S` | none | no empty slots remain |
| `TT-015` | Rewrite project cards around problem, solution, proof | `P1` | `M` | `TT-001` | key projects are faster to understand |
| `TT-016` | Prioritize anchor projects in the portfolio order | `P2` | `S` | `TT-015` | strongest work appears first |
| `TT-009` | Clarify clickable badges and secondary links | `P2` | `S` | `TT-004` | links read as actions, not labels |
| `TT-018` | Fix contact microcopy and action consistency | `P2` | `S` | none | labels match actual behavior |

Wave gate:

- portfolio filter feels correct on desktop and mobile
- top projects communicate commercial and technical value quickly
- contact actions are semantically correct in `EN` and `ES`

## Wave 4 — Performance and Technical Cleanup

Objective: remove waste and tighten the frontend after structure is stable.

Wave scoreboard:

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Lighthouse mobile | `70` | `80+` | `Pending` |
| Lighthouse desktop | `87` | `90+` | `Pending` |
| Asset hygiene | weak | good | `Pending` |
| Frontend duplication | moderate | reduced | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Dependency | Done when |
|---|---|---|---|---|---|
| `TT-010` | Remove duplicate Google Fonts loading path | `P2` | `S` | none | one controlled font loading strategy remains |
| `TT-011` | Improve LCP handling for hero image | `P2` | `S` | `TT-006` | hero image gets correct priority |
| `TT-012` | Compress or replace PNG fallback strategy | `P2` | `S` | `TT-006` | fallback no longer carries unnecessary weight |
| `TT-013` | Review third-party frontend scripts | `P3` | `S` | none | every third party has explicit justification |
| `TT-022` | Consolidate repeated card/list/section styles | `P3` | `M` | after visual changes settle | less CSS duplication without regressions |
| `TT-023` | Separate reusable tokens from decorative exceptions | `P3` | `M` | `TT-022` | styling system becomes easier to govern |

Wave gate:

- performance metrics improve relative to baseline
- no duplicated font loading remains
- no obvious asset misuse remains

## Wave 5 — SEO, Metadata, and Final Polish

Objective: align public metadata, root behavior, and final trust signals.

Wave scoreboard:

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Social preview quality | weak | strong | `Pending` |
| Root URL SEO clarity | mixed | coherent | `Pending` |
| Credential link trust | mixed | validated | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Dependency | Done when |
|---|---|---|---|---|---|
| `TT-019` | Switch `og:image` and `twitter:image` to the OG card asset | `P2` | `S` | none | social preview uses a proper card |
| `TT-020` | Decide root URL strategy for `/` and sitemap behavior | `P2` | `M` | none | root/canonical/sitemap tell one consistent story |
| `TT-021` | Revalidate external credential links | `P2` | `S` | none | no visible credential points to a weak URL |
| `TT-017` | Reduce redundancy across About, Proof, and Credentials | `P2` | `M` | `TT-015` | sections no longer repeat the same proof |

Wave gate:

- metadata is aligned with the stronger presentation
- visible trust links are valid
- content flow feels intentional end to end

## 6. Master Task Backlog

This is the single flattened backlog for ticket creation.

| ID | Area | Task | Priority | Impact | Effort | Recommended wave | Status |
|---|---|---|---|---|---|---|---|
| `TT-001` | Positioning | Rewrite hero H1 and subheadline around service | `P1` | high | `M` | `Wave 1` | `Done` |
| `TT-002` | Responsive UX | Reorder hero on mobile/tablet | `P1` | high | `M` | `Wave 1` | `Done` |
| `TT-003` | Conversion UX | Reduce hero CTAs and clarify hierarchy | `P1` | high | `S` | `Wave 1` | `Done` |
| `TT-004` | Interaction UX | Fix portfolio filter layout reflow | `P1` | high | `S` | `Wave 3` | `Pending` |
| `TT-005` | Performance | Replace oversized navbar logo asset | `P1` | high | `S` | `Wave 1` | `Done` |
| `TT-005A` | Performance | Replace oversized favicon strategy | `P1` | high | `S` | `Wave 1` | `Done` |
| `TT-006` | Brand trust | Replace or remove hero photo | `P1` | high | `M` | `Wave 2` | `Done` |
| `TT-007` | Visual polish | Simplify hero cards and reduce template feel | `P2` | medium | `M` | `Wave 2` | `Done` |
| `TT-008` | Mobile nav | Convert mobile menu into robust overlay | `P2` | medium | `M` | `Wave 2` | `Done` |
| `TT-009` | Affordance | Clarify clickable badges and small links | `P2` | medium | `S` | `Wave 3` | `Pending` |
| `TT-010` | Performance | Remove duplicate Google Fonts loading | `P2` | medium | `S` | `Wave 4` | `Pending` |
| `TT-011` | Performance | Improve hero image LCP handling | `P2` | medium | `S` | `Wave 4` | `Pending` |
| `TT-012` | Assets | Compress or replace photo fallback strategy | `P2` | medium | `S` | `Wave 4` | `Pending` |
| `TT-013` | Governance | Review third-party frontend scripts | `P3` | low | `S` | `Wave 4` | `Pending` |
| `TT-014` | Accessibility | Add consistent `:focus-visible` states | `P2` | medium | `S` | `Wave 2` | `Done` |
| `TT-015` | Portfolio copy | Rewrite project cards for scanability and proof | `P1` | high | `M` | `Wave 3` | `Pending` |
| `TT-016` | Information architecture | Reorder and emphasize anchor projects | `P2` | medium | `S` | `Wave 3` | `Pending` |
| `TT-017` | Content structure | Reduce redundancy across About, Proof, Credentials | `P2` | medium | `M` | `Wave 5` | `Pending` |
| `TT-018` | Contact UX | Fix form/contact microcopy and state clarity | `P2` | medium | `S` | `Wave 3` | `Pending` |
| `TT-019` | SEO/social | Use OG card asset in metadata | `P2` | medium | `S` | `Wave 5` | `Pending` |
| `TT-020` | SEO architecture | Decide root URL and sitemap strategy | `P2` | medium | `M` | `Wave 5` | `Pending` |
| `TT-021` | Trust QA | Revalidate credential links | `P2` | medium | `S` | `Wave 5` | `Pending` |
| `TT-022` | Maintainability | Consolidate repeated CSS patterns | `P3` | low | `M` | `Wave 4` | `Pending` |
| `TT-023` | Design system | Separate reusable tokens from decorative exceptions | `P3` | low | `M` | `Wave 4` | `Pending` |

## 7. Execution Sequence

Recommended implementation order:

1. `TT-001`
2. `TT-002`
3. `TT-003`
4. `TT-005`
5. `TT-005A`
6. `TT-006`
7. `TT-007`
8. `TT-008`
9. `TT-014`
10. `TT-004`
11. `TT-015`
12. `TT-016`
13. `TT-009`
14. `TT-018`
15. `TT-010`
16. `TT-011`
17. `TT-012`
18. `TT-013`
19. `TT-022`
20. `TT-023`
21. `TT-019`
22. `TT-020`
23. `TT-021`
24. `TT-017`

Rationale:

- This order fixes `business-critical perception` first.
- It postpones `cleanup` until layout and copy stabilize.
- It postpones `metadata` until public-facing assets and messaging are final.

## 8. Session Scoreboard Template

Use this after each implementation session.

| Session date | Active wave | Tasks touched | Build status | Breakpoint status | Lighthouse delta | Blockers | Next action |
|---|---|---|---|---|---|---|---|
| `2026-04-29` | `Wave 1` | `TT-001, TT-002, TT-003, TT-005, TT-005A` | `Pass` | `OK` | `Not yet re-run` | `None` | `Start Wave 2 with TT-006 or TT-008` |
| `2026-04-29` | `Wave 2` | `TT-006, TT-007, TT-008, TT-014` | `Pass` | `OK` | `Not yet re-run` | `None` | `Start Wave 3 with TT-004` |
| `YYYY-MM-DD` | `Wave X` | `TT-000, TT-000` | `Pass/Fail` | `OK/Issue` | `N/A or summary` | `None or note` | `single next move` |

## 9. Release Scoreboard Template

Use this when preparing to publish a wave or the full program.

| Check | Status | Notes |
|---|---|---|
| `npm run build` passes | `Pending` |  |
| Desktop visual review complete | `Pending` |  |
| Mobile visual review complete | `Pending` |  |
| Tablet visual review complete | `Pending` |  |
| No horizontal overflow | `Pending` |  |
| Core links verified | `Pending` |  |
| Console clean enough | `Pending` |  |
| Lighthouse desktop recorded | `Pending` |  |
| Lighthouse mobile recorded | `Pending` |  |
| Metadata validated | `Pending` |  |

## 10. Validation Protocol

Required breakpoints:

- `360x800`
- `390x844` or `414x896`
- `768x1024`
- `1366x900`
- `1920x1080`

Required validations after any significant UI wave:

- review homepage top section in all required breakpoints
- confirm no horizontal overflow
- confirm nav works in desktop and mobile
- confirm hero CTA visibility in mobile
- confirm portfolio filter behavior
- confirm keyboard focus visibility
- confirm contact actions still make sense
- run `npm run build`

Required validations after performance-related tasks:

- rerun Lighthouse mobile and desktop
- inspect top network requests
- confirm no oversized branding assets remain in initial payload

Required validations after metadata tasks:

- inspect rendered HTML
- confirm `canonical`, `hreflang`, `og:image`, and `twitter:image`
- confirm root strategy and sitemap are aligned

## 11. Commands

Build:

```bash
npm run build
```

Lighthouse desktop:

```bash
npx lighthouse https://tooltician.com/en/ --preset=desktop --chrome-flags='--headless --no-sandbox' --output=json --output-path=output/lighthouse/desktop.json
```

Lighthouse mobile:

```bash
npx lighthouse https://tooltician.com/en/ --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --chrome-flags='--headless --no-sandbox' --output=json --output-path=output/lighthouse/mobile.json
```

## 12. Definition of Done

A task is only done when all relevant conditions are true:

- implementation is complete
- the page still builds
- affected breakpoints were reviewed
- no new obvious UX regression was introduced
- scoreboard status was updated
- if the task touches performance, the metric delta was measured
- if the task touches copy, both `EN` and `ES` were considered

## 13. Immediate Recommendation

Start with `Wave 1` and do not split focus.

Best first batch:

1. `TT-001`
2. `TT-002`
3. `TT-003`
4. `TT-005`
5. `TT-005A`

That batch should produce the fastest visible improvement in:

- clarity
- perceived professionalism
- mobile usability
- raw page weight

## 14. Optimization & Self-aligment

Before you start work on this project, create/update three files:
1. spec.md — a complete spec with goals, implementation details, and a verification section describing exactly how you'll prove each piece works.
2. todo.md — a running to-do list you'll edit as you work. Break complex tasks into verifiable sub-tasks.
3. tests/ — a folder of end-to-end tests that let you verify everything you build. Loop on them until each passes.

While you work: (a) consult spec.md before every change, (b) check off todo.md as you go, (c) run tests after every meaningful commit, (d) every ~20 iterations, call a fresh sub-agent with "review spec.md and the current implementation for gaps" and loop on its feedback until alignment is reached.

Do not ask me for clarification on anything you can resolve by reading the spec and running the tests. Start with the spec.
