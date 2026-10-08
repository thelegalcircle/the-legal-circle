import fs from 'node:fs';
const slug = 'quebec-oath-law-constitutional-challenge';
const headline = 'Quebec’s Oath Law Faces Injunction Request: A Constitutional Dispute Beyond the Monarchy';
const description = 'An injunction request challenges Quebec’s legislative oath law. The dispute raises constitutional amendment and interim-relief questions.';
const report = 'https://www.canadianlawyermag.com/news/general/legal-org-applies-for-injunction-to-force-quebec-lawmakers-to-pledge-allegiance-to-the-king/394768';
const filing = 'https://cdn-res.keymedia.com/cms/files/cl/jess_639270031638498596.pdf';
const body = `<p>Can a province change the constitutional conditions for taking a seat in its legislature?</p>
<p>That is the question beneath a new request concerning Quebec’s oath law. The Public Interest Litigation Institute has asked Quebec Superior Court for interim relief concerning the oath of allegiance to the monarch despite legislation adopted in 2022. Specifically, the applicants seek a stay of the law and section 128Q.1 pending the underlying constitutional challenge. The request follows the provincial election and seeks relief before the National Assembly reconvenes on November 17. <a href="${report}">Canadian Lawyer reporting</a>.</p>
<p>The dispute is politically charged, but its legal significance extends beyond attitudes toward the Crown. It concerns constitutional amendment authority and the conditions under which elected representatives may participate in legislative proceedings.</p>
<h2>What the applicant argues</h2>
<p>The institute relies on section 128 of the Constitution Act, 1867. It contends that Quebec’s legislation could not validly remove the oath requirement and that members who do not take it would fail to satisfy a constitutional condition for participating in the Assembly.</p>
<p>Those are the applicant’s arguments, not judicial findings. Quebec’s attorney general has said the province intends to defend the legislation’s validity. <a href="${report}">Canadian Lawyer reporting</a>.</p>
<p>The institute’s filed application is available publicly. It provides the primary source for the relief requested and the allegations supporting it. <a href="${filing}">Read the application for an order staying application (PDF)</a>.</p>
<h2>The amendment question is central</h2>
<p>At its core, the case asks where provincial authority over its own constitutional arrangements ends.</p>
<p>A legislature’s power to organize its affairs does not, by itself, resolve whether it can alter a particular requirement found in Canada’s constitutional text. Conversely, identifying a requirement in that text does not complete the analysis of which amendment procedure applies.</p>
<p>The court will need to examine the relevant provisions and arguments. The political symbolism of the oath cannot substitute for that work.</p>
<p>For constitutional practitioners, this makes the dispute useful beyond its immediate subject: it tests how a contested provincial change should be characterized within the constitutional framework.</p>
<h2>Interim relief presents a separate problem</h2>
<p>The requested interim stay adds an urgent procedural question to the underlying challenge.</p>
<p>A court considering interim relief must address what should happen before the merits are finally decided. Here, either course could have institutional consequences.</p>
<p>An order affecting participation in legislative proceedings could disrupt the operation of an elected body. Refusing relief could, according to the applicant’s theory, allow members to participate without satisfying a constitutional requirement.</p>
<p>That tension is analysis of the dispute, not a prediction of how the court will rule.</p>
<h2>What has—and has not—happened</h2>
<p>The filing begins a request for judicial intervention. It does not establish that the law is invalid, that elected members are disqualified or that legislative votes will be ineffective.</p>
<p>Coverage should preserve those distinctions. A challenged law remains a challenged law until a court grants relevant relief or decides its validity.</p>
<p>Lawyers following the proceeding should separate the underlying constitutional action from the interim-relief request, examine the precise order sought and avoid treating the applicant’s description of consequences as settled law.</p>
<p>The case’s broader importance lies in who has authority to alter a constitutional condition—and through which process.</p>
<p><strong>The oath carries symbolism. The court must decide the legal authority behind changing it.</strong></p>
<p class="tlc-primary-source"><strong>Primary source:</strong> <a href="${filing}">Filed application for a stay, Quebec Superior Court, No. 500-17-139512-266 (PDF)</a>.</p>`;
const manifest = JSON.parse(fs.readFileSync('news/articles.json','utf8'));
if (manifest.some(a=>a.slug===slug)) throw new Error('Article already exists');
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
manifest.unshift({slug,headline,seoTitle:'Quebec Oath Law Challenge: Constitutional Issues Explained',metaDescription:description,excerpt:'A request for interim relief over Quebec’s oath law raises questions about constitutional amendment authority and participation in legislative proceedings.',contentType:'analysis',category:'Legal Developments',jurisdiction:'Quebec, Canada',tags:[{name:'Constitutional Law',slug:'constitutional-law'},{name:'Interim Relief',slug:'interim-relief'},{name:'Quebec',slug:'quebec'}],related:[],status:'published',author:{name:'The Legal Circle',type:'Organization',url:'https://thelegalcircle.ca/editorial/'},published:timestamp,modified:timestamp,featuredImage:{url:'/assets/the-legal-circle-social-card.png',alt:'The Legal Circle — Connect. Contribute. Grow.',width:1200,height:630,showInArticle:false},social:{title:headline,description,image:'/assets/the-legal-circle-social-card.png'},correctionNote:''});
let html = fs.readFileSync('_templates/article.html','utf8');
html = html.replace(/<!--[^]*?-->/g,c=>c.includes('FEATURED_IMAGE_')||c.includes('RELATED_ARTICLES_')?c:'');
html = html.replace(/<div class="tlc-article-body">[\s\S]*?<\/div>/,()=>`<div class="tlc-article-body">${body}</div>`).replace('{{READING_TIME}}',String(Math.ceil(body.replace(/<[^>]+>/g,' ').split(/\s+/).length/220)));
fs.mkdirSync(`news/${slug}`);
fs.writeFileSync(`news/${slug}/index.html`,html);
fs.writeFileSync('news/articles.json',JSON.stringify(manifest,null,2)+'\n');
