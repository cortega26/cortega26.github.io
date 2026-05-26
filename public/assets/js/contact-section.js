(() => {
  const copyBtn = document.querySelector('.copy-email-btn');
  const copyConfirm = document.getElementById('copy-confirm');

  copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email ?? '';
    try {
      await navigator.clipboard.writeText(email);
      copyConfirm?.classList.add('show');
      window.setTimeout(() => copyConfirm?.classList.remove('show'), 2500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('cf-submit');
  const successEl = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalLabel = submitBtn?.textContent ?? '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = submitBtn.dataset.sending ?? 'Sending...';
    }

    successEl?.classList.remove('show');
    errorEl?.classList.remove('show');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        successEl?.classList.add('show');
      } else {
        errorEl?.classList.add('show');
      }
    } catch {
      errorEl?.classList.add('show');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
})();

