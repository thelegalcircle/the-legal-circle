import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function addBackToTop() {
  let count = 0;
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', '_legal-drafts'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { visit(file); continue; }
      if (!entry.name.endsWith('.html')) continue;
      let html = fs.readFileSync(file, 'utf8');
      if (!html.includes('</head>') || html.includes('src="/back-to-top.js')) continue;
      html = html.replace('</head>', '<link rel="stylesheet" href="/back-to-top.css?v=20261016"><script src="/back-to-top.js?v=20261016" defer></script></head>');
      fs.writeFileSync(file, html);
      count++;
    }
  };
  visit(root);
  return count;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Attached shared back-to-top component to ${addBackToTop()} pages/templates.`);
