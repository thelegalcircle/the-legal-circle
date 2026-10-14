import fs from 'node:fs';
import path from 'node:path';
import {articlePath} from './article-path.mjs';
const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function selectAdeleInterviews(articles,now=Date.now()) {
  return articles.filter(article=>article.status==='published'&&article.contentType==='interview'&&Date.parse(article.published)<=now&&(article.interviewer?.name??article.author?.name)==='Adele Salikhova'&&!/preview|draft/i.test(articlePath(article))).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published));
}
export function buildAdeleProfile(root,articles) {
  const file=path.join(root,'about/adele-salikhova/index.html');
  if(!fs.existsSync(file))return;
  const interviews=selectAdeleInterviews(articles);
  const cards=interviews.map(article=>{
    const url=articlePath(article);
    const portrait=article.guest?.portrait?.url??article.guest?.portrait??article.interviewGuest?.portrait?.url??article.interviewGuest?.portrait;
    const safePortrait=typeof portrait==='string'&&(portrait.startsWith('/')||portrait.startsWith('https://'))?portrait:null;
    return `<article class="profile-interview-card">${safePortrait?`<a href="${escape(url)}"><img src="${escape(safePortrait)}" alt="${escape(article.guest?.name??article.interviewGuest?.name??'Interview guest')}" loading="lazy"></a>`:''}<h3><a href="${escape(url)}">${escape(article.headline)}</a></h3><p>${escape(article.excerpt)}</p><a href="${escape(url)}">Read interview →</a></article>`;
  }).join('\n');
  const section=interviews.length?`<section class="profile-interviews" aria-labelledby="adele-interviews"><h2 id="adele-interviews">Interviews conducted by Adele Salikhova</h2><div class="profile-interview-grid">${cards}</div></section>`:'';
  const html=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,html.replace(/<!-- ADELE_INTERVIEWS_START -->[\s\S]*?<!-- ADELE_INTERVIEWS_END -->/,`<!-- ADELE_INTERVIEWS_START -->\n${section}\n<!-- ADELE_INTERVIEWS_END -->`));
}
