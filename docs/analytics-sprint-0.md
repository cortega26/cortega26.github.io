# Analytics Sprint 0 — Service/Lead Funnel Analytics

> Status: implemented (semantically corrected). Static Astro consulting site,
> GA4 (gtag.js direct, `G-2HK4GHK7GR`).
> This doc is the Sprint 0 record: business model, architecture, service
> registry, event dictionary, privacy rules, Cloudflare comparison method,
> GA4 configuration, and production validation.

## 1. Business model (source of truth)

`tooltician.com` is a **consulting/portfolio site with productized services and
a lead-generation funnel**. It is not a tools platform and not a SaaS. There
are no in-browser executions, uploads, exports, accounts, or usage limits.

The actual funnel:

```text
traffic
  → service discovery (service pages, services section, guides)
    → service engagement (interest in a specific service)
      → trust/proof interaction (results band, evidence, portfolio, CV)
        → brief/contact intent (brief form, call booking, email)
          → successful lead (delivered brief)
```

The analytics taxonomy in this doc describes that business. An earlier
iteration modeled services as "tools" (`tool_view`, `tool_execute`, …) to
preserve the wording of the original brief; that vocabulary was misleading and
has been removed from the canonical schema (§9 maps old → new).

No monetization was implemented: no limits, paywalls, auth, pricing changes,
sales CTAs, or UX changes. Measurement-only `data-*` attributes were added to
existing interactive elements.

## 2. Architecture

```text
page markup (data-service-id + explicit intent attributes, §5)
  → public/assets/js/product-analytics.js   (canonical layer: window.ttAnalytics)
  → public/assets/js/track.js               (transport: window.ttTrack → gtag queue)
  → GA4 (gtag.js, single init in BaseLayout / gateway stub)
```

- **One initialization path.** GA4 stub lives in `src/layouts/BaseLayout.astro`
  (all content pages) and `src/pages/index.astro` (language gateway). MPA site,
  no client-side router → automatic `page_view` per navigation, no duplicates.
- **Transport (`track.js`) unchanged in contract.** `ttTrack(name,
  {location, label, status})`, queue-until-gtag, and declarative `[data-track]`
  clicks are intact. It additionally passes a minimal allowlist of canonical
  params (`service_id`, `service_category`, `contact_type`, `cta_location`,
  `error_category`, `error_stage`) — string-only, 100-char cap.
- **Canonical layer (`product-analytics.js`, deferred, CSP-safe external file —
  no CSP hash changes):** registry validation, per-event param allowlists,
  sanitization, view/engage/start dedup, DNT/GPC/localhost suppression, error
  normalization, explicit declarative bindings. All failures silent by design.
- **Brief lifecycle (`intake-form.js`):** emits `brief_start/submit/success/
  error` — plus `service_engage` when the form lives in a real service scope —
  alongside the unchanged legacy `form_start/form_submit_success/
  form_submit_error`.
- **Copy-email (`contact-section.js`):** successful clipboard write emits
  `email_copy`. The address itself is never sent.
- **Page identity** comes from GA4's built-in page dimensions. The canonical
  layer sends no `page_path` of its own.

### Files changed (semantic refactor)

| File | Change |
|---|---|
| `src/data/service-registry.json` | Canonical service registry (renamed from tool registry; `service_id`, `service_category`, routes) |
| `public/assets/js/product-analytics.js` | Canonical service/lead layer (`window.ttAnalytics`; no `tool_*`, no `result_action`, no `page_path`) |
| `public/assets/js/track.js` | Minimal service/lead param pass-through (legacy intact) |
| `public/assets/js/intake-form.js` | Brief lifecycle + scoped `service_engage` (legacy intact) |
| `public/assets/js/contact-section.js` | `email_copy` on successful copy |
| `src/layouts/BaseLayout.astro` | Load `product-analytics.js` |
| `src/pages/index.astro` | Load `track.js` + `product-analytics.js`; `data-language-select` |
| `src/components/ServicePage.astro` | `data-service-id`; `data-service-engage`, `data-book-call`, `data-template-open`, `data-proof-click` |
| `src/pages/.../web-technical-hygiene/index.astro` (en) | `htw` scope; same intent attributes |
| `src/pages/.../higiene-tecnica-web/index.astro` (es) | `htw` scope; `data-book-call`, `data-proof-click` |
| `src/components/HeroSection.astro` | `data-book-call`, `contact_intent/send_brief` |
| `src/components/ContactSection.astro` | `data-book-call`, `contact_intent/email`, `data-template-open` |
| `src/components/IntakeForm.astro` | `data-book-call` on Calendly alt-link |
| `src/components/AboutSection.astro`, `Footer.astro` | `data-cv-download` on CV links |
| `src/components/ResultsBand.astro` | `data-proof-click` on verify links |
| `src/components/PortfolioSection.astro` | `data-portfolio-click` on project links; legacy `portfolio_filter` |
| `src/data/siteDocuments.ts` | Privacy/cookies disclose the service/lead params |
| `tests/analytics-service-funnel.mjs` | 77 behavioral unit tests (replaces tool-vocabulary suite) |
| `tests/run.js` | S0 wiring group enforces corrected semantics |
| `package.json` | `test` runs the corrected suite |

## 3. Service registry

Source of truth: `src/data/service-registry.json` (client mirror
`SERVICE_REGISTRY` in `product-analytics.js`, parity-tested). `service_id` is
stable and never derived from display text; routes are never renamed for
analytics. Generic surfaces (home, work, guides, gateway) are **not** services:
events fired there simply omit `service_id`/`service_category`.

| service_id | public_name | service_category | route_en | route_es |
|---|---|---|---|---|
| `automation` | Python Automation & Data Pipelines | `automation` | `/en/services/python-automation/` | `/es/servicios/automatizacion-python/` |
| `recurring-data` | Recurring Data Collection | `data-collection` | `/en/services/recurring-data-collection/` | `/es/servicios/recoleccion-recurrente-datos/` |
| `internal-tools` | Internal Tools & APIs | `internal-tools` | `/en/services/internal-tools/` | `/es/servicios/herramientas-internas/` |
| `financial` | Financial & Audit Systems | `financial` | `/en/services/financial-tooling/` | `/es/servicios/herramientas-financieras/` |
| `web` | Static Sites & Focused Front Ends | `web` | `/en/services/static-sites/` | `/es/servicios/sitios-web/` |
| `htw` | Web Technical Hygiene | `hygiene` | `/en/services/web-technical-hygiene/` | `/es/servicios/higiene-tecnica-web/` |

## 4. Canonical event dictionary

Every event below corresponds to behavior actually present in the repository.
`service_id`/`service_category` appear only when a real service scope was
resolved (service page scope or service-qualified brief form).

| Event | Real action → trigger | Params |
|---|---|---|
| `service_view` | A service page becomes available (`<main data-service-id>` at load); once per service per page load | `service_id`, `service_category` |
| `service_engage` | First meaningful interaction showing interest in a service: intent-chip click, or first input into that service's brief form. Never page load; once per service per page load | `service_id`, `service_category` |
| `brief_start` | First input into any brief form; once per form context per page load | `service_id`?, `service_category`? |
| `brief_submit` | Brief submit attempted (after native validation passes); every attempt counts | `service_id`?, `service_category`? |
| `brief_success` | Formspree `response.ok` — the primary qualified-lead signal | `service_id`?, `service_category`? |
| `brief_error` | Normalized brief failure only: failed native validation, HTTP 4xx/5xx, network | `service_id`?, `service_category`?, `error_category ∈ {validation,client,server,network}`, `error_stage ∈ {validate,submit,deliver}` |
| `book_call` | Calendly CTA clicked — call-booking intent, economically distinct from a brief | `cta_location`, `service_id`?, `service_category`? |
| `email_copy` | Email address successfully copied to clipboard | `service_id`?, `service_category`? |
| `proof_click` | Outbound verification click: ResultsBand "check it yourself" links, service evidence badges | `service_id`?, `service_category`? |
| `portfolio_click` | Portfolio project link clicked (repo, live site, store, CI) | `service_id`?, `service_category`? |
| `cv_download` | CV PDF link clicked | — |
| `template_open` | Scoping-template document opened (evaluation depth) | `service_id`?, `service_category`? |
| `language_select` | Gateway language card chosen | — |
| `contact_intent` | Generic fallback only: brief-nav CTA (`send_brief`) and mailto link (`email`) | `contact_type ∈ {send_brief,email}`, `cta_location`, `service_id`?, `service_category`? |

Legacy events kept as-is (§8): `form_start`, `form_submit_success`,
`form_submit_error`, `cta_book_call`, `cta_send_brief`, `cta_download_cv`,
`proof_verify`, `intent_select`, `portfolio_filter`.

### Funnel + derived metrics

```text
service_view → service_engage → brief_start → brief_submit → brief_success
                                                      ↘ brief_error
service_view → proof_click / portfolio_click (trust, off-funnel)
service_view → book_call / email_copy / contact_intent (contact paths)
```

- Service engagement rate = `service_engage / service_view`
- Brief start rate = `brief_start / service_view` (per service; site-wide for home)
- Brief completion rate = `brief_success / brief_start`
- Brief submission success rate = `brief_success / brief_submit`
- Brief failure rate = `brief_error / brief_submit` (slice by `error_category`)
- Call-intent rate = `book_call / service_view` (per service)
- Brief vs. call vs. email mix preserved — the three lead types are **not**
  combined: a delivered brief, a call intent, and an email copy have different
  economic value and stay separate events.

## 5. Adding analytics to a future service/page

1. If it is a real service, add it to `src/data/service-registry.json` (+ the
   `SERVICE_REGISTRY` mirror — tests fail on drift). Never invent a
   `service_id` for generic content.
2. Stamp the page scope: `<main data-service-id="<service_id>">` →
   `service_view` is automatic.
3. Interest signals: `data-service-engage` (fires `service_engage`, deduped).
4. Brief forms work automatically via `intake-form.js` (scope resolves from the
   nearest `[data-service-id]` first, then the `intake_<service>` form name).
5. Commercially distinct actions get explicit attributes: `data-book-call`,
   `data-proof-click` (outbound only), `data-portfolio-click` (outbound only),
   `data-cv-download`, `data-template-open`, `data-language-select`.
   Remaining contact CTAs: `data-contact-intent="send_brief|email"`.
   `pass ttAnalytics.briefError()` only status codes or fixed labels — never
   messages. Add `data-no-track` to exclude an element.
6. Register new params as GA4 custom dimensions (§6) and extend
   `tests/analytics-service-funnel.mjs` + the `tests/run.js` S0 group.

## 6. GA4 custom dimensions (minimal, derived from reporting needs)

No `page_path` dimension: GA4's built-in page dimensions (page location/path)
already answer "which page". `service_category` is registered alongside
`service_id` because EN/ES routes for one service share an id but reporting
cuts by both. `cta_location` is registered because the same event
(`book_call`, `contact_intent`) fires from hero, contact, and per-service
brief contexts that must be comparable.

| Dimension | Scope | Why |
|---|---|---|
| `service_id` | Event | Per-service funnel cuts (the core Sprint 0 question) |
| `service_category` | Event | Category rollups across locales |
| `contact_type` | Event | `send_brief` vs `email` mix |
| `cta_location` | Event | Which placement drives `book_call`/`contact_intent` |
| `error_category` | Event | `validation` vs `client` vs `server` vs `network` failure mix |
| `error_stage` | Event | Where in the brief flow failures occur |

Create under Admin → Custom definitions → Event scope. Keep Google Signals
off (matches current disclosure).

## 7. Key Events (recommendation)

- **`brief_success`** — primary Key Event. A delivered brief is the qualified
  lead: highest economic value, unambiguous success criterion.
- **`book_call`** — secondary Key Event, kept separate. A call click is strong
  intent but not a delivered lead; merging it with `brief_success` would
  overstate lead volume and hide channel mix.
- Do **not** mark `service_view`, `service_engage`, `proof_click`, or
  `cv_download` as Key Events: they are diagnostic funnel steps, and inflating
  the key-event count would dilute lead reporting.

## 8. Legacy compatibility

Production GA4 has collected the generic events (`form_*`, `cta_*`,
`proof_verify`, `intent_select`) since the August 2026 GA4 migration. They
continue to fire unchanged so existing history and any explorations built on
them keep working. The canonical service/lead schema is the reporting source
of truth going forward.

| Canonical event | Legacy event(s) fired alongside | Reason |
|---|---|---|
| `brief_start` / `brief_success` / `brief_error` | `form_start` / `form_submit_success` / `form_submit_error` | Continuity of the pre-existing form funnel history |
| `book_call` | `cta_book_call` | Continuity of CTA click history |
| `service_engage` (chips) | `intent_select` | Continuity of intent-chip history |
| `proof_click` | `proof_verify` | Continuity of proof-interaction history |
| `cv_download` | `cta_download_cv` | Continuity of CV-download history |
| `portfolio_click`, `email_copy`, `template_open`, `language_select` | `portfolio_filter` covers filters; otherwise none | No legacy equivalent existed; canonical-only |

Removal condition: drop a legacy event only after its canonical successor has
≥90 days of production parity **and** no GA4 exploration/report references the
legacy name. Never reintroduce `tool_*` names.

## 9. Semantic correction record (old → new)

The first Sprint 0 pass used tool/SaaS vocabulary. Every item below was
renamed or split to describe the real consulting business; no `tool_*`
canonical event, param, attribute, file, or identifier remains in
`src/`, `public/`, or `dist/` (enforced by tests).

| Old (removed) | New | Why the old term was wrong |
|---|---|---|
| `tool_view` | `service_view` | Pages are service offerings, not tools |
| `tool_start` | `service_engage` + `brief_start` | One event conflated service interest with funnel entry; they are different stages |
| `tool_execute` | `brief_submit` | Nothing is "executed"; a brief submit is attempted |
| `tool_success` | `brief_success` | Success = delivered lead, not a computation result |
| `tool_error` (+ `execution_stage`) | `brief_error` (+ `error_stage`) | Failures are brief-form failures at validate/submit/deliver |
| `result_action` (+ `action_type`) | `email_copy`, `cv_download`, `proof_click`, `portfolio_click`, `template_open`, `language_select` | Fundamentally different actions were collapsed for symmetry; each now names its real action |
| `contact_intent/book_call` (+ `intent_chip`) | `book_call` (own event), `contact_intent/{send_brief,email}` | A call booking has distinct economic value from brief/email intent |
| `tool_id` / `tool_category` | `service_id` / `service_category` | Registry describes services |
| `execution_mode=brief_form` | (removed) | Single mode carried no information; event names carry it |
| `page_path` custom param | (removed) | Redundant with GA4 built-in page dimensions |
| `tool_id='site'` fallback | `service_id` omitted | Generic surfaces must not fake a service context |
| `tool-registry.json`, `ttProduct`, `TOOL_REGISTRY` | `service-registry.json`, `ttAnalytics`, `SERVICE_REGISTRY` | Identifiers must read as the business reads |

## 10. Privacy / security rules (unchanged, re-verified)

- NEVER sent: form field values, messages, pasted text, emails, tokens/keys,
  URLs/hrefs/link text, stack traces, raw backend responses. `intake-form.js`
  passes only HTTP status codes and the fixed labels `'network'` /
  `'validation'`; `contact-section.js` reads the address only for the
  clipboard write, never for analytics.
- Param allowlist per event; non-strings dropped; 100-char cap; secret-like
  and email-like values drop the param (event rejected if a required param is
  lost); `service_category` always derives from a valid `service_id`, never
  from caller input; unknown services are omitted, never invented.
- Suppression: `navigator.doNotTrack`, `globalPrivacyControl`, localhost /
  `file:` protocol, `window.__TT_NO_ANALYTICS__` kill-switch.
  `ttAnalytics.debug()` exposes `{sent, suppressed, reasons}`.
- Privacy + Cookies pages (EN/ES) disclose GA4 plus the coarse lead-funnel
  params and state that form contents never reach analytics.

## 11. Cloudflare ↔ GA4 diagnostic model

Baseline (given, external context — do not treat as users):

```text
Cloudflare 30d: 115,607 total HTTP requests · 95,663 human (~83%)
                5,711 total visits · 5,653 human (~99%)
```

Hierarchy: `HTTP requests → CF visits → GA4 users/sessions/views →
service_view → service_engage → brief_start → brief_submit → brief_success →
book_call / email_copy`.

Diagnostics (directional, never forced to reconcile):

```text
CF human visits / GA4 sessions        (consent/adblock/JS gap)
CF human requests / GA4 views         (asset-per-page ratio)
GA4 active users / service_view       (service discovery)
brief_success / GA4 active users      (lead conversion density)
book_call / brief_success             (call-vs-brief channel mix)
```

## 12. GA4 production validation procedure

Preconditions: deploy to production; use a browser with no adblocker and DNT
off (DNT/GPC suppress canonical events by design — see §10).

1. Open GA4 → **Admin → DebugView**. Open the site with `?debug_mode=1`
   (or via Tag Assistant) so your device appears in DebugView.
2. **service_view**: open `/en/services/python-automation/` → expect
   `service_view {service_id: automation, service_category: automation}`
   exactly once (reload → once more; no doubles without reload). Home page →
   no `service_view` (correct: no service scope).
3. **service_engage**: on a service page, click an intent chip → expect
   `service_engage {service_id: <page service>}` once; legacy `intent_select`
   also fires (expected duality, §8).
4. **brief_start/submit/success**: type one character in the service brief form
   → `brief_start` + `service_engage`; submit a test brief → `brief_submit`,
   then `brief_success` (both with that `service_id`). Delete the test lead in
   Formspree afterwards. Repeat on the home form → same events **without**
   `service_id`.
5. **brief_error**: submit with an empty required field → `brief_error
   {error_category: validation, error_stage: validate}`. (Do not forge server
   errors against prod Formspree.)
6. **book_call**: click a Calendly CTA → `book_call {cta_location: hero}` (or
   `contact` / `<slug>_brief`); legacy `cta_book_call` alongside.
7. **email_copy / cv_download / proof_click / portfolio_click**: copy-email →
   `email_copy`; CV link → `cv_download`; ResultsBand verify → `proof_click`;
   any portfolio project link → `portfolio_click`. Confirm no URL, text, or
   email appears in params.
8. **Realtime check**: Reports → Realtime → Event count by Event name —
   confirm the 14 canonical names arrive with the 6 custom dimensions
   populated in the DebugView parameter cards.
9. **Console aid**: `ttAnalytics.debug()` returns `{sent, suppressed,
   reasons}` for the page load; `window.dataLayer` shows raw payloads.

## 13. Measurement baseline template

```text
Measurement window:
Active users:            Sessions:              Views:
Top landing pages:
Top services by view:    Top services by engage:
Brief starts (by service):  Brief submits:      Brief successes (by service):
Brief failure rate (by error_category):
book_call (by cta_location):  email_copy:       proof_click / portfolio_click:
Contact mix (brief_success vs book_call vs email):
Traffic source:          Country:               Device:
Cloudflare human visits: Cloudflare human requests:
CF visits / GA4 sessions:  Notes/anomalies:
```

## 14. Known gaps / non-goals

- No scroll-depth or time-on-page instrumentation (scope kept minimal).
- Guide pages and work pages carry no `service_id` (correct per §3);
  per-article granularity is future work — GA4 page dimensions cover volume.
- ProofSection card links and ServicesSection example badges have no canonical
  event yet (candidate: extend `proof_click` stamping — needs per-card service
  mapping first).
- Legacy events still flow on localhost/dev and ignore DNT; only the canonical
  layer suppresses. Canonical is the reporting source of truth.
- No server-side event validation (static site; GA4 filters apply).

## 15. Sprint 1 hypotheses (not implemented)

- Compare `service_engage / service_view` across the six services to decide
  which offerings earn deeper investment vs. repositioning.
- `brief_success / brief_start` per service locates form friction vs. intent
  mismatch; `validation`-heavy `brief_error` points at specific form UX fixes.
- `book_call` vs `brief_success` mix per service reveals whether visitors want
  conversation or async scoping — staff and CTA hierarchy accordingly.
- `proof_click`/`portfolio_click` rates as trust-signal ranking: which evidence
  actually gets verified before contact.
- `template_open → brief_start` sequence as an evaluation-depth predictor of
  lead quality.
