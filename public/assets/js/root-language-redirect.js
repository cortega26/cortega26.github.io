/**
 * Root landing behavior (Plan 031): the root is a real bilingual x-default
 * landing, so only returning visitors who already chose a language are
 * forwarded. First-time visitors stay on the landing and choose explicitly —
 * the old browser-language auto-redirect is gone by design.
 */
(() => {
  const preferenceKey = 'tooltician-language';

  const normalizeLanguage = (value) => {
    if (typeof value !== 'string') return null;

    const lower = value.toLowerCase();
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
    return null;
  };

  try {
    const storedPreference = normalizeLanguage(window.localStorage.getItem(preferenceKey));
    if (storedPreference) {
      window.location.replace(`/${storedPreference}/`);
    }
  } catch {
    // Storage blocked — keep the landing usable.
  }
})();
