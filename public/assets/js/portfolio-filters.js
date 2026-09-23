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

    // A thematic group whose cards are all filtered out disappears with them
    // (Plan 030) — no empty headings left behind.
    document.querySelectorAll('.work-group').forEach((group) => {
      const anyVisible = group.querySelector('.project-card:not([hidden])') !== null;
      group.hidden = !anyVisible;
      group.setAttribute('aria-hidden', String(!anyVisible));
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

