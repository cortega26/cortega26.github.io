/**
 * Handles every IntakeForm instance on the page: async Formspree submit,
 * scoped success/error states, and conversion events (form_start /
 * form_submit_success / form_submit_error) via window.ttTrack when present.
 */
(() => {
  const track = (name, props) => {
    if (typeof window.ttTrack === 'function') window.ttTrack(name, props);
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
        track('form_start', { location: ctx });
      },
      { once: false }
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

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
          track('form_submit_success', { location: ctx });
        } else {
          errorEl && errorEl.classList.add('show');
          track('form_submit_error', { location: ctx, status: response.status });
        }
      } catch (_) {
        errorEl && errorEl.classList.add('show');
        track('form_submit_error', { location: ctx, status: 'network' });
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  });
})();
