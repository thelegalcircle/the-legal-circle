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
    const headY = banner.querySelector('.tlc-eyebrow').getBoundingClientRect().top;
    const height = Math.max(550 * 1316 / 1195, box.bottom + 12 - headY);
    image.style.width = `${height * 1195 / 1316}px`;
    image.style.top = `${headY - box.top}px`;
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
    ], { duration: 3000, iterations: Infinity, easing: 'cubic-bezier(.25,.1,.25,1)' });
  }
  banner.addEventListener('pointerenter', play);
  banner.addEventListener('focusin', play);
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      if (motion?.playState === 'paused' && !reduced.matches) motion.play();
      else play();
    } else motion?.pause();
  }, { threshold: .1 });
  observer.observe(banner);
  image.addEventListener('load', () => { prepare(); if (banner.matches(':hover')) play(); }, { once: true });
  window.addEventListener('resize', () => { prepare(); if (banner.getBoundingClientRect().top < innerHeight && banner.getBoundingClientRect().bottom > 0) play(); });
  reduced.addEventListener('change', () => { prepare(); if (!reduced.matches) play(); });
  prepare();
})();
