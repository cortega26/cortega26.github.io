# PR Plan — fix/edutecno-ia

## Objective
Address the next highest-impact backlog items by improving the EduTecno project hub landmarks and restoring heading hierarchy for English portfolio sections.

## Scope of this PR
1. **EduTecno hub information architecture (B-007)**
   - Add banner header, breadcrumb navigation, and semantic `<main>` landmark.
   - Provide skip link and visually hidden list heading for module cards.
   - Introduce structured footer with support contact and update metadata.
2. **Heading hierarchy for capability and portfolio groups (B-006)**
   - Insert visually hidden `<h2>` elements before repeated `<h3>` groups.
   - Ensure bootstrap utility classes keep hidden headings accessible to screen readers.

## Deferred to follow-up PRs
- Footer trust copy update on EduTecno PC2 detail page (B-008).
- Portfolio structured data expansion (B-009).

## Testing plan
- Manual keyboard traversal of EduTecno skip link, breadcrumb, and module buttons (desktop breakpoint).
- Screen reader heading outline audit via VoiceOver rotor or NVDA (static reasoning based on heading order).

