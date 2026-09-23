# Plan 037: Close the content measurement loop (Search Console runbook + day-60 pilot review)

> **Executor instructions**: This plan creates and edits documentation only.
> Do NOT touch `src/`, `public/`, `scripts/`, `tests/`, or any code. The
> Search Console steps in the runbook you write are operator actions — the
> executor never logs into external accounts. Run every verification command
> and confirm the expected result before moving on. If anything in the "STOP
> conditions" section occurs, stop and report — do not improvise. When done,
> update the status row for this plan in `plans/README.md` — unless a reviewer
> dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat f886e00..HEAD -- docs/tasks/content-pilot-review.md docs/tasks/maintenance-checklist.md docs/tasks/keyword-research-es.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 036 DONE (state recorded; this plan's cross-references were refreshed in reconciliation)
- **Category**: direction (organic-content measurement)
- **Planned at**: commit `f886e00`, 2026-09-23 (reconciled after plans 036/035/039; the in-scope files' relevant content is unchanged — `maintenance-checklist.md` gained additive content in items 1–2 only)

## Why this matters

The ES content pilot has explicit kill criteria — each new guide is kept only
if it reaches top-20 Search Console impressions within 60 days — but there is
no mechanism that will ever trigger the review, and Search Console was never
connected. Without this, the three published guides can never be judged, the
four remaining keyword rows stay in limbo, and the strategy's "measure before
optimize" rule is unenforceable. This plan writes the operator runbook, adds a
dated checkpoint to the maintenance cadence, and records the decision rules so
the keep/kill call happens on schedule instead of never.

## Current state

Facts the executor needs, inlined (verified by the advisor on 2026-09-23):

- `docs/tasks/keyword-research-es.md:11` — the kill criteria and the missing
  data source:

  ```markdown
  Rules applied: commercial intent → existing service page, never NEW. Every NEW
  row is an informational article that converts THROUGH exactly one mapped service
  page (its CTA). Kill criterion per row: impressions window is 60 days post-publish
  unless the row says otherwise.
  ```

  and (line 5): "No Search Console export was provided, so confidence is capped
  at MED per plan".

- The three published pilot guides (ranked picks 1, 2 and 4 from that doc),
  live in `src/data/guides.ts:14-41`, published in commit `0246f64`
  (`2026-09-16`). Their URLs and mapped CTAs:

  | Guide URL | Service CTA target | Kill criterion |
  |---|---|---|
  | `/es/guias/automatizar-reportes-excel-python/` | `/es/servicios/automatizacion-python/` | `<` top-20 impressions in 60 days → drop CTA, keep as unlinked note |
  | `/es/guias/auditoria-tecnica-web-negocios-pequenos/` | `/es/servicios/higiene-tecnica-web/` | same |
  | `/es/guias/pagina-web-estatica-cuando-conviene/` | `/es/servicios/sitios-web/` | same |

  Day-60 checkpoint: **2026-11-15** (60 days after `0246f64`).

- `docs/tasks/tooltician-strategy-execution-plan.md:168` — TS-002 is blocked
  and fully manual (status cell now reads `Bloqueado (manual; runbook en plan
  037)`). Its note at lines 179–184 contains the exact operator steps to
  reproduce in the runbook:

  ```text
  1. En Google Search Console → Agregar propiedad → tipo Dominio → tooltician.com.
  2. Copiar el valor TXT que entrega Google y agregarlo como registro TXT en la
     zona DNS de tooltician.com (Cloudflare).
  3. Esperar propagación DNS y pulsar "Verificar" en Search Console.
  4. Una vez verificado, ir a Sitemaps → enviar sitemap-index.xml.
  5. Confirmar en el panel que el sitemap fue aceptado.
  ```

- `docs/tasks/maintenance-checklist.md` — the quarterly runbook has six items
  (time-bound claims, A+ posture, OG card, full gates, funnel self-test,
  llms/sitemap) and a "Dated runs" table. It has no content-performance item.
  (Items 1 and 2 gained additive paragraphs in plans 039/035 — a résumé-PDF
  check and a `check:prod` step; they do not affect this plan's Step 2.)

- The four unbuilt keyword rows (from `keyword-research-es.md`): #5 "controlar
  mi negocio en Excel vs herramienta a medida", #6 "cómo vigilar precios de
  la competencia automáticamente", #8 "automatizar facturas y conciliación
  pequeña empresa", #9 "static site vs WordPress for small business" (EN).
  They must not be published before the pilot review decides.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| File exists | `test -f docs/tasks/content-pilot-review.md && echo OK` | declared | `OK` |
| Runbook sections | `grep -c "## " docs/tasks/content-pilot-review.md` | declared | `≥ 6` |
| Checklist item | `grep -c "Content pilot review" docs/tasks/maintenance-checklist.md` | declared | `1` |
| Keyword-doc pointer | `grep -c "content-pilot-review" docs/tasks/keyword-research-es.md` | declared | `1` |
| Scope | `git diff --stat f886e00...HEAD -- src public scripts tests` | declared (base refreshed in reconciliation) | empty output |

## Scope

**In scope** (the only files you should modify):
- `docs/tasks/content-pilot-review.md` (create)
- `docs/tasks/maintenance-checklist.md` (add item 7 + one dated-run row)
- `docs/tasks/keyword-research-es.md` (add a pointer line under the intro)

**Out of scope** (do NOT touch):
- `docs/tasks/tooltician-strategy-execution-plan.md` — plan 036 landed and owns
  its reconciliation; do not edit it here.
- `src/data/guides.ts`, any guide page, or `src/data/routes.ts` — no code.
- `docs/content-audit/**` — separate authority documents.
- Search Console, GA4, Cloudflare, or any external account. The executor
  cannot and must not attempt these steps.

## Git workflow

- Branch: `advisor/037-content-measurement`
- Conventional commit, e.g.
  `docs(content): add Search Console runbook and day-60 pilot review checkpoint`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

Confirm the three files exist / are absent as described:

```sh
test -f docs/tasks/content-pilot-review.md && echo "EXISTS (drift)" || echo "ABSENT (expected)"
grep -n "Dated runs" docs/tasks/maintenance-checklist.md
grep -n "Kill criterion per row" docs/tasks/keyword-research-es.md
```

**Verify**: first prints `ABSENT (expected)`; the other two print line hits.
If the review file already exists, STOP (drift).

### Step 1: Create `docs/tasks/content-pilot-review.md`

Create the file with exactly these sections (content below is the spec — keep
the headings, tables, and decision rules verbatim; you may add a one-line
purpose sentence per section):

```markdown
# Content Pilot Review — ES Guides (Plan 023/037)

Cadence: `one review at day 60, then per-batch`. Owner: `site operator`.
Source rules: `docs/tasks/keyword-research-es.md` (kill criteria per row).

## 1. Precondition — Search Console connected (operator)

The kill criteria need impressions, which only Search Console provides. Until
this is done, the review is BLOCKED (record it, do not guess):

1. Search Console → Add property → Domain → `tooltician.com`.
2. Add the TXT record Google gives you to the `tooltician.com` DNS zone
   (Cloudflare) and press Verify.
3. Sitemaps → submit `https://tooltician.com/sitemap-index.xml`.
4. Confirm the panel shows the sitemap as accepted.

## 2. Review window

Pilot batch published `2026-09-16` (commit `0246f64`). Day-60 checkpoint:
`2026-11-15`. Do not judge before the window closes.

## 3. Guides under review

| Guide | Service CTA | Kill criterion |
|---|---|---|
| `/es/guias/automatizar-reportes-excel-python/` | `/es/servicios/automatizacion-python/` | < top-20 impressions in 60 days → drop CTA, keep as unlinked note |
| `/es/guias/auditoria-tecnica-web-negocios-pequenos/` | `/es/servicios/higiene-tecnica-web/` | same |
| `/es/guias/pagina-web-estatica-cuando-conviene/` | `/es/servicios/sitios-web/` | same |

## 4. How to run the review (operator)

1. Search Console → Performance → Search results → filter Page = each guide
   URL above; window = last 60 days; export or note **impressions** and the
   **average position**.
2. Record one row per guide in the dated-runs table of
   `docs/tasks/maintenance-checklist.md`.
3. Apply the decision matrix in §5.

## 5. Decision matrix (per guide)

| Result | Action |
|---|---|
| ≥ top-20 impressions and position improving | Keep guide + CTA; candidate for the next batch |
| < top-20 impressions | Drop the `ArticleCta` from that guide (keep the article as an unlinked note); record why |
| Zero impressions for all three guides | Stop the content track: no new guides; record the verdict in this file |

## 6. Next-batch rule (only after a passing review)

Candidate rows are #5, #6, #8 and #9 in `docs/tasks/keyword-research-es.md`.
Publish at most two per batch, and only if at least one pilot guide passed its
kill criterion. Each new guide must keep exactly one mapped service CTA and
its own 60-day kill criterion. If no guide passes, publish nothing and record
the stop decision here.

## 7. Dated reviews

| Date | Search Console verified? | Guide | Impressions | Avg. position | Decision |
|---|---|---|---|---|---|
| `YYYY-MM-DD` | `yes/no` | ... | ... | ... | `keep/drop/stop` |
```

**Verify**: `test -f docs/tasks/content-pilot-review.md && echo OK` → `OK`;
`grep -c "## " docs/tasks/content-pilot-review.md` → at least 7.

### Step 2: Add the maintenance-checklist item

In `docs/tasks/maintenance-checklist.md`, add a new item after item 6 and
before the file ends:

```markdown
## 7. Content pilot review

Where: `docs/tasks/content-pilot-review.md`.
How: at each review date (first: `2026-11-15`), run the Search Console review
and apply the decision matrix. If Search Console is still not verified, record
`BLOCKED` with the date — never estimate impressions.

```

Also append one row to the "Dated runs" table (newest first, immediately
below the header row so it becomes the first entry):

```markdown
| `2026-09-23` | 7. Content pilot review scheduled | `Pending` — day-60 checkpoint `2026-11-15`; Search Console not yet verified |
```

**Verify**: `grep -c "Content pilot review" docs/tasks/maintenance-checklist.md` → `2` (heading + dated row); `grep -n "## 7" docs/tasks/maintenance-checklist.md` → one hit.

### Step 3: Point the keyword doc at the runbook

In `docs/tasks/keyword-research-es.md`, directly under the intro paragraph
(after line 12, before "## Indexable-URL inventory"), insert:

```markdown
> **Review checkpoint:** the pilot guides' day-60 review, Search Console
> setup, and the next-batch rule live in
> [`content-pilot-review.md`](content-pilot-review.md). Do not publish the
> remaining NEW rows (#5, #6, #8, #9) before that review passes.
```

**Verify**: `grep -c "content-pilot-review" docs/tasks/keyword-research-es.md` → `1`.

### Step 4: Final scope check

```sh
git diff --name-only f886e00...HEAD
git diff --stat f886e00...HEAD -- src public scripts tests
```

**Verify**: first command lists exactly the three in-scope files; second
prints nothing.

## Test plan

No code tests apply. The verification commands in each step are the test.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test -f docs/tasks/content-pilot-review.md && echo OK` prints `OK`
- [ ] The runbook contains the three guide URLs, the `2026-11-15` checkpoint, and the decision matrix (`grep -c "2026-11-15" docs/tasks/content-pilot-review.md` → ≥ 1)
- [ ] `grep -c "Content pilot review" docs/tasks/maintenance-checklist.md` → `2`
- [ ] `grep -c "content-pilot-review" docs/tasks/keyword-research-es.md` → `1`
- [ ] `git diff --stat f886e00...HEAD -- src public scripts tests` prints nothing
- [ ] `git diff --name-only f886e00...HEAD` lists exactly the three in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `docs/tasks/content-pilot-review.md` already exists (drift).
- The three guide URLs or the `0246f64` publication date do not match
  `src/data/guides.ts` / `git log -1 0246f64` (the pilot changed).
- You are asked to (or think you should) perform Search Console, DNS, or
  Cloudflare actions — those are operator-only; record `BLOCKED` instead.
- A verification command fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The day-60 review is the only thing that can authorize the next content
  batch; do not let a later plan publish rows #5/#6/#8/#9 without it.
- If a guide's CTA is dropped, `src/data/guides.ts` and the guide page still
  reference it — removing the `ArticleCta` is a follow-up code change, not
  part of this docs plan.
- Reviewer should confirm the runbook contains no invented impression numbers
  and that the decision matrix matches `keyword-research-es.md` exactly.
- **Deferred:** automate the Search Console export (e.g. a scheduled script
  using the Search Console API). Unblocked by connecting the property first;
  not worth credentials until one manual review has run.
- **Deferred:** GA4-side content attribution for guides — owned by plan 038.
