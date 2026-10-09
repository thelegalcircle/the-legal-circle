import fs from 'node:fs';
import path from 'node:path';
import { articlePath } from './article-path.mjs';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const date = s => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(s));
const placeholder = '/assets/the-legal-circle-social-card.png';

export function buildTestHome(root, articles, now = new Date()) {
  const published = articles.filter(a => a.status === 'published' && Date.parse(a.published) <= now.getTime())
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  const interview = published.find(a => a.contentType === 'interview');
  const categories = [['Legal Developments', 'legal-developments'], ['AI & Technology', 'ai-technology'], ['Legal Marketing & PR', 'legal-marketing-pr'], ['Business & Practice Development', 'business-practice-development']];
  const types = { news: 'News', analysis: 'Analysis', opinion: 'Opinion', explainer: 'Explainer', practical: 'Practical article', feature: 'Feature', interview: 'Interview' };
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
  const magneo = `<article class="tlc-feature-column tlc-magneo-tile"><h2>Marketing &amp; PR</h2><div class="tlc-magneo-visual" role="img" aria-label="Magneo illustrative website preview, CAD $1,800 total"><div class="tlc-magneo-wordmark">MAG<span>NEO</span></div><span class="tlc-magneo-price">CAD $1,800 <small>total</small></span><div class="tlc-magneo-preview" aria-hidden="true"><div class="tlc-preview-bar"><span>YOUR LAW FIRM</span><i></i><i></i><i></i></div><div class="tlc-preview-content"><strong>Clear advice.<br>A confident next step.</strong><span>Professional legal services</span><b>Contact our team →</b></div><div class="tlc-preview-lines"><i></i><i></i><i></i></div></div><div class="tlc-magneo-phone" aria-hidden="true"><span>YOUR LAW FIRM</span><strong>Clear advice.</strong><i></i><i></i><b>Contact →</b></div><small class="tlc-preview-caption">Illustrative design concept</small></div><p class="tlc-promo-disclosure">Promotional offer · Magneo</p><h3><a href="https://magneo.ca/new-clients/" target="_blank" rel="noopener noreferrer">A stronger website for your law firm.</a></h3><p>Magneo’s new-client offer: a focused website rebuild for Ontario law firms, up to six pages, for CAD $1,800 total.</p><p class="tlc-promo-availability">Three spots · October 2026</p><a class="tlc-card-link" href="https://magneo.ca/new-clients/" target="_blank" rel="noopener noreferrer">Explore the offer on Magneo <span aria-hidden="true">↗</span></a><small class="tlc-external-note">Opens magneo.ca, a separate website.</small></article>`;
  const features = `<section id="featured-content" class="tlc-test-features" aria-label="Featured content">${magneo}${contentColumn('Interviews', interview, 'Read interview')}${eventColumn}</section>`;
  const blocks = categories.map(([category, slug]) => {
    const items = published.filter(a => a.category === category).slice(0, 5);
    const archive = `/news/categories/${slug}/`;
    return `<section class="tlc-pressfeed-block" aria-labelledby="feed-${slug}" data-feed-category="${esc(category)}"><h3 id="feed-${slug}"><a href="${archive}">${esc(category)}</a></h3><div class="tlc-pressfeed-stories">${items.map((a, i) => `<article class="tlc-home-story tlc-pressfeed-story" data-slug="${esc(a.slug)}"${i ? ' hidden' : ''} aria-label="Article ${i + 1} of ${items.length}"><p class="tlc-home-story-meta"><time datetime="${a.published}">${date(a.published)}</time> · ${esc(types[a.contentType] || a.contentType)}</p><h4><a href="${esc(articlePath(a))}">${esc(a.headline)}</a></h4><p class="tlc-home-story-opening">${esc(a.excerpt)}</p><a class="tlc-card-link" href="${esc(articlePath(a))}">Read article <span aria-hidden="true">→</span></a></article>`).join('') || '<p>Published coverage coming soon.</p>'}</div>${items.length > 1 ? `<div class="tlc-pressfeed-controls" hidden><button type="button" data-feed-prev aria-label="Previous ${esc(category)} article">Previous</button><button type="button" data-feed-next aria-label="Next ${esc(category)} article">Next</button><span data-feed-indicator aria-live="off">1 / ${items.length}</span></div>` : ''}<a class="tlc-card-link tlc-view-category" href="${archive}">View category <span aria-hidden="true">→</span></a></section>`;
  }).join('');
  const feed = `<section class="tlc-home-latest tlc-pressfeed" aria-labelledby="tlc-pressfeed-title"><div class="tlc-home-latest-inner"><div class="tlc-pressfeed-heading"><h2 id="tlc-pressfeed-title">Pressfeed</h2><div class="tlc-feed-update-control" hidden><button type="button" data-feed-play>Pause updates</button><span data-feed-status></span></div></div><div class="tlc-pressfeed-grid">${blocks}</div><a class="tlc-card-link tlc-home-view-all" href="/news/">View all articles <span aria-hidden="true">→</span></a></div></section>`;
  let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  home = home.replace(/(src|href)="assets\//g, '$1="/assets/');
  home = home.replace(/<!-- HOMEPAGE_ARTICLES_START -->[\s\S]*?<!-- HOMEPAGE_ARTICLES_END -->/, features + feed);
  home = home.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/home-test.css?v=20261009-categories-v2">\n<script src="/pressfeed.js?v=20261009-categories" defer></script>\n</head>');
  home = home.replace(/(<link rel="canonical" href=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  home = home.replace(/(<meta property="og:url" content=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  fs.mkdirSync(path.join(root, 'home-test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'home-test/index.html'), home);
  // Explicit exclusion also removes an accidentally added test URL on future builds.
  for (const name of ['sitemap.xml', 'news-sitemap.xml']) {
    const file = path.join(root, name);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\s*<url>\s*<loc>https:\/\/thelegalcircle\.ca\/home-test\/[\s\S]*?<\/url>/g, ''));
  }
  console.log(`Test homepage: Magneo promotion, ${interview?.slug || 'interviews coming soon'}, four category feeds, ${event?.url || 'no upcoming event'}.`);
}
