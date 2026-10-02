# News publishing checklist

The News pages are static HTML. Search metadata, article structured data, News cards, related stories, category archives and both sitemaps are generated from `news/articles.json`.

## Publish an article

1. Copy `_templates/article.html` to `news/<stable-slug>/index.html`.
2. Write the article body and preserve one H1 followed by logical H2/H3 headings.
3. Add one record to `news/articles.json` with:
   - `status`: use `draft` until approved, then `published`;
   - headline, SEO title, meta description, stable slug and short excerpt;
   - content type: `news`, `analysis`, `opinion`, `explainer` or `interview`;
   - one approved primary category and optional tags;
   - genuine author name, type and biography/editorial URL;
   - confirmed publication and modification dates;
   - jurisdiction where relevant;
   - image URL, descriptive alternative text, width and height;
   - social title, description and image;
   - genuinely relevant related article slugs;
   - a correction note only when one is required.
4. Add and verify primary-source links in the article body. Never invent a source, author, credential or image.
5. Run `npm run news:publish-check`.
6. Review the rendered News index, article, related links, category archive and mobile layout before committing.

The GitHub workflow repeats the build and validation when the manifest changes. It also refreshes `news-sitemap.xml` daily so only eligible news published today or yesterday remains in the Google News sitemap. Older articles stay in the regular sitemap and site navigation.

## Editorial review before publication

- Explain what happened and why it matters.
- Confirm the jurisdiction and the event date.
- Check and link primary sources.
- Include original explanation or a clearly attributed expert perspective.
- Confirm the institutional or personal byline and publication details.
- Use a unique headline, SEO title, meta description and excerpt.
- Provide a suitable image and descriptive alternative text when available.
- Select only genuinely relevant related articles.
- Label reporting, analysis, opinion, explainers and interviews accurately.

If an exact publication time or article-specific image is unavailable, do not invent it. Use the confirmed date and approved branded sharing image, then record the missing asset for editorial follow-up.
