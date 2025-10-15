# PR Plan — fix/remove-legacy-js

## Objective
Improve first meaningful paint and contact accessibility by eliminating third-party JavaScript dependencies and delivering an inline status message for the portfolio contact form (backlog items B-010 and B-011).

## Scope of this PR
1. **Remove CDN JavaScript dependencies (B-010)**
   - Rewrite smooth scrolling logic without jQuery.
   - Implement a vanilla navbar collapse controller so Bootstrap JS, Popper, and jQuery are no longer required.
2. **Accessible contact confirmation (B-011)**
   - Add an aria-live status region that announces the email draft fallback.
   - Reset and localize messaging without disruptive alerts.

## Deferred to follow-up PRs
- Assess migrating Bootstrap CSS utility usage to a fully custom layout to drop the CSS CDN dependency.

## Testing plan
- Manual verification of navbar toggle behavior on mobile and desktop breakpoints without Bootstrap JS.
- Manual verification that the contact form status message announces in NVDA (reasoned) and updates when submitting.

