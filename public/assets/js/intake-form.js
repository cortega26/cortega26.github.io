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

    // Progressive enhancement (Plan 028): without JS the form keeps native
    // validation; with JS we own an accessible per-field error layer.
    form.setAttribute('novalidate', '');

    const controls = Array.from(form.querySelectorAll('input, select, textarea'));
    const summary = form.querySelector('.intake-form__summary');
    const summaryText = form.querySelector('[data-summary-text]');

    /** Message for an invalid control, chosen from its validity state. */
    const errorFor = (control) => {
      if (control.validity.valueMissing) return control.dataset.errorRequired || '';
      if (control.validity.typeMismatch) return control.dataset.errorType || '';
      return '';
    };

    const setFieldError = (control, message) => {
      const errorEl = control.id ? document.getElementById(`${control.id}-error`) : null;
      if (!errorEl) return;
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', errorEl.id);
      } else {
        errorEl.hidden = true;
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
    };

    const labelFor = (control) => {
      const label = control.id ? form.querySelector(`label[for="${control.id}"]`) : null;
      return label ? (label.textContent || '').trim() : control.name;
    };

    /** Validate every control, render errors + summary, focus the first invalid. */
    const validateForm = () => {
      const invalid = [];
      controls.forEach((control) => {
        if (control.checkValidity()) {
          setFieldError(control, '');
        } else {
          invalid.push(control);
          setFieldError(control, errorFor(control));
        }
      });
      if (invalid.length > 0) {
        if (summary && summaryText) {
          const template = summary.getAttribute('data-summary-template') || '{fields}';
          summaryText.textContent = template.replace('{fields}', invalid.map(labelFor).join(', '));
          summary.hidden = false;
        }
        invalid[0].focus();
      } else if (summary) {
        summary.hidden = true;
      }
      return invalid;
    };

    /** Clear a field's error as soon as it becomes valid; hide a stale summary. */
    const onFieldSettled = (event) => {
      const target = event.target;
      if (!controls.includes(target)) return;
      if (target.checkValidity()) setFieldError(target, '');
      if (summary && controls.every((control) => control.checkValidity())) summary.hidden = true;
    };
    form.addEventListener('input', onFieldSettled);
    form.addEventListener('change', onFieldSettled);

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
      const invalidControls = validateForm();
      if (invalidControls.length > 0) {
        funnel('briefError', serviceIdForForm(ctx, form), 'validation');
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
          controls.forEach((control) => setFieldError(control, ''));
          if (summary) summary.hidden = true;
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
