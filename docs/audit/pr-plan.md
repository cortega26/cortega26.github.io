# PR Plan — fix/e2e-audit-top3

## Objective
Ship the three highest-impact fixes discovered during the audit while leaving clear follow-ups for remaining issues.

## Scope of this PR
1. **Navigation submenu stability**
   - Convert Portfolio nav item to button + submenu structure (EN + ES).
   - Add ARIA wiring, case-study anchors, and keyboard interactions.
   - Update localized stylesheets for submenu layout + focus rings.
   - Centralize submenu state with 170 ms debounce + composedPath outside-click guard.
2. **Hero imagery stability**
   - Add intrinsic `width`/`height`, `loading`, and `decoding` hints to hero portrait in both locales.
3. **Focus visibility baseline**
   - Introduce `:focus-visible` rules for anchors/buttons.
   - Ensure nav toggles inherit typography and highlight on focus.

## Deferred to follow-up PRs
- Skip links on portfolio pages (backlog B-002).
- Replace blocking alerts with live-region feedback (B-005).
- CSS diet (Bootstrap removal) and schema enhancements (B-004, B-009).

## Testing plan
- Manual keyboard traversal across nav + submenu (desktop + responsive breakpoints).
- Verify hero layout shift eliminated via dev tools (CLS overlay) — static reasoning only.
- Smoke-test contact form fallback to ensure no regression in submission flow.

