/**
 * Contact section helpers: copy-email button with clipboard fallback.
 * Sprint 0: a successful copy is an email_copy lead signal (canonical).
 * The email address itself is never sent to analytics.
 */
(() => {
  /** @type {Window & typeof globalThis & {ttTrack?: (name: string, props?: Record<string, unknown>) => void, ttAnalytics?: {emailCopy?: (id?: string) => unknown, serviceIdForElement?: (el?: Element | null) => (string|undefined)}}} */
  const typedWindow = window;
  const copyBtn = document.querySelector('.copy-email-btn');
  const copyConfirm = document.getElementById('copy-confirm');

  const trackCopy = () => {
    try {
      const analytics = typedWindow.ttAnalytics;
      if (analytics && typeof analytics.emailCopy === 'function') {
        const serviceId =
          typeof analytics.serviceIdForElement === 'function'
            ? analytics.serviceIdForElement(copyBtn)
            : undefined;
        analytics.emailCopy(serviceId);
      } else if (typeof typedWindow.ttTrack === 'function') {
        // Pre-canonical fallback: generic legacy event, no service invented.
        typedWindow.ttTrack('email_copy', {});
      }
    } catch {
      /* never let instrumentation break the page */
    }
  };

  copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email ?? '';
    try {
      await navigator.clipboard.writeText(email);
      copyConfirm?.classList.add('show');
      window.setTimeout(() => copyConfirm?.classList.remove('show'), 2500);
      trackCopy();
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
})();
