/**
 * Sprint 0 analytics — canonical service/lead event layer for tooltician.com.
 *
 * Tooltician is a consulting/portfolio site with productized services and a
 * lead-generation funnel (NOT a tools platform), so this layer uses the real
 * business vocabulary:
 *
 *   service_view / service_engage
 *   brief_start / brief_submit / brief_success / brief_error
 *   book_call / email_copy / proof_click / portfolio_click / cv_download
 *   template_open / language_select / contact_intent (generic fallback)
 *
 * Transport stays in track.js (window.ttTrack, queued until gtag is ready).
 * Page identity comes from GA4's built-in page dimensions — this layer sends
 * no page_path of its own. service_id/service_category are attached only when
 * a real service context exists; generic surfaces omit them (never faked).
 *
 * Privacy: behavior only, never content. Params are allowlisted per event,
 * coerced to short strings, values matching secret patterns are dropped, and
 * raw user input, form values, URLs, emails, and stack traces are never read.
 *
 * CSP-safe: external file, no inline code, no eval. No CSP hash changes.
 */
(() => {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const doc = typeof document !== 'undefined' ? document : null;
  const nav = typeof navigator !== 'undefined' ? navigator : {};

  /** Mirror of src/data/service-registry.json (service_id -> service_category). Parity-tested. */
  const SERVICE_REGISTRY = {
    automation: 'automation',
    'recurring-data': 'data-collection',
    'internal-tools': 'internal-tools',
    financial: 'financial',
    web: 'web',
    htw: 'hygiene',
  };

  const CONTACT_TYPES = ['send_brief', 'email'];
  const ERROR_CATEGORIES = ['validation', 'client', 'server', 'network'];
  const ERROR_STAGES = ['validate', 'submit', 'deliver'];

  /**
   * Canonical events. `required` params must survive sanitization or the
   * event is rejected client-side; `optional` params are omitted when absent.
   * service_id/service_category are optional everywhere except service_view /
   * service_engage, which by definition only fire inside a service scope.
   */
  const EVENTS = {
    service_view: { required: ['service_id', 'service_category'], optional: [] },
    service_engage: { required: ['service_id', 'service_category'], optional: [] },
    brief_start: { required: [], optional: ['service_id', 'service_category'] },
    brief_submit: { required: [], optional: ['service_id', 'service_category'] },
    brief_success: { required: [], optional: ['service_id', 'service_category'] },
    brief_error: { required: ['error_category', 'error_stage'], optional: ['service_id', 'service_category'] },
    book_call: { required: ['cta_location'], optional: ['service_id', 'service_category'] },
    email_copy: { required: [], optional: ['service_id', 'service_category'] },
    proof_click: { required: [], optional: ['service_id', 'service_category'] },
    portfolio_click: { required: [], optional: ['service_id', 'service_category'] },
    cv_download: { required: [], optional: [] },
    template_open: { required: [], optional: ['service_id', 'service_category'] },
    language_select: { required: [], optional: [] },
    contact_intent: { required: ['contact_type', 'cta_location'], optional: ['service_id', 'service_category'] },
  };

  const MAX_LEN = 100;
  const SECRET_PATTERN = /api[_-]?key|secret|token|passwd|password|bearer|session|cookie|auth|credential|private[_-]?key/i;
  const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

  const counters = { sent: 0, suppressed: 0, reasons: {} };
  const seenOnce = new Set();

  function noteSuppressed(reason) {
    counters.suppressed += 1;
    counters.reasons[reason] = (counters.reasons[reason] || 0) + 1;
  }

  /** Non-null when canonical events must not be emitted (privacy or non-prod). */
  function suppressionReason() {
    try {
      if (root.__TT_NO_ANALYTICS__) return 'disabled_flag';
      if (nav.doNotTrack === '1' || nav.doNotTrack === 'yes') return 'do_not_track';
      if (nav.globalPrivacyControl === true) return 'global_privacy_control';
      const host = (root.location && root.location.hostname) || '';
      const proto = (root.location && root.location.protocol) || '';
      if (proto === 'file:') return 'local_protocol';
      if (host === '' || host === 'localhost' || host === '127.0.0.1' || host === '::1') return 'local_host';
    } catch (_) {
      return 'suppression_check_failed';
    }
    return null;
  }

  function sanitizeString(value) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (SECRET_PATTERN.test(trimmed) || EMAIL_PATTERN.test(trimmed)) return undefined;
    return trimmed.slice(0, MAX_LEN);
  }

  /** Registry id or undefined — generic surfaces never fake a service context. */
  function resolveServiceId(candidate) {
    const clean = sanitizeString(candidate);
    if (clean && Object.prototype.hasOwnProperty.call(SERVICE_REGISTRY, clean)) return clean;
    return undefined;
  }

  /** Nearest [data-service-id] scope, else undefined. Never throws. */
  function serviceIdForElement(el) {
    try {
      if (el && typeof el.closest === 'function') {
        const scope = el.closest('[data-service-id]');
        if (scope) return resolveServiceId(scope.getAttribute('data-service-id'));
      }
    } catch (_) {
      /* ignore */
    }
    return undefined;
  }

  function withService(params, serviceId) {
    const id = resolveServiceId(serviceId);
    if (id) {
      params.service_id = id;
      params.service_category = SERVICE_REGISTRY[id];
    }
    return params;
  }

  /**
   * Normalize a failure into a coarse, content-free bucket.
   * Accepts HTTP status codes, short status labels, or Error names.
   */
  function normalizeError(input) {
    if (typeof input === 'number' && Number.isFinite(input)) {
      if (input >= 500) return { error_category: 'server', error_stage: 'deliver' };
      if (input >= 400) return { error_category: 'client', error_stage: 'deliver' };
      return { error_category: 'server', error_stage: 'deliver' };
    }
    const label = sanitizeString(typeof input === 'string' ? input : (input && input.name) || '');
    if (!label) return { error_category: 'server', error_stage: 'deliver' };
    const low = label.toLowerCase();
    if (low === 'validation' || low === 'invalid' || low === 'bad-request') {
      return { error_category: 'validation', error_stage: 'validate' };
    }
    if (low === 'network' || low === 'timeout' || low === 'abort' || low.indexOf('network') !== -1 || low.indexOf('failed to fetch') !== -1) {
      return { error_category: 'network', error_stage: 'deliver' };
    }
    if (low.charAt(0) === '4') return { error_category: 'client', error_stage: 'deliver' };
    if (low.charAt(0) === '5') return { error_category: 'server', error_stage: 'deliver' };
    return { error_category: 'server', error_stage: 'deliver' };
  }

  function buildParams(event, raw) {
    const spec = EVENTS[event];
    if (!spec) return null;
    const params = {};
    const check = (key, value) => {
      if (value === undefined) return undefined;
      if (key === 'service_id') return resolveServiceId(typeof value === 'string' ? value : '');
      // service_category is always derived from a valid service_id below —
      // raw caller input for it is ignored so it can never be forged.
      if (key === 'service_category') return undefined;
      if (key === 'contact_type') return CONTACT_TYPES.indexOf(value) !== -1 ? value : undefined;
      if (key === 'error_category') return ERROR_CATEGORIES.indexOf(value) !== -1 ? value : undefined;
      if (key === 'error_stage') return ERROR_STAGES.indexOf(value) !== -1 ? value : undefined;
      return sanitizeString(value);
    };
    for (const key of spec.required.concat(spec.optional)) {
      const clean = check(key, (raw || {})[key]);
      if (clean !== undefined) params[key] = clean;
    }
    // service_category always derives from a valid service_id, never raw input.
    if (params.service_id && !params.service_category) {
      params.service_category = SERVICE_REGISTRY[params.service_id];
    }
    return params;
  }

  function emit(event, raw) {
    const spec = EVENTS[event];
    if (!spec) return { sent: false, reason: 'unknown_event' };
    const suppressed = suppressionReason();
    if (suppressed) {
      noteSuppressed(suppressed);
      return { sent: false, reason: suppressed };
    }
    const params = buildParams(event, raw || {});
    if (!params) return { sent: false, reason: 'build_failed' };
    // Never emit a canonical event missing a required param.
    for (const key of spec.required) {
      if (params[key] === undefined) {
        noteSuppressed('missing_params');
        return { sent: false, reason: 'missing_params' };
      }
    }
    try {
      if (typeof root.ttTrack === 'function') {
        root.ttTrack(event, params);
        counters.sent += 1;
        return { sent: true };
      }
      noteSuppressed('no_transport');
      return { sent: false, reason: 'no_transport' };
    } catch (_) {
      noteSuppressed('transport_error');
      return { sent: false, reason: 'transport_error' };
    }
  }

  /** Fire-once guard per key per page load (rerender/observer safe). */
  function emitOnce(key, event, raw) {
    if (seenOnce.has(key)) return { sent: false, reason: 'duplicate_suppressed' };
    seenOnce.add(key);
    return emit(event, raw);
  }

  function serviceView(serviceId) {
    const id = resolveServiceId(serviceId);
    if (!id) return { sent: false, reason: 'missing_params' };
    return emitOnce('service_view:' + id, 'service_view', withService({}, id));
  }

  /**
   * First meaningful interaction showing interest in a service: an intent-chip
   * click, or first input into that service's brief form. Never page load.
   */
  function serviceEngage(serviceId) {
    const id = resolveServiceId(serviceId);
    if (!id) return { sent: false, reason: 'missing_params' };
    return emitOnce('service_engage:' + id, 'service_engage', withService({}, id));
  }

  function briefStart(serviceId) {
    const key = 'brief_start:' + (resolveServiceId(serviceId) || 'page');
    return emitOnce(key, 'brief_start', withService({}, serviceId));
  }

  function briefSubmit(serviceId) {
    return emit('brief_submit', withService({}, serviceId));
  }

  function briefSuccess(serviceId) {
    return emit('brief_success', withService({}, serviceId));
  }

  function briefError(serviceId, errorInput) {
    const norm = normalizeError(errorInput);
    return emit('brief_error', withService({ error_category: norm.error_category, error_stage: norm.error_stage }, serviceId));
  }

  function ctaLocation(el, fallback) {
    try {
      const loc = el && el.getAttribute && (el.getAttribute('data-cta-loc') || el.getAttribute('data-track-loc'));
      const clean = sanitizeString(loc || '');
      if (clean) return clean;
    } catch (_) {
      /* ignore */
    }
    return fallback || 'unknown';
  }

  function bookCall(serviceId, location) {
    return emit('book_call', withService({ cta_location: location || 'unknown' }, serviceId));
  }

  function emailCopy(serviceId) {
    return emit('email_copy', withService({}, serviceId));
  }

  function proofClick(serviceId) {
    return emit('proof_click', withService({}, serviceId));
  }

  function portfolioClick(serviceId) {
    return emit('portfolio_click', withService({}, serviceId));
  }

  function cvDownload() {
    return emit('cv_download', {});
  }

  function templateOpen(serviceId) {
    return emit('template_open', withService({}, serviceId));
  }

  function languageSelect() {
    return emit('language_select', {});
  }

  function contactIntent(contactType, location, serviceId) {
    return emit('contact_intent', withService({ contact_type: contactType, cta_location: location || 'unknown' }, serviceId));
  }

  function isExternalLink(el) {
    try {
      if (!el || el.tagName !== 'A') return false;
      const href = el.getAttribute('href') || '';
      if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
      const url = new URL(el.href, root.location && root.location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      const origin = root.location && root.location.origin;
      return !!origin && url.origin !== origin;
    } catch (_) {
      return false;
    }
  }

  function bindDeclarative() {
    if (!doc || typeof doc.addEventListener !== 'function') return;
    // service_view: a service page stamps its identity on <main data-service-id>.
    try {
      const scope = doc.querySelector('main[data-service-id]');
      if (scope) serviceView(scope.getAttribute('data-service-id'));
    } catch (_) {
      /* never break the page */
    }
    doc.addEventListener(
      'click',
      (event) => {
        try {
          const target = event.target instanceof Element ? event.target : null;
          if (!target) return;
          const el = target.closest(
            '[data-service-engage],[data-book-call],[data-contact-intent],' +
              '[data-proof-click],[data-portfolio-click],[data-cv-download],' +
              '[data-template-open],[data-language-select]'
          );
          if (!el || el.hasAttribute('data-no-track')) return;
          const serviceId = serviceIdForElement(el);
          const loc = ctaLocation(el);

          if (el.hasAttribute('data-service-engage')) {
            serviceEngage(serviceIdForElement(el));
            return;
          }
          if (el.hasAttribute('data-book-call')) {
            bookCall(serviceId, loc);
            return;
          }
          if (el.hasAttribute('data-contact-intent')) {
            contactIntent(el.getAttribute('data-contact-intent'), loc, serviceId);
            return;
          }
          // Proof/portfolio only count for outbound verification/browsing.
          if (el.hasAttribute('data-proof-click') || el.hasAttribute('data-portfolio-click')) {
            const link = target.closest('a');
            if (!link || !isExternalLink(link)) return;
            if (el.hasAttribute('data-proof-click')) proofClick(serviceIdForElement(link));
            else portfolioClick(serviceIdForElement(link));
            return;
          }
          if (el.hasAttribute('data-cv-download')) {
            cvDownload();
            return;
          }
          if (el.hasAttribute('data-template-open')) {
            templateOpen(serviceId);
            return;
          }
          if (el.hasAttribute('data-language-select')) {
            languageSelect();
          }
        } catch (_) {
          /* never break the page */
        }
      },
      { capture: true }
    );
  }

  const api = {
    serviceView,
    serviceEngage,
    briefStart,
    briefSubmit,
    briefSuccess,
    briefError,
    bookCall,
    emailCopy,
    proofClick,
    portfolioClick,
    cvDownload,
    templateOpen,
    languageSelect,
    contactIntent,
    resolveServiceId,
    serviceIdForElement,
    normalizeError,
    debug() {
      return { sent: counters.sent, suppressed: counters.suppressed, reasons: { ...counters.reasons }, seen: Array.from(seenOnce) };
    },
  };

  api._internals = {
    SERVICE_REGISTRY,
    EVENTS,
    CONTACT_TYPES,
    ERROR_CATEGORIES,
    ERROR_STAGES,
    buildParams,
    sanitizeString,
    suppressionReason,
  };

  root.ttAnalytics = api;

  try {
    if (doc && doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', bindDeclarative);
    } else {
      bindDeclarative();
    }
  } catch (_) {
    /* timers/DOM unavailable — API remains callable */
  }
})();
