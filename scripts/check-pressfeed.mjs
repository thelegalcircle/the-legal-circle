import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function fixture(reduced = false) {
  const handlers = new Map(), timers = new Map(); let timerId = 0;
  const element = (name, hidden = false) => ({ hidden, textContent: '', style: {}, clientWidth: 500,
    addEventListener(e, fn) { handlers.set(`${name}:${e}`, fn); }, contains(el) { return el === this; }, setAttribute() {}, remove() {},
    cloneNode() { return element('clone'); }, getBoundingClientRect() { return { height: 300 }; }, appendChild() {} });
  const feed = element('feed'), play = element('play'), update = element('update',true), status = element('status');
  const groups = [3,2,1,3].map((count,n) => {
    const stories = Array.from({length:count},(_,i)=>element(`story${n}-${i}`,i>0));
    const block = element(`block${n}`), box = element(`box${n}`), controls = count>1 ? element(`controls${n}`,true) : null;
    const prev=element(`prev${n}`), next=element(`next${n}`), indicator=element(`indicator${n}`);
    if(controls) controls.querySelector=s=>({'[data-feed-prev]':prev,'[data-feed-next]':next,'[data-feed-indicator]':indicator})[s];
    block.querySelectorAll=()=>stories;
    block.querySelector=s=>({'.tlc-pressfeed-stories':box,'.tlc-pressfeed-controls':controls})[s];
    return {block,stories,controls,indicator};
  });
  feed.querySelectorAll=()=>groups.map(g=>g.block);
  feed.querySelector=s=>({'[data-feed-play]':play,'.tlc-feed-update-control':update,'[data-feed-status]':status})[s];
  const doc={activeElement:null,hidden:false,querySelector:()=>feed,addEventListener(e,fn){handlers.set(`document:${e}`,fn);}};
  const motion={matches:reduced,addEventListener(e,fn){handlers.set(`motion:${e}`,fn);}};
  vm.runInNewContext(fs.readFileSync('pressfeed.js','utf8'),{document:doc,matchMedia:()=>motion,ResizeObserver:class{observe(){}},
    setTimeout(fn,delay){assert.equal(delay,10000);timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);}});
  return {groups,play,update,status,doc,motion,timers,run:(name,value)=>handlers.get(name)(value),tick(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}
const f=fixture();
assert(!f.update.hidden && f.timers.size===3);
assert.equal(f.groups[2].controls,null);
f.tick(); assert.equal(f.groups[0].indicator.textContent,'2 / 3');assert.equal(f.groups[1].indicator.textContent,'2 / 2');assert.equal(f.groups[3].indicator.textContent,'2 / 3');
f.run('next0:click');assert.equal(f.groups[0].indicator.textContent,'3 / 3');
f.run('next0:click');assert.equal(f.groups[0].indicator.textContent,'1 / 3');
f.run('prev0:click');assert.equal(f.groups[0].indicator.textContent,'3 / 3');
f.run('play:click');assert.equal(f.play.textContent,'Resume updates');assert.equal(f.timers.size,0);
f.run('play:click');assert.equal(f.play.textContent,'Pause updates');assert.equal(f.timers.size,3);
f.run('feed:mouseenter');assert.equal(f.timers.size,0);
f.run('feed:mouseleave');assert.equal(f.timers.size,3);
f.run('feed:focusin');assert.equal(f.timers.size,0);
f.run('feed:focusout',{relatedTarget:null});assert.equal(f.timers.size,3);
f.doc.activeElement=f.groups[0].stories[2]; f.run('next0:click');assert.equal(f.groups[0].indicator.textContent,'3 / 3');
f.doc.activeElement=null;f.motion.matches=true;f.run('motion:change');assert.equal(f.timers.size,0);assert(f.play.disabled);
const r=fixture(true);assert.equal(r.timers.size,0);assert(r.play.disabled);r.run('next1:click');assert.equal(r.groups[1].indicator.textContent,'2 / 2');
console.log('Four-category Pressfeed tests passed: independent 10-second timers, single-article fallback, wrapping controls, global pause/resume, hover/focus pause, focused-story protection and reduced motion.');
