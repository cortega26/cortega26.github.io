/**
 * Environment guard for GA4 — must run synchronously BEFORE the inline gtag stub.
 *
 * Only the production hosts may send GA4 hits. On any other host (localhost,
 * LAN preview, file://, forks) it sets GA's documented opt-out flag
 * window['ga-disable-<ID>'] so gtag('config')/gtag('event') send nothing. Events
 * are still queued in dataLayer, so tests and local debugging keep working.
 * (product-analytics.js keeps its own DNT/GPC/localhost suppression untouched.)
 *
 * It lives in an external file so the inline stub keeps its CSP hash.
 */
(() => {
  const PRODUCTION_HOSTS = ['tooltician.com', 'www.tooltician.com'];
  try {
    const script = document.currentScript;
    const ga4Id = script && script.getAttribute('data-ga4-id');
    const host = (location.hostname || '').toLowerCase();
    if (location.protocol === 'file:' || !PRODUCTION_HOSTS.includes(host)) {
      if (ga4Id) window['ga-disable-' + ga4Id] = true;
    }
  } catch (_) {
    /* never let instrumentation break the page */
  }
})();
