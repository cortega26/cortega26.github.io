# Plan 045: Emit ISO-8601 dates in legal-page structured data and Open Graph meta

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/data/siteDocuments.ts src/pages/[lang]/[document].astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

All eight legal pages (privacy/cookies/terms/engagement × en/es) publish
their "last updated" date as a human display string (`'1 Sep 2026'`,
`'1 de septiembre de 2026'`) into schema.org `datePublished`/`dateModified`
and the Open Graph `article:published_time`/`article:modified_time` meta.
Neither schema.org nor Open Graph accepts localized prose dates: the
structured data is invalid/ignored and the article meta is unparseable.
Verified in the built output at `be975ef`:
`dist/es/privacy/index.html` contains
`"datePublished":"1 de septiembre de 2026"`.

## Current state (verified at `be975ef`)

`src/data/siteDocuments.ts:10-21` (interface) and `:32,88` (values):

```ts
  updatedLabel: string;
  updatedAt: string;
...
      updatedAt: '1 Sep 2026',
...
      updatedAt: '1 de septiembre de 2026',
```

All four documents × two locales (`siteDocuments.ts:32,88,146,182,220,262,305,373`):

| Document | EN | ES |
|---|---|---|
| privacy | `1 Sep 2026` | `1 de septiembre de 2026` |
| cookies | `21 Aug 2026` | `21 de agosto de 2026` |
| terms | `17 May 2026` | `17 de mayo de 2026` |
| engagement | `27 May 2026` | `27 de mayo de 2026` |

`src/pages/[lang]/[document].astro:55-56` and `:82-83`:

```ts
  datePublished: content.updatedAt,
  dateModified: content.updatedAt,
...
    <meta property="article:published_time" content={content.updatedAt} />
    <meta property="article:modified_time" content={content.updatedAt} />
```

The visible label (`:96`, `{content.updatedLabel}: {content.updatedAt}`)
must keep the human string; only the machine fields change.

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Typecheck    | `npm run check`                | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before `npm test`. Never `npm run build`.

## Scope

**In scope** (the only files you may modify):
- `src/data/siteDocuments.ts`
- `src/pages/[lang]/[document].astro`
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope**:
- The visible `updatedAt` display strings and `updatedLabel` — must not
  change.
- `src/data/jsonld.ts`, service pages, home pages — unrelated schema.
- Any other date field.

## Git workflow

- Branch: `advisor/045-legal-iso-dates`
- Conventional commits, e.g. `fix(seo): emit ISO dates for legal-page schema and OG meta`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Add an ISO date field to the content model

In `siteDocuments.ts`:

1. Add to `SiteDocumentContent` after `updatedAt`:

```ts
  /** Machine-readable ISO-8601 date (YYYY-MM-DD) for schema/OG; `updatedAt` stays the display string. */
  updatedAtIso: string;
```

2. Set it on all eight records (same value per document, both locales):
   privacy `'2026-09-01'`, cookies `'2026-08-21'`, terms `'2026-05-17'`,
   engagement `'2026-05-27'`.

**Verify**: `npm run check` → 0 errors (the interface makes a missed record
a type error).

### Step 2: Use the ISO value in machine-readable output

In `src/pages/[lang]/[document].astro`:

```ts
  datePublished: content.updatedAtIso,
  dateModified: content.updatedAtIso,
...
    <meta property="article:published_time" content={content.updatedAtIso} />
    <meta property="article:modified_time" content={content.updatedAtIso} />
```

Leave line `:96` (the visible `{content.updatedLabel}: {content.updatedAt}`)
untouched.

**Verify**: `npx --no-install astro build`, then:

```bash
grep -o '"datePublished":"[^"]*"' dist/en/privacy/index.html dist/es/privacy/index.html
grep -o 'article:published_time" content="[^"]*"' dist/es/privacy/index.html
```

All must print ISO `2026-09-01`; no localized month names anywhere in the
JSON-LD/meta.

### Step 3: Regression test

Add a group to `tests/run.js` (built-output pattern like `H-04` at
`tests/run.js:900-940`, with the skip guard):

- For each of the 8 legal pages (`dist/{en,es}/{privacy,cookies,terms,engagement}/index.html`):
  extract the first `datePublished` from JSON-LD and the
  `article:published_time` meta; assert both match `/^\d{4}-\d{2}-\d{2}$/`
  and equal the expected ISO value for that document.
- Positive control: the visible `Last updated`/`Última actualización` text
  still contains the human string (`1 Sep 2026` / `1 de septiembre de 2026`
  for privacy).

**Verify**: `node tests/run.js --built` → new assertions green; the full
count grows by exactly the number you added.

### Step 4: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; `git status --short src/data/github-stats.json` → empty.

## Test plan

- New built-output group (Step 3) with per-page ISO assertions and a
  human-string positive control.
- Pattern: `tests/run.js:900-940` (`H-04`).
- No browser tests needed.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -o '"datePublished":"[^"]*"' dist/es/privacy/index.html` → `"datePublished":"2026-09-01"`
- [ ] `grep -c "de septiembre" dist/es/privacy/index.html` → unchanged from
      baseline (the visible label still renders)
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 045 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- Any document's ISO value cannot be derived from its display string
  (report the document instead of guessing).
- A step's verification fails twice.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- When a legal document is updated, both `updatedAt` (display) and
  `updatedAtIso` (machine) must change together; the new test compares the
  ISO field only, so a mismatch between the two is a review item.
- **Deferred:** deriving the display string from the ISO value (single
  source) — would touch legal copy formatting and is not worth the churn now.
