import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function fixture(reduced = false) {
  const handlers = new Map();
  const element = (name, hidden = false) => ({ hidden, textContent: '', style: {}, clientWidth: 700,
    addEventListener(event, handler) { handlers.set(`${name}:${event}`, handler); },
    contains(el) { return el === this; }, setAttribute() {}, remove() {},
    cloneNode() { return element('clone'); }, getBoundingClientRect() { return { height: 300 }; }, appendChild() {} });
  const stories = [element('story0'), element('story1', true), element('story2', true)];
  const box = element('box'), controls = element('controls', true), feed = element('feed');
  const prev = element('prev'), next = element('next'), play = element('play'), indicator = element('indicator');
  controls.querySelector = s => ({ '[data-feed-prev]': prev, '[data-feed-next]': next, '[data-feed-play]': play, '[data-feed-indicator]': indicator })[s];
  feed.querySelector = s => ({ '.tlc-pressfeed-stories': box, '.tlc-pressfeed-controls': controls })[s];
  feed.querySelectorAll = () => stories;
  const doc = { activeElement: null, hidden: false, querySelector: () => feed, addEventListener(e, fn) { handlers.set(`document:${e}`, fn); } };
  const motion = { matches: reduced, addEventListener(e, fn) { handlers.set(`motion:${e}`, fn); } };
  let timer;
  const context = { document: doc, matchMedia: () => motion, ResizeObserver: class { observe() {} },
    setTimeout(fn, delay) { assert.equal(delay, 8000); timer = fn; return 1; }, clearTimeout() { timer = null; } };
  vm.runInNewContext(fs.readFileSync('pressfeed.js', 'utf8'), context);
  return { stories, controls, play, indicator, doc, feed, motion,
    run: (name, value) => handlers.get(name)(value), timer: () => timer };
}
const f = fixture();
assert(!f.controls.hidden && f.timer());
f.timer()(); assert.equal(f.indicator.textContent, '2 / 3');
f.run('next:click'); assert.equal(f.indicator.textContent, '3 / 3');
f.run('next:click'); assert.equal(f.indicator.textContent, '1 / 3');
f.run('prev:click'); assert.equal(f.indicator.textContent, '3 / 3');
f.run('play:click'); assert.equal(f.play.textContent, 'Play'); assert(!f.timer());
f.run('play:click'); assert(f.timer());
f.run('feed:mouseenter'); assert(!f.timer());
f.run('feed:mouseleave'); assert(f.timer());
f.run('feed:focusin'); assert(!f.timer());
f.run('feed:focusout', { relatedTarget: null }); assert(f.timer());
f.doc.activeElement = f.stories[2];
f.run('next:click'); assert.equal(f.indicator.textContent, '3 / 3', 'Focused article must remain visible');
f.doc.activeElement = null;
f.motion.matches = true; f.run('motion:change'); assert(!f.timer());
const r = fixture(true); assert(!r.timer()); assert.equal(r.play.textContent, 'Play');
r.run('next:click'); assert.equal(r.indicator.textContent, '2 / 3');
r.run('play:click'); assert(!r.timer(), 'Reduced motion always disables automatic rotation');
console.log('Pressfeed checks passed: 8-second rotation, previous/next wrapping, pause/play, hover/focus pause, focused-story protection and reduced motion.');
