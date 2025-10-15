# E2E Front-end Audit — elrincondeebano (cortega26.github.io)

_Last updated: 2025-10-15 16:30:12Z_

## Scope
- Landing selector (`/index.html`)
- English portfolio (`/english/english.html`)
- Spanish portfolio (`/index-spa.html`)
- EduTecno hub (`/edutecno/edu-index.html` and `/edutecno/PC2/prueba_consolidacion_2.html`)
- Shared assets (`/assets`, `/assets/css/style.css`, `/assets/js/script.js`, JS helpers)

## Summary of fixes shipped now
1. Hardened navigation submenu toggle with debounced outside-click guard, keyboard support, and ARIA sync. Fixes the instant-close defect and creates anchor targets for key portfolio case studies. (See `english/english.html`, `index-spa.html`, and shared assets in `/assets/js/script.js` and `/assets/css/style.css`.)
2. Added intrinsic sizing (`width`/`height`) and async decoding hints to hero imagery to eliminate layout shift in both locales. (See `english/english.html` and `index-spa.html`.)
3. Restored visible focus states across nav buttons, submenu links, and global anchors to bring keyboard parity in both languages. (See `/assets/css/style.css`.)

## Detailed findings & remediation

### 1. Navigation submenu collapses immediately (Resolved)
- **Observation**: Portfolio nav entry used a simple anchor, so the dropdown pattern closed on the same click due to Bootstrap collapse + document click listeners.
- **Evidence**: Original markup in `english/english.html` and `index-spa.html` lacked a stable state hook; there was no ARIA state or debounce (`git show HEAD^:english/english.html`).
- **Impact**: Users could not reach deep portfolio anchors; keyboard users especially lost context because focus returned to page body.
- **Root cause**: No dedicated state management for nested navigation; reliance on Bootstrap's default collapse and global click handler.
- **Fix**: Converted the Portfolio item into a button-controlled submenu with `aria-expanded`, `aria-controls`, 180 ms outside-click debounce, Escape handling, and focus transfer. Added anchor IDs for flagship case studies to make submenu destinations meaningful.

### 2. Layout shift from hero portrait (Resolved)
- **Observation**: The above-the-fold hero image had no intrinsic dimensions, so the first contentful paint pushed text as the PNG loaded.
- **Evidence**: Prior markup lacked `width`/`height` and `decoding` attributes (`git show HEAD^:english/english.html` lines around the hero figure).
- **Impact**: 150–200px CLS during hero render, harming Core Web Vitals and visual polish on mobile.
- **Root cause**: Static HTML without responsive image hints; reliance on CSS max-width alone.
- **Fix**: Parsed the PNG header to obtain 952×939 dimensions, set `loading="eager"` and `decoding="async"` to keep hero crisp without layout shift.

### 3. Invisible focus outlines (Resolved)
- **Observation**: Global styles removed focus outlines (`a:focus { text-decoration: none; }`) and nav buttons inherited no keyboard affordance.
- **Evidence**: `assets/css/style.css` prior to change had no `:focus-visible` styles.
- **Impact**: Keyboard users could not see where focus landed, failing WCAG 2.4.7.
- **Root cause**: Hover-focused theming without accessible fallback.
- **Fix**: Introduced `:focus-visible` outlines for anchors and buttons, highlighted submenu links on focus, and ensured nav toggles inherit typography.

### 4. Heavy third-party CSS for limited usage (Open)
- **Observation**: Both portfolio pages load full Bootstrap 4.5 and Font Awesome even though only a subset of grid utilities and no FA icons are used.
- **Impact**: Adds ~150 KB compressed render-blocking CSS.
- **Root cause**: Bootstrapping from CDN for layout convenience.
- **Plan**: Replace with a slim utility layer (Flex/Grid via native CSS) and self-hosted icon subset. Logged in backlog item B-004.

### 5. No skip link on portfolio pages (Open)
- **Observation**: Unlike the landing selector, English/Spanish portfolio pages have no skip-to-content link.
- **Impact**: Keyboard users must tab through the entire nav on every load.
- **Root cause**: Omitted accessibility affordance.
- **Plan**: Add consistent skip link anchored to `<main>` on both locales. Logged in backlog item B-002.

### 6. Contact form uses alert() confirmations (Open)
- **Observation**: `sendEmailFallback` uses blocking `alert()` dialogs for feedback.
- **Impact**: Interrupts screen-reader flow and mobile UX.
- **Root cause**: Quick fallback implementation without toast/inline feedback.
- **Plan**: Replace with inline status region (ARIA live polite) and progressive enhancement. Logged in backlog item B-005.

### 7. EduTecno practice hub lacks breadcrumb/landmark structure (Open)
- **Observation**: `edu-index.html` uses a bare container without header landmarks or breadcrumbs to orient students.
- **Impact**: Harder navigation for assistive tech; SEO can’t infer structure.
- **Root cause**: Minimal template for internal audience.
- **Plan**: Add `<header>`, `<nav aria-label="Módulos">`, and breadcrumb schema. Logged in backlog item B-007.

### 8. Digimon practice page footer contains joking “hack the Pentagon” link (Open)
- **Observation**: `/edutecno/PC2/prueba_consolidacion_2.html` features a novelty link that could alarm auditors and hamper trust.
- **Impact**: Potential policy/security concern for students.
- **Root cause**: Leftover easter egg from training material.
- **Plan**: Replace with legitimate resource link or remove. Logged in backlog item B-008.

### 9. Math Lab + Portfolio sections lack heading hierarchy cues (Open)
- **Observation**: Several subsections jump from `<h2>` to `<h3>` without intermediate summaries, and cards rely only on typographic styling.
- **Impact**: Screen readers get repetitive `heading level 3` sequences without grouping context.
- **Root cause**: Visual-first layout.
- **Plan**: Introduce visually hidden `<h2>` separators per thematic group (Automation, Data Viz, Platforms). Logged in backlog item B-006.

### 10. No structured data for portfolio case studies (Open)
- **Observation**: Person schema exists but individual projects lack `CreativeWork` or `Project` JSON-LD.
- **Impact**: Missed SEO richness (search results, knowledge panels).
- **Root cause**: Only top-level schema implemented.
- **Plan**: Generate `ItemList` + `CreativeWork` entries for highlighted case studies. Logged in backlog item B-009.

## Linked artifacts
- Accessibility notes: `../a11y/a11y-report.md`
- Backlog: `../backlog.csv`
- Design tokens: `../styles/tokens.json`
- PR execution plan: `pr-plan.md`

