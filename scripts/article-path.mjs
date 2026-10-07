// Existing articles retain /news/ URLs; an editorially specified path is optional.
export function articlePath(article) {
  const value = article.path || `/news/${article.slug}/`;
  if (!/^\/(?:[a-z0-9-]+\/)+$/.test(value)) throw new Error(`Invalid article path: ${value}`);
  return value;
}
