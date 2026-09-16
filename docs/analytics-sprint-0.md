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

> Corrected 2026-09-16: the earlier version of this section recommended
> `book_call` as a secondary Key Event. That was wrong and has been reverted.
> `book_call` fires on Calendly CTA click/open only (confirmed by live
> production validation, §12) — it proves scheduling intent, not a completed
> meeting. Marking a click as a Key Event would misrepresent it as a
> conversion. It stays a normal (non-Key) event until a technically verified
> "booking confirmed" signal exists (e.g. a Calendly webhook), which is not
> implemented and is out of scope for Sprint 0.

- **`brief_success`** — the only Key Event. A delivered brief is the
  qualified lead: highest economic value, unambiguous success criterion.
- **`book_call`** — normal event, **not** a Key Event. Booking intent only
  (Calendly click/open); no technical confirmation of an actual meeting
  exists in this implementation. Do not infer conversion from a click.
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

## 16. Sprint 0 production baseline start

> Recorded by Claude (Cowork) during the production closeout pass. Deployment
> facts below come from `master`'s local git ref, read directly off
> `carlos@i5-12600k:~/VS_Code_Projects/platform/tooltician-site`; the GitHub
> Actions run id/status were supplied by the closeout task and could not be
> independently re-verified against the GitHub API in this session (repo API
> access was not enabled for the session). GA4 facts below were observed
> directly, live, in this session.

```text
Deployment commit:      1f95ff6ca99109aea186d21b3138f99f4e800365 (master)
Deployment workflow:    Deploy to GitHub Pages, run 35125959168 (SUCCESS, as
                         reported — not independently re-verified via GitHub API)
Deployment date/time:   not independently confirmed (GitHub API unavailable
                         this session); local master ref matches this commit
                         as of 2026-09-16 17:11 UTC
Timezone:                UTC (deployment) / America/Santiago (validation, UTC-3)

GA4 property:            Tooltician (account casabea.cl, 404807309),
                         property 551059139, stream 15478383962,
                         https://tooltician.com, G-2HK4GHK7GR
GA4 validation timestamp: 2026-09-16 17:12–17:23 UTC (2026-09-16 14:12–14:23
                          America/Santiago)
Custom dimensions configured (event-scoped, all 6 newly created — none
existed before this pass; two unrelated legacy dimensions `label`/`location`
→ `tt_label`/`tt_location` were left untouched):
  - Service ID            → service_id
  - Service Category       → service_category
  - Contact Type           → contact_type
  - CTA Location           → cta_location
  - Error Category         → error_category
  - Error Stage            → error_stage

brief_success Key Event:  STILL NOT marked as of this update. Two independent
                          blockers: (1) a real production submission to test
                          the full brief_submit → brief_success chain was
                          attempted and was blocked by this session's own
                          safety controls (automated form-fill/submission is
                          treated as a real-world transaction requiring a
                          human to do it directly, not an agent); (2) even
                          for events already confirmed firing live (book_call,
                          proof_click, etc. — see below), GA4's Admin → Events
                          list had still not indexed any canonical event name
                          ~25 minutes after they fired in Realtime, only the
                          legacy `cta_book_call`. Action needed from Carlos:
                          submit one real test brief himself (see below), then
                          star `brief_success` once it appears under
                          Admin → Events → Eventos recientes (GA4 propagation
                          is same-day to next-day, not instant).
book_call Key Event:      Correctly NOT marked, and §7 above has been
                          corrected: this doc previously recommended `book_call`
                          as a secondary Key Event, which was wrong and has
                          been reverted. book_call is booking *intent* only
                          (Calendly click/open) — no signal in this
                          implementation confirms a meeting actually happened.
book_call semantics:      Confirmed by live production interaction: clicking
                          a Calendly CTA fires `book_call {service_id,
                          service_category, cta_location}` immediately, via
                          the analytics layer, before the browser navigates
                          to calendly.com. No later event confirms an actual
                          completed booking. This is click/open intent only —
                          matches the corrected §4/§7 of this doc exactly.

Known measurement caveats:
  - brief_submit / brief_success remain NOT live-tested. A real Formspree
    submission is the only way to trigger them for real (no DevTools
    injection was used or will be used, per instruction not to fabricate
    success). A second closeout pass explicitly authorized one controlled
    test submission, but the acting agent's own automated-browser guardrails
    blocked filling/submitting the live production form ("Real-World
    Transactions" — agents are not permitted to submit real forms on a
    person's behalf even with in-chat authorization). This needs Carlos to
    submit one test brief himself on https://tooltician.com (any service
    page's form, or the homepage form), using his own email, then delete the
    resulting Formspree entry if he doesn't want to keep it. brief_start and
    brief_error WERE confirmed live (correct params, no PII, no real
    submission — native validation blocked the POST for brief_error).
  - email_copy was attempted but the browser used for validation blocked
    the Clipboard API silently (no permission grant available in this
    automated session), so no event fired. Implementation looks correct
    (product-analytics.js fires on successful clipboard write only); this
    specific event needs a manual click-test in a normal browser session to
    fully confirm.
  - language_select was not reachable: the gateway ("/") auto-redirected
    to a locale before the manual language-card UI ever rendered, so there
    was no element to click. This is expected gateway behavior, not a defect.
  - GitHub Actions run 35125959168 / commit 1f95ff6 status is as reported by
    the task, not independently re-verified via the GitHub API in this
    session (blocked: "GitHub access to this repository is not enabled for
    this session"). The local git ref on `master` does match 1f95ff6.

Clean baseline start: NOT YET — deferred until brief_success is observed via
a real submission and marked as a GA4 Key Event. This section will need one
more update once that happens.
```

## 17. Production submission incident — code audit findings (2026-09-16)

> Recorded by Claude (Cowork) after Carlos reported that his one real manual
> test brief reached Formspree successfully (he received the resulting
> email) but GA4 Realtime recorded none of `brief_submit`, `brief_success`,
> `form_submit_success`, or `form_submit_error`, and that he did not see a
> visible success confirmation on the page. **Sprint 0 is NOT closed by this
> section** — see the verdict at the end.

### 17.1 Audit method

Cloned the exact deployed commit (`1f95ff6`, verified against the local
`master` ref on Carlos's machine) into an isolated environment with full
shell access and traced every file in the submission path line by line,
rather than guessing: `intake-form.js`, `track.js`, `product-analytics.js`,
`contact-section.js`, `IntakeForm.astro`, `BaseLayout.astro`,
`ServicePage.astro`. Then ran the full quality-gate suite against the
unmodified code (`npm run check`, `node tests/run.js`,
`node tests/analytics-service-funnel.mjs` — 77/77, `npm run build`,
`node tests/run.js --built` — 155/155) and extended `test-behavioral.mjs`
(real headless-Chromium + mocked Formspree) with two new end-to-end cases —
double-click protection and the failure path — in addition to the existing
single-submit case, then ran all three against the unmodified production
code.

### 17.2 Result: no code defect found

Every file in the submission path is correct as deployed:

- **`intake-form.js`**: `event.preventDefault()` → native `checkValidity()`
  → `funnel('briefSubmit', …)` fires *before* the `fetch()` call, regardless
  of outcome, exactly as required. `response.ok` branches to
  `successEl.classList.add('show')` + `track('form_submit_success', …)` +
  `funnel('briefSuccess', …)`; any non-2xx or a thrown `fetch()` branches to
  the error banner + `form_submit_error` + `briefError`. The submit button is
  disabled for the duration of the request (`finally` re-enables it),
  preventing double submission.
- **`IntakeForm.astro`**: the accessible, bilingual success/error banners
  Carlos said were missing **already exist** in this exact deployed commit —
  `<p class="intake-form__success" role="status" aria-live="polite">` (EN
  "Sent. I'll reply by email within two business days." / ES "Enviado.
  Respondo por correo en dos días hábiles.") and a matching
  `<p class="intake-form__error" role="alert" aria-live="polite">`, toggled
  by a plain `.show` CSS class (`display: none` → `display: block`). No
  `.reveal`/IntersectionObserver interaction hides them.
- **`track.js`** (legacy transport): has no DNT/GPC/localhost gating at
  all — it queues events only until `window.gtag` exists (polling every
  500ms, up to 5s), then calls `gtag('event', name, params)` unconditionally.
- **`BaseLayout.astro`**: `window.gtag` is defined *synchronously*, inline,
  before `track.js`/`product-analytics.js` even parse (both load with
  `defer`, in document order, after the inline stub) — so the "queue until
  gtag exists" path in `track.js` is never actually exercised in practice;
  `gtag` is already a function the instant `track.js` runs.
- **`product-analytics.js`** (canonical layer): suppression logic is
  intentional and scoped — DNT, GPC, the `window.__TT_NO_ANALYTICS__`
  kill-switch, and `localhost`/`127.0.0.1`/`file:` all suppress canonical
  `brief_*` events by design (§10). This does **not** explain the reported
  symptom: Carlos's test was on the live `tooltician.com` domain, and — more
  importantly — the *legacy* transport (`form_submit_success`/
  `form_submit_error`, called directly from `intake-form.js`, not gated by
  `product-analytics.js` at all) was *also* silent. No suppression path in
  this codebase can silence both the canonical and legacy transports at once
  while leaving Formspree delivery intact.

New end-to-end proof (`test-behavioral.mjs`, real Chromium, real DOM/CSS,
mocked Formspree + mocked `googletagmanager.com`, unmodified production
code): a single submit sends exactly 1 POST, shows the success banner, and
`form_submit_success` reaches `window.dataLayer` with no PII. A double-click
on the submit button still sends exactly 1 POST (button-disable protection
confirmed). A 500 response shows the error banner (never the success one)
and `form_submit_error` reaches `window.dataLayer`. In this local/preview
run the canonical `brief_*` events are correctly suppressed with reason
`local_host` (confirmed via `ttAnalytics.debug()`) — expected, by design,
and separately proven to fire correctly against a real host by the existing
unit suite (§S3 in `tests/analytics-service-funnel.mjs`). All of this ran
against the code exactly as deployed — **no production file needed to
change**.

### 17.3 Most likely root cause (not confirmed — cannot be confirmed from here)

Given every code path fires unconditionally and correctly, the one point
common to *both* the canonical and legacy transports — and the only thing
that could silence both while leaving an unrelated third-party POST
(Formspree) untouched — is the browser environment Carlos's one real test
ran in: a content blocker, tracking-protection extension, or DNS/hosts-level
block (uBlock Origin, Brave Shields, Privacy Badger, a Pi-hole-style
blocklist, etc.) preventing `googletagmanager.com`/`google-analytics.com`
from ever being reached. `gtag()` itself only pushes to the local
`dataLayer` array (always succeeds, no network call) — the actual network
beacon to Google happens once `gtag.js` runs, and that request is one of the
most commonly blocked third-party requests on the web. This is consistent
with everything observed: Formspree delivery succeeded (not a typical block
target), zero GA4 events of any kind reached GA4 (both transports funnel
through the same blocked network path), and no defect surfaced anywhere in
static or live-browser testing of the actual code. This cannot be verified
without seeing Carlos's real browser/extension state at the time of that one
submission, so it is recorded here as the leading hypothesis, not a
confirmed root cause.

### 17.4 Changes made this pass

- `test-behavioral.mjs`: added `testDoubleClickProtection` and
  `testErrorPath`, and strengthened `testSingleSubmit` to also assert the
  `window.dataLayer` contents (GA4 events fired, and no PII in them). No
  production file (`intake-form.js`, `track.js`, `product-analytics.js`,
  `contact-section.js`, `IntakeForm.astro`) was changed, because none was
  found to be defective.
- This section (§17) of this doc.

### 17.5 Recommended production revalidation

Before the next real test submission: use a browser profile with **no
content/ad blocker and no privacy extension**, confirm `navigator.doNotTrack`
is not `'1'` and `globalPrivacyControl` is not `true` (both suppress the
canonical layer by design), then submit one real test brief and check GA4
Realtime within a minute or two. If events still don't appear under those
conditions, that would newly implicate the code and warrant reopening this
audit — but nothing found in this pass supports a code fix.

**Verdict at the end of this pass: Sprint 0 remains NOT CLOSED** — superseded
by §18 below, which found and fixed a real mobile UX defect that this
section's static/desktop-only testing missed.

## 18. Production revalidation & browser-environment diagnosis (2026-09-16, cont.)

> Recorded by Claude (Cowork) in a follow-up pass that inspected the LIVE
> `https://tooltician.com` production site directly (not just source/clone)
> in two real browser environments, and checked GA4 Realtime directly for a
> live-triggered event. This section corrects one conclusion in §17: the
> "no visible success feedback" report **does reproduce**, on mobile.

### 18.1 Browser environments used

- **Claude in Chrome** (this session's Chrome automation extension) —
  `navigator.doNotTrack === '1'`, no GPC. **This is a Claude-controlled
  automation browser, not Carlos's personal browser** — it cannot be used to
  explain or reproduce Carlos's own real test submission, and is not claimed
  to. It's noted only as a data point: DNT alone (no blocker) suppresses just
  the canonical `brief_*` layer by design (§10) — legacy `form_submit_*` is
  never gated by DNT — so DNT alone cannot explain the *total* silence
  (canonical + legacy) Carlos originally reported.
- **Claude's built-in browser pane** — confirmed clean:
  `navigator.doNotTrack === null`, no `globalPrivacyControl`. Used for the
  GA4 connectivity proof and the mobile-viewport UX inspection below.

### 18.2 GA4 pipeline proof (clean browser, live production, this pass)

From the clean built-in-browser session, on `https://tooltician.com`:

- `fetch()` probes (no-cors) to `https://www.googletagmanager.com/gtag/js`
  and `https://www.google-analytics.com/g/collect` both completed without a
  network error (a client-side block, e.g. `ERR_BLOCKED_BY_CLIENT`, throws
  on `fetch()` — neither did) — GA4's endpoints are reachable from this
  environment.
- Navigating to a real service page fired `service_view` correctly:
  `ttAnalytics.debug()` → `{sent: 1, suppressed: 0}`, `dataLayer` carried
  the `event`/`service_view`/`{service_id, service_category}` push.
- **That exact event was confirmed arriving in GA4 Realtime** (property
  551059139, casabea.cl/Tooltician) within seconds, alongside `page_view` —
  screenshotted live in the Realtime overview report.

This proves the full pipeline — app code → `dataLayer` → `gtag` → network →
GA4 property — works correctly, end to end, against this exact production
property, right now, from a clean browser. Combined with §17's full code
trace, this rules out a code-level cause for the analytics silence with much
higher confidence: everything downstream of "is this browser blocked" is now
directly demonstrated working, not just inferred from source reading.

### 18.3 Success/error banner — real mobile defect found (not a false alarm)

§17 checked the banner only in a desktop-sized Playwright browser and by
static CSS/JS reading, and concluded (incorrectly, as it turns out) that
nothing was wrong. Live inspection of the actual production page at a real
mobile viewport (375×812, the built-in browser's mobile emulation) found a
genuine, reproducible defect:

- The success/error `<p>` sits in the DOM immediately after the submit
  button. On a normal desktop-height viewport that's still on-screen when it
  appears (confirmed via screenshot — clearly visible, well-contrasted,
  directly below the "Send brief" button).
- On a 375×812 mobile viewport, scrolled to the natural resting position
  right before tapping submit (the submit button at or near the bottom edge
  of the visible area — confirmed with the button scrolled to
  `block:'end'`), the banner's bounding box (`top: ~855`, `bottom: ~919`)
  falls entirely **below** the 812px-tall viewport. Reproduced identically
  for both the success and the error banner.
- No code anywhere called `scrollIntoView()` or moved focus after toggling
  the `.show` class, so nothing brought the now-visible-but-off-screen
  banner onto the user's screen. `aria-live="polite"`/`role="status"` still
  announce it correctly to screen readers — this is a sighted-user,
  small-viewport gap, not an accessibility-API gap.

This plausibly explains Carlos's "no visible success confirmation" report
directly, independent of the analytics question, if his check was on a phone
(or a narrow/short browser window) — the email arriving from Formspree while
the page itself appeared to do nothing.

### 18.4 Fix applied (minimal, per the task's "do not redesign the form" constraint)

- `public/assets/js/intake-form.js`: added a small `revealFeedback(el)`
  helper (`el.scrollIntoView({behavior:'smooth', block:'nearest'})` then
  `el.focus({preventScroll:true})`), called right after each place the code
  already adds the `.show` class (success, HTTP-error, and network-error
  paths). No change to the submit/fetch/event lifecycle logic itself.
- `src/components/IntakeForm.astro`: added `tabindex="-1"` to both the
  success and error `<p>` elements so they're programmatically focusable
  (for the `.focus()` call above) without joining the page's normal Tab
  order. `role`/`aria-live` unchanged.
- `test-behavioral.mjs`: added `testMobileSuccessVisibility` — real
  Playwright browser at a 375×812 viewport, scrolls the submit button to the
  bottom edge (the realistic pre-tap position), submits, and asserts the
  success banner's bounding box is fully inside the viewport afterward. This
  test reproduces the exact defect found live (failed against the
  pre-fix code) and passes against the fix.

### 18.5 Full regression pass after the fix

`npm run check` (0 errors) · `node tests/run.js` (130/130) ·
`node tests/analytics-service-funnel.mjs` (77/77, unchanged — this fix
touches UX only, not analytics emission) · `npm run build` +
`node tests/run.js --built` (155/155) · `node test-htw-snapshot.mjs`
(clean) · `node test-behavioral.mjs`: single-submit, double-click
protection, error-path, **new mobile-visibility test**, and both filter
pages — all passing, 0 console/page errors anywhere.

### 18.6 Root cause — stated precisely, not overclaimed

- **UX defect (no visible success confirmation): CONFIRMED and FIXED.** Root
  cause was a missing scroll/focus step after revealing the banner,
  reproducible on any short/mobile viewport. This is the more likely
  explanation for what Carlos personally observed, and it is now fixed and
  covered by an automated regression test.
- **Analytics defect (zero GA4 events on Carlos's one real submission):
  root cause remains unproven.** No code defect exists (§17's full trace +
  this pass's live end-to-end GA4 proof in a clean browser). The
  browser-side-blocking hypothesis is now better supported circumstantially
  (clean pipeline proven to work; DNT alone can't explain legacy-transport
  silence) but was not, and cannot be, directly confirmed without visibility
  into Carlos's actual browser/extension state at the moment of that one
  submission.

### 18.7 Next manual revalidation step (for Carlos, not performed by Claude)

Per this task's explicit instruction, no additional real production
submission was made by Claude. Recommended before the next one:

1. Use a normal or clean-Incognito browser profile with no ad/content
   blocker and no privacy extension.
2. Open DevTools → Network, filter `google`, confirm requests to
   `googletagmanager.com`/`google-analytics.com` are not shown as
   `(blocked)`/`ERR_BLOCKED_BY_CLIENT`.
3. Visit any page and confirm in GA4 → Realtime that a `page_view` or
   `service_view` appears within ~1 minute — this proves the browser can
   reach GA4 before spending the one real test submission.
4. Only then submit one real test brief and watch GA4 Realtime for
   `brief_submit` → `brief_success`, and watch the page itself for the
   (now scroll-and-focus-assisted) success banner.

**Verdict: SPRINT 0 NOT CLOSED.** Closure still requires: one real
production submission, performed by Carlos, in a browser confirmed able to
reach GA4 first; `brief_submit` observed; `brief_success` observed;
`brief_success` configured as the GA4 Key Event; and the clean baseline
timestamp recorded per §16. None of those have happened yet — this pass
fixed a real UX bug and strengthened the evidence that the analytics gap is
environmental, but did not close any of the outstanding closure criteria.
