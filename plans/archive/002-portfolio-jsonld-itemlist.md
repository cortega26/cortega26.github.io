# Plan 002: Move the portfolio `itemListElement` into a valid `ItemList` JSON-LD node

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 676bd14..HEAD -- src/pages/en/index.astro src/pages/es/index.astro`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (best done after plans/001 so `npm run check` guards the edit)
- **Category**: seo / correctness
- **Planned at**: commit `676bd14`, 2026-07-10

## Why this matters

The home pages emit a JSON-LD block typed `["Person","ProfessionalService"]`
that carries an `itemListElement` array of 8 portfolio works. `itemListElement`
is a property of schema.org **`ItemList`**, not of `Person` or
`ProfessionalService`. Placing it there is invalid: schema consumers (Google's
Rich Results parser, LLM crawlers) are entitled to ignore the property, which
would make the 8 flagship portfolio entries structurally invisible — directly
undercutting this site's "public evidence / GEO" thesis. Moving the same array
into a dedicated `ItemList` node makes the data valid and machine-readable with
no change to the human-visible page. This overlaps with task `TS-016`
("validate JSON-LD in Rich Results") in
`docs/tasks/tooltician-strategy-execution-plan.md`; treat this as the code
change that TS-016's validation would demand.

## Current state

Both `src/pages/en/index.astro` and `src/pages/es/index.astro` define a `jsonLd`
const (EN lines 25–71, ES lines 25–71). The tail of that object holds the
portfolio list as a **direct property of the Person/ProfessionalService node**:

`src/pages/en/index.astro:61-70` (ES is the structurally identical block with
Spanish descriptions):

```js
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'SoftwareApplication', name: 'El Rincón de Ébano', url: 'https://elrincondeebano.com', description: 'Live e-commerce storefront for a private residential community, actively operated.' } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'SoftwareApplication', name: 'Portfolio Manager', url: 'https://github.com/cortega26/portfolio-manager-server', description: '...' } },
    // ... positions 3–8 ...
  ],
};
```

Both files render JSON-LD from a `<Fragment slot="head">` (EN/ES lines 88–91):

```astro
  <Fragment slot="head">
    <script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd)} />
    <script type="application/ld+json" is:inline set:html={JSON.stringify(breadcrumbJsonLd)} />
  </Fragment>
```

Convention to match: this exact `set:html={JSON.stringify(...)}` pattern is how
every page in this repo emits JSON-LD (see also `src/components/ServicePage.astro:92-94`,
`src/pages/[lang]/[document].astro:84`). Follow it — one `<script>` per JSON-LD
object. The bilingual rule for this repo is absolute: **every content change is
applied to both EN and ES** (see the project CLAUDE.md "Bilingual pattern").

## Commands you will need

| Purpose     | Command                          | Expected on success            |
|-------------|----------------------------------|--------------------------------|
| Type check  | `npm run check` (exists after 001)| exit 0, `0 errors`            |
| Build       | `npx astro build`                | exit 0, writes `dist/`        |

> If plan 001 has not been executed yet and `npm run check` does not exist,
> use `npx astro check` instead, or rely on `npx astro build` succeeding.
>
> Use `npx astro build`, **not** `npm run build`: the latter also runs
> `scripts/fetch-github-stats.js`, which rewrites `src/data/github-stats.json`
> from the live GitHub API — an out-of-scope side-effect. `npx astro build`
> renders `dist/` without it, so `git status` stays clean.

## Scope

**In scope** (the only files you should modify):
- `src/pages/en/index.astro`
- `src/pages/es/index.astro`

**Out of scope** (do NOT touch):
- The `breadcrumbJsonLd` object — it is already a valid `BreadcrumbList`; leave
  it alone.
- The Person/ProfessionalService fields other than `itemListElement`
  (`makesOffer`, `knowsAbout`, `hasOccupation`, `address`, etc.) — do not
  restructure or "clean up" these; only the `itemListElement` moves.
- Any of the 8 items' text, URLs, order, or `position` numbers — move them
  verbatim.
- JSON-LD in any other page or component.

## Git workflow

- Branch: `advisor/002-portfolio-jsonld-itemlist`
- One commit; Conventional Commits style, e.g.
  `fix(seo): model portfolio works as a valid ItemList JSON-LD node`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1 (manual, recommended baseline): record the "before"

Before editing, capture the current behavior so the improvement is provable.
This step is manual and optional but recommended: open Google's Rich Results
Test (https://search.google.com/test/rich-results), test
`https://tooltician.com/en/`, and note whether the 8 `SoftwareApplication`
items are detected or dropped. This is the evidence TS-016 wants. If you cannot
run it, proceed — the code change below is correct regardless of the current
parser behavior.

### Step 2: Extract the array into a new `ItemList` const (EN)

In `src/pages/en/index.astro`:

1. **Remove** the `itemListElement: [ ... ],` property from the `jsonLd`
   object (the block at lines ~61–70, ending just before the closing `};`).
2. **Add** a new const immediately after the `jsonLd` object (and before
   `breadcrumbJsonLd`), reusing the exact same array you just removed:

   ```js
   const portfolioJsonLd = {
     '@context': 'https://schema.org',
     '@type': 'ItemList',
     name: 'Tooltician portfolio',
     itemListOrder: 'https://schema.org/ItemListOrderAscending',
     numberOfItems: 8,
     itemListElement: [
       // paste the exact 8 ListItem entries removed from jsonLd, unchanged
     ],
   };
   ```

**Verify**: `grep -c "itemListElement" src/pages/en/index.astro` → returns `1`
(the property now exists only inside `portfolioJsonLd`), and
`grep -c "@type': 'ItemList'" src/pages/en/index.astro` → returns `1`.

### Step 3: Render the new block (EN)

Add a third `<script>` in the `<Fragment slot="head">` of
`src/pages/en/index.astro`:

```astro
  <Fragment slot="head">
    <script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd)} />
    <script type="application/ld+json" is:inline set:html={JSON.stringify(portfolioJsonLd)} />
    <script type="application/ld+json" is:inline set:html={JSON.stringify(breadcrumbJsonLd)} />
  </Fragment>
```

**Verify**: `grep -c "application/ld+json" src/pages/en/index.astro` → returns `3`.

### Step 4: Repeat Steps 2–3 for ES

Apply the identical structural change to `src/pages/es/index.astro`, keeping the
**Spanish** item descriptions that are already there (do not copy the English
text). Use the same `portfolioJsonLd` const name and the same
`name: 'Tooltician portfolio'` (a proper noun; keep it identical across
locales, matching how `breadcrumbJsonLd` reuses `'Tooltician'`).

**Verify**:
- `grep -c "@type': 'ItemList'" src/pages/es/index.astro` → `1`
- `grep -c "application/ld+json" src/pages/es/index.astro` → `3`

### Step 5: Build and validate the emitted JSON-LD

```bash
npm run check     # if plan 001 landed; otherwise: npx astro check
npx astro build   # astro build directly — NOT `npm run build` (see Commands note)
```

Then confirm the built HTML contains a well-formed `ItemList` and that the
Person node no longer carries `itemListElement` (the built page also contains
FAQPage and BreadcrumbList JSON-LD blocks — the script below selects by
`@type` and ignores them):

```bash
node -e '
const fs=require("fs");
for (const f of ["dist/en/index.html","dist/es/index.html"]) {
  const html=fs.readFileSync(f,"utf8");
  const blocks=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const person=blocks.find(b=>String(b["@type"]).includes("Person"));
  const list=blocks.find(b=>b["@type"]==="ItemList");
  if(!person) throw new Error(f+": no Person block");
  if(person.itemListElement) throw new Error(f+": Person still has itemListElement");
  if(!list||list.itemListElement.length!==8) throw new Error(f+": ItemList missing or wrong count");
  console.log(f+": OK — Person clean, ItemList has "+list.itemListElement.length+" items");
}
'
```

**Verify**: prints `... OK` for both `dist/en/index.html` and
`dist/es/index.html`.

## Test plan

- No new test file is required; the Step 5 node assertion is the regression
  check (Person has no `itemListElement`; a valid `ItemList` of 8 items exists
  in both locales).
- If plan 003's snapshot harness exists, it does not cover the home page, so no
  snapshot update is needed here.
- Manual (recommended): re-run the Rich Results Test from Step 1 on the built
  output or after deploy and confirm the 8 items are now detected under the
  `ItemList`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx astro build` exits 0
- [ ] The Step 5 node script prints `OK` for both EN and ES built pages
- [ ] `grep -c "itemListElement" src/pages/en/index.astro` returns `1`
      (and same for the ES file)
- [ ] Each of `src/pages/en/index.astro` and `src/pages/es/index.astro` emits
      exactly 3 `application/ld+json` scripts
- [ ] Only `src/pages/en/index.astro` and `src/pages/es/index.astro` are
      modified (`git status`)
- [ ] `plans/README.md` status row for 002 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `itemListElement` array in either file does not contain exactly 8
  `ListItem` entries, or the two files' item lists have diverged in count
  (the excerpt assumed 8 per locale, positions 1–8).
- The `<Fragment slot="head">` block does not match the "Current state"
  excerpt (the page structure drifted).
- `npm run check` newly fails **because of your edit** (a type error you
  introduced) and the fix is not obvious within the two in-scope files.
- You find the same invalid `itemListElement`-on-`Person` pattern in other
  pages/components — note it and report; do not expand scope in this plan.

## Maintenance notes

For the human/agent who owns this after the change lands:

- A stronger modeling option (deferred) is to combine the Person, ItemList, and
  BreadcrumbList into a single `@graph` array with `@id` cross-references so the
  `ItemList` is explicitly attributed to the Person. That is a larger change and
  is intentionally not done here; a standalone valid `ItemList` is the minimal
  correct fix.
- If portfolio items are ever added/removed, update `numberOfItems` and the
  Step 5 expected count (`8`) together, in both locales.
- A reviewer should confirm the ES file kept Spanish descriptions and only the
  *structure* changed.
