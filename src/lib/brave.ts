interface BraveResultItem {
  title: string;
  url: string;
  description: string;
  age: string;
  source?: string;
  meta_url?: { name: string };
}

export async function fetchBraveNews(query: string = 'Tottenham Hotspur') {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return [];

  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `https://api.search.brave.com/res/v1/news/search?q=${encodedQuery}`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    }
  );

  if (!response.ok) {
    console.warn(`Brave API responded with status: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return (data.results || []).map((item: BraveResultItem) => ({
    title: item.title,
    url: item.url,
    description: item.description,
    published_time: item.age,
    source: item.source || item.meta_url?.name || 'Brave News',
  }));
}
