(() => {
  const banner = document.querySelector('#join.tlc-invitation-with-art');
  if (!banner) return;
  const image = banner.querySelector('.tlc-invitation-justice');
  const target = banner.querySelector('.tlc-opportunity-target');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion, distance = 0;
  function prepare() {
    motion?.cancel();
    image.style.removeProperty('width');
    image.style.removeProperty('top');
    image.style.removeProperty('bottom');
    if (innerWidth <= 1200) return;
    const box = banner.getBoundingClientRect(), word = target.getBoundingClientRect();
    const targetY = word.top + word.height * .48;
    const height = Math.max(550 * 1316 / 1195, (box.bottom + 12 - targetY) / .81);
    image.style.width = `${height * 1195 / 1316}px`;
    image.style.top = `${targetY - box.top - height * .19}px`;
    image.style.bottom = 'auto';
    const art = image.getBoundingClientRect();
    distance = word.right + 3 - (art.left + art.width * .024);
  }
  function play() {
    if (motion?.playState === 'running' || innerWidth <= 1200 || reduced.matches || !image.complete) return;
    prepare();
    motion = image.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: `translateX(${distance}px)`, offset: .43 },
      { transform: `translateX(${distance}px)`, offset: .53 },
      { transform: 'translateX(0)', offset: .85 },
      { transform: 'translateX(0)', offset: 1 }
    ], { duration: 4800, easing: 'cubic-bezier(.25,.1,.25,1)' });
  }
  banner.addEventListener('pointerenter', play);
  banner.addEventListener('focusin', play);
  image.addEventListener('load', () => { prepare(); if (banner.matches(':hover')) play(); }, { once: true });
  window.addEventListener('resize', prepare);
  reduced.addEventListener('change', prepare);
  prepare();
})();
