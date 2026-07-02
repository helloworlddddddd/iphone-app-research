const RSS_BASE = 'https://itunes.apple.com/jp/rss/toppaidapplications'

type RssEntry = { id: { attributes: { 'im:id': string } } }
type RssFeedResponse = { feed: { entry: RssEntry[] } }

export async function fetchRankingIds(genreId: number, limit = 200): Promise<number[]> {
  const url = `${RSS_BASE}/limit=${limit}/genre=${genreId}/json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${url}`)
  const data: RssFeedResponse = await res.json()
  return data.feed.entry.map((e) => parseInt(e.id.attributes['im:id'], 10))
}
