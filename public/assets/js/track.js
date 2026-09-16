/**
 * Conversion instrumentation — GA4 (gtag.js direct).
 *
 * Exposes window.ttTrack(name, props) and auto-binds clicks on any element
 * carrying [data-track]. Public contract preserved: ttTrack(name, {location, label, status}).
 * Internally maps to GA4 custom params: tt_location, tt_label, tt_status (see Plan 006).
 * No direct gtag() calls outside this bridge. gtag() itself queues via dataLayer.
 */
(() => {
  /** @typedef {{location?: unknown, label?: unknown, status?: unknown, service_id?: unknown, service_category?: unknown, contact_type?: unknown, cta_location?: unknown, error_category?: unknown, error_stage?: unknown}} TrackingProps */
  /** @type {Window & typeof globalThis & {gtag?: (...args: unknown[]) => void, ttTrack?: (name: string, props?: TrackingProps) => void}} */
  const typedWindow = window;

  /** Bounded in-memory queue for events fired before gtag is ready (Plan 011). */
  const queue = [];
  const MAX_QUEUE = 50;

  /**
   * Canonical Sprint 0 params passed through verbatim to GA4 (in addition to
   * the legacy tt_* mapping). Allowlisted, string-only, length-capped so the
   * transport can never leak raw user content even if a caller errs.
   * Page identity uses GA4's built-in page dimensions — no page_path here.
   */
  const CANONICAL_PARAMS = [
    'service_id',
    'service_category',
    'contact_type',
    'cta_location',
    'error_category',
    'error_stage',
  ];
  const MAX_PARAM_LEN = 100;

  /** @param {unknown} value */
  function sanitizeParam(value) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.slice(0, MAX_PARAM_LEN);
  }

  /** @param {string | null} name @param {TrackingProps} [props] */
  function send(name, payload) {
    try {
      // GA4 direct — single gtag('event') call, namespaced params (Plan 006).
      // gtag() queues via dataLayer internally; no additional dataLayer.push.
      if (typeof typedWindow.gtag === 'function') {
        /** @type {Record<string, unknown>} */
        const params = {};
        if (payload.location !== undefined) params.tt_location = payload.location;
        if (payload.label !== undefined) params.tt_label = payload.label;
        if (payload.status !== undefined) params.tt_status = payload.status;
        for (const key of CANONICAL_PARAMS) {
          const clean = sanitizeParam(payload[key]);
          if (clean !== undefined) params[key] = clean;
        }
        typedWindow.gtag('event', name, params);
      }
    } catch (_) {
      /* never let instrumentation break the page */
    }
  }

  /** Drain buffered events in order; splice-take prevents double-flush. */
  function flush() {
    const pending = queue.splice(0, queue.length);
    for (const item of pending) send(item.name, item.payload);
  }

  /** @param {string | null} name @param {TrackingProps} [props] */
  function track(name, props) {
    if (!name) return;
    const payload = props && typeof props === 'object' ? props : {};
    if (typeof typedWindow.gtag !== 'function') {
      if (queue.length >= MAX_QUEUE) queue.shift();
      queue.push({ name, payload });
      return;
    }
    flush();
    send(name, payload);
  }

  typedWindow.ttTrack = track;

  // Flush any events buffered before gtag arrived, then poll briefly for late gtag.
  try {
    if (typeof typedWindow.gtag === 'function') flush();
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      try {
        if (typeof typedWindow.gtag === 'function') {
          flush();
          clearInterval(timer);
        } else if (ticks >= 10) {
          clearInterval(timer);
        }
      } catch (_) {
        /* never let instrumentation break the page */
      }
    }, 500);
  } catch (_) {
    /* timers unavailable — events stay queued until the next track() call */
  }

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
