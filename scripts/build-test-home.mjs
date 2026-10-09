import fs from 'node:fs';
import path from 'node:path';
import { articlePath } from './article-path.mjs';
import { buildMagneoOffer } from './build-magneo-offer.mjs';

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
  const offerTile = `<article class="tlc-feature-column tlc-magneo-tile"><h2>Marketing &amp; PR</h2><a class="tlc-offer-preview" href="/magneo-website-offer/" aria-label="View Magneo’s website offer"><img src="/assets/magneo-immigration-desktop.png" width="1265" height="712" alt="Immigration law website concept by Magneo"><img class="tlc-offer-mobile" src="/assets/magneo-immigration-mobile.png" width="390" height="844" alt="Mobile view of the immigration design concept"></a><p class="tlc-promo-disclosure">Promotional offer · Magneo</p><h3><a href="/magneo-website-offer/">A stronger website for your law firm.</a></h3><p>Explore Magneo’s website rebuild package for Ontario law firms: up to six pages for <strong>CAD $1,800 total</strong>.</p><p class="tlc-promo-availability">Three spots · October 2026</p><a class="tlc-card-link" href="/magneo-website-offer/">View the offer <span aria-hidden="true">→</span></a></article>`;
  const features = `<section id="featured-content" class="tlc-test-features" aria-label="Featured content">${offerTile}${contentColumn('Interviews', interview, 'Read interview')}${eventColumn}</section>`;
  const blocks = categories.map(([category, slug]) => {
    const items = published.filter(a => a.category === category).slice(0, 5);
    const archive = `/news/categories/${slug}/`;
    return `<section class="tlc-pressfeed-block" aria-labelledby="feed-${slug}" data-feed-category="${esc(category)}"><h3 id="feed-${slug}"><a href="${archive}">${esc(category)}</a></h3><div class="tlc-pressfeed-stories">${items.map((a, i) => `<article class="tlc-home-story tlc-pressfeed-story" data-slug="${esc(a.slug)}"${i ? ' hidden' : ''} aria-label="Article ${i + 1} of ${items.length}"><p class="tlc-home-story-meta"><time datetime="${a.published}">${date(a.published)}</time> · ${esc(types[a.contentType] || a.contentType)}</p><h4><a href="${esc(articlePath(a))}">${esc(a.headline)}</a></h4><p class="tlc-home-story-opening">${esc(a.excerpt)}</p><a class="tlc-card-link" href="${esc(articlePath(a))}">Read article <span aria-hidden="true">→</span></a></article>`).join('') || '<p>Published coverage coming soon.</p>'}</div>${items.length > 1 ? `<div class="tlc-pressfeed-controls" hidden><button type="button" data-feed-prev aria-label="Previous ${esc(category)} article">Previous</button><button type="button" data-feed-next aria-label="Next ${esc(category)} article">Next</button><span data-feed-indicator aria-live="off">1 / ${items.length}</span></div>` : ''}<a class="tlc-card-link tlc-view-category" href="${archive}">View category <span aria-hidden="true">→</span></a></section>`;
  }).join('');
  const feed = `<section class="tlc-home-latest tlc-pressfeed" aria-labelledby="tlc-pressfeed-title"><div class="tlc-home-latest-inner"><div class="tlc-pressfeed-heading"><h2 id="tlc-pressfeed-title">Pressfeed</h2><div class="tlc-feed-update-control" hidden><button type="button" data-feed-play>Pause updates</button><span data-feed-status></span></div></div><div class="tlc-pressfeed-grid">${blocks}</div><a class="tlc-card-link tlc-home-view-all" href="/news/">View all articles <span aria-hidden="true">→</span></a></div></section>`;
  let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  home = home.replace(/(src|href)="assets\//g, '$1="/assets/');
  const scales = `<svg class="tlc-scales tlc-lady-justice" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g class="tlc-justice-figure" fill="currentColor"><path d="M27 23Q23 12 34 10Q44 10 44 22L40 28L34 30L28 27ZM26 18Q20 29 27 34L31 26Z"/><path d="M32 29Q22 30 20 41L15 60L22 70L27 65L23 58L29 43L30 55L22 85Q35 90 49 86L41 56L43 43L54 35L65 18L61 15L49 29L40 32Z"/><path d="M59 16L61 10L65 11L66 18L63 22ZM19 68L25 66L28 73L23 77Z"/><path d="M25 72L68 87L82 94L65 92L24 78Z"/></g><g fill="none" stroke="var(--tlc-green)" stroke-width="1.8" stroke-linecap="round"><path d="M28 20L41 20M28 36Q34 42 42 37M30 48L38 54M31 58L27 79M35 62L40 82"/></g><g class="tlc-justice-sway"><g class="tlc-scales-beam" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M50 27H87M68 21V27"/><g class="tlc-scales-pan tlc-scales-pan-left"><path d="M50 27L43 50H57ZM43 50Q50 58 57 50" fill="currentColor"/></g><g class="tlc-scales-pan tlc-scales-pan-right"><path d="M87 27L80 50H94ZM80 50Q87 58 94 50" fill="currentColor"/></g></g></g></svg>`;
  home = home.replace('<span class="tlc-orbit-core"></span>', `<span class="tlc-orbit-core">${scales}</span>`);
  home = home.replace('Animated circular paths moving around a bright green centre', 'Animated circular paths around gently balancing scales of justice in a green centre');
  home = home.replace(/<!-- HOMEPAGE_ARTICLES_START -->[\s\S]*?<!-- HOMEPAGE_ARTICLES_END -->/, features + feed);
  home = home.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/home-test.css?v=20261009-justice">\n<script src="/pressfeed.js?v=20261009-categories" defer></script>\n</head>');
  home = home.replace(/(<link rel="canonical" href=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  home = home.replace(/(<meta property="og:url" content=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  fs.mkdirSync(path.join(root, 'home-test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'home-test/index.html'), home);
  buildMagneoOffer(root);
  // Explicit exclusion also removes an accidentally added test URL on future builds.
  for (const name of ['sitemap.xml', 'news-sitemap.xml']) {
    const file = path.join(root, name);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\s*<url>\s*<loc>https:\/\/thelegalcircle\.ca\/home-test\/[\s\S]*?<\/url>/g, ''));
  }
  console.log(`Test homepage: Magneo promotion, ${interview?.slug || 'interviews coming soon'}, four category feeds, ${event?.url || 'no upcoming event'}.`);
}
