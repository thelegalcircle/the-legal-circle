import fs from 'node:fs';
import path from 'node:path';

export function buildHomePreview(root) {
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="https://thelegalcircle.ca/"><title>The Legal Circle</title></head><body><p>The approved homepage is now live. <a href="/">Go to The Legal Circle homepage</a>.</p></body></html>';
  fs.mkdirSync(path.join(root, 'home-test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'home-test/index.html'), html);
}
