(() => {
  const preferenceKey = 'tooltician-language';

  document.querySelectorAll('[data-language-preference]').forEach((link) => {
    link.addEventListener('click', () => {
      const preference = link.getAttribute('data-language-preference');
      if (!preference) return;

      try {
        window.localStorage.setItem(preferenceKey, preference);
      } catch {
        // Ignore storage failures and keep normal navigation.
      }
    });
  });
})();

