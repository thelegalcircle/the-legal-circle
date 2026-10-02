import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://thelegalcircle.ca';
const articles = JSON.parse(fs.readFileSync(path.join(ROOT, 'news', 'articles.json'), 'utf8')).filter((article) => article.status === 'published');
const errors = [];
const titles = new Map();
const descriptions = new Map();
const expectedIndexDescription = 'Explore legal developments, expert perspectives, AI, legal marketing and practice growth through news, analysis and interviews from The Legal Circle.';

function add(message) { errors.push(message); }
function one(html, pattern) { return html.match(pattern)?.[1] || ''; }
function localFileFor(urlPath) {
  const pathname = urlPath.split('#')[0].split('?')[0];
  if (!pathname || pathname === '/') return path.join(ROOT, 'index.html');
  const relative = pathname.replace(/^\//, '');
  if (path.extname(relative)) return path.join(ROOT, relative);
  return path.join(ROOT, relative, 'index.html');
}

for (const article of articles) {
  const file = path.join(ROOT, 'news', article.slug, 'index.html');
  if (!fs.existsSync(file)) { add(`${article.slug}: missing HTML`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = one(html, /<title>([\s\S]*?)<\/title>/);
  const description = one(html, /<meta name="description" content="([^"]*)">/);
  const canonical = one(html, /<link rel="canonical" href="([^"]+)">/);
  if ((titles.get(title) || 0) > 0) add(`${article.slug}: duplicate title`); titles.set(title, (titles.get(title) || 0) + 1);
  if ((descriptions.get(description) || 0) > 0) add(`${article.slug}: duplicate meta description`); descriptions.set(description, (descriptions.get(description) || 0) + 1);
  if (title !== article.seoTitle.replace(/&/g, '&amp;')) add(`${article.slug}: SEO title mismatch`);
  if (!description) add(`${article.slug}: missing meta description`);
  if (canonical !== `${SITE}/news/${article.slug}/`) add(`${article.slug}: canonical mismatch`);
  if ((html.match(/<h1(?:\s[^>]*)?>/g) || []).length !== 1) add(`${article.slug}: requires exactly one H1`);
  if ((html.match(/<h2(?:\s[^>]*)?>/g) || []).length < 1) add(`${article.slug}: missing H2 structure`);
  if (/noindex|nofollow/i.test(html)) add(`${article.slug}: indexing restriction present`);
  if (!html.includes('tlc-article-dek')) add(`${article.slug}: missing summary`);
  if (!html.includes(`datetime="${article.published}"`)) add(`${article.slug}: publication date missing`);
  if (!html.includes('href="/editorial/"')) add(`${article.slug}: editorial byline link missing`);
  if (!html.includes('mailto:networking@thelegalcircle.ca')) add(`${article.slug}: corrections contact missing`);
  if (!html.includes('tlc-primary-source')) add(`${article.slug}: source section missing`);
  if (html.indexOf('tlc-article-tags') < html.indexOf('tlc-article-meta')) add(`${article.slug}: tags must follow byline/date`);
  if (!html.includes(`data-content-type="${article.contentType}"`)) add(`${article.slug}: content type not rendered`);
  if (!html.includes(`data-category="${article.category.replace(/&/g, '&amp;')}"`) && !html.includes(`data-category="${article.category}"`)) add(`${article.slug}: category not rendered`);
  if (article.related.length && !html.includes('tlc-related-articles')) add(`${article.slug}: related articles missing`);
  if (!html.includes(`content="${article.featuredImage.width}"`) || !html.includes(`content="${article.featuredImage.height}"`)) add(`${article.slug}: social image dimensions missing`);
  const jsonText = one(html, /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  try {
    const json = JSON.parse(jsonText);
    const node = json['@graph']?.find((entry) => ['NewsArticle', 'Article', 'BlogPosting'].includes(entry['@type']));
    if (!node) add(`${article.slug}: missing article JSON-LD node`);
    else {
      if (node.headline !== article.headline) add(`${article.slug}: schema headline mismatch`);
      if (node.datePublished !== article.published || node.dateModified !== article.modified) add(`${article.slug}: schema dates mismatch`);
      if (node.mainEntityOfPage !== canonical) add(`${article.slug}: schema canonical mismatch`);
    }
  } catch { add(`${article.slug}: invalid JSON-LD`); }
}

const newsIndex = fs.readFileSync(path.join(ROOT, 'news', 'index.html'), 'utf8');
if (one(newsIndex, /<meta name="description" content="([^"]*)">/) !== expectedIndexDescription) add('News index meta description mismatch');
if (one(newsIndex, /<title>(.*?)<\/title>/) !== 'Legal News &amp; Insights | The Legal Circle') add('News index SEO title mismatch');
if (/noindex|nofollow/i.test(newsIndex)) add('News index has indexing restriction');

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const article of articles) if (!sitemap.includes(`<loc>${SITE}/news/${article.slug}/</loc>`)) add(`${article.slug}: missing from regular sitemap`);
if (!sitemap.includes(`${SITE}/editorial/`)) add('Editorial page missing from regular sitemap');
const newsSitemap = fs.readFileSync(path.join(ROOT, 'news-sitemap.xml'), 'utf8');
if (!newsSitemap.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')) add('News sitemap namespace missing');
if (!newsSitemap.includes('<news:name>The Legal Circle</news:name>')) add('News sitemap publication name missing');
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!robots.includes(`${SITE}/sitemap.xml`) || !robots.includes(`${SITE}/news-sitemap.xml`)) add('robots.txt must reference both sitemaps');

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '_legal-drafts' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html') && !full.includes(`${path.sep}_templates${path.sep}`)) htmlFiles.push(full);
  }
}
walk(ROOT);
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    const target = localFileFor(href);
    if (!fs.existsSync(target)) add(`${path.relative(ROOT, file)}: broken internal link ${href}`);
    const fragment = href.includes('#') ? href.split('#')[1] : '';
    if (fragment && fs.existsSync(target)) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      if (!targetHtml.includes(`id="${fragment}"`)) add(`${path.relative(ROOT, file)}: missing fragment target ${href}`);
    }
  }
}

if (errors.length) {
  console.error(`News SEO audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`News SEO audit passed: ${articles.length} articles, ${htmlFiles.length} rendered pages, unique metadata, valid structured data, working internal links and both sitemaps referenced.`);
