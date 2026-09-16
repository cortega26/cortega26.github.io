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
})();

