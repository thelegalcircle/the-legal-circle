import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectRelated } from './related-articles.mjs';
import { articlePath } from './article-path.mjs';
import { buildTestHome } from './build-test-home.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://thelegalcircle.ca';
const PUBLICATION = 'The Legal Circle';
const manifestPath = path.join(ROOT, 'news', 'articles.json');
const articles = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const published = articles.filter((article) => article.status === 'published');
const bySlug = new Map(published.map((article) => [article.slug, article]));
const categorySlugs = {
  'Legal Developments': 'legal-developments',
  'AI & Technology': 'ai-technology',
  'Legal Marketing & PR': 'legal-marketing-pr',
  'Business & Practice Development': 'business-practice-development',
  'Interviews & Perspectives': 'interviews-perspectives'
};
const contentTypeLabels = {
  news: 'News', analysis: 'Analysis', opinion: 'Opinion', explainer: 'Explainer', interview: 'Interview'
};
const schemaTypes = {
  news: 'NewsArticle', analysis: 'Article', opinion: 'Article', explainer: 'BlogPosting', interview: 'Article'
};

function fail(message) { throw new Error(message); }
function esc(value = '') { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function absolute(url) { return /^https?:\/\//i.test(url) ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`; }
function articleUrl(article) { return `${SITE}${articlePath(article)}`; }
function datePart(date) { return date.slice(0, 10); }
function displayDate(date) { return new Intl.DateTimeFormat('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(date)); }
function clean(value) { return value.replace(/[ \t]+$/gm, '').replace(/\n{4,}/g, '\n\n\n'); }
function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) fail(`Could not find ${label}`);
  pattern.lastIndex = 0;
  return html.replace(pattern, typeof replacement === 'function' ? replacement : () => replacement);
}
function indentJson(value) { return JSON.stringify(value, null, 2).split('\n').map((line) => `  ${line}`).join('\n'); }

const required = ['slug', 'status', 'headline', 'seoTitle', 'metaDescription', 'excerpt', 'contentType', 'category', 'tags', 'author', 'published', 'modified', 'featuredImage', 'social', 'related'];
const seen = new Set();
const seenPaths = new Set();
for (const article of articles) {
  const pathname = articlePath(article);
  if (seenPaths.has(pathname)) fail(`Duplicate article path: ${pathname}`);
  seenPaths.add(pathname);
  for (const field of required) if (article[field] === undefined || article[field] === '') fail(`${article.slug || 'Article'} is missing ${field}`);
  if (seen.has(article.slug)) fail(`Duplicate slug: ${article.slug}`);
  seen.add(article.slug);
  if (!contentTypeLabels[article.contentType]) fail(`${article.slug} has unsupported contentType ${article.contentType}`);
  if (!categorySlugs[article.category]) fail(`${article.slug} has unsupported category ${article.category}`);
  const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
  if (!timestampPattern.test(article.published) || !timestampPattern.test(article.modified)) fail(`${article.slug} must use ISO 8601 timestamps with a timezone`);
  if (Date.parse(article.modified) < Date.parse(article.published)) fail(`${article.slug} modified timestamp precedes publication`);
  if (!article.author.name || !article.author.type || !article.author.url) fail(`${article.slug} has incomplete author information`);
  if (!article.featuredImage.url || !article.featuredImage.alt || !article.featuredImage.width || !article.featuredImage.height) fail(`${article.slug} has incomplete image information`);
  if (!article.social.title || !article.social.description || !article.social.image) fail(`${article.slug} has incomplete social metadata`);
  for (const related of article.related) if (!articles.some((candidate) => candidate.slug === related)) fail(`${article.slug} references unknown related article ${related}`);
}

const topicsHtml = fs.readFileSync(path.join(ROOT, 'news', 'topics', 'index.html'), 'utf8');
const availableTopics = new Set([...topicsHtml.matchAll(/<section id="([^"]+)" class="tlc-topic-section">/g)].map((match) => match[1]));
const categoryCounts = new Map();
for (const article of published) categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1);
// Every category with published content deserves a browse link, even with one article.
const archiveCategories = new Set(Object.keys(categorySlugs).filter((category) => categoryCounts.has(category)));

function buildArticleSchema(article) {
  const canonical = articleUrl(article);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaTypes[article.contentType],
        '@id': `${canonical}#article`,
        headline: article.headline,
        description: article.metaDescription,
        datePublished: article.published,
        dateModified: article.modified,
        mainEntityOfPage: canonical,
        image: {
          '@type': 'ImageObject',
          url: absolute(article.featuredImage.url),
          width: article.featuredImage.width,
          height: article.featuredImage.height,
          caption: article.featuredImage.alt
        },
        articleSection: article.category,
        keywords: article.tags.map((tag) => tag.name),
        spatialCoverage: article.jurisdiction || undefined,
        author: { '@type': article.author.type, name: article.author.name, url: article.author.url },
        publisher: {
          '@type': 'Organization', name: PUBLICATION, url: `${SITE}/`,
          logo: { '@type': 'ImageObject', url: `${SITE}/assets/the-legal-circle-logo.png`, width: 512, height: 512 }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'News & Insights', item: `${SITE}/news/` },
          { '@type': 'ListItem', position: 3, name: article.headline, item: canonical }
        ]
      }
    ]
  };
}

function renderTags(article) {
  return article.tags.map((tag) => availableTopics.has(tag.slug)
    ? `<li><a href="/news/topics/#${esc(tag.slug)}">#${esc(tag.name)}</a></li>`
    : `<li><span>#${esc(tag.name)}</span></li>`).join('');
}

function renderRelated(article) {
  const items = selectRelated(article, articles);
  if (!items.length) return '';
  return `<section class="tlc-related-articles" aria-labelledby="related-title">
          <p class="tlc-eyebrow">Continue reading</p>
          <h2 id="related-title">Related articles</h2>
          <div class="tlc-related-grid">${items.map((item) => `<article><p>${esc(item.category)} · <time datetime="${item.published}">${esc(displayDate(item.published))}</time></p><h3><a href="${esc(articlePath(item))}">${esc(item.headline)}</a></h3><span>${esc(item.excerpt)}</span></article>`).join('')}</div>
        </section>`;
}

function renderFeaturedImage(article) {
  if (!article.featuredImage.showInArticle) return '';
  return `<figure class="tlc-article-featured"><img src="${esc(article.featuredImage.url)}" alt="${esc(article.featuredImage.alt)}" width="${article.featuredImage.width}" height="${article.featuredImage.height}" fetchpriority="high" decoding="async"></figure>`;
}

function updateArticle(article) {
  const file = path.join(ROOT, articlePath(article).slice(1), 'index.html');
  if (!fs.existsSync(file)) fail(`Missing rendered article: news/${article.slug}/index.html`);
  let html = fs.readFileSync(file, 'utf8');
  const canonical = articleUrl(article);
  const image = absolute(article.social.image || article.featuredImage.url);
  const tagMeta = article.tags.map((tag) => `  <meta property="article:tag" content="${esc(tag.name)}">`).join('\n');

  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(article.seoTitle)}</title>`, `${article.slug} title`);
  html = replaceRequired(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(article.metaDescription)}">`, `${article.slug} meta description`);
  html = replaceRequired(html, /<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${canonical}">`, `${article.slug} canonical`);
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(article.social.title)}">`, `${article.slug} OG title`);
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(article.social.description)}">`, `${article.slug} OG description`);
  html = replaceRequired(html, /<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${canonical}">`, `${article.slug} OG URL`);
  html = replaceRequired(html, /<meta property="og:image" content="[^"]+">/, `<meta property="og:image" content="${image}">`, `${article.slug} OG image`);
  html = replaceRequired(html, /<meta property="og:image:width" content="[^"]+">/, `<meta property="og:image:width" content="${article.featuredImage.width}">`, `${article.slug} OG image width`);
  html = replaceRequired(html, /<meta property="og:image:height" content="[^"]+">/, `<meta property="og:image:height" content="${article.featuredImage.height}">`, `${article.slug} OG image height`);
  html = replaceRequired(html, /<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(article.featuredImage.alt)}">`, `${article.slug} OG image alt`);
  html = replaceRequired(html, /<meta property="article:published_time" content="[^"]+">/, `<meta property="article:published_time" content="${article.published}">`, `${article.slug} published time`);
  html = replaceRequired(html, /<meta property="article:modified_time" content="[^"]+">/, `<meta property="article:modified_time" content="${article.modified}">`, `${article.slug} modified time`);
  html = replaceRequired(html, /<meta property="article:section" content="[^"]+">/, `<meta property="article:section" content="${esc(article.category)}">`, `${article.slug} section`);
  html = replaceRequired(html, /<meta property="article:author" content="[^"]+">(?:\s*<meta property="article:tag" content="[^"]+">)*/, `<meta property="article:author" content="${esc(article.author.name)}">\n${tagMeta}`, `${article.slug} article author`);
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(article.social.title)}">`, `${article.slug} Twitter title`);
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(article.social.description)}">`, `${article.slug} Twitter description`);
  html = replaceRequired(html, /<meta name="twitter:image" content="[^"]+">/, `<meta name="twitter:image" content="${image}">`, `${article.slug} Twitter image`);
  html = replaceRequired(html, /<link rel="stylesheet" href="\/styles\.css\?v=[^"]+">/, '<link rel="stylesheet" href="/styles.css?v=20261003-circular-logo">', `${article.slug} stylesheet version`);
  html = replaceRequired(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${indentJson(buildArticleSchema(article))}\n  </script>`, `${article.slug} JSON-LD`);

  html = replaceRequired(html, /<article class="tlc-article"(?:\s+data-[^>]*)?>/, `<article class="tlc-article" data-content-type="${esc(article.contentType)}" data-category="${esc(article.category)}"${article.jurisdiction ? ` data-jurisdiction="${esc(article.jurisdiction)}"` : ''}>`, `${article.slug} article element`);
  html = replaceRequired(html, /(<header class="tlc-article-header">[\s\S]*?<p class="tlc-eyebrow">)[\s\S]*?(<\/p>)/, (_match, start, end) => `${start}${esc(article.category)}${end}`, `${article.slug} category eyebrow`);
  html = replaceRequired(html, /(<header class="tlc-article-header">[\s\S]*?)<h1>[\s\S]*?<\/h1>/, (_match, start) => `${start}<h1>${esc(article.headline)}</h1>`, `${article.slug} H1`);
  html = replaceRequired(html, /<p class="tlc-article-dek">[\s\S]*?<\/p>/, `<p class="tlc-article-dek">${esc(article.excerpt)}</p>`, `${article.slug} excerpt`);
  const updated = article.modified !== article.published ? `<span>Updated <time datetime="${article.modified}">${esc(displayDate(article.modified))}</time></span>` : '';
  const meta = `<div class="tlc-article-meta"><span>By <a href="${esc(article.author.url.replace(SITE, ''))}">${esc(article.author.name)}</a></span><span class="tlc-article-type">${esc(contentTypeLabels[article.contentType])}</span><time datetime="${article.published}">${esc(displayDate(article.published))}</time>${updated}<span>${html.match(/<div class="tlc-article-meta">[\s\S]*?<span>(\d+ min read)<\/span>/)?.[1] || '4 min read'}</span></div>`;
  html = replaceRequired(html, /<div class="tlc-article-meta">[\s\S]*?<\/div>/, meta, `${article.slug} visible metadata`);
  html = replaceRequired(html, /<ul class="tlc-article-tags" aria-label="Article topics">[\s\S]*?<\/ul>/, `<ul class="tlc-article-tags" aria-label="Article topics">${renderTags(article)}</ul>`, `${article.slug} topics`);
html = replaceRequired(html, /<aside class="tlc-article-aside" aria-label="Article information">[\s\S]*?<\/aside>/, `<aside class="tlc-article-aside" aria-label="Article information"><span>${esc(article.category)}</span><p>${esc(contentTypeLabels[article.contentType])}</p><p>${article.author.type === 'Person' ? 'Written by' : 'Published by'} <a href="${esc(article.author.url.replace(SITE, ''))}">${esc(article.author.name)}</a></p><p>${esc(displayDate(article.published))}</p>${article.jurisdiction ? `<p>${esc(article.jurisdiction)}</p>` : ''}</aside>`, `${article.slug} article information`);

  const featured = `<!-- FEATURED_IMAGE_START -->\n        ${renderFeaturedImage(article)}\n        <!-- FEATURED_IMAGE_END -->`;
  if (/<!-- FEATURED_IMAGE_START -->[\s\S]*?<!-- FEATURED_IMAGE_END -->/.test(html)) html = html.replace(/<!-- FEATURED_IMAGE_START -->[\s\S]*?<!-- FEATURED_IMAGE_END -->/, featured);
  else html = replaceRequired(html, /(<\/header>\s*)(<div class="tlc-article-layout">)/, (_match, start, layout) => `${start}${featured}\n\n        ${layout}`, `${article.slug} featured image placement`);

  const correction = article.correctionNote ? `<aside class="tlc-correction-note" aria-label="Correction"><strong>Correction:</strong> ${esc(article.correctionNote)}</aside>` : '';
  const relatedBlock = `<!-- RELATED_ARTICLES_START -->\n        ${correction}\n        ${renderRelated(article)}\n        <!-- RELATED_ARTICLES_END -->`;
  if (/<!-- RELATED_ARTICLES_START -->[\s\S]*?<!-- RELATED_ARTICLES_END -->/.test(html)) html = html.replace(/<!-- RELATED_ARTICLES_START -->[\s\S]*?<!-- RELATED_ARTICLES_END -->/, relatedBlock);
  else html = replaceRequired(html, /(<footer class="tlc-author-card">)/, (_match, footer) => `${relatedBlock}\n\n        ${footer}`, `${article.slug} related article placement`);

  const authorCard = `<footer class="tlc-author-card">
          <p class="tlc-eyebrow">${article.author.type === 'Person' ? 'Written by' : 'Published by'}</p>
          <h2><a href="${esc(article.author.url.replace(SITE, ''))}">${esc(article.author.name)}</a></h2>
          <p>${article.author.type === 'Person' ? 'Marketing contributor to The Legal Circle.' : 'A media and networking platform for legal professionals, bringing together legal news, expert perspectives, marketing and business development insights.'}</p>
          <a href="/get-featured/">Contribute to The Legal Circle <span aria-hidden="true">→</span></a>
          <p class="tlc-corrections">Questions or corrections? Email <a href="mailto:networking@thelegalcircle.ca">networking@thelegalcircle.ca</a>.</p>
        </footer>`;
  html = replaceRequired(html, /<footer class="tlc-author-card">[\s\S]*?<\/footer>/, authorCard, `${article.slug} author card`);

  fs.writeFileSync(file, clean(html));
}

for (const article of published) updateArticle(article);

function renderNewsCard(article) {
  const category = archiveCategories.has(article.category)
    ? `<a href="/news/categories/${categorySlugs[article.category]}/">${esc(article.category)}</a>`
    : `<span>${esc(article.category)}</span>`;
  return `<article class="tlc-news-card">
          <div class="tlc-news-card-meta">${category}<time datetime="${article.published}">${esc(displayDate(article.published))}</time><span>${esc(contentTypeLabels[article.contentType])}</span></div>
          <div>
            <h3><a href="${esc(articlePath(article))}">${esc(article.headline)}</a></h3>
            <p>${esc(article.excerpt)}</p>
            <p class="tlc-news-byline">By <a href="${esc(article.author.url.replace(SITE, ''))}">${esc(article.author.name)}</a></p>
            <a class="tlc-card-link" href="${esc(articlePath(article))}">Read article <span aria-hidden="true">→</span></a>
          </div>
        </article>`;
}

const sorted = [...published].sort((a, b) => b.published.localeCompare(a.published) || articles.indexOf(a) - articles.indexOf(b));
// Read the opening paragraph from the article itself, never a separate homepage excerpt.
const recentArticles = [...published].filter((article) => Date.parse(article.published) <= Date.now())
  .sort((a, b) => Date.parse(b.published) - Date.parse(a.published) || articles.indexOf(a) - articles.indexOf(b)).slice(0, 3);
const recentSection = `<!-- HOMEPAGE_ARTICLES_START -->
      <section class="tlc-home-latest" aria-labelledby="tlc-latest-title">
        <div class="tlc-home-latest-inner">
          <h2 id="tlc-latest-title">Latest from The Legal Circle</h2>
          ${recentArticles.map((article) => {
            const html = fs.readFileSync(path.join(ROOT, articlePath(article).slice(1), 'index.html'), 'utf8');
            const paragraph = html.match(/<div class="tlc-article-body">\s*<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
            if (!paragraph) fail(`${article.slug}: missing opening paragraph`);
            return `<article class="tlc-home-story">
            <p class="tlc-home-story-meta">${esc(article.category)} · <time datetime="${article.published}">${esc(displayDate(article.published))}</time></p>
            <h3><a href="${esc(articlePath(article))}">${esc(article.headline)}</a></h3>
            <p class="tlc-home-story-opening">${paragraph}</p>
            <a class="tlc-card-link" href="${esc(articlePath(article))}">Continue reading <span aria-hidden="true">→</span></a>
          </article>`;
          }).join('\n          ')}
          <a class="tlc-card-link tlc-home-view-all" href="https://thelegalcircle.ca/news/">View all articles <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <!-- HOMEPAGE_ARTICLES_END -->`;
const homePath = path.join(ROOT, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
if (/<!-- HOMEPAGE_ARTICLES_START -->[\s\S]*?<!-- HOMEPAGE_ARTICLES_END -->/.test(home)) {
  home = home.replace(/<!-- HOMEPAGE_ARTICLES_START -->[\s\S]*?<!-- HOMEPAGE_ARTICLES_END -->/, () => recentSection);
} else {
  home = replaceRequired(home, /<section class="tlc-invitation"/, () => `${recentSection}\n\n      <section class="tlc-invitation"`, 'homepage joining invitation');
}
fs.writeFileSync(homePath, home);
const newsIndexPath = path.join(ROOT, 'news', 'index.html');
let newsIndex = fs.readFileSync(newsIndexPath, 'utf8');
const indexDescription = 'Explore legal developments, expert perspectives, AI, legal marketing and practice growth through news, analysis and interviews from The Legal Circle.';
newsIndex = replaceRequired(newsIndex, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${indexDescription}">`, 'News index meta description');
newsIndex = replaceRequired(newsIndex, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${indexDescription}">`, 'News index OG description');
newsIndex = replaceRequired(newsIndex, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${indexDescription}">`, 'News index Twitter description');
newsIndex = replaceRequired(newsIndex, /<link rel="stylesheet" href="\/styles\.css\?v=[^"]+">/, '<link rel="stylesheet" href="/styles.css?v=20261006-subscribe-button">', 'News index stylesheet version');
const collectionSchema = {
  '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Legal News & Insights', description: indexDescription,
  url: `${SITE}/news/`, isPartOf: { '@type': 'WebSite', name: PUBLICATION, url: `${SITE}/` },
  publisher: { '@type': 'Organization', name: PUBLICATION, url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/assets/the-legal-circle-logo.png` } },
  mainEntity: { '@type': 'ItemList', itemListElement: sorted.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: articleUrl(article), name: article.headline })) }
};
newsIndex = replaceRequired(newsIndex, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${indentJson(collectionSchema)}\n  </script>`, 'News index JSON-LD');
newsIndex = replaceRequired(newsIndex, /(<section class="tlc-news-latest"[\s\S]*?<h2 class="tlc-news-list-heading"[^>]*>Latest articles<\/h2>)[\s\S]*?(<\/section>)/, (_match, start, end) => `${start}\n        <!-- NEWS_CARDS_START -->\n        ${sorted.map(renderNewsCard).join('\n        ')}\n        <!-- NEWS_CARDS_END -->\n      ${end}`, 'News index cards');
const categoryNav = `<nav class="tlc-news-category-nav" aria-label="Browse news categories"><span>Browse:</span>${[...archiveCategories].map((category) => `<a href="/news/categories/${categorySlugs[category]}/">${esc(category)}</a>`).join('')}</nav>`;
if (/<!-- CATEGORY_NAV_START -->[\s\S]*?<!-- CATEGORY_NAV_END -->/.test(newsIndex)) newsIndex = newsIndex.replace(/<!-- CATEGORY_NAV_START -->[\s\S]*?<!-- CATEGORY_NAV_END -->/, `<!-- CATEGORY_NAV_START -->\n      ${categoryNav}\n      <!-- CATEGORY_NAV_END -->`);
else newsIndex = replaceRequired(newsIndex, /(<\/section>\s*)(<section class="tlc-news-latest")/, (_match, endHero, latestStart) => `${endHero}\n      <!-- CATEGORY_NAV_START -->\n      ${categoryNav}\n      <!-- CATEGORY_NAV_END -->\n\n      ${latestStart}`, 'News category navigation');
fs.writeFileSync(newsIndexPath, clean(newsIndex));

function categoryDescription(category) {
  return {
    'Legal Developments': 'Reporting and analysis on courts, legislation, professional obligations and other developments affecting legal practice.',
    'Business & Practice Development': 'Practical perspectives on legal services, client experience, leadership and sustainable practice growth.',
    'Legal Marketing & PR': 'Insights on professional visibility, reputation, content and legal communications.',
    'AI & Technology': 'Legal developments and practical analysis concerning artificial intelligence, legal technology and digital risk.',
    'Interviews & Perspectives': 'Interviews and professional perspectives from across the legal community.'
  }[category];
}

function categoryPage(category, items) {
  const slug = categorySlugs[category];
  const canonical = `${SITE}/news/categories/${slug}/`;
  const description = categoryDescription(category);
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: category, description, url: canonical, isPartOf: { '@type': 'CollectionPage', name: 'Legal News & Insights', url: `${SITE}/news/` }, mainEntity: { '@type': 'ItemList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, url: articleUrl(item), name: item.headline })) } };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(category)} | The Legal Circle</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="/assets/the-legal-circle-logo.png">
  <meta property="og:title" content="${esc(category)} | The Legal Circle">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Legal Circle">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/assets/the-legal-circle-social-card.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(category)} | The Legal Circle">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/assets/the-legal-circle-social-card.png">
  <link rel="stylesheet" href="/styles.css?v=20261006-categories">
  <script src="/consent.js?v=20261001" defer></script>
  <script type="application/ld+json">
${indentJson(schema)}
  </script>
</head>
<body>
  <!-- GENERATED_CATEGORY_ARCHIVE -->
  <div class="tlc-page">
    <a class="tlc-skip" href="#main-content">Skip to content</a>
    <header class="tlc-header"><a class="tlc-brand" href="/" aria-label="The Legal Circle home"><span class="tlc-logo"><img src="/assets/the-legal-circle-logo.png" alt="The Legal Circle"></span></a><nav class="tlc-nav" aria-label="Community navigation"><a href="/#about">About</a><a href="/news/" aria-current="page">News</a><a href="/events/">Events</a><a href="/get-featured/">Get Featured</a><a href="/contact/">Contact</a><a href="https://magneo.ca/" target="_blank" rel="noopener noreferrer">Marketing &amp; PR <span aria-hidden="true">↗</span></a></nav><a class="tlc-button tlc-button-small" href="https://www.linkedin.com/groups/40976138/" target="_blank" rel="noopener noreferrer">Join LinkedIn group</a></header>
    <main id="main-content" class="tlc-news-main"><section class="tlc-news-hero"><div><nav class="tlc-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/news/">News &amp; Insights</a></nav><p class="tlc-eyebrow">Category</p><h1>${esc(category)}</h1><p>${esc(description)}</p></div></section><section class="tlc-news-latest" aria-labelledby="articles-title"><h2 class="tlc-news-list-heading" id="articles-title">Published articles</h2>${items.map(renderNewsCard).join('')}</section></main>
    <footer class="tlc-footer"><span class="tlc-logo tlc-logo-footer"><img src="/assets/the-legal-circle-logo.png" alt="The Legal Circle"></span><p>Website built by <a href="https://magneo.ca/" target="_blank" rel="noopener noreferrer">Magneo.ca</a>.</p><nav aria-label="Legal Circle footer"><a href="/">Home</a><a href="/news/" aria-current="page">News</a><a href="/events/">Events</a><a href="/get-featured/">Get Featured</a><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-of-use/">Website Terms of Use</a><a href="/contact/">Contact</a><a href="https://magneo.ca/" target="_blank" rel="noopener noreferrer">Marketing &amp; PR by Magneo <span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/groups/40976138/" target="_blank" rel="noopener noreferrer">LinkedIn group</a></nav></footer>
  </div>
</body>
</html>
`;
}

const categoriesRoot = path.join(ROOT, 'news', 'categories');
fs.mkdirSync(categoriesRoot, { recursive: true });
const generatedCategorySlugs = new Set();
for (const category of archiveCategories) {
  const slug = categorySlugs[category];
  generatedCategorySlugs.add(slug);
  const dir = path.join(categoriesRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  const items = sorted.filter((article) => article.category === category);
  fs.writeFileSync(path.join(dir, 'index.html'), clean(categoryPage(category, items)));
}
for (const entry of fs.readdirSync(categoriesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || generatedCategorySlugs.has(entry.name)) continue;
  const file = path.join(categoriesRoot, entry.name, 'index.html');
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('GENERATED_CATEGORY_ARCHIVE')) fs.rmSync(path.join(categoriesRoot, entry.name), { recursive: true, force: true });
}

function existingSitemapEntries() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const entries = [];
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)) entries.push({ loc: match[1], lastmod: match[2] });
  return entries;
}
const articleUrls = new Set(articles.map(articleUrl));
const preserved = existingSitemapEntries().filter((entry) => !entry.loc.startsWith(`${SITE}/news/`) && entry.loc !== `${SITE}/editorial/` && !articleUrls.has(entry.loc));
const newsLastmod = sorted.reduce((latest, article) => article.modified > latest ? article.modified : latest, '1970-01-01');
const sitemapEntries = [
  ...preserved,
  { loc: `${SITE}/news/`, lastmod: newsLastmod },
  { loc: `${SITE}/news/topics/`, lastmod: newsLastmod },
  ...[...archiveCategories].sort().map((category) => ({ loc: `${SITE}/news/categories/${categorySlugs[category]}/`, lastmod: sorted.filter((article) => article.category === category).reduce((latest, article) => article.modified > latest ? article.modified : latest, '1970-01-01') })),
  ...sorted.map((article) => ({ loc: articleUrl(article), lastmod: article.modified })),
  { loc: `${SITE}/editorial/`, lastmod: '2026-10-02' }
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((entry) => `  <url>\n    <loc>${esc(entry.loc)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const today = new Date();
const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
const cutoff = new Date(utcToday); cutoff.setUTCDate(cutoff.getUTCDate() - 1);
const cutoffDate = cutoff.toISOString().slice(0, 10);
const newsEligible = sorted.filter((article) => article.contentType === 'news' && datePart(article.published) >= cutoffDate && datePart(article.published) <= utcToday.toISOString().slice(0, 10));
const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${newsEligible.map((article) => `  <url>\n    <loc>${esc(articleUrl(article))}</loc>\n    <news:news>\n      <news:publication><news:name>${PUBLICATION}</news:name><news:language>en</news:language></news:publication>\n      <news:publication_date>${article.published}</news:publication_date>\n      <news:title>${esc(article.headline)}</news:title>\n    </news:news>\n  </url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'news-sitemap.xml'), newsSitemap);

const robotsPath = path.join(ROOT, 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8').replace(/\s*Sitemap: https:\/\/thelegalcircle\.ca\/news-sitemap\.xml\s*/g, '\n');
robots = `${robots.trim()}\nSitemap: ${SITE}/news-sitemap.xml\n`;
fs.writeFileSync(robotsPath, robots);

console.log(`Built ${published.length} articles, ${archiveCategories.size} category archives, ${sitemapEntries.length} sitemap URLs and ${newsEligible.length} News sitemap entries.`);

// Keep existing static pages and the future article template on the same navigation.
function updateNavigation(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '_legal-drafts', 'node_modules', 'scripts', 'assets'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { updateNavigation(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('class="tlc-nav"')) continue;
    html = html.replace(/<nav class="tlc-nav"[^>]*>[\s\S]*?<\/nav>/, nav => {
      nav = nav.replace(/<div class="tlc-news-dropdown tlc-contact-dropdown">[\s\S]*?<\/div><\/div>/, block => block.match(/<a href="\/contact\/"[^>]*>Contact<\/a>/)[0]);
      nav = nav.replace(/<div class="tlc-news-dropdown tlc-interviews-dropdown">[\s\S]*?<\/div><\/div>/, '');
      nav = nav.replace(/<div class="tlc-news-dropdown tlc-marketing-dropdown">([\s\S]*?<\/a>)[\s\S]*?<\/div><\/div>/, '$1');
      nav = nav.replace(/<a href="\/get-featured\/"[^>]*>Get Featured<\/a>/g, '');
      nav = nav.replace(/<a href="\/events\/"[^>]*>Events<\/a>/, events => `<div class="tlc-news-dropdown tlc-interviews-dropdown"><span class="tlc-nav-label">Interviews</span><button class="tlc-news-toggle" type="button" aria-label="Expand Interviews options" aria-expanded="false" aria-controls="tlc-interviews-menu"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="tlc-news-menu" id="tlc-interviews-menu" hidden><a href="/get-featured/">Get Featured</a></div></div>${events}`);
      const contact = nav.match(/<a href="\/contact\/"[^>]*>Contact<\/a>/)?.[0];
      const marketing = nav.match(/<a\b[^>]*href="https:\/\/magneo\.ca\/"[^>]*>Marketing[\s\S]*?<\/a>/)?.[0];
      if (contact && marketing) {
        nav = nav.replace(contact, '').replace(marketing, '');
        const marketingLink = marketing.replace(/ aria-(?:haspopup|expanded|controls)="[^"]*"/g, '').replace('<a ', '<a aria-haspopup="true" aria-expanded="false" aria-controls="tlc-marketing-menu" ');
        nav = nav.replace('</nav>', `<div class="tlc-news-dropdown tlc-marketing-dropdown">${marketingLink}<div class="tlc-news-menu" id="tlc-marketing-menu" hidden><a href="https://magneo.ca/new-clients-offer/" target="_blank" rel="noopener noreferrer">Special offer from Magneo</a></div></div>${contact}</nav>`);
      }
      const links = [...archiveCategories].filter(category => published.some(article => article.category === category && Date.parse(article.published) <= Date.now()) && fs.existsSync(path.join(categoriesRoot, categorySlugs[category], 'index.html')))
        .map(category => `<a href="/news/categories/${categorySlugs[category]}/">${esc(category)}</a>`).join('');
      const render = news => `<div class="tlc-news-dropdown">${news}<button class="tlc-news-toggle" type="button" aria-label="Expand News categories" aria-expanded="false" aria-controls="tlc-news-menu"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="tlc-news-menu" id="tlc-news-menu" hidden>${links}</div></div>`;
      if (nav.includes('class="tlc-news-dropdown"')) return nav.replace(/<div class="tlc-news-dropdown">([\s\S]*?<a\b[^>]*>News<\/a>)[\s\S]*?<\/div><\/div>/, (_match, news) => render(news));
      return nav.replace(/<a href="\/news\/"[^>]*>News<\/a>/, render);
    });
    if (!html.includes('src="/navigation.js')) html = html.replace('</head>', '  <script src="/navigation.js?v=20261006" defer></script>\n</head>');
    html = html.replace(/href="\/styles\.css\?v=[^"]+"/, 'href="/styles.css?v=20261009-nav"');
    html = html.replace(/src="\/navigation\.js\?v=[^"]+"/, 'src="/navigation.js?v=20261009-magneo-offer"');
    html = html.replace(/src="\/consent\.js\?v=[^"]+"/, 'src="/consent.js?v=20261008-ga4"');
    fs.writeFileSync(file, html);
  }
}
updateNavigation(ROOT);
buildTestHome(ROOT, articles);
