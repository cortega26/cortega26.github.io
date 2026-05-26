(() => {
  const languagePreferenceKey = 'tooltician-language';
  const firstVisitRedirectKey = 'tooltician-language-autoredirect';

  document.querySelectorAll('[data-language-preference]').forEach((link) => {
    link.addEventListener('click', () => {
      const preference = link.getAttribute('data-language-preference');
      if (!preference) return;

      try {
        window.localStorage.setItem(languagePreferenceKey, preference);
        window.localStorage.setItem(firstVisitRedirectKey, '1');
      } catch {
        // Ignore storage failures and keep normal navigation.
      }
    });
  });

  const bar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const navbar = document.querySelector('.navbar');

  const onScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;

    if (backToTop) {
      const show = window.scrollY > 400;
      backToTop.classList.toggle('visible', show);
      if (show) backToTop.removeAttribute('tabindex');
      else backToTop.setAttribute('tabindex', '-1');
    }

    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const toggle = document.querySelector('.navbar__toggle');
  const links = document.querySelector('.navbar__links');
  const overlay = document.querySelector('[data-nav-close]');
  const mobileNav = window.matchMedia('(max-width: 768px)');
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  let returnFocus = null;

  const navFocusables = () => {
    if (!links) return [];
    return Array.from(links.querySelectorAll(focusableSelector)).filter(
      (element) => !element.hasAttribute('disabled'),
    );
  };

  const setNavOpen = (open) => {
    if (!toggle || !links || !overlay) return;

    const isOpen = open && mobileNav.matches;
    toggle.classList.toggle('open', isOpen);
    links.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('nav-open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);

    if (isOpen) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
      window.requestAnimationFrame(() => navFocusables()[0]?.focus());
    } else if (returnFocus) {
      const nextFocus = returnFocus;
      returnFocus = null;
      window.requestAnimationFrame(() => nextFocus.focus());
    }
  };

  const closeNav = () => {
    setNavOpen(false);
  };

  const trapNavFocus = (event) => {
    if (!mobileNav.matches || !links?.classList.contains('open') || event.key !== 'Tab') return;

    const focusables = navFocusables();
    if (focusables.length === 0) return;

    const first = focusables.at(0);
    const last = focusables.at(-1);
    if (!first || !last) return;

    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  toggle?.addEventListener('click', () => {
    const open = !links?.classList.contains('open');
    setNavOpen(open);
  });

  overlay?.addEventListener('click', closeNav);
  links?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && links?.classList.contains('open')) {
      closeNav();
      return;
    }

    trapNavFocus(event);
  });

  mobileNav.addEventListener('change', (event) => {
    if (!event.matches) {
      setNavOpen(false);
    }
  });

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach((element) => observer.observe(element));
})();

