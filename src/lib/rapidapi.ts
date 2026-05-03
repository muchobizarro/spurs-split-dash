export async function fetchTeamStats(teamId: string) {
  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) return null;

  // Map teamId to SportAPI7 specific IDs, Tournaments and seasons (Updated for 2026)
  const isMen = teamId === '33' || teamId === '47';
  const sportApiId = isMen ? '33' : '273547';
  const tournamentId = isMen ? '17' : '1044';
  const seasonId = isMen ? '76986' : '79227';

  // Correct SportAPI7 endpoint format
  const url = `https://sportapi7.p.rapidapi.com/api/v1/team/${sportApiId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;
  
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
      console.warn(`RapidAPI responded with status: ${response.status} for team ${sportApiId}`);
      return null;
    }
    const data = await response.json();
    
    if (!data.statistics) return null;

    // Map SofaScore statistics to the format expected by DeepStats component
    return {
      goalsScored: data.statistics.goalsScored,
      goalsConceded: data.statistics.goalsConceded,
      cleanSheets: data.statistics.cleanSheets,
      avgBallPossession: data.statistics.averageBallPossession,
      matchesPlayed: data.statistics.matchesPlayed
    };
  } catch (error) {
    console.error('RapidAPI Error:', error);
    return null;
  }
}
