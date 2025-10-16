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
  "You found the Praetorians' π—Angela Bennett would be proud of that trace route.",
  "No floppy disk here: I surface the secure backlog once we scope the engagement.",
  "Ask about the zero-trust automation playbook that keeps regulated teams hardened.",
  "Curious how the incident drills run now that Gatekeeper is retired? I'll walk you through it.",
  "Ready to exit teaser mode? Let's pair the roadmap with outcomes and metrics."
];

const messagesEs = [
  "Encontraste el π de los Praetorians—Angela Bennett aprobaría esa ruta de rastreo.",
  "Sin disquete: comparto el backlog seguro cuando definamos el alcance juntos.",
  "Pregunta por el playbook de automatización zero-trust que protege a equipos regulados.",
  "¿Quieres saber cómo corren los simulacros ahora que Gatekeeper quedó atrás? Te lo explico.",
  "¿Listo para salir del modo teaser? Conectemos la hoja de ruta con métricas reales."
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
      ? 'Sal del laberinto digital y agenda una llamada de descubrimiento para coordinar el traspaso.'
      : 'Jack out of the Net and book a discovery call so we can plan the handoff.';
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
