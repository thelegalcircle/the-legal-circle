# The Legal Circle

Static GitHub Pages copy of The Legal Circle community landing page.

## Update and redeploy

1. Edit `index.html` for content or `styles.css` for presentation.
2. Keep all publication assets inside `assets/` and use relative paths.
3. Preview the site locally before publishing.
4. Commit the changes to the `main` branch and push them to GitHub.
5. GitHub Pages redeploys automatically from the repository root.

## Publishing News & Insights

1. Copy `_templates/article.html` into `news/article-slug/index.html`.
2. Replace every `{{PLACEHOLDER}}`, add the approved article copy, author biography and sharing image.
   For `{{ARTICLE_TAG_ITEMS}}`, use plain `<li>Topic</li>` items unless a matching topic archive exists. Replace the placeholder with nothing when an article has no tags; the empty row stays hidden.
3. Keep each article at a clean directory URL such as `/news/article-slug/`.
4. Add the published article to `news/index.html` with its title, short summary, author and publication date.
5. Validate the canonical URL, metadata, Article structured data, links and mobile layout before publishing.

Do not create placeholder articles or list empty categories. The News landing page should only show article previews after genuine editorial content is approved.

The page intentionally carries `noindex, nofollow`. Do not remove that directive until indexing is explicitly approved.
