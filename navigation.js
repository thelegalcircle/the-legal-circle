(() => {
  document.querySelectorAll('.tlc-news-dropdown').forEach(dropdown => {
    const marketing = dropdown.classList.contains('tlc-marketing-dropdown');
    const button = dropdown.querySelector('button') || dropdown.querySelector('a');
    const menu = dropdown.querySelector('.tlc-news-menu');
    const label = marketing ? 'Marketing & PR options' : dropdown.classList.contains('tlc-interviews-dropdown') ? 'Interviews options' : 'News categories';
    let touchOpened = false;
    const setOpen = open => {
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (!marketing) button.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${label}`);
      if (!open) touchOpened = false;
    };
    button.addEventListener('click', event => {
      if (!marketing) { setOpen(menu.hidden); return; }
      if (matchMedia('(hover: none)').matches && !touchOpened) {
        event.preventDefault(); touchOpened = true; setOpen(true);
      }
    });
    if (marketing) dropdown.addEventListener('focusin', () => setOpen(true));
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
      if (event.key === 'Escape') { event.preventDefault(); button.focus(); setOpen(false); }
      if (event.key === 'ArrowDown' && event.target === button) {
        event.preventDefault(); setOpen(true); menu.querySelector('a')?.focus();
      }
    });
    document.addEventListener('click', event => { if (!dropdown.contains(event.target)) setOpen(false); });
  });
})();
