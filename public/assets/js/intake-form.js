/**
 * Handles every IntakeForm instance on the page: async Formspree submit,
 * scoped success/error states, and conversion events (form_start /
 * form_submit_success / form_submit_error) via window.ttTrack when present.
 *
 * Sprint 0 (canonical lead funnel): mirrors the same lifecycle as
 * brief_start / brief_submit / brief_success / brief_error — plus
 * service_engage when the form lives in a real service scope — via
 * window.ttAnalytics when present. Legacy event names are unchanged.
 * Only coarse, content-free params are ever emitted — form field values,
 * messages, and raw responses are never read for analytics.
 */
(() => {
  /** @type {Window & typeof globalThis & {ttTrack?: (name: string, props?: Record<string, unknown>) => void, ttAnalytics?: {briefStart?: (id?: string) => unknown, briefSubmit?: (id?: string) => unknown, briefSuccess?: (id?: string) => unknown, briefError?: (id?: string, err?: unknown) => unknown, serviceEngage?: (id?: string) => unknown, resolveServiceId?: (id: string) => (string|undefined), serviceIdForElement?: (el?: Element | null) => (string|undefined)}}} */
  const typedWindow = window;

  /** @param {string} name @param {Record<string, unknown>} [props] */
  const track = (name, props) => {
    if (typeof typedWindow.ttTrack === 'function') typedWindow.ttTrack(name, props);
  };

  /**
   * Map data-track-form="intake_<service>" to a service_id, or undefined for
   * the generic site form. Generic surfaces never fake a service context.
   */
  const serviceIdForForm = (ctx, form) => {
    try {
      const analytics = typedWindow.ttAnalytics;
      if (analytics && typeof analytics.serviceIdForElement === 'function') {
        const scoped = analytics.serviceIdForElement(form);
        if (scoped) return scoped;
      }
      const suffix = String(ctx || '').replace(/^intake_/, '');
      if (analytics && typeof analytics.resolveServiceId === 'function') {
        return analytics.resolveServiceId(suffix);
      }
    } catch (_) {
      /* ignore */
    }
    return undefined;
  };

  /** @param {'briefStart'|'briefSubmit'|'briefSuccess'|'briefError'|'serviceEngage'} stage */
  const funnel = (stage, serviceId, detail) => {
    try {
      const analytics = typedWindow.ttAnalytics;
      if (!analytics || typeof analytics[stage] !== 'function') return;
      if (stage === 'briefError') analytics.briefError(serviceId, detail);
      else analytics[stage](serviceId);
    } catch (_) {
      /* never let instrumentation break the form */
    }
  };

  /**
   * Show a submit-result banner and bring it into view. On short/mobile
   * viewports the banner sits right after the submit button and can render
   * below the visible viewport with no scroll or focus change (confirmed via
   * live production inspection at 375x812) — every prior automated check ran
   * at desktop height, where the banner was already in view, so this went
   * unnoticed. `aria-live` already announces it to screen readers; this adds
   * the matching visual/keyboard signal for sighted users on a small screen.
   */
  const revealFeedback = (el) => {
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.focus({ preventScroll: true });
    } catch (_) {
      /* never let instrumentation/UX polish break the form */
    }
  };

  document.querySelectorAll('form.intake-form').forEach((form) => {
    const ctx = form.getAttribute('data-track-form') || 'intake';
    const submitBtn = form.querySelector('button[type="submit"]');
    const successEl = form.querySelector('.intake-form__success');
    const errorEl = form.querySelector('.intake-form__error');
    const pageField = form.querySelector('[data-fill="page"]');
    if (pageField) pageField.value = window.location.pathname;

    // Fire form_start once per form on first meaningful interaction.
    let started = false;
    form.addEventListener(
      'input',
      () => {
        if (started) return;
        started = true;
        const serviceId = serviceIdForForm(ctx, form);
        track('form_start', { location: ctx });
        funnel('briefStart', serviceId);
        // First input into a service-scoped brief also signals service interest.
        if (serviceId) funnel('serviceEngage', serviceId);
      },
      { once: false }
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        funnel('briefError', serviceIdForForm(ctx, form), 'validation');
        form.reportValidity();
        return;
      }
      funnel('briefSubmit', serviceIdForForm(ctx, form));

      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = submitBtn.dataset.sending || 'Sending…';
      }
      successEl && successEl.classList.remove('show');
      errorEl && errorEl.classList.remove('show');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          form.reset();
          successEl && successEl.classList.add('show');
          revealFeedback(successEl);
          track('form_submit_success', { location: ctx });
          funnel('briefSuccess', serviceIdForForm(ctx, form));
        } else {
          errorEl && errorEl.classList.add('show');
          revealFeedback(errorEl);
          track('form_submit_error', { location: ctx, status: response.status });
          funnel('briefError', serviceIdForForm(ctx, form), response.status);
        }
      } catch (_) {
        errorEl && errorEl.classList.add('show');
        revealFeedback(errorEl);
        track('form_submit_error', { location: ctx, status: 'network' });
        funnel('briefError', serviceIdForForm(ctx, form), 'network');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  });
})();
