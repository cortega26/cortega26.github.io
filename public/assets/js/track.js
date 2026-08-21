/**
 * Conversion instrumentation — GA4 (gtag.js direct).
 *
 * Exposes window.ttTrack(name, props) and auto-binds clicks on any element
 * carrying [data-track]. Public contract preserved: ttTrack(name, {location, label, status}).
 * Internally maps to GA4 custom params: tt_location, tt_label, tt_status (see Plan 006).
 * No direct gtag() calls outside this bridge. gtag() itself queues via dataLayer.
 */
(() => {
  function track(name, props) {
    if (!name) return;
    const payload = props && typeof props === 'object' ? props : {};
    try {
      // GA4 direct — single gtag('event') call, namespaced params (Plan 006).
      // gtag() queues via dataLayer internally; no additional dataLayer.push.
      if (typeof window.gtag === 'function') {
        const params = {};
        if (payload.location !== undefined) params.tt_location = payload.location;
        if (payload.label !== undefined) params.tt_label = payload.label;
        if (payload.status !== undefined) params.tt_status = payload.status;
        window.gtag('event', name, params);
      }
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
