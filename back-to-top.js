(() => {
  if (document.querySelector('.tlc-back-to-top')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tlc-back-to-top';
  button.textContent = 'Back to top ↑';
  button.setAttribute('aria-label', 'Back to top of page');
  button.hidden = true;
  document.body.append(button);
  const update = () => {
    const consentOpen = [...document.querySelectorAll('.tlc-consent-banner,.tlc-consent-backdrop')]
      .some(el => !el.hidden && el.getClientRects().length);
    const hidden = window.scrollY < 400 || consentOpen;
    if (button.hidden !== hidden) button.hidden = hidden;
  };
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }, { passive: true });
  new MutationObserver(update).observe(document.body, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']
  });
  button.addEventListener('click', () => {
    const target = document.querySelector('header a[href], h1');
    if (target) {
      const temporaryFocus = !target.hasAttribute('tabindex') && !target.matches('a[href]');
      if (temporaryFocus) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (temporaryFocus) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  update();
})();
