(() => {
  const feed = document.querySelector('.tlc-pressfeed');
  if (!feed) return;
  const stories = [...feed.querySelectorAll('.tlc-pressfeed-story')];
  if (stories.length < 2) return;
  const box = feed.querySelector('.tlc-pressfeed-stories');
  const controls = feed.querySelector('.tlc-pressfeed-controls');
  const play = controls.querySelector('[data-feed-play]');
  const indicator = controls.querySelector('[data-feed-indicator]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, paused = motion.matches, hovered = false, focused = false, timer;
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovered && !focused && !motion.matches && !document.hidden) timer = setTimeout(() => { show(index + 1); }, 8000);
  }
  function show(next) {
    // Never hide a story containing keyboard focus.
    if (stories[index].contains(document.activeElement)) return;
    stories[index].hidden = true;
    index = (next + stories.length) % stories.length;
    stories[index].hidden = false;
    indicator.textContent = `${index + 1} / ${stories.length}`;
    schedule();
  }
  function measure() {
    const width = box.clientWidth;
    let max = 0;
    for (const story of stories) {
      const clone = story.cloneNode(true);
      clone.hidden = false;
      clone.setAttribute('aria-hidden', 'true');
      clone.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${width}px;`;
      box.appendChild(clone);
      max = Math.max(max, clone.getBoundingClientRect().height);
      clone.remove();
    }
    box.style.minHeight = `${Math.ceil(max)}px`;
  }
  controls.hidden = false;
  play.textContent = paused ? 'Play' : 'Pause';
  controls.querySelector('[data-feed-prev]').addEventListener('click', () => show(index - 1));
  controls.querySelector('[data-feed-next]').addEventListener('click', () => show(index + 1));
  play.addEventListener('click', () => {
    paused = !paused;
    play.textContent = paused ? 'Play' : 'Pause';
    schedule();
  });
  feed.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  feed.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  feed.addEventListener('focusin', () => { focused = true; schedule(); });
  feed.addEventListener('focusout', event => { focused = feed.contains(event.relatedTarget); schedule(); });
  motion.addEventListener('change', () => { if (motion.matches) { paused = true; play.textContent = 'Play'; } schedule(); });
  document.addEventListener('visibilitychange', schedule);
  let width = 0;
  new ResizeObserver(() => { if (box.clientWidth !== width) { width = box.clientWidth; measure(); } }).observe(box);
  document.fonts?.ready.then(measure);
  measure(); schedule();
})();
