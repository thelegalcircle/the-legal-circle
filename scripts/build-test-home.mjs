import fs from 'node:fs';
import path from 'node:path';
import { articlePath } from './article-path.mjs';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const date = s => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(s));
const placeholder = '/assets/the-legal-circle-social-card.png';

export function buildTestHome(root, articles, now = new Date()) {
  const published = articles.filter(a => a.status === 'published' && Date.parse(a.published) <= now.getTime())
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  const feature = published.find(a => ['analysis', 'opinion', 'explainer', 'feature', 'practical'].includes(a.contentType));
  const interview = published.find(a => a.contentType === 'interview');
  const news = published.filter(a => a.contentType === 'news').slice(0, 10);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const events = JSON.parse(fs.readFileSync(path.join(root, 'events/events.json'), 'utf8'));
  const event = events.filter(e => e.status === 'published' && (e.startDate ? e.startDate.slice(0, 10) >= today : e.startMonth > today.slice(0, 7)))
    .sort((a, b) => (a.startDate || `${a.startMonth}-31`).localeCompare(b.startDate || `${b.startMonth}-31`))[0];
  const image = (url, alt) => `<img src="${esc(url || placeholder)}" alt="${esc(alt || 'The Legal Circle') }" width="1200" height="630" loading="lazy">`;
  const column = (label, title, paragraph, url, cta, picture = placeholder, alt = 'The Legal Circle') => `<article class="tlc-feature-column"><h2>${label}</h2>${image(picture, alt)}<h3><a href="${esc(url)}">${esc(title)}</a></h3><p>${esc(paragraph)}</p><a class="tlc-card-link" href="${esc(url)}">${cta} <span aria-hidden="true">→</span></a></article>`;
  const contentColumn = (label, item, cta) => item ? column(label, item.headline, item.excerpt, articlePath(item), cta, item.featuredImage?.url, item.featuredImage?.alt)
    : column(label, `${label} coming soon`, label === 'Interviews' ? 'Have an experience or perspective to share? Put yourself forward for a proposed interview.' : 'Explore published coverage from The Legal Circle.', label === 'Interviews' ? '/get-featured/' : '/news/', label === 'Interviews' ? 'Get featured' : 'View articles');
  let eventColumn;
  if (event) {
    const html = fs.readFileSync(path.join(root, event.url.slice(1), 'index.html'), 'utf8');
    const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<br\s*\/?>/g, ' ').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
    const intro = html.match(/<p class="tlc-event-intro">([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
    const img = html.match(/<figure class="tlc-event-hero-image">\s*<img src="([^"]+)" alt="([^"]+)"/);
    if (!title || !intro) throw new Error('Event title or introduction missing');
    const monthLabel = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(`${event.startMonth}-01T12:00:00Z`));
    eventColumn = column('Events', title, `${intro} ${event.startDate ? date(event.startDate) : `${monthLabel} · Exact date and venue to be announced.`}`, event.url, 'View event', img?.[1], img?.[2]);
  } else eventColumn = column('Events', 'More events to come', 'Discover networking opportunities and future gatherings.', '/events/', 'View events');
  const features = `<section id="featured-content" class="tlc-test-features" aria-label="Featured content">${contentColumn('Articles', feature, 'Read article')}${contentColumn('Interviews', interview, 'Read interview')}${eventColumn}</section>`;
  const feed = `<section class="tlc-home-latest tlc-pressfeed" aria-labelledby="tlc-pressfeed-title"><div class="tlc-home-latest-inner"><h2 id="tlc-pressfeed-title">Pressfeed</h2><div class="tlc-pressfeed-stories">${news.map((a, i) => `<article class="tlc-home-story tlc-pressfeed-story"${i ? ' hidden' : ''} aria-label="Story ${i + 1} of ${news.length}"><p class="tlc-home-story-meta">${esc(a.category)} · <time datetime="${a.published}">${date(a.published)}</time></p><h3><a href="${esc(articlePath(a))}">${esc(a.headline)}</a></h3><p class="tlc-home-story-opening">${esc(a.excerpt)}</p><a class="tlc-card-link" href="${esc(articlePath(a))}">Continue reading <span aria-hidden="true">→</span></a></article>`).join('') || '<p>News coverage coming soon.</p>'}</div><div class="tlc-pressfeed-controls" hidden><button type="button" data-feed-prev>Previous</button><button type="button" data-feed-next>Next</button><button type="button" data-feed-play>Pause</button><span data-feed-indicator aria-live="off">1 / ${news.length}</span></div><a class="tlc-card-link tlc-home-view-all" href="/news/">View all news <span aria-hidden="true">→</span></a></div></section>`;
  let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  home = home.replace(/(src|href)="assets\//g, '$1="/assets/');
  home = home.replace(/<!-- HOMEPAGE_ARTICLES_START -->[\s\S]*?<!-- HOMEPAGE_ARTICLES_END -->/, features + feed);
  home = home.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/home-test.css?v=20261009-crop">\n<script src="/pressfeed.js?v=20261009" defer></script>\n</head>');
  home = home.replace(/(<link rel="canonical" href=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  home = home.replace(/(<meta property="og:url" content=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  fs.mkdirSync(path.join(root, 'home-test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'home-test/index.html'), home);
  // Explicit exclusion also removes an accidentally added test URL on future builds.
  for (const name of ['sitemap.xml', 'news-sitemap.xml']) {
    const file = path.join(root, name);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\s*<url>\s*<loc>https:\/\/thelegalcircle\.ca\/home-test\/[\s\S]*?<\/url>/g, ''));
  }
  console.log(`Test homepage: ${feature?.slug || 'no feature'}, ${interview?.slug || 'interviews coming soon'}, ${news.length} news stories, ${event?.url || 'no upcoming event'}.`);
}
