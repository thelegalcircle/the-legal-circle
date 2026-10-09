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
assert(home.includes('Latest from The Legal Circle'));
assert(!test.includes('Latest from The Legal Circle'));
assert(!/\b(?:href|src)="assets\//.test(test));
assert(test.includes('Interviews coming soon'));
assert(test.includes('Exact date and venue to be announced'));
assert.equal((test.match(/class="tlc-home-story tlc-pressfeed-story"/g) || []).length, 10);
for (const name of ['sitemap.xml', 'news-sitemap.xml']) assert(!fs.readFileSync(name, 'utf8').includes('/home-test/'));
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
for (const file of modified.filter(f => f.endsWith('.html') && f !== 'home-test/index.html')) {
  const before = execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' });
  assert.equal(normalize(fs.readFileSync(file, 'utf8')), normalize(before), `Unrelated tracked HTML change: ${file}`);
}
console.log('All tracked HTML changes verified as navigation and CSS cache version only; live content and indexing unchanged.');
console.log('Test homepage checks passed: isolated sections, indexing, navigation, ten news stories, draft/future exclusion and deterministic generation.');
