import fs from 'node:fs';
import path from 'node:path';
const raw=fs.readFileSync(process.argv[2],'utf8');
const existing=JSON.parse(fs.readFileSync('news/articles.json','utf8'));
const template=fs.readFileSync('news/kirkland-ellis-financial-reporting-big-law/index.html','utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sources=[
 {'Canadian Lawyer':'https://www.canadianlawyermag.com/news/general/courts-cannot-provide-an-unlimited-audience-to-irrelevant-ai-filings-bcca-justice-warns-litigants/394779'},
 {'about.att.com':'https://about.att.com/story/2026/att-legaledge.html','Reuters':'https://www.reuters.com/legal/legalindustry/how-att-is-using-ai-reduce-its-reliance-law-firms-2026-10-08/'},
 {'Reuters':'https://www.boursorama.com/bourse/actualites/les-cabinets-d-avocats-accordent-a-leurs-avocats-un-repit-dans-leur-routine-de-facturation-pour-leur-permettre-de-tester-l-ia-de5e439cae2cd5224177fb1c00dc03ac'},
 {'Consilium':'https://www.consilium.europa.eu/en/policies/market-integration-and-supervision-misp/'},
 {'Reuters':'https://www.marketscreener.com/news/london-court-quashes-rate-rigging-conviction-of-ex-deutsche-bank-trader-bittar-ce785ddfd08df124'},
 {'oag.ca.gov':'https://www.mass.gov/doc/2026-1708-sheppard-mullin-richter-hampton-llp/download','Law360':'https://www.law360.co.uk/employment-authority/other/articles/2535865/sheppard-mullin-hit-with-class-action-over-data-breach'},
 {'Yukon.ca':'https://yukon.ca/en/news/yukon-government-tables-yukon-firearms-act-support-responsible-firearm-owners'}
];
const categories=['AI & Technology','Business & Practice Development','Business & Practice Development','Legal Developments','Legal Developments','Business & Practice Development','Legal Developments'];
const related=[['judge-ai-errors-junior-lawyer-training-concerns','wagner-fraser-ai-courts-truth-seeking','ropes-gray-ai-training-hours'],['arceus-ai-supported-law-firm-17-million-funding','kirkland-ellis-financial-reporting-big-law','ropes-gray-ai-training-hours'],['judge-ai-errors-junior-lawyer-training-concerns','bc-court-ai-filings-access-to-justice','att-legaledge-ai-outside-counsel'],['supreme-court-canada-cross-border-bitcoin-restraint-case'],['lawyer-civility-emails-alberta-smith-2026-abca-308'],['california-sb-574-lawyers-generative-ai-law','ai-agents-canadian-government-website-transluce-report'],['quebec-oath-law-constitutional-challenge','canada-maid-mental-illness-advance-requests']];
const followups=[
 ['judge-ai-errors-junior-lawyer-training-concerns','AI errors and junior-lawyer training'],
 ['arceus-ai-supported-law-firm-17-million-funding','AI-supported legal service delivery and alternative fees'],
 ['bc-court-ai-filings-access-to-justice','the relevance and review problems raised by AI-assisted court filings'],
 ['supreme-court-canada-cross-border-bitcoin-restraint-case','cross-border jurisdiction in cryptocurrency proceedings'],
 ['lawyer-civility-emails-alberta-smith-2026-abca-308','another appellate decision concerning professional conduct'],
 ['california-sb-574-lawyers-generative-ai-law','confidentiality and lawyers’ use of generative AI'],
 ['quebec-oath-law-constitutional-challenge','a separate dispute about provincial constitutional authority']
];
const items=raw.split(/(?:^|\n)Article \d+\r?\n/).filter(s=>s.trim());
if(items.length!==7)throw Error('Expected seven articles');
const added=items.map((chunk,i)=>{
 const lines=chunk.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const headline=lines[0], meta=key=>lines.find(s=>s.startsWith(key+': ')).slice(key.length+2);
 const slug=meta('URL slug');
 const body=lines.slice(2,lines.findIndex(s=>s.startsWith('Meta title:')));
 let list=null;
 const rendered=[];
 for(let line of body){
  line=line.replace('35,000 associate hours','35,000 lawyer hours').replace('Negotiations with the European Parliament remain, following the Parliament’s adoption of its own position.','Negotiations with the European Parliament will begin once the Parliament adopts its own position.');
  if(i===5)line=line.replace('The complaint alleges that the incident exposed information belonging to at least 1,000 people.','The complaint alleges that the incident exposed personal information.');
  const marker=line.match(/^(?:- |\d+\. )/); const kind=marker?(line.startsWith('-')?'ul':'ol'):null;
  if(list!==kind){if(list)rendered.push(`</${list}>`);if(kind)rendered.push(`<${kind}>`);list=kind;}
  if(marker)line=line.slice(marker[0].length);
  let html=esc(line);
  for(const [label,url] of Object.entries(sources[i]))if(line.endsWith(label))html=html.slice(0,-esc(label).length)+`<a href="${url}">${label==='oag.ca.gov'?'Firm notification':esc(label)}</a>`;
  const heading=!marker&&line.length<100&&!/[.!?]$/.test(line)&&!Object.keys(sources[i]).some(s=>line.endsWith(s));
  rendered.push(kind?`<li>${html}</li>`:heading?`<h2>${html}</h2>`:`<p>${html}</p>`);
 }
 if(list)rendered.push(`</${list}>`);
 const [target,label]=followups[i];
 rendered.push(`<p>Related coverage: read our analysis of <a href="/news/${target}/">${esc(label)}</a>.</p>`);
 rendered.push(`<p class="tlc-primary-source"><strong>Sources:</strong> ${Object.entries(sources[i]).map(([label,url])=>`<a href="${url}">${label==='oag.ca.gov'?'Firm notification':esc(label)}</a>`).join(' · ')}${i===2?' · <a href="https://www.ropesgray.com/en/services/practices/artificial-intelligence">Ropes &amp; Gray’s AI practice information</a>':''}.</p>`);
 const html=template.replace(/<div class="tlc-article-body">[\s\S]*?<\/div>\s*<\/div>/,`<div class="tlc-article-body">${rendered.join('\n')}</div>\n</div>`);
 fs.mkdirSync(path.join('news',slug),{recursive:true});fs.writeFileSync(path.join('news',slug,'index.html'),html);
 return {...existing[0],slug,headline,seoTitle:meta('Meta title'),metaDescription:meta('Meta description'),excerpt:body[0],contentType:'analysis',category:categories[i],jurisdiction:i===0?'British Columbia, Canada':i===6?'Yukon, Canada':i===3?'European Union; Canadian implications':i===4?'England and Wales; Canadian comparison':'United States; Canadian implications',tags:[{name:meta('Primary keyword'),slug}],related:related[i],published:'2026-10-09T18:29:30Z',modified:'2026-10-09T18:29:30Z',social:{title:headline,description:meta('Meta description'),image:'/assets/the-legal-circle-social-card.png'},correctionNote:''};
});
// Editorial backlinks from established coverage, without changing the original arguments.
const reciprocal=[['judge-ai-errors-junior-lawyer-training-concerns',0],['arceus-ai-supported-law-firm-17-million-funding',1],['kirkland-ellis-financial-reporting-big-law',1],['wagner-fraser-ai-courts-truth-seeking',0],['california-sb-574-lawyers-generative-ai-law',5],['quebec-oath-law-constitutional-challenge',6],['supreme-court-canada-cross-border-bitcoin-restraint-case',3],['lawyer-civility-emails-alberta-smith-2026-abca-308',4]];
for(const [slug,i] of reciprocal){const a=existing.find(a=>a.slug===slug);a.related=[added[i].slug,...a.related.filter(s=>s!==added[i].slug)].slice(0,3);const file=`news/${slug}/index.html`;let html=fs.readFileSync(file,'utf8');const link=`<p>Related coverage: <a href="/news/${added[i].slug}/">${esc(added[i].headline)}</a>.</p>`;if(!html.includes(link))html=html.replace(/(<\/div>\s*<\/div>\s*<!-- RELATED_ARTICLES_START -->)/,link+'$1');fs.writeFileSync(file,html);}
fs.writeFileSync('news/articles.json',JSON.stringify([...added,...existing.filter(a=>!added.some(n=>n.slug===a.slug))],null,2)+'\n');
console.log('Imported seven articles with sources, editorial related selections and reciprocal links.');
