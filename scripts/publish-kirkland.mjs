import fs from 'node:fs';
const slug = 'kirkland-ellis-financial-reporting-big-law';
const headline = 'Kirkland & Ellis Ends Voluntary Financial Reporting: What Big Law Loses When the Numbers Disappear';
const description = 'Kirkland & Ellis will stop voluntarily sharing revenue and profit figures. What the decision means for rankings, recruitment and client comparisons.';
const report = 'https://news.bloomberglaw.com/business-and-practice/kirkland-goes-dark-on-reporting-revenue-and-profits-to-media';
const ft = 'https://www.ft.com/content/7380c978-9b65-4a07-8ce3-bdf88f2484d1';
const body = `<p>The law firm at the top of Big Law’s revenue rankings is stepping away from supplying the figures that help construct them.</p>
<p>Kirkland &amp; Ellis told <em>The American Lawyer</em> that 2026 would be its final year voluntarily providing financial information to industry publications. The decision also covers other outlets reporting on law firm economics, according to Bloomberg Law’s review of the firm’s letter. <a href="${report}">Bloomberg Law reporting</a>.</p>
<p>This is a disclosure decision, not a change in legal reporting requirements. It also does not mean journalists will stop estimating the firm’s performance or including it in rankings.</p>
<p>It changes the source of the information.</p>
<h2>Kirkland’s argument: financial rankings miss client value</h2>
<p>The firm’s stated position is that public revenue and profit reporting offers little meaningful value to clients and inadequately reflects legal service quality. It also argues that rankings can encourage attention to quantitative measures over qualitative strengths and client outcomes. <a href="${report}">Bloomberg Law reporting</a>.</p>
<p>There is an important distinction here.</p>
<p>A revenue figure describes economic scale. It does not establish whether a particular team is suitable for a client’s matter. Average profit per equity partner does not tell a client how effectively a file will be staffed or whether the proposed fee represents good value.</p>
<p>Financial success and service quality answer different questions.</p>
<h2>The figures still have other uses</h2>
<p>The Financial Times reported that Kirkland’s 2025 results included approximately US$10.6 billion in revenue and US$11.1 million in average profit per equity partner. Those figures help explain why its withdrawal attracts attention: a major benchmark is becoming less directly observable. <a href="${ft}">Financial Times reporting</a>.</p>
<p>For lawyers considering a move, financial information can provide context for questions about compensation, investment and the firm’s business model.</p>
<p>For firm leaders, it can help frame comparisons about scale and economics. For clients, it may inform procurement discussions, even though it cannot establish the quality or value of a specific engagement.</p>
<p>These are analytical uses of the information. None makes a ranking a complete assessment of a firm.</p>
<h2>Less voluntary disclosure creates a source problem</h2>
<p>Public rankings already require readers to understand what is being measured. With less information supplied directly by firms, the distinction between reported and estimated figures becomes more important.</p>
<p>An estimate may be useful. Its reliability depends on the evidence and methodology behind it.</p>
<p>Readers should therefore ask whether a number came from the firm, independent reporting or a calculation based on incomplete information. They should also avoid treating minor differences between figures as meaningful when the underlying methods vary.</p>
<p>The effect of Kirkland’s decision will depend partly on whether other firms follow and how publications respond.</p>
<h2>What Canadian firms can take from the debate</h2>
<p>For Canadian legal professionals, the story raises a practical question about how firms demonstrate strength.</p>
<p>A firm that rejects financial rankings still needs credible ways to explain its capabilities. That may include relevant experience, team depth, service delivery and substantiated evidence of client value.</p>
<p>Likewise, a prospective lateral partner should ask about the economics relevant to their own position rather than relying on a headline average. A client should assess the proposed team and engagement, not assume the highest-grossing firm is automatically the best fit.</p>
<p>Financial transparency can be useful without becoming the profession’s sole definition of success.</p>
<p><strong>Removing the numbers does not remove the need for evidence of value.</strong></p>
<p class="tlc-primary-source"><strong>Sources:</strong> <a href="${report}">Bloomberg Law’s reporting on the firm’s letter</a> and <a href="${ft}">Financial Times reporting</a>.</p>`;
const manifest = JSON.parse(fs.readFileSync('news/articles.json','utf8'));
if (manifest.some(a=>a.slug===slug)) throw new Error('Article already exists');
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
manifest.unshift({slug,headline,seoTitle:'Kirkland Ends Financial Reporting: What It Means for Big Law',metaDescription:description,excerpt:'Kirkland’s withdrawal from voluntary financial disclosures raises questions about rankings, recruitment and the evidence firms use to demonstrate client value.',contentType:'analysis',category:'Business & Practice Development',jurisdiction:'United States; Canadian implications',tags:[{name:'Law Firm Economics',slug:'law-firm-economics'},{name:'Big Law',slug:'big-law'},{name:'Client Value',slug:'client-value'}],related:['law-firm-positioning-services-client-understanding'],status:'published',author:{name:'The Legal Circle',type:'Organization',url:'https://thelegalcircle.ca/editorial/'},published:timestamp,modified:timestamp,featuredImage:{url:'/assets/the-legal-circle-social-card.png',alt:'The Legal Circle — Connect. Contribute. Grow.',width:1200,height:630,showInArticle:false},social:{title:headline,description,image:'/assets/the-legal-circle-social-card.png'},correctionNote:''});
let html = fs.readFileSync('_templates/article.html','utf8');
html = html.replace(/<!--[^]*?-->/g,c=>c.includes('FEATURED_IMAGE_')||c.includes('RELATED_ARTICLES_')?c:'');
html = html.replace(/<div class="tlc-article-body">[\s\S]*?<\/div>/,()=>`<div class="tlc-article-body">${body}</div>`).replace('{{READING_TIME}}',String(Math.ceil(body.replace(/<[^>]+>/g,' ').split(/\s+/).length/220)));
fs.mkdirSync(`news/${slug}`);
fs.writeFileSync(`news/${slug}/index.html`,html);
manifest[0].related = ['law-firm-positioning-clear-client-services'];
fs.writeFileSync('news/articles.json',JSON.stringify(manifest,null,2)+'\n');
