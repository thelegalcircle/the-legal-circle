import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildTestHome } from './build-test-home.mjs';
const home = fs.readFileSync('index.html', 'utf8');
const test = fs.readFileSync('home-test/index.html', 'utf8');
const articles = JSON.parse(fs.readFileSync('news/articles.json', 'utf8'));
assert(test.includes('<meta name="robots" content="noindex, nofollow">'));
assert(!home.includes('noindex'));
assert(!home.includes('Pressfeed'));
assert(!home.includes('tlc-scales'));
assert(test.includes('class="tlc-scales"'));
assert(test.includes('class="tlc-scales-pan tlc-scales-pan-left"'));
assert(home.includes('Latest from The Legal Circle'));
assert(!test.includes('Latest from The Legal Circle'));
assert(!/\b(?:href|src)="assets\//.test(test));
assert(test.includes('Interviews coming soon'));
assert(test.includes('Exact date and venue to be announced'));
assert(test.includes('Promotional offer · Magneo'));
assert(!test.includes('Opens magneo.ca, a separate website.'));
assert.equal((test.match(/href="\/magneo-website-offer\/"/g)||[]).length,3);
assert(test.includes('CAD $1,800 total'));
assert(test.includes('Three spots · October 2026'));
const offer = fs.readFileSync('magneo-website-offer/index.html','utf8');
assert(offer.includes('content="noindex, nofollow"'));
assert.equal((offer.match(/<h1>/g)||[]).length,1);
assert(offer.includes('PROMOTIONAL OFFER FROM MAGNEO'));
assert(offer.includes('mailto:contact@magneo.ca?subject=Website%20Offer%20via%20The%20Legal%20Circle'));
assert(offer.includes('tel:+14378731155'));
assert(!offer.includes('<form'));
assert(!home.includes('/magneo-website-offer/'));
assert.equal((test.match(/class="tlc-pressfeed-block"/g) || []).length, 4);
const expectedCategories = ['Legal Developments', 'AI & Technology', 'Legal Marketing & PR', 'Business & Practice Development'];
const renderedBlocks = [...test.matchAll(/<section class="tlc-pressfeed-block"[\s\S]*?<\/section>/g)].map(m => m[0]);
for (const [i, category] of expectedCategories.entries()) {
  const expected = articles.filter(a => a.category === category && a.status === 'published' && Date.parse(a.published) <= Date.now()).sort((a,b) => Date.parse(b.published)-Date.parse(a.published)).slice(0,5);
  assert.deepEqual([...renderedBlocks[i].matchAll(/data-slug="([^"]+)"/g)].map(m=>m[1]), expected.map(a=>a.slug));
  assert.equal((renderedBlocks[i].match(/ hidden aria-label="Article/g) || []).length, Math.max(0, expected.length-1));
  assert.equal(renderedBlocks[i].includes('data-feed-prev'), expected.length > 1);
}
for (const name of ['sitemap.xml', 'news-sitemap.xml']) { assert(!fs.readFileSync(name, 'utf8').includes('/home-test/')); assert(!fs.readFileSync(name,'utf8').includes('/magneo-website-offer/')); }
for (const html of [home, test]) {
  const nav = html.match(/<nav class="tlc-nav"[\s\S]*?<\/nav>/)[0];
  assert(nav.indexOf('Marketing &amp; PR') < nav.indexOf('>Contact<'));
  assert(nav.endsWith('>Contact</a></nav>'));
  assert(!nav.includes('/home-test/'));
}
const injected = [
  { ...articles[0], slug: 'draft-never-show', headline: 'Draft never show', status: 'draft' },
  { ...articles[0], slug: 'future-never-show', headline: 'Future never show', published: '2099-01-01T00:00:00Z' }
];
buildTestHome(process.cwd(), [...injected, ...articles]);
const rebuilt = fs.readFileSync('home-test/index.html', 'utf8');
assert(!rebuilt.includes('Draft never show') && !rebuilt.includes('Future never show'));
assert.equal(rebuilt, test, 'Build must be deterministic and ignore drafts/future posts');
const modified = execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' }).trim().split('\n');
const normalize = html => html.replace(/<nav class="tlc-nav"[\s\S]*?<\/nav>/, 'NAV').replace(/styles\.css\?v=[^"]+/, 'styles.css?VERSION').replace(/\r/g, '');
for (const file of modified.filter(f => f.endsWith('.html') && f !== 'home-test/index.html' && f !== 'magneo-website-offer/index.html')) {
  const before = execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' });
  assert.equal(normalize(fs.readFileSync(file, 'utf8')), normalize(before), `Unrelated tracked HTML change: ${file}`);
}
console.log('All tracked HTML changes verified as navigation and CSS cache version only; live content and indexing unchanged.');
console.log('Test homepage checks passed: isolated Magneo tile, four newest-first category feeds, no-JS first articles, indexing, navigation, draft/future exclusion and deterministic generation.');
