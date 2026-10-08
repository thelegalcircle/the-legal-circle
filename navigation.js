(() => {
  document.querySelectorAll('.tlc-news-dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('button');
    const menu = dropdown.querySelector('.tlc-news-menu');
    const label = dropdown.classList.contains('tlc-interviews-dropdown') ? 'Interviews options' : 'News categories';
    const setOpen = open => {
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${label}`);
    };
    button.addEventListener('click', () => setOpen(menu.hidden));
    dropdown.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(min-width: 1001px) and (hover: hover)').matches) setOpen(true);
    });
    dropdown.addEventListener('pointerleave', () => {
      if (!dropdown.contains(document.activeElement)) setOpen(false);
    });
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) setOpen(false);
    });
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); button.focus(); }
      if (event.key === 'ArrowDown' && event.target === button) {
        event.preventDefault(); setOpen(true); menu.querySelector('a')?.focus();
      }
    });
    document.addEventListener('click', event => { if (!dropdown.contains(event.target)) setOpen(false); });
  });
})();
