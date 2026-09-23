# Plan 036: Re-baseline the strategy, refresh, and content-audit docs to the shipped state

> **Executor instructions**: Follow this plan step by step. This is a
> docs-only plan: do NOT touch `src/`, `public/`, `scripts/`, `tests/`, or any
> code. Run every verification command and confirm the expected result before
> moving on. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1508fa2..HEAD -- docs/tasks/tooltician-strategy-execution-plan.md docs/tasks/tooltician-refresh-backlog.md docs/content-audit/map.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (plans 037–040 reference the state this plan records; run it first)
- **Category**: direction (docs / roadmap truth)
- **Planned at**: commit `1508fa2`, 2026-09-23

## Why this matters

Three roadmap documents are the declared grounding sources for future
maintenance work, and all three are now actively wrong: they mark delivered
work as pending, describe home sections that were removed, and cite a
hostname that is no longer the live site. Any agent or human following their
"recommended sequence" would redo finished work or chase files that do not
render. This plan adds dated reconciliation records and corrects the
machine-scannable status cells, without deleting history. It changes no code.

## Current state

Facts the executor needs, inlined (all verified by the advisor on 2026-09-23
against commit `1508fa2`):

**`docs/tasks/tooltician-strategy-execution-plan.md`** (424 lines, last
touched 2026-08-21 by the GA4 migration):
- §6 Fase 0 table (lines 139–145) lists TS-003/004/005 as `Pendiente`, but the
  canonical analytics layer shipped in commit `1f95ff6`:
  `public/assets/js/product-analytics.js` emits `service_view`,
  `service_engage`, `brief_*`, `book_call`, `email_copy`, `proof_click`,
  `portfolio_click`, `cv_download`, `template_open`, `language_select`,
  `contact_intent`; `tests/analytics-service-funnel.mjs` (77 tests) and the
  `S0` group in `tests/run.js:1256-1305` verify the wiring.
- TS-006 (line 170, §7 line 245) is `Pendiente` ("Enlazar el CV"), but the CV
  is linked at `src/components/AboutSection.astro:56` and
  `src/components/Footer.astro:80` with `data-track="cta_download_cv"`.
- §6 Fase 2 (lines 180–188) names `ResultsBand`, `PortfolioSection`,
  `ProofSection`, `ServiceSpotlight` as the home's sections. The current home
  imports only `HeroSection`, `ResultsBand`, `ServicesSection`,
  `PortfolioSection`, `AboutSection`, `FaqSection`, `ContactSection`
  (`src/pages/en/index.astro:5-11,45-53`); `ProofSection.astro` and
  `ServiceSpotlight.astro` have **zero references** anywhere in `src/`.
- TS-016 (line 213) is `Pendiente` ("Validar JSON-LD"), but `src/data/jsonld.ts`
  and the work/root schema shipped in Plan 033 (commit `c9da477`).
- TS-017 (line 214) is `Pendiente` ("Revisar llms.txt / OG"), but
  `public/llms.txt`/`public/llms-full.txt` were updated in Plan 034
  (`c9da477`) and the OG card is wired in `src/layouts/BaseLayout.astro:21,59-63`.
- §5 program scoreboard (lines 118–127) still shows `Pendiente` for events,
  panel, employer route, home redundancy, and cases.
- The event catalog §4 (lines 92–112) is superseded by
  `docs/analytics-sprint-0.md` (Sprint 0 canonical schema, closed 2026-09-16).

**`docs/tasks/tooltician-refresh-backlog.md`** (467 lines, last touched
2026-05-27):
- §6 master backlog (lines 284–309) marks TT-019 (OG metadata), TT-020 (root
  URL), TT-017 (home redundancy), TT-010 (duplicate fonts), TT-011/012 (hero
  image LCP/fallback), TT-013 (third-party review) and TT-021 (credential
  links) as `Pending`, but all are resolved or moot:
  - TT-019: `src/layouts/BaseLayout.astro:21,59-63` uses
    `https://tooltician.com/assets/images/og-card.png`.
  - TT-020: Plan 031 (commit `c9da477`) shipped the root x-default landing.
  - TT-017: home consolidated in commit `79b5347`; residual duplication is
    plan 040.
  - TT-010: no external Google Fonts remain — `src/styles/global.css:7,15`
    defines `@font-face` for self-hosted files and
    `src/layouts/BaseLayout.astro:47-49` preloads them. `grep -rn "fonts.googleapis" src/`
    returns nothing.
  - TT-011/012: `src/components/HeroSection.astro` contains no `<img>`/photo
    (TT-006 removed the portrait); there is no hero image to optimize.
  - TT-013: the only third-party runtime script is GA4, documented in
    `docs/analytics-sprint-0.md` §10; `grep -rn "ahrefs" src/ public/` returns
    nothing.
  - TT-021: the audit closeout recorded `node scripts/check-links-seo.js` →
    `0 internos / 0 externos / 0 SEO` (`audit-20260923-response.md:131`).
- TT-022/TT-023 (CSS consolidation) are still legitimately open — leave them
  `Pending`.

**`docs/content-audit/map.md`** (17 lines): describes the legacy GitHub Pages
site (`https://cortega26.github.io/`), claims "Privacy, cookie, and terms
pages absent", and predates the entire Astro build. It is a historical
artifact, not a current map.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Docs-only diff | `git diff --name-only 1508fa2...HEAD` | executed (advisor ran git on the clean tree) | exactly the three in-scope files |
| Confirm no code touched | `git diff --stat 1508fa2...HEAD -- src public scripts tests` | executed | empty output |
| Reconciliation heading present | `grep -c "Reconciliación de estado (2026-09-23)" docs/tasks/tooltician-strategy-execution-plan.md` | declared (heading absent from the file as read by the advisor) | `1` |
| Refresh reconciliation present | `grep -c "Reconciliation (2026-09-23)" docs/tasks/tooltician-refresh-backlog.md` | declared (absent as read) | `1` |
| Map banner present | `grep -c "Historical document" docs/content-audit/map.md` | declared (absent as read) | `1` |

## Scope

**In scope** (the only files you should modify):
- `docs/tasks/tooltician-strategy-execution-plan.md`
- `docs/tasks/tooltician-refresh-backlog.md`
- `docs/content-audit/map.md`

**Out of scope** (do NOT touch, even though they look related):
- `docs/tasks/higiene-tecnica-web-backlog.md` — its header is already accurate
  ("Complete — All 5 sessions done · One item blocked").
- `docs/analytics-sprint-0.md` — plan 038 owns it; do not edit here.
- `docs/content-audit/audits/audit-20260923-response.md` — closed authority
  document; its maintenance rule says statuses update row by row, not by
  rewrite. Do not edit.
- `plans/` — the index is updated by the executor's final step only.
- Any code, test, or script file.

## Git workflow

- Branch: `advisor/036-rebaseline-docs`
- One commit is fine; conventional commits, e.g.
  `docs(plans): re-baseline strategy, refresh, and audit-map docs to shipped state`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a baseline

Run the two `git diff` commands from the table on the unmodified checkout.
Expect the first to list nothing before you start (clean tree relative to
`1508fa2`) and the second to be empty.

**Verify**: both commands behave as above; `git status --short` shows a clean
tree.

### Step 1: Strategy plan — insert the reconciliation section

Open `docs/tasks/tooltician-strategy-execution-plan.md`. Immediately after the
`> **Cómo leer este documento.**` blockquote (ends at line 9), insert this
section verbatim (keep the blank line spacing style of the file):

```markdown
## 0. Reconciliación de estado (2026-09-23)

Este documento es la dirección, no el estado. El estado verificado contra
`1508fa2` está abajo; las tablas §5–§7 se corrigen en consecuencia. Fuentes:
`plans/README.md` (series 007–034), `docs/analytics-sprint-0.md` (Sprint 0),
y `docs/content-audit/audits/audit-20260923-response.md`.

| Tarea | Estado real | Evidencia |
|---|---|---|
| TS-003 CTAs comerciales | Parcial — superseded por Sprint 0 | `product-analytics.js` + `ServicePage.astro:111`; residual en plan 038 |
| TS-004 enlaces salientes | Hecho (parcial) | `portfolio_click`/`proof_click` canónicos; `ProofSection` ya no se renderiza |
| TS-005 test de instrumentación | Hecho | `tests/analytics-service-funnel.mjs`, `analytics-guard.mjs`, grupo S0 |
| TS-006 CV enlazado | Hecho (Plan 017 + 039) | `AboutSection.astro:56`, `Footer.astro:80`; PDF real EN/ES por locale (plan 039) |
| TS-007 trayectoria | Pendiente | Bloqueado por hechos de carrera; plan 039 |
| TS-008 perfiles trackeados | Pendiente | Plan 039 |
| TS-009/010/011 home | Hecho (parcial, `79b5347`) | Home consolidada; residual de prueba duplicada → plan 040 |
| TS-012/013/014 casos | Parcial | Rol/fecha/CTA (Plan 029); métricas cuantificadas aparcadas |
| TS-015 back-links | Pendiente | Recon/plantilla hechos (Plan 019); ejecución externa del operador |
| TS-016 JSON-LD | Parcial | `jsonld.ts` + paridad (Plan 033); Rich Results externo pendiente |
| TS-017 llms/OG | Hecho (Plan 034) | `llms.txt`/`llms-full.txt`; `BaseLayout.astro:21,59-63` |
| TS-018/019/020 | Bloqueado | Sin datos (Search Console); runbook en plan 037 |

El catálogo de eventos §4 quedó superseded por `docs/analytics-sprint-0.md`
(capa canónica service/lead, cerrada 2026-09-16). No inventar eventos fuera de
esa capa.
```

**Verify**: `grep -c "Reconciliación de estado (2026-09-23)" docs/tasks/tooltician-strategy-execution-plan.md` → `1`.

### Step 2: Strategy plan — correct the status cells

In the **§7 master backlog** table (lines ~236–260, rows start with
`` | `TS-0xx` | ``), replace only that row's final status cell. Current cell
text is quoted exactly; new text is what you write:

| Row | Current cell | New cell |
|---|---|---|
| TS-002 | `Bloqueado` (100% manual: verificación DNS TXT + envío de sitemap pendientes del usuario) | `` `Bloqueado` (manual; runbook en plan 037) `` |
| TS-003 | `Pendiente` | `` `Parcial` — Sprint 0 canónico; residual de cards/chips en plan 038 `` |
| TS-004 | `Pendiente` | `` `Hecho (parcial)` — `portfolio_click`/`proof_click` canónicos `` |
| TS-005 | `Pendiente` | `` `Hecho` — `tests/analytics-service-funnel.mjs` + grupo S0 `` |
| TS-006 | `Pendiente` | `` `Hecho` (Plan 017 + 039) — CV EN/ES reales por locale `` |
| TS-007 | `Pendiente` | `` `Pendiente` — bloqueado por hechos de carrera; plan 039 `` |
| TS-008 | `Pendiente` | `` `Pendiente` — plan 039 `` |
| TS-009 | `Pendiente` | `` `Hecho` (`79b5347`) `` |
| TS-010 | `Pendiente` | `` `Hecho (parcial)` (`79b5347`) — residual en plan 040 `` |
| TS-011 | `Pendiente` | `` `Hecho` (`79b5347`) `` |
| TS-012 | `Pendiente` | `` `Parcial` — rol/fecha/CTA (Plan 029) `` |
| TS-013 | `Pendiente` | `` `Parcial` — modelo de evidencia (Plan 029) `` |
| TS-014 | `Pendiente` | `` `Hecho` — CTA por caso al servicio (Plan 029) `` |
| TS-015 | `Pendiente` | `` `Pendiente` — recon/plantilla hechos (Plan 019) `` |
| TS-016 | `Pendiente` | `` `Parcial` — builders/paridad (Plan 033); Rich Results externo `` |
| TS-017 | `Pendiente` | `` `Hecho` (Plan 034) `` |

Leave TS-001, TS-002's other tables, and TS-018/019/020's `Bloqueado` cells as
they are (they are already accurate). In the **§6 phase tables**, do not
rewrite rows: the §0 section is the authority now.

In the **§5 program scoreboard** (lines ~118–127), replace the `Estado` cell of
these rows:

| Dimension | New `Estado` |
|---|---|
| Eventos de conversión capturados | `` `Hecho` — Sprint 0 canónico (2026-09-16) `` |
| Panel de analítica de eventos | `` `Hecho` — GA4 + 6 dimensiones (2026-09-16) `` |
| Ruta de empleador | `` `Parcial` — CV enlazado (Plan 017); PDF placeholder, plan 039 `` |
| Redundancia de prueba en home | `` `Hecho (parcial)` — consolidación `79b5347`; residual plan 040 `` |
| Casos de estudio reales | `` `Parcial` — evidencia rol/fecha (Plan 029) `` |
| JSON-LD de servicios | `` `Parcial` — builders/paridad (Plan 033); Rich Results externo `` |
| Search Console conectado | `` `Pendiente` — manual; runbook en plan 037 `` |

Leave `Back-links desde productos propios` as `Pendiente`.

**Verify**: `grep -n "plan 038\|plan 039\|plan 040\|plan 037" docs/tasks/tooltician-strategy-execution-plan.md` → at least 6 hits.

### Step 3: Strategy plan — decision log + session scoreboard

1. In §11 "Registro de decisiones", append to the **closed decisions** table:

   ```markdown
   | `2026-09-23` | La capa canónica Sprint 0 (`docs/analytics-sprint-0.md`) supersede el catálogo de eventos §4 | El catálogo §4 quedó obsoleto con la migración a service/lead |
   ```

2. In §14 "Plantilla de scoreboard de sesión", append one row after the last
   dated row:

   ```markdown
   | `2026-09-23` | `Reconciliación` | `— (docs)` | `Pass` | `n/a` | Sprint 0 cerrado | `ninguno` | `Ejecutar planes 035–040` |
   ```

**Verify**: `grep -c "2026-09-23" docs/tasks/tooltician-strategy-execution-plan.md` → at least 3.

### Step 4: Refresh backlog — reconciliation table + status cells

1. Open `docs/tasks/tooltician-refresh-backlog.md`. After the header block
   (after line 6, before `## 1. Executive Overview`), insert:

   ```markdown
   ## 0. Reconciliation (2026-09-23)

   Verified against commit `1508fa2`. The wave scoreboards below are
   historical; the master backlog §6 cells were corrected where the work has
   shipped. Details: `plans/README.md`.

   | Task | Verified state | Evidence |
   |---|---|---|
   | TT-010 duplicate Google Fonts | Done | Self-hosted `@font-face` (`global.css:7,15`); no `fonts.googleapis` in `src/` |
   | TT-011 hero image LCP | Moot | No hero image exists (`HeroSection.astro` has no `<img>`) |
   | TT-012 PNG fallback | Moot | Same as TT-011 |
   | TT-013 third-party scripts | Done | Only GA4 remains, documented in `docs/analytics-sprint-0.md` §10 |
   | TT-017 home redundancy | Done (partial) | Home consolidated in `79b5347`; residual in plan 040 |
   | TT-019 OG metadata | Done | `BaseLayout.astro:21,59-63` |
   | TT-020 root URL strategy | Done | Plan 031 (root x-default landing) |
   | TT-021 credential links | Done | Link checker 0/0/0 (audit closeout) |
   | TT-022/TT-023 CSS consolidation | Pending | Still open |
   ```

2. In the **§6 Master Task Backlog** table, replace only the `Status` cell of
   each row (last column):

   | Row | New cell |
   |---|---|
   | TT-010 | `` `Done` (2026-09-23) `` |
   | TT-011 | `` `Done` — moot, no hero image `` |
   | TT-012 | `` `Done` — moot, no hero image `` |
   | TT-013 | `` `Done` (2026-09-23) `` |
   | TT-017 | `` `Done (partial)` — residual in plan 040 `` |
   | TT-019 | `` `Done` (2026-09-23) `` |
   | TT-020 | `` `Done` (2026-09-23) `` |
   | TT-021 | `` `Done` (2026-09-23) `` |

   Leave TT-022 and TT-023 as `Pending`.

**Verify**: `grep -c "Reconciliation (2026-09-23)" docs/tasks/tooltician-refresh-backlog.md` → `1` and `grep -c "plan 040" docs/tasks/tooltician-refresh-backlog.md` → at least `2`.

### Step 5: Content-audit map banner

Prepend to `docs/content-audit/map.md`, before the existing `# Content Audit Map` heading:

```markdown
> **Historical document (pre-Astro).** This map describes the legacy
> `cortega26.github.io` static pages and is kept for audit history. The live
> route inventory is authoritative in `src/data/routes.ts`; current findings
> and statuses live in `docs/content-audit/audits/audit-20260923-response.md`.
> Do not use the table below to plan work.

```

Do not modify the existing table rows.

**Verify**: `grep -c "Historical document" docs/content-audit/map.md` → `1`.

### Step 6: Final checks

Run:

```sh
git diff --name-only 1508fa2...HEAD
git diff --stat 1508fa2...HEAD -- src public scripts tests
```

**Verify**: first command lists exactly the three in-scope files; second prints
nothing.

## Test plan

No code tests apply. Verification is the grep/git commands in each step plus
the final diff scope check. Do not add tests for docs.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "Reconciliación de estado (2026-09-23)" docs/tasks/tooltician-strategy-execution-plan.md` → `1`
- [ ] `grep -c "Reconciliation (2026-09-23)" docs/tasks/tooltician-refresh-backlog.md` → `1`
- [ ] `grep -c "Historical document" docs/content-audit/map.md` → `1`
- [ ] `git diff --stat 1508fa2...HEAD -- src public scripts tests` prints nothing
- [ ] `git diff --name-only 1508fa2...HEAD` lists exactly the three in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `1508fa2` and the
  excerpts in "Current state" no longer match.
- A status cell quoted above is not found verbatim in the target table row
  (someone already edited it) — report which row, do not guess a replacement.
- You are tempted to update a row whose evidence you cannot verify with a
  command from this plan — leave it and report.
- Any verification command fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- This reconciliation is a snapshot at `1508fa2`; the next audit should append
  a new dated section rather than editing this one.
- Plans 037–040 each reference the state recorded here. If one of them is
  rejected, update the corresponding row in the §0 table with a dated note.
- Reviewer should check that no historical row was silently rewritten: the
  diffs should be additions plus status-cell replacements only.
- **Deferred:** delete the orphaned `ProofSection.astro` and
  `ServiceSpotlight.astro` components (~450 lines, zero references). Unblocked
  by nothing; belongs to a tech-debt pass, not this docs plan.
