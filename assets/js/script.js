const focusableSelector = 'a[href], area[href], button, input, textarea, select, details, summary, iframe, [tabindex]:not([tabindex="-1"])';

function initSmoothScroll() {
  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  if (!internalLinks.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  internalLinks.forEach((link) => {
    const href = link.getAttribute('href');

    if (!href || href === '#' || href === '#0') {
      return;
    }

    link.addEventListener('click', (event) => {
      const targetId = href.slice(1);
      if (!targetId) {
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();

      const shouldReduceMotion = prefersReducedMotion.matches;
      target.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const isNaturallyFocusable = target.matches(focusableSelector);
      let addedTemporaryTabIndex = false;

      if (!isNaturallyFocusable) {
        target.setAttribute('tabindex', '-1');
        addedTemporaryTabIndex = true;
      }

      target.focus({ preventScroll: true });

      if (addedTemporaryTabIndex) {
        const removeTemporaryTabIndex = () => {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', removeTemporaryTabIndex);
        };

        target.addEventListener('blur', removeTemporaryTabIndex);
      }
    });
  });
}

const messagesEn = [
  "Automation roadmap in play: exploring pilots that could free 420 analyst hours—want to see the backlog?",
  "Lookup vision alert: building toward 6× faster fraud reviews once benchmarks land.",
  "Transparency first: aiming to earn trusted-partner status with fintech, cyber, and public teams.",
  "FastAPI, SQL, and storytelling—pick two and I'll scope the third.",
  "Ready to prototype together? Let's co-design the next delivery sprint."
];

const messagesEs = [
  "Hoja de ruta en marcha: explorando pilotos que podrían liberar 420 horas de analistas—¿quieres ver el backlog?",
  "Alerta de visión en consultas: construyendo hacia revisiones antifraude 6× más rápidas cuando lleguen los benchmarks.",
  "Transparencia primero: objetivo de ganar condición de socio de confianza con equipos fintech, ciber y públicos.",
  "FastAPI, SQL y storytelling: elige dos y yo planifico el tercero.",
  "¿Listo para prototipar? Diseñemos juntos el próximo sprint de entrega."
];

let clickCount = 0;
let contactStatusRegion = null;

function clearContactStatus() {
  if (!contactStatusRegion) {
    return;
  }

  contactStatusRegion.textContent = '';
  contactStatusRegion.removeAttribute('data-state');
}

function setContactStatus(message, state = 'info') {
  if (!contactStatusRegion) {
    return false;
  }

  contactStatusRegion.dataset.state = state;
  contactStatusRegion.textContent = message;
  return true;
}

function showPiMessage() {
  const langAttribute = document.documentElement.getAttribute('lang');
  const isSpanish = langAttribute && langAttribute.startsWith('es');
  const messages = isSpanish ? messagesEs : messagesEn;

  if (clickCount >= messages.length) {
    const finalMessage = isSpanish
      ? '¿Listo para conversar? Agenda una llamada de descubrimiento y avancemos.'
      : 'Ready to talk? Book a discovery call and let’s move forward.';
    alert(finalMessage);
    clickCount = 0;
    return;
  }

  alert(messages[clickCount]);
  clickCount += 1;
}

function sendEmailFallback(event) {
  const contactForm = document.getElementById('contact-form');

  if (!contactForm) {
    return;
  }

  event.preventDefault();
  clearContactStatus();

  const langAttribute = document.documentElement.getAttribute('lang');
  const isSpanish = langAttribute && langAttribute.startsWith('es');

  const name = contactForm.elements['name'].value.trim();
  const email = contactForm.elements['email'].value.trim();
  const subject = contactForm.elements['subject'].value.trim();
  const message = contactForm.elements['message'].value.trim();

  const fallbackSubject = isSpanish ? 'Consulta de portafolio' : 'Portfolio Inquiry';
  const composedSubject = subject
    ? `${subject} — ${name || fallbackSubject}`
    : `${fallbackSubject} ${isSpanish ? 'de' : 'from'} ${name || (isSpanish ? 'Visita al sitio web' : 'Website Visitor')}`;

  const bodyLines = [
    `${isSpanish ? 'Nombre' : 'Name'}: ${name || (isSpanish ? 'No proporcionado' : 'Not provided')}`,
    `${isSpanish ? 'Correo' : 'Email'}: ${email || (isSpanish ? 'No proporcionado' : 'Not provided')}`,
    '',
    message || ''
  ];

  const mailtoLink = `mailto:carlosortega77@gmail.com?subject=${encodeURIComponent(composedSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

  window.location.href = mailtoLink;

  window.setTimeout(() => {
    contactForm.reset();
  }, 300);

  const successMessage = isSpanish
    ? 'Tu mensaje está listo en tu cliente de correo. Revísalo y envíalo para completar el contacto.'
    : 'Your message draft is ready in your email client. Review and send it to complete your outreach.';

  if (!setContactStatus(successMessage, 'success')) {
    window.alert(successMessage);
  }
}

function initAccessibleSubmenus() {
  const toggles = Array.from(document.querySelectorAll('[data-submenu-toggle]'));

  if (!toggles.length) {
    return;
  }

  const submenuByToggle = new Map();

  toggles.forEach((toggle) => {
    const controlledId = toggle.getAttribute('aria-controls');
    const submenu = controlledId ? document.getElementById(controlledId) : null;
    submenuByToggle.set(toggle, submenu || null);
  });

  const setExpandedState = (toggle, expanded) => {
    const submenu = submenuByToggle.get(toggle);
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (submenu) {
      submenu.hidden = !expanded;
    }
  };

  const focusFirstItem = (submenu) => {
    if (!submenu) {
      return;
    }

    window.setTimeout(() => {
      const firstFocusable = submenu.querySelector('a, button');
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      }
    }, 64);
  };

  let activeToggle = null;
  let toggleTimer = null;
  let pendingToggle = null;
  let pendingState = null;

  const applyToggleState = (toggle, shouldOpen, options = {}) => {
    if (!toggle) {
      return;
    }

    if (shouldOpen) {
      toggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          setExpandedState(otherToggle, false);
        }
      });

      setExpandedState(toggle, true);
      activeToggle = toggle;

      if (options.focusOnOpen) {
        focusFirstItem(submenuByToggle.get(toggle));
      }

      return;
    }

    setExpandedState(toggle, false);
    if (activeToggle === toggle) {
      activeToggle = null;
    }
  };

  const scheduleToggleState = (toggle, shouldOpen, options = {}) => {
    pendingToggle = toggle;
    pendingState = shouldOpen;
    window.clearTimeout(toggleTimer);
    toggleTimer = window.setTimeout(() => {
      pendingToggle = null;
      pendingState = null;
      applyToggleState(toggle, shouldOpen, options);
    }, 170);
  };

  const buildEventPath = (event) => {
    if (typeof event.composedPath === 'function') {
      const composed = event.composedPath();
      if (Array.isArray(composed) && composed.length) {
        return composed;
      }
    }

    const fallbackPath = [];
    let node = event.target;

    while (node) {
      fallbackPath.push(node);
      node = node.parentNode;
    }

    return fallbackPath;
  };

  toggles.forEach((toggle) => {
    const submenu = submenuByToggle.get(toggle);

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        scheduleToggleState(toggle, false);
        return;
      }

      scheduleToggleState(toggle, true, { focusOnOpen: true });
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          scheduleToggleState(toggle, false);
        } else {
          scheduleToggleState(toggle, true, { focusOnOpen: true });
        }
      }

      if (event.key === 'Escape') {
        scheduleToggleState(toggle, false);
        window.setTimeout(() => {
          toggle.focus();
        }, 0);
      }
    });

    if (!submenu) {
      return;
    }

    submenu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        scheduleToggleState(toggle, false);
        window.setTimeout(() => {
          toggle.focus();
        }, 0);
      }
    });

    submenu.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        scheduleToggleState(toggle, false);
      });
    });
  });

  document.addEventListener('pointerdown', (event) => {
    const path = buildEventPath(event);

    const interactedInside = toggles.some((toggle) => {
      const submenu = submenuByToggle.get(toggle);
      return path.includes(toggle) || (submenu && path.includes(submenu));
    });

    if (interactedInside) {
      return;
    }

    if (pendingToggle && pendingState) {
      if (pendingState === true) {
        return;
      }
    }

    if (activeToggle) {
      scheduleToggleState(activeToggle, false);
    }
  });
}

function initNavbarToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');

  if (!toggle) {
    return;
  }

  const controlsId = toggle.getAttribute('aria-controls');
  const nav = controlsId ? document.getElementById(controlsId) : null;

  if (!nav) {
    return;
  }

  const desktopBreakpoint = window.matchMedia('(min-width: 992px)');

  const openNav = () => {
    nav.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeNav = () => {
    nav.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const syncWithViewport = () => {
    if (desktopBreakpoint.matches) {
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      return;
    }

    nav.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  };

  syncWithViewport();

  if (typeof desktopBreakpoint.addEventListener === 'function') {
    desktopBreakpoint.addEventListener('change', syncWithViewport);
  } else if (typeof desktopBreakpoint.addListener === 'function') {
    desktopBreakpoint.addListener(syncWithViewport);
  }

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      closeNav();
    } else {
      openNav();
    }
  });

  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
      toggle.blur();
    }
  });

  nav.addEventListener('click', (event) => {
    if (desktopBreakpoint.matches) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('.nav-link')) {
      closeNav();
    }
  });

  document.addEventListener('click', (event) => {
    if (desktopBreakpoint.matches) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!nav.contains(target) && !toggle.contains(target)) {
      closeNav();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initAccessibleSubmenus();
  initNavbarToggle();

  const contactForm = document.getElementById('contact-form');

  contactStatusRegion = document.getElementById('contact-form-status');
  clearContactStatus();

  if (contactForm) {
    contactForm.addEventListener('submit', sendEmailFallback);

    contactForm.addEventListener('input', () => {
      clearContactStatus();
    });

    contactForm.addEventListener('reset', () => {
      window.setTimeout(() => {
        clearContactStatus();
      }, 0);
    });
  }
});
