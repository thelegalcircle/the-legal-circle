// One-time, source-controlled publication batch. Existing articles are never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestFile = path.join(root, 'news/articles.json');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const published = '2026-10-07T15:02:48Z';
const link = (url, text) => `<a href="${url}">${text}</a>`;
const source = (url, text) => `<p class="tlc-primary-source"><strong>Source:</strong> ${link(url, text)}.</p>`;
const drafts = [
  {
    slug: 'canadian-legal-news-october-2026',
    headline: 'Canadian Legal News Roundup: October 2026',
    seoTitle: 'Canadian Legal News Roundup: October 2026',
    metaDescription: 'Canadian legal news as of October 7, 2026: Supreme Court developments, legal regulation, Manitoba’s coercive-control proposal and merger news.',
    excerpt: 'A snapshot of October’s early legal developments, with clearly dated regulatory and court background from earlier in 2026.',
    contentType: 'news', category: 'Legal Developments', jurisdiction: 'Canada',
    tags: ['Canadian Legal News', 'Legal Regulation', 'Courts'],
    related: ['ontario-family-law-update', 'ontario-court-appeal-appointments-myers-harris-nishikawa-2026', 'supreme-court-canada-cross-border-bitcoin-restraint-case'],
    body: `<p>Welcome to the October 2026 edition of The Legal Circle’s Canadian legal news roundup: court developments, changes affecting the profession and stories worth following across practice areas. This is a snapshot as of October 7, with earlier developments identified as background rather than presented as new October events.</p>
<h2>1. Supreme Court of Canada opens its judicial year</h2>
<p>Chief Justice Richard Wagner marked the ceremonial opening on October 5. His remarks emphasized the rule of law, judicial independence and public confidence in democratic institutions, while describing a busy fall session.</p>
<p><strong>Why it matters:</strong> For litigation teams, the practical task is to follow the hearing calendar and decisions relevant to their files. A leave grant means the Court will consider an appeal, not that it has already settled the issue—as our ${link('/news/supreme-court-canada-cross-border-bitcoin-restraint-case/', 'report on the cross-border bitcoin restraint appeal')} explains.</p>
${source('https://www.scc-csc.ca/about-apropos/judges-juges/list-liste/richard-wagner/sd-2026-10-05/', 'Chief Justice Wagner’s October 5 remarks')}
<h2>2. B.C.’s single-regulator challenge moves toward an appeal</h2>
<p>The Law Society of British Columbia’s constitutional challenge to the Legal Professions Act is not a newly launched September lawsuit. The trial took place in October 2025, and the challenge was dismissed on April 29, 2026. The Law Society appealed; its published timeline lists November 16 and 17, 2026 for the appeal hearing.</p>
<p><strong>Why it matters:</strong> The dispute concerns the independence of legal regulation and the province’s move toward a single regulator. Lawyers following the debate should distinguish the legislation, the trial result and the unresolved appeal rather than treating any one stage as the final outcome.</p>
${source('https://www.lawsociety.bc.ca/news-and-engagement/news/updates-and-timeline-single-legal-regulator-legislation/', 'Law Society of B.C. litigation timeline')}
<h2>3. Alberta’s regulatory changes are September background</h2>
<p>Amendments to Alberta’s Legal Profession Act and the Regulated Professions Neutrality Act came into force September 1. In his July 9 update, Law Society president Bud Melnyk outlined the regulator’s response and reaffirmed its public-interest role.</p>
<p><strong>Why it matters:</strong> Alberta practitioners should consult the current legislation, rules and regulator guidance for the requirements that affect their work. The changes are relevant context for October, but this is not an announcement of a new October commencement date.</p>
${source('https://www.lawsociety.ab.ca/letter-from-the-president-bud-melnyk-kc-2/', 'Law Society of Alberta president’s update')}
<h2>4. FATF review recognizes work by legal regulators</h2>
<p>On September 29, the Federation of Law Societies of Canada welcomed the Financial Action Task Force’s evaluation of Canada’s anti-money laundering and terrorist financing framework. The Federation highlighted recognition of legal regulators’ preventive, supervisory, educational and disciplinary work, alongside the constitutional setting in which that regulation operates.</p>
<p><strong>Why it matters:</strong> The evaluation supplies context for compliance discussions; it does not itself create new duties for every lawyer. Check the client-identification, verification and other rules that apply in your jurisdiction rather than assuming the report automatically changes them.</p>
${source('https://flsc.ca/news/', 'Federation’s September 29 FATF statement')}
<h2>5. Manitoba proposes a limitation-period change for coercive-control claims</h2>
<p>In an October 5 announcement, Manitoba described proposed amendments to its Limitations Act that would remove limitation periods for civil claims arising from intimate partner violence involving coercive control.</p>
<p><strong>Why it matters:</strong> This is a proposal, not a statement that the change is already law. Counsel assessing historical claims should follow the bill’s progress, final wording and commencement provisions. It does not establish the limitation rules in Ontario or another province.</p>
${source('https://news.gov.mb.ca/news/print%2Cindex.html?archive=&amp;item=75598', 'Manitoba government’s October 5 announcement')}
<h2>6. Earlier case to revisit: R. v. Klayme</h2>
<p>The Nova Scotia Court of Appeal’s decision in <em>R. v. Klayme</em>, 2026 NSCA 59, dates to July 23—not October. The court found Klayme factually innocent after an investigation followed the wrong account: the relevant usernames differed by one underscore.</p>
<p><strong>Why it matters:</strong> The case is a reminder to scrutinize the technical foundation of digital evidence. An identifier, account record or search result should be tested against the original evidence, not accepted because later records appear internally consistent.</p>
${source('https://www.canlii.org/en/ns/nsca/doc/2026/2026nsca59/2026nsca59.html', 'R. v. Klayme, 2026 NSCA 59')}
<h2>7. Nortera and B&amp;G terminate the Green Giant Canada transaction</h2>
<p>Nortera’s October 6 release reports that the parties terminated their asset purchase agreement on October 5. According to the announcement, Canadian regulatory approval had not been obtained by the September 24 contractual deadline. B&amp;G continues to own and operate Green Giant Canada.</p>
<p><strong>Why it matters:</strong> For transaction counsel, the announcement illustrates the importance of regulatory conditions and outside dates. The companies’ account of a terminated agreement should not be rewritten as a final tribunal ruling or proof that the Competition Bureau formally prohibited the deal.</p>
${source('https://www.norterafoods.com/presse/bandg-foods-et-nortera-annoncent-la-resiliation-de-la-convention-dachat-dactifs-de-geant-vert-canada/', 'Nortera’s transaction announcement')}
<h2>Keep the conversation grounded in the sources</h2>
<p>If a development affects your practice, read the original decision, legislation or notice before acting. For a closer look at Ontario procedure, see our ${link('/ontario-family-law-update/', 'Ontario family law update')}.</p>
<p>Bring questions to ${link('https://www.linkedin.com/groups/40976138/', 'The Legal Circle’s LinkedIn discussion group')}, ${link('https://www.linkedin.com/newsletters/the-legal-circle-7512189166164549632/', 'follow the newsletter')} or ${link('/get-featured/', 'propose a contribution')}. This roundup is general information, not legal advice.</p>`
  },
  {
    slug: 'ontario-family-law-update',
    headline: 'Ontario Family Law Update: Key Changes in 2026',
    seoTitle: 'Ontario Family Law Update: Key Changes (2026)',
    metaDescription: 'Ontario family law changes in 2026: abusive proceedings, support arbitration awards, Toronto hearings and AI duties, with proposals distinguished from law.',
    excerpt: 'A plain-English look at Ontario family procedure in 2026—and proposals that should not be mistaken for enacted law.',
    contentType: 'explainer', category: 'Legal Developments', jurisdiction: 'Ontario, Canada',
    tags: ['Family Law', 'Ontario Courts', 'Court Procedure'],
    related: ['canadian-legal-news-october-2026', 'judge-ai-errors-junior-lawyer-training-concerns'],
    body: `<p>2026 has brought a series of changes to Ontario family procedure rather than one headline reform. This Ontario family law update reviews abusive-proceeding rules, support arbitration awards, hearing arrangements and AI responsibilities, then separates two proposals from current law. The position described is as of October 7, 2026.</p>
<h2>1. Rule 1.4 addresses frivolous, vexatious or abusive proceedings</h2>
<p><strong>What changed:</strong> Amendments under O. Reg. 310/26 added Rule 1.4 to the Family Law Rules. It permits the court, on its own initiative or on a party’s request, to stay or dismiss a case or motion that appears on its face to be frivolous, vexatious or otherwise an abuse of process.</p>
<p>The rule includes a specific procedure. For a case, a party requests an order using Form 1.4; the court can direct notice and written submissions. This is not a licence to bypass the prescribed safeguards.</p>
<p><strong>Who it affects:</strong> Lawyers and parties addressing potentially abusive litigation. A difficult or unsuccessful case is not automatically abusive.</p>
<p><strong>What to watch:</strong> How courts apply the threshold and the procedural protections in particular files.</p>
${source('https://www.ontario.ca/laws/regulation/990114', 'Family Law Rules, Rule 1.4')}
<h2>2. A filing route for family arbitration support awards</h2>
<p><strong>What changed:</strong> Order in Council 468/2026 brought the relevant Schedule 9 provisions of the <em>Cutting Red Tape, Building Ontario Act, 2024</em> into force May 1, 2026.</p>
<p>Section 59.9 of the Family Law Act permits a party entitled to enforce an arbitration award containing support or maintenance provisions to file it with the Superior Court of Justice or Family Court, with the required documents. The support provision may then be enforced as a court order. Filing does not remove the right to seek to set aside the award.</p>
<p><strong>Who it affects:</strong> Parties resolving support through family arbitration and the lawyers advising them.</p>
<p><strong>What to check:</strong> The award’s eligibility, required documentation and current forms, including Form 26D and Form 32.1. Confirm operative versions and filing requirements before submission; a form’s appearance in an online list is not a substitute for checking the legislation.</p>
${source('https://www.ontario.ca/orders-in-council/oc-4682026', 'Order in Council 468/2026')}
${source('https://www.ontario.ca/laws/statute/90f03', 'Family Law Act, section 59.9')}
${source('https://ontariocourtforms.on.ca/en/family-law-rules-forms/', 'Official Family Law Rules forms')}
<h2>3. Toronto short family motions are presumptively in person</h2>
<p><strong>What changed:</strong> Starting April 2, short family motions at the Toronto Superior Court are heard in person unless the court orders otherwise.</p>
<p>For an already scheduled matter, the official notice directs a virtual-hearing request through the Ontario Courts Public Portal <em>and</em> by email to the family trial office, copying all parties. Requests made within two weeks of the hearing will not be considered.</p>
<p><strong>Who it affects:</strong> Toronto Superior Court family practitioners and parties—not every family hearing across Ontario.</p>
<p><strong>What to check:</strong> The current notice, hearing format and any order made in the individual case. Do not assume a past virtual appearance determines the next one.</p>
${source('https://www.ontariocourts.ca/scj/news/short-family-motions-to-be-heard-in-person-in-toronto-starting-april-2-2026/', 'Superior Court’s Toronto short-motion notice')}
<h2>4. Toronto’s Integrated Domestic Violence Court has limited eligibility</h2>
<p><strong>What changed:</strong> The Ontario Court of Justice’s practice direction effective April 2 schedules qualifying criminal intimate-partner-violence cases with related OCJ family proceedings in the Integrated Domestic Violence Court at 10 Armoury Street.</p>
<p>This is not a newly invented court: the IDVC began in 2011. It coordinates specified family and criminal matters. Its jurisdiction does not include divorce, family-property division or child-protection cases.</p>
<p><strong>What to check:</strong> Both proceedings’ locations and the court’s eligibility criteria before suggesting that a client can use the integrated process.</p>
${source('https://www.ontariocourts.ca/ocj/news/practice-direction-regarding-the-integrated-domestic-violence-court/', 'OCJ practice-direction notice')}
${source('https://www.ontariocourts.ca/ocj/family-court/integrated-domestic-violence-court/', 'IDVC eligibility and jurisdiction')}
<h2>5. AI verification duties apply province-wide in Superior Court family proceedings</h2>
<p><strong>What changed:</strong> The Consolidated Provincial Practice Direction for Family Proceedings, updated March 17, addresses AI use and the responsibility of lawyers, family legal services providers and litigants for material presented to the court.</p>
<p>Its sanctions section describes a range of possible responses to failures of duty, depending on the facts. It does not mean that every AI error automatically leads to dismissal.</p>
<p><strong>Practical implication:</strong> Verify authorities and quotations, and review the reasoning—not only the formatting. Our ${link('/news/judge-ai-errors-junior-lawyer-training-concerns/', 'analysis of AI errors and junior-lawyer training')} explains why checking a filing and developing professional judgment are different tasks.</p>
${source('https://www.ontariocourts.ca/scj/filing-procedures/provincial/consolidated-provincial-practice-direction-for-family-proceedings/', 'Provincial family practice direction')}
<h2>Two proposals to watch—not enacted changes</h2>
<p><strong>Bill C-223:</strong> The federal <em>Keeping Children Safe Act</em> is a private member’s bill proposing amendments to the Divorce Act. Parliament’s status page lists it at committee consideration after second reading and referral on February 4. It is not law; check its progress and text before treating a proposed provision as a legal requirement.</p>
${source('https://www.parl.ca/legisinfo/en/bill/45-1/c-223', 'Parliament’s Bill C-223 status and text')}
<p><strong>OBA spouse-definition submission:</strong> Dated February 13, 2026—not March—the Ontario Bar Association’s submission proposes broadening the Family Law Act support definition to include former spouses, particularly addressing standing after a foreign divorce. Eligibility to bring a claim would still be distinct from proving entitlement to support. This is an Ontario reform proposal, not a nationwide change.</p>
${source('https://oba.org/Our-Impact/Submissions/Proposed-Amendment-to-the-Definition-of-Spouse-in-the-Family-Law-Act', 'OBA’s proposed spouse-definition amendment')}
<h2>The practical takeaway</h2>
<p>Check the applicable rule, the hearing format, the court’s jurisdiction and the current documents before taking the next procedural step. Separate proposals from law and professional commentary from the operative source.</p>
<p>For broader developments, read the ${link('/canadian-legal-news-october-2026/', 'October Canadian legal news roundup')}. This update is general information, not advice about an individual family dispute.</p>`
  },
  {
    slug: 'best-lawyer-communities-canada-2026',
    headline: '13 Best Lawyer Communities in Canada (2026)',
    seoTitle: '13 Best Lawyer Communities in Canada (2026)',
    metaDescription: 'Explore 13 lawyer communities in Canada, from bar associations to free networks. Compare audiences, membership models and practical fit for your career.',
    excerpt: 'Compare professional associations, focused networks and informal communities by audience, cost and the kind of connection you want.',
    contentType: 'explainer', category: 'Business & Practice Development', jurisdiction: 'Canada',
    tags: ['Lawyer Communities', 'Professional Networking', 'Practice Development'],
    related: ['law-firm-referral-marketing-tax-lawyers', 'personal-branding-lawyers-reputation-beyond-firm'],
    body: `<p>Every lawyer needs people who understand the work: peers to trade notes with, mentors who have seen a problem before and a place to discuss professional growth. This guide to 13 lawyer communities in Canada compares broad associations, focused networks and informal groups so you can choose by fit rather than prestige alone.</p>
<p><strong>Editorial disclosure:</strong> The Legal Circle publishes this guide and operates the first community listed. “Best” describes possible fits for different needs, not an independent ranking, exhaustive survey or claim that one organization is objectively superior. The numbered order is a reading guide. Fees and benefits below reflect available official information checked October 7, 2026; confirm eligibility, taxes, current fees and event availability before joining.</p>
<h2>1. The Legal Circle — open professional conversation</h2>
<p><strong>Who it’s for:</strong> Lawyers, paralegals, notaries and other legal professionals interested in legal developments, visibility and practice growth.</p>
<p><strong>Cost:</strong> Reading the website and joining the LinkedIn discussion group or newsletter are free. Any future ticketed gathering would have its own booking terms.</p>
<p><strong>What it offers:</strong> Published news and analysis, a LinkedIn discussion space and opportunities to propose articles, expert commentary or interviews. Podcasts, webinars and speaking sessions are future possibilities, not established programmes presented as already running.</p>
<p><strong>Consider:</strong> This is a developing community, not a regulator or substitute for accredited professional education. Do not assume participation earns CPD credit.</p>
<p>${link('https://www.linkedin.com/groups/40976138/', 'Join the discussion')} · ${link('https://www.linkedin.com/newsletters/the-legal-circle-7512189166164549632/', 'Follow the newsletter')} · ${link('/get-featured/', 'Propose a contribution')}</p>
<h2>2. Ontario Bar Association — Ontario-wide professional involvement</h2>
<p><strong>Who it’s for:</strong> Ontario legal professionals seeking practice-area sections, professional development and opportunities to contribute to policy discussions.</p>
<p><strong>Published fees:</strong> The official page lists $692.75 plus tax for experienced full-time practitioners, $374.75 plus tax for eligible part-time practitioners and $333.60 plus tax for lawyers in their first three years of call. Eligible law students and NCA candidates have a no-cost category.</p>
<p><strong>Consider:</strong> Choose sections and events you will actually use. Access to programming does not mean every programme is included in the membership fee.</p>
${source('https://www.oba.org/membership/fee-and-benefits/', 'OBA membership fees and benefits')}
<h2>3. Canadian Bar Association — a national network</h2>
<p><strong>Who it’s for:</strong> Lawyers looking for connections across jurisdictions, national sections, advocacy and professional resources.</p>
<p><strong>Cost:</strong> Check the membership category and provincial or territorial branch. In Ontario, the OBA is the CBA’s branch: these are connected memberships, not two independent subscriptions you necessarily need to buy.</p>
<p><strong>Consider:</strong> A broad network works best when you identify a section, committee or activity relevant to your practice.</p>
${source('https://www.cba.org/', 'Canadian Bar Association')}
<h2>4. Inn Laws — curated discussions about running a practice</h2>
<p><strong>Who it’s for:</strong> Firm owners, partners and associates interested in practice-building, technology and peer problem-solving.</p>
<p><strong>Published price:</strong> $130 per month, or $96 per month paid annually. Confirm tax, billing and cancellation terms directly.</p>
<p><strong>What it offers:</strong> Curated peer groups, AI training and technology consulting. The community is built around running a practice rather than serving as a general legal research resource.</p>
<p><strong>Consider:</strong> Ask about the application process, group fit and time commitment before paying.</p>
${source('https://innlaws.ca/', 'Inn Laws membership information')}
<h2>5. Toronto Lawyers Association — local professional connections</h2>
<p><strong>Who it’s for:</strong> Lawyers whose work and professional relationships are centred in Toronto.</p>
<p><strong>What it offers:</strong> A courthouse library, education, networking events and advocacy. Programmes and events can have separate prices.</p>
<p><strong>Cost:</strong> Consult the association for the current membership category and any new-call or candidate concessions; this guide does not rely on an unverified 2026 fee.</p>
<p><strong>Consider:</strong> Local access may be particularly useful if you regularly practise in Toronto. Location and actual participation matter more than membership alone.</p>
${source('https://www.tlaonline.ca/', 'Toronto Lawyers Association')}
<h2>6. Canadian Defence Lawyers — civil-defence practice</h2>
<p><strong>Who it’s for:</strong> Civil-defence counsel seeking a practice-focused professional network.</p>
<p><strong>What it offers:</strong> Defence-oriented education, committees and opportunities to connect with colleagues working on similar disputes.</p>
<p><strong>Cost:</strong> Check the organization’s current membership rates and the benefits included in your category.</p>
<p><strong>Consider:</strong> Its subject focus is the advantage for defence practitioners; it is not a general community for every practice area.</p>
${source('https://www.cdlawyers.org/index.asp', 'Canadian Defence Lawyers')}
<h2>7. Counselwell — an in-house community with free and paid tiers</h2>
<p><strong>Who it’s for:</strong> In-house lawyers interested in peer discussion, professional resources and events.</p>
<p><strong>Published plans:</strong> Core is free; Premium is listed at $500 per year. The free tier has limits, including up to two standard events annually subject to availability. Special events can require tickets.</p>
<p><strong>Consider:</strong> Compare the current plans rather than assuming that every event, mentoring feature or recording is free.</p>
${source('https://www.counselwell.ca/', 'Counselwell membership plans')}
<h2>8. ITL Network — internationally trained legal professionals</h2>
<p><strong>Who it’s for:</strong> Internationally trained lawyers and graduates at different career stages, alongside mentors and allies.</p>
<p><strong>What it offers:</strong> Mentorship, licensing guidance, career resources and professional networking, including the ITL Conference.</p>
<p><strong>Cost:</strong> Confirm the available plan during membership enquiry; an unconfirmed annual fee is not quoted here.</p>
<p><strong>Consider:</strong> The network supports the licensing journey but does not make licensing decisions. Its stated audience also includes established practitioners, not only newcomers.</p>
${source('https://itlnetwork.ca/', 'ITL Network’s mission and membership information')}
<h2>9. Federation of Asian Canadian Lawyers — chapter-based community</h2>
<p><strong>Who it’s for:</strong> Asian Canadian legal professionals interested in inclusion, advocacy, career support and community.</p>
<p><strong>Ontario pricing:</strong> FACL Ontario lists a one-year full membership at $50 and student membership as free. Other chapters may have different fees and programmes.</p>
<p><strong>What it offers:</strong> Mentorship, networking, member resources and reduced event pricing.</p>
<p><strong>Consider:</strong> Check the relevant chapter rather than applying a British Columbia fee to an Ontario membership.</p>
${source('https://on.facl.ca/become-a-member/', 'FACL Ontario membership')}
<h2>10. Toronto Legal Hackers — law and technology meetups</h2>
<p><strong>Who it’s for:</strong> Lawyers, technologists, academics and others interested in the intersection of law and technology.</p>
<p><strong>What it offers:</strong> A self-organized meetup community with a history of discussions and workshops.</p>
<p><strong>Cost and availability:</strong> Check the group and individual event listing. Its public page showed past events but no upcoming event in the listing reviewed, so this guide does not promise regular current in-person meetings.</p>
<p><strong>Consider:</strong> An informal discussion group is different from a structured membership programme or accredited course.</p>
${source('https://www.meetup.com/toronto-legal-hackers/', 'Toronto Legal Hackers event listing')}
<h2>11. NCA Network — connections along the licensing journey</h2>
<p><strong>Who it’s for:</strong> Internationally trained legal professionals building a Canadian career.</p>
<p><strong>What it offers:</strong> The network describes support through mentorship, shared experiences and professional connections.</p>
<p><strong>Cost:</strong> Confirm current membership and event terms directly; no unverified event fee is quoted here.</p>
<p><strong>Consider:</strong> This community is separate from the National Committee on Accreditation. Use the NCA and relevant law society for authoritative assessment and licensing requirements.</p>
${source('https://ncanetwork.com/', 'NCA Network')}
<h2>12. Lawyers Networking Society — career-path conversation</h2>
<p><strong>Who it’s for:</strong> Prospective practitioners and internationally trained lawyers exploring Canadian career pathways.</p>
<p><strong>What is visible:</strong> Its public LinkedIn posts discuss routes such as articling and Ontario’s Law Practice Program.</p>
<p><strong>Cost and availability:</strong> Contact the organizers for current activities and participation terms. This guide does not assert an unverified free-membership offer, founding date or event schedule.</p>
<p><strong>Consider:</strong> Peer accounts can help you identify questions; they do not replace official licensing guidance.</p>
${source('https://www.linkedin.com/posts/lawyers-networking-society_lpp-articling-lawpracticeprogram-activity-7343312740402216960-oW20', 'Lawyers Networking Society’s career-path discussion')}
<h2>13. CBA In-House Lawyers — the in-house professional network</h2>
<p><strong>Who it’s for:</strong> In-house and government counsel seeking a broader professional association and in-house-focused resources.</p>
<p><strong>Membership:</strong> OBA’s in-house category lists $374.75–$692.75 plus tax and says CBA membership automatically includes the Canadian Corporate Counsel Association. Check the current CBA In-House offering and category rather than assuming a separate fee is necessary.</p>
<p><strong>Consider:</strong> Compare the professional-development and association benefits with informal peer communities; they serve different needs.</p>
${source('https://www.oba.org/membership/fee-and-benefits/', 'OBA’s in-house membership category')}
<h2>How to choose the right community</h2>
<p>Start with the connection you want: a local colleague, a mentor, a practice-area discussion, licensing support or a place to develop professional visibility. Then check eligibility, current activity, total cost and what membership actually includes.</p>
<p>A paid association and a free discussion group can complement each other. Neither membership nor a directory listing guarantees clients, referrals or career growth. Confirm any claimed CPD accreditation with the provider and your regulator.</p>
<p>For practical follow-up, explore ${link('/news/law-firm-referral-marketing-tax-lawyers/', 'how professional relationships support referral marketing')} and ${link('/news/personal-branding-lawyers-reputation-beyond-firm/', 'building a professional reputation beyond your firm’s name')}. You can also ${link('https://www.linkedin.com/groups/40976138/', 'join The Legal Circle’s discussion group')} and help shape future conversations.</p>`
  }
];
for (const draft of drafts) {
  if (manifest.some(article => article.slug === draft.slug)) throw new Error(`Already exists: ${draft.slug}`);
  const { body, ...fields } = draft;
  const article = {
    ...fields, path: `/${draft.slug}/`, status: 'published',
    tags: draft.tags.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })),
    author: { name: 'The Legal Circle', type: 'Organization', url: 'https://thelegalcircle.ca/editorial/' },
    published, modified: published,
    featuredImage: { url: '/assets/the-legal-circle-social-card.png', alt: 'The Legal Circle — Connect. Contribute. Grow.', width: 1200, height: 630, showInArticle: false },
    social: { title: draft.headline, description: draft.metaDescription, image: '/assets/the-legal-circle-social-card.png' },
    correctionNote: ''
  };
  const dir = path.join(root, draft.slug);
  if (fs.existsSync(dir)) throw new Error(`Refusing to overwrite ${dir}`);
  const readingTime = Math.ceil(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 220);
  let html = fs.readFileSync(path.join(root, '_templates/article.html'), 'utf8');
  html = html.replace(/<!--[^]*?-->/g, comment => comment.includes('FEATURED_IMAGE_') || comment.includes('RELATED_ARTICLES_') ? comment : '');
  html = html.replace(/<div class="tlc-article-body">[\s\S]*?<\/div>/, () => `<div class="tlc-article-body">\n${body}\n          </div>`);
  html = html.replace('{{READING_TIME}}', String(readingTime));
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  manifest.unshift(article);
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
console.log('Created the three reviewed articles. Run news:publish-check to generate metadata and archives.');
