# Services Catalog Proposal — Productized Scope & Pricing

Version: `2026-05-30`
Status: `Proposed — awaiting pricing sign-off before page build`
Author: drafted by assistant, acting as domain expert; numbers are **proposed defaults, adjust freely**.
Goal alignment: this serves the *monetization* half of the original objective (reach/traffic + monetization). Each productized service is simultaneously a **commercial-intent SEO landing** and a **conversion surface** with clear scope + price.

---

## 1. Strategic decisions baked into this proposal

These are the choices I made for you. Each is reversible — flag any you want changed.

| Decision | What I chose | Why |
|---|---|---|
| **Consolidate 7 → 5 services** | Merge the 7 thin schema "Offers" into 5 productized services (4 new + the existing Web Technical Hygiene) | Fewer, stronger pages rank and convert better than 6 thin ones. Each new page targets a distinct keyword cluster instead of cannibalizing. |
| **Dual-market pricing** | ES in UF (CL/LATAM), EN in USD premium (~1.4–1.6x), mirroring the existing Web Technical Hygiene page | You already proved this model works; consistency avoids reinventing per service. |
| **Fixed-scope tiers, not hourly** | Every service = free call → paid scoping → 2 fixed build tiers → optional retainer | Fixed scope qualifies leads, removes price friction, and is what converts vs. "contact for quote". |
| **Universal entry point** | Free 15-min diagnostic call (Calendly) on every service | Lowers commitment, matches current funnel. |
| **Page structure** | `/en/services/<slug>/` + `/es/servicios/<slug>/`, cloning the proven Web Technical Hygiene template (hero → who it's for → scope in/out → deliverables → pricing ladder → FAQ → CTA) | Reuses working layout, JSON-LD (`Service` + `FAQPage` + `BreadcrumbList`), and styles. |

**Pricing calibration reference (from existing site):**
- 1 UF ≈ CLP $41,000 ≈ USD ~$43 (the value already hard-coded in the Web Hygiene page).
- ES tiers are calibrated for local purchasing power; EN tiers are a deliberate international premium with executive-ready deliverables — **not** a currency conversion. (Precedent: Web Hygiene "Full Review" is 15 UF ≈ $650 in ES vs **$999** in EN.)

---

## 2. The 7 → 5 mapping

| Original schema Offer | Lands in |
|---|---|
| ETL & Workflow Automation | **#2 Python Automation & Data Pipelines** |
| Scraping & Data Acquisition | **#2 Python Automation & Data Pipelines** |
| Reporting & Data Delivery | **#2 Python Automation & Data Pipelines** |
| Internal APIs & Reliability | **#3 Internal Tools & APIs** |
| (Operator-Ready Internal Tools) | **#3 Internal Tools & APIs** |
| Financial & Audit Tooling | **#4 Financial & Audit Tooling** |
| Static Sites & Front Ends | **#5 Static Sites & Front Ends** |
| Web Technical Hygiene | **#1 — already live, reference only** |

---

## 3. Service #1 — Web Technical Hygiene `(EXISTING — reference, no change)`

Already live with a proven ladder. Listed here only so the catalog is internally consistent.

| Tier | ES (CL/LATAM) | EN (international) |
|---|---|---|
| Diagnostic | 1 UF | $69 |
| Basic Hardening | from 7 UF | — |
| Operational Review & Hardening | from 13 UF | from $899 |
| Full Review + Executive Report | from 15 UF | from $999 |
| Monthly Technical Support | from 4 UF/mo | from $279/mo |

---

## 4. Service #2 — Python Automation & Data Pipelines `(NEW — build first)`

**Positioning:** Replace recurring manual data/report work with scheduled, reproducible pipelines that emit the same answer every time.
**Target keywords:** `python automation consultant`, `ETL pipeline developer`, `web scraping service`, `reporting automation`.
**Ideal client:** ops-heavy team with a known recurring bottleneck (reports assembled by hand, fragile scrapes, copy-paste delivery).
**Proof to feature:** polla (jackpot ingestion), conciliador_bancario, Noticiencias collector.

**Scope — included:** scheduled ETL, resilient/re-runnable scrapers, structured output & reporting flows, logging, retries, README + runbook, CI/schedule, failure alerts, handoff.
**Scope — excluded:** open-ended product development, real-time streaming infrastructure, data-warehouse platform standup, ML model development.

**Deliverables:** working pipeline in your environment · README + operating notes · CI or scheduled run · documented failure points & alerts.

| Tier | ES | EN | Outcome |
|---|---|---|---|
| Diagnostic call | free (15 min) | free (15 min) | Confirm fit |
| **Automation Scoping** (scope doc, credited to build) | 3 UF | $290 | Inputs/outputs/owner/success criteria in writing |
| **Scoped Automation Build** (1 flow/source) | from 30 UF | from $1,500 | One pipeline live + handoff |
| **Multi-source Data System** | from 60 UF | from $3,200 | Several sources, orchestrated, monitored |
| **Stabilization Retainer** | from 6 UF/mo | from $290/mo | Ongoing upkeep & external judgment |

> Note: the homepage currently advertises automation at "from 30 UF (~$1,200)" even in EN. This proposal adds a **deliberate international USD tier** (from $1,500) for EN, matching the Web Hygiene precedent. Decision point — confirm you want the EN premium, or keep EN UF-anchored.

---

## 5. Service #3 — Internal Tools & APIs `(NEW)`

**Positioning:** Package scripts behind internal APIs or guided interfaces so the workflow stays usable after the original builder steps away.
**Target keywords:** `internal tools developer`, `FastAPI developer`, `script to internal API`, `internal API development`.
**Ideal client:** several people touch the same workflow and handoff/key-person risk is real.
**Proof to feature:** Rutificador (library + CLI), DNSpect, FastSearchAPI.

**Scope — included:** wrap scripts behind FastAPI / CLI / guided UI, auth, input validation, packaging, tests, docs, deploy.
**Scope — excluded:** full SaaS product, design-heavy frontends, mobile apps, staff augmentation with undefined ownership.

**Deliverables:** deployed internal API/tool · auth & validation · tests · docs + handoff.

| Tier | ES | EN | Outcome |
|---|---|---|---|
| Diagnostic call | free | free | Confirm fit |
| **Scoping** (credited to build) | 3 UF | $290 | Interface contract + scope in writing |
| **Scoped Internal Tool** | from 35 UF | from $1,800 | One workflow wrapped + handoff |
| **Team Platform** (multi-workflow) | from 70 UF | from $3,600 | Several workflows behind one usable surface |
| **Stabilization Retainer** | from 6 UF/mo | from $290/mo | Ongoing upkeep |

---

## 6. Service #4 — Financial & Audit Tooling `(NEW — premium)`

**Positioning:** Reconciliation and finance workflows that stop on mismatches, preserve audit traces, and make review easier. Fail-closed by design.
**Target keywords:** `bank reconciliation automation`, `financial reconciliation software`, `audit tooling`, `fail-closed reconciliation`.
**Ideal client:** finance/ops team where a wrong answer costs more than a slower explicit check.
**Proof to feature:** bankrecon (PyPI), Portfolio Manager (deterministic finance math).
**Why premium:** trust-critical work commands a premium; errors here are expensive.

**Scope — included:** reconciliation logic, fail-closed controls, deterministic audit artifacts, validation rules, reproducible outputs, docs.
**Scope — excluded:** full ERP/accounting platform, certified financial audit (not a CPA engagement), tax filing/advice.

**Deliverables:** reconciliation/control tool · audit-trace output · validation rule set · docs + handoff.

| Tier | ES | EN | Outcome |
|---|---|---|---|
| Diagnostic call | free | free | Confirm fit |
| **Scoping** (credited to build) | 4 UF | $390 | Control requirements + scope in writing |
| **Scoped Implementation** | from 45 UF | from $2,400 | One control/reconciliation flow live |
| **Financial Control System** | from 90 UF | from $4,800 | Multi-source controls + audit artifacts |
| **Stabilization Retainer** | from 8 UF/mo | from $390/mo | Ongoing upkeep & review |

---

## 7. Service #5 — Static Sites & Front Ends `(NEW)`

**Positioning:** Lean Astro/static surfaces that explain the system clearly, convert the right lead, and stay maintainable — evidence over decoration.
**Target keywords:** `astro developer`, `static site developer`, `fast website build`, `bilingual website developer`.
**Ideal client:** team that needs a credible, fast, maintainable public surface, not a decorative marketing site.
**Proof to feature:** this site (tooltician.com), Monedario, El Rincón de Ébano, Noticiencias.

**Scope — included:** Astro/static build, SEO + performance baked in, i18n, forms, deploy pipeline, docs.
**Scope — excluded:** complex web apps, e-commerce backends, CMS-heavy builds, ongoing content production.

**Deliverables:** deployed site · SEO/perf/i18n baked in · forms wired · docs + handoff.

| Tier | ES | EN | Outcome |
|---|---|---|---|
| Diagnostic call | free | free | Confirm fit |
| **Scoping** (credited to build) | 2 UF | $190 | Sitemap + scope in writing |
| **Scoped Site / Landing** | from 25 UF | from $1,200 | One fast, indexable site live |
| **Multi-page + i18n** | from 50 UF | from $2,600 | Larger bilingual site, SEO-complete |
| **Maintenance** | from 3 UF/mo | from $150/mo | Updates, monitoring, small changes |

---

## 8. SEO mapping (why this helps discoverability)

| New page | Primary commercial-intent query it can rank for |
|---|---|
| Python Automation & Data Pipelines | "python automation consultant", "etl pipeline freelance", "web scraping service" |
| Internal Tools & APIs | "internal tools developer", "fastapi developer for hire" |
| Financial & Audit Tooling | "bank reconciliation automation", "audit tooling developer" |
| Static Sites & Front Ends | "astro developer", "bilingual static site developer" |

Each page adds: a `Service` JSON-LD with `hasOfferCatalog`, a `FAQPage`, `BreadcrumbList`, internal links from the homepage `ServicesSection` cards (which currently point to `#contact-form`), and an entry in the sitemap. That's 8 new indexable URLs (4 services × 2 locales) of high commercial intent.

---

## 9. Recommended build order

1. **#2 Python Automation & Data Pipelines** — your core positioning, highest demand, strongest proof.
2. **#3 Internal Tools & APIs** — adjacent, reuses much of #2's framing.
3. **#4 Financial & Audit Tooling** — premium, differentiated, strong proof (bankrecon).
4. **#5 Static Sites & Front Ends** — lowest ticket, but easy proof and quick to write.

Each page ~ the Web Hygiene template. After build, wire the homepage `ServicesSection` card `href`s to the new pages (they currently go to `#contact-form`).

---

## 10. What I need from you to start building

1. **Sign off on / adjust the numbers** in §4–§7 (especially the EN international-premium decision in §4).
2. Confirm the **7→5 consolidation** (§2) — or tell me you want all 7 as separate pages.
3. Confirm **build order** (§9) or reprioritize.

Once you green-light, I clone the Web Hygiene template per service, in EN + ES, build cleanly, and wire the homepage cards.
