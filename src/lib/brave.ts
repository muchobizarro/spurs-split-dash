export async function fetchBraveNews() {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(
    'https://api.search.brave.com/res/v1/news/search?q=Tottenham+Hotspur',
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
  return data.results || [];
}
