(() => {
  const slider = document.querySelector('.tlc-event-slider');
  if (!slider) return;
  const track = slider.querySelector('.tlc-event-photo-gallery');
  const slides = Array.from(track.children);
  const controls = slider.querySelector('.tlc-event-slider-controls');
  const status = controls.querySelector('.tlc-event-slider-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  controls.hidden = false;
  function go(direction) {
    index = (index + direction + slides.length) % slides.length;
    track.scrollTo({left: index * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  controls.querySelector('[data-slide="previous"]').addEventListener('click', () => go(-1));
  controls.querySelector('[data-slide="next"]').addEventListener('click', () => go(1));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', () => {
    index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    status.textContent = `${index + 1} / ${slides.length}`;
  }, {passive: true});
  new ResizeObserver(() => track.scrollTo({left: index * track.clientWidth, behavior: 'instant'})).observe(track);
})();
