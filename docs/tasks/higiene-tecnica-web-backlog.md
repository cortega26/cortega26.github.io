# Program Backlog: Higiene Técnica Web — Service Page Audit & Funnel Improvement

Version: `2026-05-26`
Status: `Active — Session D complete`
Scope: `/es/servicios/higiene-tecnica-web/` landing page + integration points across `tooltician.com`
Primary goal: maximize conversion funnel from awareness through contact, across all dimensions of the service page and its integration with the main portfolio.

---

## 1. Executive Overview

This document is the operational backlog for the Higiene Técnica Web service page audit program.
It covers four distinct audit sessions (B, D, A, C) executed after an initial baseline session (0).
Each session has a defined scope, scoreboard, task list, and exit gate.

### Baseline state (before Session 0)

| Dimension | Baseline score | Primary weakness |
|---|---:|---|
| Pricing psychology | `2/5` | 5 flat tiers, "Incluye todo lo anterior" ×3, English brand name |
| Copy quality — plans | `2/5` | Use-case intros, no transformation language, no tier journey |
| Copy quality — page | `3/5` | "Nueva línea de servicio" eyebrow, "CTA principal" H3 exposed |
| Visual proof | `2/5` | Only technical findings table, no executive report preview |
| ES home integration | `2/5` | One-liner in hero + card #7 of 7 — minimal prominence |
| EN integration | `0/5` | Not present anywhere in EN site |
| Conversion path | `2/5` | CTA goes to generic portfolio form with no service context |
| Social proof | `0/5` | None |
| Urgency / availability | `0/5` | None |
| UX/UI — section rhythm | `2/5` | 10 sections, conceptual overlap between #comparacion and #casos |
| UX/UI — mobile | `2/5` | 5 stacked pricing cards on mobile |
| SEO — keywords | `3/5` | Title/meta good but "mantención" vs "mantenimiento" unresolved |
| Commercial differentiation | `2/5` | Implicit only — no explicit contrast with freelancer alternative |
| Buyer risk mitigation | `1/5` | No satisfaction conditions, no partial guarantee |
| Brand voice coherence | `3/5` | Service tone consistent but implementation details leaking into UI |

### State after Session 0 (2026-05-26)

| Dimension | Score after Session 0 | Changes applied |
|---|---:|---|
| Pricing psychology | `4/5` | Decoy tiers differentiated, naming aligned, notes explicit |
| Copy quality — plans | `4/5` | Transformation intros, explicit item lists, tier journey narrative |
| Copy quality — page | `4/5` | Eyebrow, H3, brief section, mailto prefill fixed |
| Visual proof | `4/5` | Executive report mock (C→A scores, business-language findings) |
| ES home integration | `4/5` | ServiceSpotlight section added after ServicesSection |
| EN integration | `2/5` | Service card added to EN ServicesSection — no EN landing page |
| Conversion path | `3/5` | Mailto prefill improved, CTA copy updated |
| Social proof | `0/5` | Unchanged — pending Session B |
| Urgency / availability | `0/5` | Unchanged — pending Session B |
| UX/UI — section rhythm | `2/5` | Unchanged — pending Session A |
| UX/UI — mobile | `2/5` | Unchanged — pending Session A |
| SEO — keywords | `3/5` | Unchanged — pending Session C |
| Commercial differentiation | `2/5` | Unchanged — pending Session D |
| Buyer risk mitigation | `1/5` | Unchanged — pending Session D |
| Brand voice coherence | `4/5` | Eyebrow and H3 fixed, naming language aligned |

---

## 2. Operating Principles

- Fix conversion blockers before optimizing discovery (Session B before Session C).
- Fix commercial argument before polishing presentation (Session D before Session A).
- Every change must leave the page deployable: `npm run build` must pass.
- Both ES and EN implications must be considered for any copy or structure change.
- Scoring is updated at the end of each session — no score changes between sessions.
- Tasks are not considered done until the definition of done below is met.

---

## 3. Delivery Model

Sessions execute in this order based on conversion impact:

```
Session 0 (Done) → Session B → Session D → Session A → Session C
```

Rationale:
- Session B fixes conversion gaps that affect every visitor who already arrives.
- Session D hardens the commercial argument before bringing more traffic.
- Session A improves presentation after copy and argument are solid.
- Session C improves discovery after the destination is worth finding.

---

## 4. Session Scope Definitions

### Session 0 — Baseline & Pricing (Done 2026-05-26)
Pricing psychology, copy quality, visual proof, basic integration.

### Session B — Conversión y Captación
What a cold prospect experiences: above-the-fold clarity, contact path friction, absence of social proof, urgency signals, CTA specificity, FAQ coverage.

### Session D — Propuesta Comercial y Coherencia
How the service differentiates from alternatives, risk mitigation for the buyer, brand voice audit, EN audience gap, commercial coherence with the portfolio narrative.

### Session A — UX/UI y Presentación
Section count and rhythm, pricing card layout vs. comparison table, mobile experience, visual consistency with the global design system.

### Session C — SEO y Visibilidad Orgánica
Keyword strategy (mantención vs. mantenimiento), internal linking from portfolio to service page, schema markup completeness, content gap analysis.

---

## 5. Session Scoreboards

### Session 0 — Baseline & Pricing (Done)

| Item | Status | Notes |
|---|---|---|
| Eyebrow "Nueva línea de servicio" removed | `Done` | Replaced with "Higiene Técnica Web · Tooltician" |
| H3 "CTA principal" fixed | `Done` | Replaced with customer-facing heading + price |
| Mailto CTA prefilled | `Done` | Subject + body template with service fields |
| ServiceSpotlight created | `Done` | Added to ES home after ServicesSection |
| EN service card added | `Done` | Card #7 in EN ServicesSection, links to ES landing |
| Decoy pricing differentiated | `Done` | Tiers 3 and 4 clearly separated in name, note, and items |
| Plans array rewritten | `Done` | No "Incluye todo lo anterior", explicit items per tier |
| "Web Trust Pack" renamed | `Done` | "Revisión Integral con Reporte Ejecutivo" |
| "Mejor valor" → "Recomendado" | `Done` | Badge updated |
| Diagnostic discount clarified | `Done` | Mechanism explicit: "se aplica como crédito" |
| Tier 4 → Tier 5 connection | `Done` | Monitoring map explicitly bridges to monthly plan |
| Pricing subtitle narrative | `Done` | Journey from diagnosis to monthly articulated |
| Executive report mock | `Done` | C→A grades, 3 business-language findings, pending item bridges to monthly |

Exit gate: `npm run build` passes · All items above Done.

---

### Session B — Conversión y Captación

Objective: reduce friction in the path from landing to contact, and add mechanisms that create action now vs. later.

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Urgency / availability signal | `None` | Visible | `Pending` |
| CTA specificity | `Generic` | Intent-matched | `Pending` |
| Contact path context | `Generic form` | Service-specific | `Pending` |
| Social proof | `0` | `≥1 signal` | `Pending` |
| Self-diagnosis hook | `None` | Present | `Pending` |
| FAQ objection coverage | `Partial` | Complete | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Done when |
|---|---|---|---|---|
| `HTW-B01` | Add availability or capacity signal on landing page hero | `P1` | `S` | Prospect sees that slots exist and can be filled |
| `HTW-B02` | Rewrite hero primary CTA from generic to intent-specific | `P2` | `S` | CTA names the specific action and outcome, not just "solicitar" |
| `HTW-B03` | Create service-specific contact path (query param, dedicated anchor, or mini intake) | `P1` | `M` | Form or mailto receives service context without user typing it |
| `HTW-B04` | Add social proof signal — testimonial, anonymous case quote, or client reference | `P1` | `L` | At least one human signal of past delivery exists on the page |
| `HTW-B05` | Audit above-the-fold for cold prospect at 1366px and 375px | `P2` | `S` | Service understood and CTA visible within first viewport |
| `HTW-B06` | Audit FAQ for missing objections: price negotiation, scope creep, "what if nothing is found" | `P2` | `M` | Top 3 unresolved objections have answers |
| `HTW-B07` | Add self-diagnosis hook linking to SecurityHeaders.com with context | `P3` | `S` | Prospect can run a free check and arrive with their own data |

Exit gate:
- `npm run build` passes
- At least one mechanism creates urgency or reduces "I'll think about it" exits
- Contact path receives service context
- Session B scoreboard updated

---

### Session D — Propuesta Comercial y Coherencia

Objective: make the commercial argument explicit and reduce perceived risk for the buyer.

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Freelancer differentiation | `Implicit` | Explicit | `Pending` |
| Tooltician credentials as proof | `Unused` | Present | `Pending` |
| "Sin alarmismo" as value prop | `Disclaimer` | Central | `Pending` |
| Buyer risk mitigation | `None` | Present | `Pending` |
| EN landing page | `None` | Stub or full | `Pending` |
| USD pricing visibility | `FAQ only` | Visible | `Pending` |
| Brand voice audit | `Not done` | Complete | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Done when |
|---|---|---|---|---|
| `HTW-D01` | Add explicit differentiation vs. generic freelancer maintenance | `P1` | `M` | Buyer understands why Tooltician over a freelancer from Workana/Fiverr |
| `HTW-D02` | Use Tooltician's own site credentials as live proof (own SecurityHeaders score, public code, active projects) | `P2` | `S` | At least one concrete credential is cited on the service page |
| `HTW-D03` | Elevate "sin alarmismo, sin promesas de seguridad total" from disclaimer to featured value prop | `P2` | `S` | Anti-alarmism appears as a positive differentiator, not a hedge |
| `HTW-D04` | Add buyer risk mitigation for diagnostic tier (e.g., satisfaction condition or clear re-scope path) | `P2` | `M` | Buyer knows what happens if the diagnostic finds nothing actionable |
| `HTW-D05` | Create EN landing page — full or minimal stub with redirect to ES | `P1` | `L` | EN-speaking prospects have a destination beyond the services card |
| `HTW-D06` | Add indicative USD pricing — even a range — visible on the page, not just in FAQ | `P2` | `S` | International prospects see a number without reading the full FAQ |
| `HTW-D07` | Audit brand voice consistency: service page tone vs. portfolio tone | `P2` | `M` | Both pages read as the same operator with the same voice |

Exit gate:
- `npm run build` passes
- Freelancer differentiation is explicit on the page
- Buyer risk for the diagnostic tier is addressed
- Session D scoreboard updated

---

### Session A — UX/UI y Presentación

Objective: reduce section fatigue, improve pricing scannability, and fix mobile experience.

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| Section count | `10` | `≤8` | `Pending` |
| #comparacion + #casos overlap | `Present` | `Merged or cut` | `Pending` |
| Pricing layout | `5 cards` | `Table or improved cards` | `Pending` |
| Mobile pricing scroll length | `Very long` | `Acceptable` | `Pending` |
| Process section visual weight | `Text-only` | `Visually supported` | `Pending` |
| Design system consistency | `Unaudited` | `Verified` | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Done when |
|---|---|---|---|---|
| `HTW-A01` | Evaluate and merge sections #comparacion and #casos — they overlap conceptually | `P1` | `M` | Page has ≤8 sections with no conceptual repetition |
| `HTW-A02` | Redesign pricing section as comparison table with feature rows | `P2` | `M` | Buyer can compare tiers horizontally at a glance |
| `HTW-A03` | Audit and fix mobile pricing — 5 stacked cards creates excessive scroll | `P2` | `M` | Mobile pricing is navigable in under 2 scrolls |
| `HTW-A04` | Add visual support to process section (icons, numbering weight, or timeline) | `P3` | `M` | Process steps feel purposeful, not just a text list |
| `HTW-A05` | Verify all service page styles use tokens from global.css — no magic values | `P2` | `S` | No hex colors or spacing values defined outside the design system |
| `HTW-A06` | Audit section alternation rhythm past the midpoint | `P3` | `S` | Section backgrounds and spacing feel intentional end to end |
| `HTW-A07` | Evaluate sticky CTA for long page | `P3` | `M` | Decision made on whether sticky CTA improves or clutters the experience |

Exit gate:
- `npm run build` passes
- Page has ≤8 sections
- Mobile pricing is navigable without excessive scroll
- Session A scoreboard updated

---

### Session C — SEO y Visibilidad Orgánica

Objective: align keyword strategy with actual search behavior and improve discovery paths.

| Metric | Baseline | Target | Current status |
|---|---:|---:|---|
| "Mantención" vs "Mantenimiento" decision | `Unresolved` | `Decided and applied` | `Pending` |
| Internal links from portfolio to service | `0` | `≥2` | `Pending` |
| FAQPage schema | `Missing` | `Present` | `Pending` |
| HowTo schema | `Missing` | `Evaluated` | `Pending` |
| Service page in sitemap | `Unverified` | `Verified` | `Pending` |

Tasks:

| ID | Task | Priority | Effort | Done when |
|---|---|---|---|---|
| `HTW-C01` | Research "mantención técnica web" vs "mantenimiento web" search volume for CL/LATAM and decide which term to prioritize | `P1` | `S` | Primary keyword is chosen and applied consistently across title, meta, h1, and copy |
| `HTW-C02` | Add internal links from relevant portfolio project cards to the service page | `P2` | `S` | At least 2 portfolio entries link naturally to the service (e.g., Monedario, El Rincón de Ébano) |
| `HTW-C03` | Add FAQPage JSON-LD schema using existing FAQ content | `P2` | `S` | FAQ section has schema markup that Google can use for rich results |
| `HTW-C04` | Evaluate HowTo schema for the 5-step process section | `P3` | `S` | Decision made — implement if justifiable |
| `HTW-C05` | Identify top 3 informational search queries this service could target with supporting content | `P2` | `M` | Content gap list exists with 3 concrete topics and approximate search intent |
| `HTW-C06` | Verify service page appears correctly in sitemap.xml and has correct canonical | `P2` | `S` | Page is indexed correctly and canonical points to itself |
| `HTW-C07` | Once EN page exists: add correct hreflang pair for ES/EN | `P2` | `S` | hreflang is bidirectional and accurate (depends on HTW-D05) |

Exit gate:
- `npm run build` passes
- Primary keyword is applied consistently
- FAQPage schema is in place
- Session C scoreboard updated

---

## 6. Master Task Backlog

| ID | Session | Area | Task | Priority | Effort | Status |
|---|---|---|---|---|---|---|
| `HTW-001` | 0 | Copy | Fix eyebrow "Nueva línea de servicio" | `P1` | `S` | `Done` |
| `HTW-002` | 0 | Copy | Fix H3 "CTA principal" | `P1` | `S` | `Done` |
| `HTW-003` | 0 | Conversion | Improve mailto CTA with prefilled brief | `P2` | `S` | `Done` |
| `HTW-004` | 0 | Integration | Create ServiceSpotlight on ES home | `P1` | `M` | `Done` |
| `HTW-005` | 0 | Integration | Add service card to EN ServicesSection | `P2` | `S` | `Done` |
| `HTW-006` | 0 | Pricing | Implement decoy pricing differentiation | `P1` | `M` | `Done` |
| `HTW-007` | 0 | Pricing | Rewrite plans array (no "Incluye todo lo anterior") | `P1` | `M` | `Done` |
| `HTW-008` | 0 | Pricing | Rename "Web Trust Pack" to Spanish | `P2` | `S` | `Done` |
| `HTW-009` | 0 | Pricing | Change "Mejor valor" → "Recomendado" | `P2` | `S` | `Done` |
| `HTW-010` | 0 | Pricing | Clarify diagnostic discount mechanism | `P2` | `S` | `Done` |
| `HTW-011` | 0 | Pricing | Connect tier 4 monitoring map to tier 5 | `P2` | `S` | `Done` |
| `HTW-012` | 0 | Pricing | Update pricing subtitle with journey narrative | `P2` | `S` | `Done` |
| `HTW-013` | 0 | Proof | Add executive report mock with C→A scores | `P1` | `M` | `Done` |
| `HTW-B01` | B | Conversion | Add availability / capacity signal | `P1` | `S` | `Done` |
| `HTW-B02` | B | Conversion | Rewrite hero CTA to intent-specific | `P2` | `S` | `Done` |
| `HTW-B03` | B | Conversion | Create service-specific contact path | `P1` | `M` | `Done` |
| `HTW-B04` | B | Proof | Add social proof signal | `P1` | `L` | `Done` |
| `HTW-B05` | B | Conversion | Audit above-the-fold for cold prospect | `P2` | `S` | `Done` |
| `HTW-B06` | B | Content | Audit FAQ for missing objections | `P2` | `M` | `Done` |
| `HTW-B07` | B | Conversion | Add self-diagnosis hook (SecurityHeaders.com) | `P3` | `S` | `Done` |
| `HTW-D01` | D | Commercial | Explicit freelancer differentiation | `P1` | `M` | `Done` |
| `HTW-D02` | D | Commercial | Use Tooltician credentials as live proof | `P2` | `S` | `Done` |
| `HTW-D03` | D | Commercial | Elevate "sin alarmismo" to value prop | `P2` | `S` | `Done` |
| `HTW-D04` | D | Commercial | Add buyer risk mitigation for diagnostic | `P2` | `M` | `Done` |
| `HTW-D05` | D | Integration | Create EN landing page (full or stub) | `P1` | `L` | `Done` |
| `HTW-D06` | D | Commercial | Add USD pricing reference | `P2` | `S` | `Done` |
| `HTW-D07` | D | Brand | Audit brand voice consistency | `P2` | `M` | `Done` |
| `HTW-A01` | A | UX/UI | Merge #comparacion + #casos | `P1` | `M` | `Pending` |
| `HTW-A02` | A | UX/UI | Redesign pricing as comparison table | `P2` | `M` | `Pending` |
| `HTW-A03` | A | UX/UI | Fix mobile pricing scroll length | `P2` | `M` | `Pending` |
| `HTW-A04` | A | UX/UI | Visual upgrade for process section | `P3` | `M` | `Pending` |
| `HTW-A05` | A | UX/UI | Verify design system token usage | `P2` | `S` | `Pending` |
| `HTW-A06` | A | UX/UI | Section alternation rhythm audit | `P3` | `S` | `Pending` |
| `HTW-A07` | A | UX/UI | Evaluate sticky CTA | `P3` | `M` | `Pending` |
| `HTW-C01` | C | SEO | Keyword decision: mantención vs mantenimiento | `P1` | `S` | `Pending` |
| `HTW-C02` | C | SEO | Internal links from portfolio to service | `P2` | `S` | `Pending` |
| `HTW-C03` | C | SEO | Add FAQPage JSON-LD schema | `P2` | `S` | `Pending` |
| `HTW-C04` | C | SEO | Evaluate HowTo schema for process section | `P3` | `S` | `Pending` |
| `HTW-C05` | C | SEO | Content gap analysis — 3 informational topics | `P2` | `M` | `Pending` |
| `HTW-C06` | C | SEO | Verify sitemap and canonical | `P2` | `S` | `Pending` |
| `HTW-C07` | C | SEO | Add hreflang pair once EN page exists | `P2` | `S` | `Pending (blocks on HTW-D05)` |

---

## 7. Session Log

| Date | Session | Tasks completed | Build | Blockers | Next action |
|---|---|---|---|---|---|
| `2026-05-26` | `0 — Baseline & Pricing` | `HTW-001 through HTW-013` | `Pass` | `None` | `Start Session B — Conversión y Captación` |
| `2026-05-26` | `B — Conversión` | `HTW-B01, HTW-B02, HTW-B03, HTW-B04, HTW-B05, HTW-B06, HTW-B07` | `Pass` | `None` | `Start Session D — Propuesta Comercial` |
| `2026-05-26` | `D — Comercial` | `HTW-D01, HTW-D02, HTW-D03, HTW-D04, HTW-D05, HTW-D06, HTW-D07` | `Pass` | `None` | `Start Session A — UX/UI y Presentación` |
| `YYYY-MM-DD` | `A — UX/UI` | `HTW-A0X, ...` | `Pass/Fail` | `None or note` | `Single next move` |
| `YYYY-MM-DD` | `C — SEO` | `HTW-C0X, ...` | `Pass/Fail` | `None or note` | `Single next move` |

---

## 8. Definition of Done

A task is only done when all relevant conditions are true:

- Implementation is complete.
- `npm run build` passes.
- Affected breakpoints were reviewed (360, 390/414, 768, 1366, 1920).
- No new UX regression was introduced.
- Session scoreboard status was updated.
- If the task touches copy, both ES and EN implications were considered.
- If the task touches pricing or commercial framing, the decoy effect and tier journey were not disrupted.

---

## 9. Key Files

| File | Purpose |
|---|---|
| `src/pages/es/servicios/higiene-tecnica-web/index.astro` | Service landing page — primary audit target |
| `src/components/ServiceSpotlight.astro` | Featured service callout on ES home |
| `src/components/ServicesSection.astro` | Services grid — both EN and ES versions |
| `src/components/HeroSection.astro` | ES hero service-note callout |
| `src/pages/es/index.astro` | ES main portfolio page |
| `src/pages/en/index.astro` | EN main portfolio page — EN gap reference |
| `docs/tasks/higiene-tecnica-web-scorecard.md` | Dimension scorecard — update after each session |
