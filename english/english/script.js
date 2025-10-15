const messagesEn = [
  "Analytics should feel calm and reliable—curious how I returned 420 hours to analysts?",
  "Bilingual partner here. Need a guide through compliance, fraud, or growth dashboards?",
  "FastAPI, SQL, and storytelling—pick two and I'll add the third.",
  "Serious about automation readiness? Let's co-design your next delivery playbook.",
  "Looking for algorithmic proof? My math lab is just a few scrolls away."
];

const messagesEs = [
  "La analítica debe sentirse segura y predecible—¿quieres saber cómo devolví 420 horas a los analistas?",
  "Compañero bilingüe disponible. ¿Necesitas guía en cumplimiento, fraude o dashboards de crecimiento?",
  "FastAPI, SQL y storytelling: elige dos y yo sumo el tercero.",
  "¿Listo para automatizar con solidez? Diseñemos juntos tu próximo playbook de entrega.",
  "¿Buscas evidencia algorítmica? Mi laboratorio matemático está unas secciones más abajo."
];

let clickCount = 0;
let contactToastController = null;

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

  const toastMessage = isSpanish
    ? 'Tu mensaje está listo en tu cliente de correo. Revísalo y envíalo para completar el contacto.'
    : 'Your message draft is ready in your email client. Review and send it to complete your outreach.';

  if (contactToastController && typeof contactToastController.show === 'function') {
    contactToastController.show(toastMessage);
  } else {
    alert(toastMessage);
  }
}

function initContactToast() {
  const toast = document.getElementById('contact-toast');

  if (!toast) {
    return null;
  }

  const messageEl = toast.querySelector('#contact-toast-message');
  const dismissButton = toast.querySelector('[data-toast-dismiss]');
  let hideTimer = null;

  const hideToast = () => {
    window.clearTimeout(hideTimer);

    if (!toast.classList.contains('is-visible')) {
      toast.setAttribute('hidden', '');
      return;
    }

    toast.classList.remove('is-visible');
  };

  const showToast = (text) => {
    if (messageEl) {
      messageEl.textContent = text;
    }

    if (toast.hasAttribute('hidden')) {
      toast.removeAttribute('hidden');
    }

    window.clearTimeout(hideTimer);

    window.requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    hideTimer = window.setTimeout(() => {
      hideToast();
    }, 8000);
  };

  if (dismissButton) {
    dismissButton.addEventListener('click', () => {
      hideToast();
    });
  }

  toast.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'opacity') {
      return;
    }

    if (!toast.classList.contains('is-visible')) {
      toast.setAttribute('hidden', '');
    }
  });

  toast.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideToast();
    }
  });

  return {
    show: showToast,
    hide: hideToast
  };
}

function initSmoothScroll(onNavigate = () => {}) {
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  if (!anchorLinks.length) {
    return;
  }

  const focusTarget = (element) => {
    if (!element) {
      return;
    }

    const hadTabIndex = element.hasAttribute('tabindex');
    const previousTabIndex = element.getAttribute('tabindex');

    if (!hadTabIndex) {
      element.setAttribute('tabindex', '-1');
    }

    element.focus({ preventScroll: true });

    if (!hadTabIndex) {
      element.removeAttribute('tabindex');
    } else if (previousTabIndex !== null) {
      element.setAttribute('tabindex', previousTabIndex);
    }
  };

  anchorLinks.forEach((link) => {
    const href = link.getAttribute('href');

    if (!href || href === '#') {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    link.addEventListener('click', (event) => {
      if (link.hasAttribute('data-submenu-toggle')) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onNavigate();

      window.setTimeout(() => {
        focusTarget(target);
      }, 420);

      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', href);
      }
    });
  });
}

function initNavbarCollapse() {
  const toggleButton = document.querySelector('[data-nav-toggle]');
  const collapseTarget = document.querySelector('[data-nav-collapse]');

  if (!toggleButton || !collapseTarget) {
    return () => {};
  }

  const desktopMedia = window.matchMedia('(min-width: 992px)');
  let expanded = false;

  const dispatchState = () => {
    const eventName = expanded ? 'nav:expanded' : 'nav:collapsed';
    document.dispatchEvent(new CustomEvent(eventName));
  };

  const syncState = () => {
    if (desktopMedia.matches) {
      collapseTarget.classList.remove('is-open');
      collapseTarget.removeAttribute('aria-hidden');
      toggleButton.setAttribute('aria-expanded', 'false');
      return;
    }

    collapseTarget.classList.toggle('is-open', expanded);
    collapseTarget.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  const closeMenu = () => {
    const wasExpanded = expanded;
    expanded = false;
    syncState();

    if (wasExpanded) {
      dispatchState();
    }
  };

  const openMenu = () => {
    if (desktopMedia.matches) {
      return;
    }

    if (!expanded) {
      expanded = true;
      syncState();
      dispatchState();
    }
  };

  toggleButton.addEventListener('click', (event) => {
    event.preventDefault();

    if (desktopMedia.matches) {
      return;
    }

    if (expanded) {
      closeMenu();
      return;
    }

    openMenu();
  });

  collapseTarget.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      window.setTimeout(() => {
        toggleButton.focus({ preventScroll: true });
      }, 0);
    }
  });

  collapseTarget.querySelectorAll('a, button').forEach((interactive) => {
    interactive.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!expanded || desktopMedia.matches) {
      return;
    }

    if (!(event.target instanceof Node)) {
      return;
    }

    const clickedInside = collapseTarget.contains(event.target) || toggleButton.contains(event.target);

    if (!clickedInside) {
      closeMenu();
    }
  });

  const handleViewportChange = () => {
    closeMenu();
    syncState();
  };

  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', handleViewportChange);
  } else if (typeof desktopMedia.addListener === 'function') {
    desktopMedia.addListener(handleViewportChange);
  }

  syncState();

  return closeMenu;
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

  document.addEventListener('nav:collapsed', () => {
    window.clearTimeout(toggleTimer);
    pendingToggle = null;
    pendingState = null;
    toggles.forEach((toggle) => setExpandedState(toggle, false));
    activeToggle = null;
  });
}

function initSiteInteractions() {
  const closeNav = initNavbarCollapse();
  initSmoothScroll(closeNav);

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', sendEmailFallback);
  }

  contactToastController = initContactToast();

  initAccessibleSubmenus();
}

document.addEventListener('DOMContentLoaded', initSiteInteractions);
