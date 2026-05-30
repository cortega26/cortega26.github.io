/**
 * Vendor-agnostic conversion instrumentation.
 *
 * Exposes window.ttTrack(name, props) and auto-binds clicks on any element
 * carrying [data-track]. Events are forwarded to whatever analytics layer is
 * present at runtime — currently a no-op safety net, ready for Plausible
 * (window.plausible) or a dataLayer/gtag consumer. No vendor is hard-wired,
 * so adopting one is a one-line change with zero markup edits.
 *
 * To start *seeing* these events, add a custom-event-capable analytics tool
 * (Plausible is the cookieless, privacy-friendly fit for this stack). Ahrefs
 * Analytics, already installed, only reports page views.
 */
(() => {
  function track(name, props) {
    if (!name) return;
    const payload = props && typeof props === 'object' ? props : {};
    try {
      // Plausible custom events (if/when loaded).
      if (typeof window.plausible === 'function') {
        window.plausible(name, { props: payload });
      }
      // Generic dataLayer (GTM / custom consumers).
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name, ...payload });
    } catch (_) {
      /* never let instrumentation break the page */
    }
  }

  window.ttTrack = track;

  // Auto-bind declarative click tracking.
  document.addEventListener(
    'click',
    (event) => {
      const el = event.target instanceof Element ? event.target.closest('[data-track]') : null;
      if (!el) return;
      track(el.getAttribute('data-track'), {
        location: el.getAttribute('data-track-loc') || undefined,
        label: (el.textContent || '').trim().slice(0, 60) || undefined,
      });
    },
    { capture: true }
  );
})();
