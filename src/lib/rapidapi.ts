export async function fetchTeamStats(teamId: string) {
  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) return null;

  // Map teamId to SportAPI7 specific IDs and seasons
  // For Spurs Men (33 in SportAPI7, but maybe passed as 47 from API-Football)
  const isMen = teamId === '33' || teamId === '47';
  const sportApiId = isMen ? '33' : '273547';
  const seasonId = isMen ? '66441' : '71101';

  const url = `https://sportapi7.p.rapidapi.com/api/v1/team/${sportApiId}/statistics/season/${seasonId}`;
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
