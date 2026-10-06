export function selectRelated(article, articles, now = Date.now()) {
  const eligible = articles.filter(item => item.status === 'published' && Date.parse(item.published) <= now && item.slug !== article.slug);
  const selected = [...new Set(article.related || [])].map(slug => eligible.find(item => item.slug === slug)).filter(Boolean).slice(0, 3);
  const topics = new Set(article.tags.map(tag => tag.slug));
  const scored = eligible.filter(item => !selected.some(existing => existing.slug === item.slug))
    .map(item => ({ item, score: item.tags.filter(tag => topics.has(tag.slug)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.item.published) - Date.parse(a.item.published));
  return [...selected, ...scored.map(({ item }) => item)].slice(0, 3);
}
