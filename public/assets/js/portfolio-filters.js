(() => {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  const setFilter = (filter) => {
    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      const categories = (card.dataset.categories ?? '').split(' ').filter(Boolean);
      const match = filter === 'all' || categories.includes(filter);
      card.hidden = !match;
      card.setAttribute('aria-hidden', String(!match));
      if (match) card.classList.add('visible');
    });

    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused.hidden) {
      const firstLink = document.querySelector('.project-card:not([hidden]) .project-link');
      firstLink?.focus();
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.filter ?? 'all');
    });
  });
})();

