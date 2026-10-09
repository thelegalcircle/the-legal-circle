import fs from 'node:fs';
import path from 'node:path';

export function buildHomePreview(root) {
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  html = html.replace('<h2 id="tlc-pressfeed-title">Pressfeed</h2>', '<div class="tlc-pressfeed-introduction"><h2 id="tlc-pressfeed-title">Pressfeed</h2><p>News and insights that matter to lawyers—from legal developments and AI to marketing and practice growth.</p></div>');
  html = html.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/home-preview.css?v=20261009-introduction">\n</head>');
  html = html.replace(/(<link rel="canonical" href=")[^"]+/, '$1https://thelegalcircle.ca/home-test/').replace(/(<meta property="og:url" content=")[^"]+/, '$1https://thelegalcircle.ca/home-test/');
  fs.mkdirSync(path.join(root, 'home-test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'home-test/index.html'), html);
}
