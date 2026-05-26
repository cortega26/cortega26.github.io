(() => {
  const preferenceKey = 'tooltician-language';
  const firstVisitKey = 'tooltician-language-autoredirect';

  const normalizeLanguage = (value) => {
    if (typeof value !== 'string') return null;

    const lower = value.toLowerCase();
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
    return null;
  };

  try {
    const storedPreference = normalizeLanguage(window.localStorage.getItem(preferenceKey));
    const autoRedirected = window.localStorage.getItem(firstVisitKey) === '1';
    const browserPreference = [...(navigator.languages ?? []), navigator.language ?? '']
      .map(normalizeLanguage)
      .find(Boolean) ?? 'en';
    const target = storedPreference ?? (autoRedirected ? null : browserPreference);

    if (!storedPreference && !autoRedirected) {
      window.localStorage.setItem(firstVisitKey, '1');
    }

    if (target) {
      window.location.replace(`/${target}/`);
    }
  } catch {
    // Fall back to showing the language gateway.
  }
})();

