import fs from 'node:fs';
const slug = 'canada-maid-mental-illness-advance-requests';
const headline = 'Canada Plans MAID Changes: Mental Illness Exclusion and Advance Requests';
const description = 'Canada proposes an indefinite mental-illness-only MAID exclusion and advance requests. What lawyers should know before legislation is introduced.';
const manifest = JSON.parse(fs.readFileSync('news/articles.json', 'utf8'));
if (manifest.some(a => a.slug === slug)) throw new Error('Article already exists');
const body = `<p>Canada is proposing to close one route to medical assistance in dying while opening another. For lawyers, the distinction matters: the government has announced its intended direction, but Parliament has not yet changed the law.</p>
<p>On October 7, the federal government announced plans to indefinitely exclude people whose sole underlying medical condition is mental illness from MAID eligibility. It also proposed allowing advance requests for people diagnosed with serious illnesses who may later lose decision-making capacity, with implementation left to provinces. <a href="https://apnews.com/article/6c3609738d1756541279f1eb1ca45b33">Associated Press reporting</a>.</p>
<p>The two proposals address different questions. The first concerns eligibility. The second concerns how a qualifying person’s wishes could operate after they lose the ability to consent.</p>
<h2>An announcement does not change eligibility</h2>
<p>The existing federal framework excludes mental illness as the sole underlying condition until March 17, 2027. The proposed indefinite exclusion would replace that scheduled endpoint if enacted. Lawyers should distinguish the announced policy from the rules currently governing assessments and treatment. <a href="https://www.canada.ca/en/health-canada/services/health-services-benefits/medical-assistance-dying.html">Health Canada’s MAID overview</a>.</p>
<p>The word “sole” is essential. The proposal should not be described as a blanket exclusion of everyone who has a mental illness. Its stated focus is people whose only underlying medical condition is mental illness.</p>
<p>Similarly, an announced intention to permit advance requests does not make a newly drafted instruction legally sufficient to authorize MAID. The eventual legislation, safeguards and implementation arrangements will determine what is possible.</p>
<h2>Advance requests raise questions beyond drafting</h2>
<p>The legal challenge extends beyond recording someone’s wishes clearly.</p>
<p>An advance-request framework would need to address how practitioners determine that the specified circumstances have arisen, how they interpret ambiguous instructions and what significance they give to the person’s behaviour after capacity is lost.</p>
<p>Those are issues of interpretation, evidence and clinical assessment. A carefully written document may still leave difficult questions when the person’s later circumstances differ from what they anticipated.</p>
<p>For lawyers advising on future-care planning, this makes the statutory details particularly important. An advance MAID request should not be casually equated with an ordinary advance-care directive.</p>
<h2>Provincial implementation will matter</h2>
<p>The proposed provincial discretion introduces another layer. Federal criminal-law changes could establish circumstances in which practitioners are protected, while provincial implementation determines whether and how the service becomes available. The announcement therefore points toward potentially different access across Canada. <a href="https://www.torontotoday.ca/local/health/mental-illness-maid-government-exclusion-12868347">TorontoToday reporting</a>.</p>
<p>For counsel, the practical consequence is that a national policy announcement cannot replace jurisdiction-specific advice.</p>
<h2>The constitutional questions remain open</h2>
<p>As legal analysis, an indefinite exclusion could invite arguments about equality, autonomy and the protection of vulnerable people. Those arguments would need to be assessed against the enacted text and the evidence supporting it.</p>
<p>The announcement establishes neither a Charter violation nor a constitutional defence. It identifies a policy choice whose legal justification may eventually be contested.</p>
<p>Lawyers should now monitor three things: the bill’s actual eligibility language, the safeguards governing advance requests, and the relationship between federal protection and provincial delivery.</p>
<p><strong>The government has announced a direction. The legal consequences will depend on the text.</strong></p>`;
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
manifest.unshift({slug,headline,seoTitle:'Canada MAID Changes: Mental Illness and Advance Requests',metaDescription:description,excerpt:'Canada’s proposed MAID changes concern eligibility and advance requests. The announced direction is not yet a change to federal law.',contentType:'analysis',category:'Legal Developments',jurisdiction:'Canada',tags:[{name:'Medical Assistance in Dying',slug:'medical-assistance-in-dying'},{name:'Health Law',slug:'health-law'},{name:'Legislative Proposals',slug:'legislative-proposals'}],related:[],status:'published',author:{name:'The Legal Circle',type:'Organization',url:'https://thelegalcircle.ca/editorial/'},published:timestamp,modified:timestamp,featuredImage:{url:'/assets/the-legal-circle-social-card.png',alt:'The Legal Circle — Connect. Contribute. Grow.',width:1200,height:630,showInArticle:false},social:{title:headline,description,image:'/assets/the-legal-circle-social-card.png'},correctionNote:''});
let html = fs.readFileSync('_templates/article.html','utf8');
html = html.replace(/<!--[^]*?-->/g,c=>c.includes('FEATURED_IMAGE_')||c.includes('RELATED_ARTICLES_')?c:'');
html = html.replace(/<div class="tlc-article-body">[\s\S]*?<\/div>/,()=>`<div class="tlc-article-body">${body}<p class="tlc-primary-source"><strong>Primary source:</strong> <a href="https://www.canada.ca/en/health-canada/services/health-services-benefits/medical-assistance-dying.html">Health Canada’s medical assistance in dying overview</a>.</p></div>`).replace('{{READING_TIME}}',String(Math.ceil(body.replace(/<[^>]+>/g,' ').split(/\s+/).length/220)));
fs.mkdirSync(`news/${slug}`);
fs.writeFileSync(`news/${slug}/index.html`,html);
fs.writeFileSync('news/articles.json',JSON.stringify(manifest,null,2)+'\n');
