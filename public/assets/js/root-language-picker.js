(() => {
  const preferenceKey = 'tooltician-language';
  const firstVisitKey = 'tooltician-language-autoredirect';

  document.querySelectorAll('[data-language-preference]').forEach((link) => {
    link.addEventListener('click', () => {
      const preference = link.getAttribute('data-language-preference');
      if (!preference) return;

      try {
        window.localStorage.setItem(preferenceKey, preference);
        window.localStorage.setItem(firstVisitKey, '1');
      } catch {
        // Ignore storage failures and keep normal navigation.
      }
    });
  });
})();

