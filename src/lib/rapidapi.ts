export async function fetchTeamStats(teamId: string) {
  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) return null;

  const url = `https://sportapi7.p.rapidapi.com/api/v1/team/${teamId}/statistics/season/61627`; // Example season ID
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'sportapi7.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`RapidAPI responded with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.statistics || null;
  } catch (error) {
    console.error('RapidAPI Error:', error);
    return null;
  }
}
