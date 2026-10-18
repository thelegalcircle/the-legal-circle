import fs from 'node:fs';
import path from 'node:path';
import {buildAdeleProfile} from './build-adele-profile.mjs';
import {renderInterviewsHub,selectPublishedInterviews} from './render-interviews-hub.mjs';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function buildInterviews(root){
 const interviews=JSON.parse(fs.readFileSync(path.join(root,'interviews/interviews.json'),'utf8'));
 const published=selectPublishedInterviews(interviews);
 for(const interview of published){
  const file=path.join(root,interview.path,'index.html');
  const date=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/Toronto'}).format(new Date(interview.published));
  let html=fs.readFileSync(file,'utf8').replace(/<p class="publication-date"[^>]*>[\s\S]*?<\/p>/,'').replace(/(?: · )?<time class="interview-publication"[^>]*>[\s\S]*?<\/time>/g,'');
  const labels=/(<div class="interview-labels">[\s\S]*?)(<\/div>)/;
  if(!labels.test(html))throw Error('Missing interview labels: '+interview.path);
  html=html.replace(labels,`$1<time class="interview-publication" datetime="${esc(interview.published)}">Published ${date}</time>$2`);
  let articleFound=false;
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(block,json)=>{
   const schema=JSON.parse(json);
   for(const item of schema['@graph']||[schema])if(['Article','NewsArticle','BlogPosting'].includes(item['@type'])){item.datePublished=interview.published;articleFound=true;}
   return '<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script>';
  });
  if(!articleFound)throw Error('Missing article schema: '+interview.path);
  if(!html.includes('/interviews/dates.css'))html=html.replace('</head>','<link rel="stylesheet" href="/interviews/dates.css?v=20261018"></head>');
  fs.writeFileSync(file,html);
 }
 const hub=path.join(root,'interviews/index.html');
 const cards=published.map(a=>`<article class="interview-card"><a href="${esc(a.path)}"><img src="${esc(a.guest.portrait)}" alt="${esc(a.guest.name)}" width="445" height="445" loading="lazy"></a><div><p class="guest-name">${esc(a.guest.name)}</p><p class="guest-role">${esc(a.guest.role)}</p><h2><a href="${esc(a.path)}">${esc(a.headline)}</a></h2><p class="excerpt">${esc(a.excerpt)}</p><a class="read-link" href="${esc(a.path)}">Read the interview →</a></div></article>`).join('\n');
 const listing=published.length?`<section class="interview-grid" aria-label="Published interviews">${cards}</section>`:'<section><h2>Our first interviews are coming soon.</h2><p>We’re preparing conversations with experts whose experiences offer fresh perspectives on legal practice.</p></section>';
 renderInterviewsHub(root, interviews);
 buildAdeleProfile(root,published);
 if(published.length){
  const a=published[0],home=path.join(root,'index.html');
  const card=`<article class="tlc-feature-column"><h2>Interviews</h2><a href="${esc(a.path)}"><img src="${esc(a.guest.portrait)}" alt="${esc(a.guest.name)}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:contain;background:#f0f1e9"></a><h3><a href="${esc(a.path)}">${esc(a.headline)}</a></h3><p>${esc(a.excerpt)}</p><a class="tlc-card-link" href="${esc(a.path)}">Read interview <span aria-hidden="true">→</span></a></article>`;
  fs.writeFileSync(home,fs.readFileSync(home,'utf8').replace(/<article class="tlc-feature-column"><h2>Interviews<\/h2>[\s\S]*?<\/article>/,card));
 }
 const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8');
 for(const a of published)if(!xml.includes('https://thelegalcircle.ca'+a.path))xml=xml.replace('</urlset>',`  <url><loc>https://thelegalcircle.ca${esc(a.path)}</loc><lastmod>${a.modified.slice(0,10)}</lastmod></url>\n</urlset>`);
 fs.writeFileSync(sitemap,xml);
}
