# Accessibility Notes — elrincondeebano

## Method
Static code review of key templates (`index.html`, `english/english.html`, `index-spa.html`, `edutecno/edu-index.html`, `edutecno/PC2/prueba_consolidacion_2.html`) with emphasis on WCAG 2.2 AA success criteria.

## Heading structure snapshots

### English portfolio (`english/english.html`)
1. `h1` — "Carlos Ortega González" (hero)
2. `h2` — Profile at a Glance
3. `h2` — Core Capabilities
4. `h2` — Career Highlights
5. `h2` — Credentials & Certifications (later in document)
6. `h2` — Portfolio (cards)
7. `h2` — Math Lab
8. `h2` — Contact
   - Multiple `h3` elements inside each section (cards, timeline items). Recommend adding hidden `h2` sub-group labels to reduce monotony.

### Spanish portfolio (`index-spa.html`)
Mirrors the English map with localized strings. Same recommendation for section grouping.

### Landing selector (`index.html`)
- `h1` — Welcome to the Carlos Ortega portfolio
- `h2` (x2) — English / Español cards

### EduTecno hub (`edutecno/edu-index.html`)
- `h1` — Prácticas de Consolidación EduTecno
- No additional headings per module; consider adding `h2`/`h3` wrappers to reinforce structure.

### Digimon practice (`edutecno/PC2/prueba_consolidacion_2.html`)
- `h1` — Digimon API
- `h2` — Lista de Digimon
- `h2` — Detalles del Digimon

## Landmark coverage
- Portfolio pages: `<nav>` (primary), `<main>`, `<footer>` plus localized skip links leading to `#overview` (B-002 resolved).
- Landing selector: includes `.skip-link` anchored to hero grid.
- EduTecno hub: lacks `<header>` and `<footer>`; consider wrapping for consistent navigation semantics (backlog B-007).

## Keyboard & focus
- Prior issue: anchors/buttons lost focus outline. Resolved via new `:focus-visible` styling (`english/english/style.css`, `spanish/style.css`).
- Nav submenu toggles now respond to `Enter`/`Space`, close on `Escape`, and trap focus to submenu items before returning to toggle.
- Remaining gap: alerts in contact flow trap focus (backlog B-005).

## Color & contrast quick check
- Primary palette (#5b8def on dark backgrounds) meets contrast >4.5:1. Secondary muted text (#c3cadc) on #0b0d17 is ~4.2:1—acceptable for larger text but monitor for small font usage.
- Buttons maintain >3:1 on hover/focus states.

## Media & alt text
- Hero portrait now includes intrinsic dimensions and descriptive alt text in both locales.
- Portfolio cards rely on text only—no additional imagery; no missing `alt` attributes detected.

## Dynamic interactions
- `showPiMessage()` relies on blocking `alert()` dialogs. Flagged for replacement with non-modal live regions (backlog B-005).
- Digimon practice app fetch UI (JS not audited) should ensure focus management when injecting details; add as future review (backlog B-010 placeholder if needed).

