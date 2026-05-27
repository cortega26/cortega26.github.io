# Program Backlog: Higiene Técnica Web — Service Page Audit & Funnel Improvement

Version: `2026-05-27`
Status: `Complete — All 5 sessions done · One item blocked: HTW-B04 (social proof, pending first client delivery)`
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
Session 0 (Done) → Session B (Done) → Session D (Done) → Session A (Done) → Session C (Done)
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

### Session B — Conversión y Captación (Done 2026-05-26)
What a cold prospect experiences: above-the-fold clarity, contact path friction, absence of social proof, urgency signals, CTA specificity, FAQ coverage.

### Session D — Propuesta Comercial y Coherencia (Done 2026-05-26)
How the service differentiates from alternatives, risk mitigation for the buyer, brand voice audit, EN audience gap, commercial coherence with the portfolio narrative.

### Session A — UX/UI y Presentación (Done 2026-05-26)
Section count and rhythm, pricing card layout vs. comparison table, mobile experience, visual consistency with the global design system.

### Session C — SEO y Visibilidad Orgánica (Done 2026-05-26)
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

Exit gate: ✓ `npm run build` passes · All items above Done.

---

### Session B — Conversión y Captación (Done 2026-05-26)

Objective: reduce friction in the path from landing to contact, and add mechanisms that create action now vs. later.

| Metric | Baseline | Target | Outcome |
|---|---:|---:|---|
| Urgency / availability signal | `None` | Visible | `Done — capacity note in hero sidebar: "Acepto 2–3 diagnósticos nuevos por mes. Respuesta en 24–48 horas hábiles."` |
| CTA specificity | `Generic` | Intent-matched | `Done — 3 intent-matched mailto CTAs with prefilled subject and body per intent` |
| Contact path context | `Generic form` | Service-specific | `Done — all primary CTAs prefilled with service context; generic form remains as secondary` |
| Social proof | `0` | `≥1 signal` | `Partial — "Prueba técnica propia" card added (own site as verifiable proxy, score 3/5); real client testimonial blocked on HTW-B04` |
| Self-diagnosis hook | `None` | Present | `Done — SecurityHeaders.com lookup link in proof card with context` |
| FAQ objection coverage | `Partial` | Complete | `Done — "nothing found" case, scope freeze, and price questions addressed` |

Tasks:

| ID | Task | Priority | Effort | Status |
|---|---|---|---|---|
| `HTW-B01` | Add availability / capacity signal to hero | `P1` | `S` | `Done` |
| `HTW-B03` | Create service-specific contact path | `P1` | `M` | `Done` |
| `HTW-B04` | Add social proof — real client testimonial or case reference | `P1` | `L` | `Blocked — pending first client delivery` |
| `HTW-B06` | Add FAQ answers for price negotiation and scope freeze guarantee | `P2` | `S` | `Done` |
| `HTW-B07` | Add self-diagnosis hook (SecurityHeaders.com) | `P3` | `S` | `Done` |

Exit gate: ✓ Passed (HTW-B04 blocked — non-blocking for session exit)

---

### Session D — Propuesta Comercial y Coherencia (Done 2026-05-26)

Objective: make the commercial argument explicit and reduce perceived risk for the buyer.

| Metric | Baseline | Target | Outcome |
|---|---:|---:|---|
| Freelancer differentiation | `Implicit` | Explicit | `Done — comparison grid in #comparacion: 4 concrete points each` |
| Tooltician credentials as proof | `Unused` | Present | `Done — own site credentials cited: HTTPS, SPF/DKIM/DMARC, security headers, public code` |
| "Sin alarmismo" as value prop | `Disclaimer` | Central | `Done — elevated to named headline in service principle card` |
| Buyer risk mitigation | `None` | Present | `Done — risk note in #brief diagnostic card: "nothing found" → report confirms with evidence, no extra charges, scope cannot expand without agreement` |
| EN landing page | `None` | Stub or full | `Done — full page at /en/services/web-technical-hygiene/ with USD pricing and own proof section` |
| USD pricing visibility | `FAQ only` | Visible | `Done — USD range visible on page (diagnóstico $69, implementación $499, soporte $279/mo)` |
| Brand voice audit | `Not done` | Complete | `Done — confirmed coherent; service page and portfolio use same operator register` |

Tasks:

| ID | Task | Priority | Effort | Status |
|---|---|---|---|---|
| `HTW-D01` | Explicit freelancer differentiation | `P1` | `S` | `Done` |
| `HTW-D02` | Cite Tooltician credentials as live proof | `P2` | `S` | `Done` |
| `HTW-D04` | Add buyer risk note for diagnostic tier | `P2` | `S` | `Done` |
| `HTW-D05` | Create EN landing page | `P1` | `L` | `Done` |
| `HTW-D06` | Add USD pricing reference | `P2` | `S` | `Done` |

Exit gate: ✓ Passed

---

### Session A — UX/UI y Presentación (Done 2026-05-26)

Objective: reduce section fatigue, improve pricing scannability, and fix mobile experience.

| Metric | Baseline | Target | Outcome |
|---|---:|---:|---|
| Section count | `10` | `≤8` | `Done — 10 → 8 sections` |
| #comparacion + #casos overlap | `Present` | `Merged or cut` | `Done — merged into single section with subheader pattern` |
| Pricing layout | `5 cards` | `Table or improved cards` | `Done — desktop: 5-column comparison table with Recomendado badge; mobile: scroll-snap carousel (85vw per card)` |
| Mobile pricing scroll length | `Very long` | `Acceptable` | `Done — snap-to-start carousel, one card at a time` |
| Process section visual weight | `Text-only` | `Visually supported` | `Done — large accent numerals (2rem, 0.35 opacity) for visual hierarchy` |
| Design system consistency | `Unaudited` | `Verified` | `Done — verified, no out-of-system values found` |

Tasks:

| ID | Task | Priority | Effort | Status |
|---|---|---|---|---|
| `HTW-A01` | Merge #comparacion + #casos | `P1` | `M` | `Done` |
| `HTW-A03` | Fix mobile pricing scroll length | `P2` | `M` | `Done` |
| `HTW-A07` | Evaluate sticky CTA for long page | `P3` | `M` | `Done — not implemented; nav CTA already covers the function without adding clutter` |

Exit gate: ✓ Passed

---

### Session C — SEO y Visibilidad Orgánica (Done 2026-05-26)

Objective: align keyword strategy with actual search behavior and improve discovery paths.

| Metric | Baseline | Target | Outcome |
|---|---:|---:|---|
| "Mantención" vs "Mantenimiento" decision | `Unresolved` | `Decided and applied` | `Done — "mantención" chosen (Chilean usage, more specific); applied across H1, meta, JSON-LD, copy on both pages` |
| Internal links from portfolio to service | `0` | `≥2` | `Done — El Rincón de Ébano + Monedario, both ES (→ /es/servicios/higiene-tecnica-web/) and EN (→ /en/services/web-technical-hygiene/)` |
| FAQPage schema | `Missing` | `Present` | `Done — 11 Q&A entries on ES page and EN page` |
| HowTo schema | `Missing` | `Evaluated` | `Done — decided not to implement; process section describes provider steps, not user-executable instructions` |
| Service page in sitemap | `Unverified` | `Verified` | `Done — both ES and EN appear correctly in sitemap-0.xml` |

Tasks:

| ID | Task | Priority | Effort | Status |
|---|---|---|---|---|
| `HTW-C01` | Keyword decision: mantención vs mantenimiento | `P1` | `S` | `Done` |
| `HTW-C02` | Internal links from portfolio to service | `P2` | `S` | `Done` |
| `HTW-C03` | Add FAQPage JSON-LD schema | `P2` | `S` | `Done` |
| `HTW-C06` | Verify sitemap and canonical | `P2` | `S` | `Done` |
| `HTW-C07` | Add hreflang pair (ES/EN) | `P2` | `S` | `Done` |

Exit gate: ✓ Passed

---

## 6. Master Task Backlog

Tasks removed from original list after honest evaluation (not implemented and not worth implementing):
`HTW-B02` (hero CTA rewrite — existing CTAs already intent-specific), `HTW-B05` (cold-prospect viewport audit — a review task, not an implementation), `HTW-D03` (elevate "sin alarmismo" — done as part of D01 grid), `HTW-D07` (brand voice audit — completed, confirmed no changes needed), `HTW-A02` (comparison table redesign — superseded by desktop table + mobile carousel), `HTW-A04` (process section icons — done via accent numerals), `HTW-A05` (design token audit — done as part of session A), `HTW-A06` (section alternation audit — fixed as part of A01 merge), `HTW-C04` (HowTo schema — evaluated and rejected), `HTW-C05` (content gap analysis — out of scope for a page-level backlog).

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
| `HTW-B01` | B | Conversion | Add availability / capacity signal to hero | `P1` | `S` | `Done` |
| `HTW-B03` | B | Conversion | Create service-specific contact path | `P1` | `M` | `Done` |
| `HTW-B04` | B | Proof | Add social proof — real client testimonial or case reference | `P1` | `L` | `Blocked — pending first client delivery` |
| `HTW-B06` | B | Content | Add FAQ answers for price negotiation and scope freeze | `P2` | `S` | `Done` |
| `HTW-B07` | B | Conversion | Add self-diagnosis hook (SecurityHeaders.com) | `P3` | `S` | `Done` |
| `HTW-D01` | D | Commercial | Explicit freelancer differentiation | `P1` | `S` | `Done` |
| `HTW-D02` | D | Commercial | Cite Tooltician credentials as live proof | `P2` | `S` | `Done` |
| `HTW-D04` | D | Commercial | Add buyer risk note for diagnostic tier | `P2` | `S` | `Done` |
| `HTW-D05` | D | Integration | Create EN landing page | `P1` | `L` | `Done` |
| `HTW-D06` | D | Commercial | Add USD pricing reference | `P2` | `S` | `Done` |
| `HTW-A01` | A | UX/UI | Merge #comparacion + #casos | `P1` | `M` | `Done` |
| `HTW-A03` | A | UX/UI | Fix mobile pricing scroll length | `P2` | `M` | `Done` |
| `HTW-A07` | A | UX/UI | Evaluate sticky CTA | `P3` | `M` | `Done — not implemented` |
| `HTW-C01` | C | SEO | Keyword decision: mantención vs mantenimiento | `P1` | `S` | `Done` |
| `HTW-C02` | C | SEO | Internal links from portfolio to service | `P2` | `S` | `Done` |
| `HTW-C03` | C | SEO | Add FAQPage JSON-LD schema | `P2` | `S` | `Done` |
| `HTW-C06` | C | SEO | Verify sitemap and canonical | `P2` | `S` | `Done` |
| `HTW-C07` | C | SEO | Add hreflang pair (ES/EN) | `P2` | `S` | `Done` |

---

## 7. Session Log

| Date | Session | Tasks completed | Build | Blockers | Next action |
|---|---|---|---|---|---|
| `2026-05-26` | `0 — Baseline & Pricing` | `HTW-001 through HTW-013` | `Pass` | `None` | `Start Session B` |
| `2026-05-26` | `B — Conversión` | `HTW-B01, HTW-B03, HTW-B06, HTW-B07` | `Pass` | `HTW-B04 blocked — own site proxy added; real testimonial pending first delivery` | `Start Session D` |
| `2026-05-26` | `D — Comercial` | `HTW-D01, HTW-D02, HTW-D04, HTW-D05, HTW-D06` | `Pass` | `None` | `Start Session A` |
| `2026-05-26` | `A — UX/UI` | `HTW-A01, HTW-A03, HTW-A07` | `Pass` | `None` | `Start Session C` |
| `2026-05-26` | `C — SEO` | `HTW-C01, HTW-C02, HTW-C03, HTW-C06, HTW-C07` | `Pass` | `None` | `Program complete` |
| `2026-05-27` | `Backlog reconciliation` | `None — audit and cleanup only` | `—` | `HTW-B04 still blocked` | `HTW-B04 on first client delivery` |

---

## 8. Remaining Open Items & Priority Order

All sessions complete. Composite score: **4.4 / 5.0** (target met).

### Blocked (1 item)

| ID | Item | Why blocked | Trigger to unblock |
|---|---|---|---|
| `HTW-B04` | Real client testimonial or anonymous case reference | First paid delivery not yet made | First client completes their diagnostic or implementation plan |

### Aspirational 4→5 gaps (no sessions scheduled — revisit after first client delivery)

These are not scheduled tasks. The page already meets its targets. These represent what would push individual dimensions from 4 to 5 once real client evidence exists:

| Dimension | Current | What would push to 5 |
|---|---:|---|
| 8 · Social proof | `3` | HTW-B04 unblocked: real testimonial or named case reference |
| 7 · Conversion path | `4` | Lightweight intake form (name, URL, goal) replacing mailto prefill |
| 15 · Commercial differentiation | `4` | Before/after comparison once first delivery exists |
| 1 · Pricing psychology | `4` | Explicit feature comparison at the 13 UF vs 15 UF boundary — UF/USD split is deliberate strategy, not a gap |

None of these are actionable until the first delivery is complete. HTW-B04 is the unlock condition for all of them.

---

## 9. Definition of Done

A task is only done when all relevant conditions are true:

- Implementation is complete.
- `npm run build` passes.
- Affected breakpoints were reviewed (360, 390/414, 768, 1366, 1920).
- No new UX regression was introduced.
- Session scoreboard status was updated.
- If the task touches copy, both ES and EN implications were considered.
- If the task touches pricing or commercial framing, the decoy effect and tier journey were not disrupted.

---

## 10. Key Files

| File | Purpose |
|---|---|
| `src/pages/es/servicios/higiene-tecnica-web/index.astro` | Service landing page — primary audit target |
| `src/pages/en/services/web-technical-hygiene/index.astro` | EN landing page — created Session D |
| `src/components/ServiceSpotlight.astro` | Featured service callout on ES home |
| `src/components/ServicesSection.astro` | Services grid — both EN and ES versions |
| `src/components/HeroSection.astro` | ES hero service-note callout |
| `src/pages/es/index.astro` | ES main portfolio page |
| `src/pages/en/index.astro` | EN main portfolio page |
| `docs/tasks/higiene-tecnica-web-scorecard.md` | Dimension scorecard — update after each session |
