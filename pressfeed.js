(() => {
  const feed = document.querySelector('.tlc-pressfeed');
  if (!feed) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const play = feed.querySelector('[data-feed-play]');
  const updateControl = feed.querySelector('.tlc-feed-update-control');
  const status = feed.querySelector('[data-feed-status]');
  let paused = motion.matches, hovered = false, focused = false;
  const blocks = [...feed.querySelectorAll('.tlc-pressfeed-block')].map(block => {
    const stories = [...block.querySelectorAll('.tlc-pressfeed-story')];
    const box = block.querySelector('.tlc-pressfeed-stories');
    const controls = block.querySelector('.tlc-pressfeed-controls');
    const state = { index: 0, timer: null, stories, box, controls };
    function show(next) {
      if (stories[state.index]?.contains(document.activeElement)) return;
      stories[state.index].hidden = true;
      state.index = (next + stories.length) % stories.length;
      const current = stories[state.index];
      current.hidden = false;
      if (!motion.matches && current.animate) current.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
      controls.querySelector('[data-feed-indicator]').textContent = `${state.index + 1} / ${stories.length}`;
      scheduleBlock(state);
    }
    function measure() {
      let max = 0;
      for (const story of stories) {
        const clone = story.cloneNode(true);
        clone.hidden = false;
        clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('inert', '');
        clone.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${box.clientWidth}px;`;
        box.appendChild(clone);
        max = Math.max(max, clone.getBoundingClientRect().height);
        clone.remove();
      }
      box.style.minHeight = `${Math.ceil(max)}px`;
    }
    if (stories.length > 1 && controls) {
      controls.hidden = false;
      controls.querySelector('[data-feed-prev]').addEventListener('click', () => show(state.index - 1));
      controls.querySelector('[data-feed-next]').addEventListener('click', () => show(state.index + 1));
      state.show = show;
      let width = 0;
      if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (box.clientWidth !== width) { width = box.clientWidth; measure(); } }).observe(box);
      else window.addEventListener('resize', measure);
      document.fonts?.ready.then(measure);
      measure();
    }
    return state;
  });
  function schedule() {
    for (const block of blocks) scheduleBlock(block);
  }
  function scheduleBlock(block) {
    clearTimeout(block.timer);
    if (block.show && !paused && !hovered && !focused && !motion.matches && !document.hidden) block.timer = setTimeout(() => block.show(block.index + 1), 10000);
  }
  function updateButton() {
    play.textContent = paused ? 'Resume updates' : 'Pause updates';
    play.setAttribute('aria-pressed', String(paused));
    play.disabled = motion.matches;
    status.textContent = motion.matches ? 'Autoplay off: reduced motion.' : '';
  }
  if (blocks.some(b => b.show)) updateControl.hidden = false;
  play.addEventListener('click', () => { paused = !paused; updateButton(); schedule(); });
  feed.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  feed.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  feed.addEventListener('focusin', () => { focused = true; schedule(); });
  feed.addEventListener('focusout', event => { focused = feed.contains(event.relatedTarget); schedule(); });
  motion.addEventListener('change', () => { if (motion.matches) paused = true; updateButton(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  updateButton(); schedule();
})();
