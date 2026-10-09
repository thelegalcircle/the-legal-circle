import fs from 'node:fs';
import assert from 'node:assert/strict';
const home=fs.readFileSync('index.html','utf8');
assert(!home.includes('noindex'));
assert(home.includes('Pressfeed') && home.includes('tlc-justice-artwork'));
assert.equal((home.match(/class="tlc-pressfeed-block"/g)||[]).length,4);
const preview=fs.readFileSync('home-test/index.html','utf8');
assert(preview.includes('content="noindex, nofollow"'));
assert(home.includes('News and insights that matter to lawyers—from legal developments and AI to marketing and practice growth.'));
assert(home.includes('data-feed-play>Pause updates'));
assert(preview.includes('http-equiv="refresh" content="0;url=/"'));
assert(!fs.readFileSync('sitemap.xml','utf8').includes('/home-test/'));
assert(fs.readFileSync('magneo-website-offer/index.html','utf8').includes('noindex, nofollow'));
const articles=JSON.parse(fs.readFileSync('news/articles.json','utf8'));
for(const block of home.matchAll(/<section class="tlc-pressfeed-block"[\s\S]*?<\/section>/g)) {
 const category=block[0].match(/data-feed-category="([^"]+)"/)[1].replace(/&amp;/g,'&');
 const expected=articles.filter(a=>a.category===category&&a.status==='published'&&Date.parse(a.published)<=Date.now()).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published)).slice(0,5).map(a=>a.slug);
 assert.deepEqual([...block[0].matchAll(/data-slug="([^"]+)"/g)].map(m=>m[1]),expected);
}
console.log('Production unchanged; Pressfeed introduction isolated to noindex preview, excluded from sitemap.');
