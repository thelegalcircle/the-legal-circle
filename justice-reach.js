(() => {
  const banner = document.querySelector('#join.tlc-invitation-with-art');
  if (!banner) return;
  const image = banner.querySelector('.tlc-invitation-justice');
  const target = banner.querySelector('.tlc-opportunity-target');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion, distance = 0, played = false;
  function prepare() {
    motion?.cancel();
    image.style.removeProperty('width');
    image.style.removeProperty('top');
    image.style.removeProperty('bottom');
    if (innerWidth <= 1200 || reduced.matches) return;
    const box = banner.getBoundingClientRect(), word = target.getBoundingClientRect();
    const height = (box.bottom + 2 - (word.top + word.height * .48)) / .81;
    image.style.width = `${height * 1195 / 1316}px`;
    image.style.top = 'auto';
    image.style.bottom = '-2px';
    const art = image.getBoundingClientRect();
    distance = word.right + 3 - (art.left + art.width * .024);
  }
  function play() {
    if (played || innerWidth <= 1200 || reduced.matches || !image.complete) return;
    prepare();
    played = true;
    motion = image.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(0)', offset: .12 },
      { transform: `translateX(${distance}px)`, offset: .43 },
      { transform: `translateX(${distance}px)`, offset: .53 },
      { transform: 'translateX(0)', offset: .85 },
      { transform: 'translateX(0)', offset: 1 }
    ], { duration: 7000, easing: 'ease-in-out' });
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) play();
  }, { threshold: .5 });
  observer.observe(banner);
  image.addEventListener('load', () => { prepare(); if (banner.getBoundingClientRect().top < innerHeight / 2) play(); }, { once: true });
  window.addEventListener('resize', prepare);
  reduced.addEventListener('change', prepare);
  prepare();
})();
