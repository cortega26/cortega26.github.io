# Plan 029: Case-study evidence model (role, scope, verified date, per-case CTA)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/components/PortfolioSection.astro src/data/caseStudies.ts src/pages/en/work/index.astro src/pages/es/trabajo/index.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (moves 10 projects out of `PortfolioSection.astro`; several
  `tests/run.js` groups read that file)
- **Depends on**: none (Plan 030 builds on it)
- **Category**: trust / content
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-01 (residual), H-06 (primary), H-12 (work-card half)

## Why this matters

The work page shows ten real projects, but a visitor cannot tell what
Tooltician's role was, when the claim was last verified, or how to start a
conversation about the same problem. The audit's H-01 "only one public case"
verdict is stale — all ten render live — but its underlying ask (separate
public evidence from unstated experience, and quantify the trust surface) is
correct and lands on H-06. This plan gives every project a structured record:
problem, role, scope, verified result, verification date, evidence links, and
a contextual CTA into the matching service. **No new metrics are invented** —
the maintainer decision (Plan 024) is role + scope + date only.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/components/PortfolioSection.astro` (890 lines) holds everything:
  - `interface Project` (line 10) with `id, title, impact, impactSuffix,
    summary, problem, solution, proof, tags, filters, tagType, links,
    evidence?, featured?`.
  - `projectsEN` (lines 36-248) and `projectsES` (250-462) — 10 entries each.
  - `filterLabels` (464), `repoMap` (489), `enrichProjects()` (505) which
    injects live GitHub stars/forks from `src/data/github-stats.json`.
  - `c` copy object (580) with `allWorkLabel: 'See all 10 projects'` /
    `'Ver los 10 proyectos'`.
  - Card markup (616-675): tags, impact, evidence chips, `h3` title, summary,
    `dl.project-points` (problem / solution / proof), `project-links`.
  - `full` mode adds the filter bar and renders all 10; home renders 3
    featured.
- `tests/run.js` reads `portfolio()` = `src/components/PortfolioSection.astro`
  in these groups: `D4` (order + 10 ids), `D5` (580M removed), `D6`/`D7`/`D8`
  (copy), `D9`/`D10` (subtitle/title), `TT-004` (filters), `TT-015`
  (problem/solution/proof + bilingual labels), `TT-016` (featured count),
  `TT-009` (link labels), `H2` (Portfolio Manager / chile-hub / LinkedIn).
  Built assertions on project rendering are in the `--built` section.
- `src/pages/{en/work,es/trabajo}/index.astro` render
  `<PortfolioSection lang full />`; both set work-page alternates (Plan 025
  replaces those with the registry).
- `repoMap` keys match project ids; `enrichProjects` only renders star/fork
  chips when counts > 0.
- All ten projects already have public evidence links (live sites, GitHub,
  PyPI, Chrome/Firefox stores, CI).

## Data model to add (per project, per locale)

```ts
role: string;          // e.g. 'Designed, built, and maintains' — derive from
                       // existing solution/proof copy; no new claims
verifiedAt: string;    // ISO month, e.g. '2026-09'; set from a real
                       // re-verification date (default: audit date 2026-09-23)
group: ProjectGroup;   // 'python-data' | 'web-apps' | 'cli-tools' | 'products'
serviceHref: string;   // localized service page for the contextual CTA
confidential?: boolean;      // default false — only set when truly under NDA
confidentialNote?: string;   // required when confidential === true
```

`group` values and default mapping (Plan 030 renders the H2 sections; keep
this exact set):

| group | EN label | ES label | Projects |
|---|---|---|---|
| `python-data` | Python & Data | Python y Datos | chile-hub, polla, rutificador |
| `web-apps` | Web & Apps | Web y Apps | ebano, monedario, noticiencias |
| `cli-tools` | CLI & Tools | CLI y Herramientas | conciliador, dnspect |
| `products` | Products & Extensions | Productos y Extensiones | portfolio-manager-unified, stop-spam-linkedin |

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Behavioral (filters) | `node test-behavioral.mjs` | declared | exit 0 |

## Scope

**In scope** (the only files you should create/modify):
- CREATE `src/data/caseStudies.ts` — `Project` interface, group labels,
  `casesByLocale`, `repoMap` (move from PortfolioSection)
- `src/components/PortfolioSection.astro` — import the data; render `role`,
  `verifiedAt`, and the per-case CTA; keep `enrichProjects`, filtering, and
  all markup/styles otherwise intact
- `tests/run.js` — repoint the groups listed above to `caseStudies.ts`; add
  the `H-06` group
- `src/pages/en/work/index.astro` / `src/pages/es/trabajo/index.astro` —
  only if a section-level note or heading changes is needed (keep minimal)

**Out of scope** (do NOT touch):
- `group`-based H2 sections and the filter JS — Plan 030 owns them
- JSON-LD — Plan 033 owns it
- Service-page copy or pricing — Plans 026/027 own them
- Any metric not already published (no "X% faster", no invented dates)

## Git workflow

- Branch: `advisor/029-case-study-evidence`
- Conventional commit, e.g. `refactor(work): single case-study data model with role and verified date`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built && node test-behavioral.mjs` → green baseline.

**Verify**: green baseline recorded (source + built + behavioral).

### Step 1: Extract the data

1. Create `src/data/caseStudies.ts` with the `Project` interface (extended),
   `projectsEN` / `projectsES` moved verbatim, `filterLabels`, `repoMap`, and
   `groupLabels`. Export `casesByLocale: Record<'en' | 'es', Project[]>`.
2. `PortfolioSection.astro` imports from it; delete the moved blocks. Keep
   `enrichProjects`, `visibleProjects`, and all markup/styles unchanged.
3. `npm run check` → exit 0 (strictest TS will flag missed references).

**Verify**: `grep -c "const projectsEN" src/components/PortfolioSection.astro` → 0;
`node tests/run.js --built` still green for the built rendering assertions.

### Step 2: Repoint the tests (before adding fields)

Update `tests/run.js`:
- Add `const caseStudies = () => read('src/data/caseStudies.ts') || '';`.
- `D4` → read `caseStudies()` for the id positions; keep the same 10 ids.
- `D5`–`D8` → read `caseStudies()`.
- `TT-015` (problem/solution/proof fields) → `caseStudies()`; the bilingual
  labels check stays on `PortfolioSection.astro` (they live in the `c` copy).
- `TT-016` (featured count) → `caseStudies()`.
- `TT-009` (link labels) → `caseStudies()`.
- `H2` (project names + repo names) → `caseStudies()`.
- `D9`/`D10`/`TT-004` stay on `PortfolioSection.astro`.

**Verify**: `node tests/run.js` → green (same counts as baseline).

### Step 3: Add the evidence fields

1. For each of the 10 projects in both locales, add `role`, `verifiedAt`,
   `group`, and `serviceHref`:
   - `role` must be derivable from the existing `solution`/`proof` text
     (e.g. Ébano already says "Diseñé y opero…" → `role: 'Diseño, construcción
     y operación continua'`). Do not add capabilities that are not already
     claimed on the page.
   - `verifiedAt` defaults to `'2026-09'` (the audit re-verification month).
     If the maintainer supplies a more precise date, use it; never invent one.
   - `serviceHref` maps to the closest service (Ébano/Monedario/Noticiencias →
     static-sites or htw; chile-hub/polla/rutificador → python-automation;
     Conciliador → financial-tooling; DNSpect/Portfolio Manager → internal-tools;
     LinkedIn extension → static-sites). Use the localized path.
2. `confidential` stays unset unless the maintainer confirms an NDA case; if
   set, `confidentialNote` is mandatory.

**Verify**: `npm run check` → exit 0.

### Step 4: Render the evidence + CTA

In the card markup (both modes):
1. Add a meta line under the title: `role` + `Verified <verifiedAt>` (EN) /
   `Verificado <verifiedAt>` (ES). Use a small `project-meta` style; if
   `confidential`, render `confidentialNote` instead of the date.
2. Add a per-case CTA to `project-links`: `Describe this problem` /
   `Describir este problema` → `serviceHref + '#contact'` (work pages have no
   contact section; the anchor lands on the service form). Tag it with
   `data-track="cta_send_brief"` and `data-track-loc="work_<id>"` to match
   the existing tracking convention.
3. Add a one-line section note in `full` mode (under the subtitle): EN
   `Ten public projects, each with verifiable evidence.` / ES `Diez proyectos
   públicos, cada uno con evidencia verificable.` (Do not claim confidential
   client work unless the maintainer confirms it.)

**Verify**: `npm run build`; `grep -c 'Describe this problem'
dist/en/work/index.html` → 10; same for the ES equivalent.

### Step 5: Test group `H-06`

Append to `tests/run.js`:
- Source: every project in `caseStudies.ts` has `role:`, `verifiedAt:`,
  `group:`, and `serviceHref:` (count the occurrences per locale = 10).
- Built (skip without dist): each work page renders ≥10 `project-meta`
  elements and 10 per-case CTA links; the section note is present.
- Built: no page contains a bare `verifiedAt` placeholder like `TBD` or
  `TODO`.

**Verify**: `node tests/run.js --built` → exit 0.

## Test plan

- Repointed groups (Step 2) + `H-06` (Step 5) + full suite. The behavioral
  filter test must stay green because filtering still uses `data-categories`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/data/caseStudies.ts` is the only project-data source
- [ ] Every case has `role`, `verifiedAt`, `group`, `serviceHref`; no invented
      metrics or dates
- [ ] Work pages render role + verification date + 10 per-case CTAs
- [ ] Existing portfolio groups (D4–D10, TT-004/009/015/016, H2) pass against
      the new source
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A project has no honest `role` derivable from existing copy — leave it out
  of the CTA/meta change and report it instead of writing new claims.
- The maintainer has not confirmed the section note's wording (the plan's
  note is factual only; do not claim confidential work).
- Repointing a test changes its intent (e.g. a check that specifically
  verified the component) — report and keep the original target.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New projects go into `src/data/caseStudies.ts` with all four evidence
  fields; `H-06` fails otherwise.
- `verifiedAt` must be refreshed when the maintainer re-verifies a case;
  treat it as a claim, not decoration.
- Plan 030 consumes `group`; Plan 033 consumes the same records for JSON-LD.
  Keep the interface stable or update both in the same change.
