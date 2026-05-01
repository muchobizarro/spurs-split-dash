export interface Fixture {
  id: number;
  date: string;
  venue: {
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
  homeTeam: {
    name: string;
    logo: string;
    winner: boolean | null;
  };
  awayTeam: {
    name: string;
    logo: string;
    winner: boolean | null;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export async function fetchNextMatch(teamId: string): Promise<Fixture | null> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;

  // We fetch next 1 and last 1 to see if there's a live game or just the next one
  // API-Football next=1 returns the next match that is NOT STARTED or LIVE
  const url = `https://v3.football.api-sports.io/fixtures?team=${teamId}&next=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) {
      console.warn(`API-Football responded with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const fixture = data.response?.[0];

    if (!fixture) return null;

    return {
      id: fixture.fixture.id,
      date: fixture.fixture.date,
      venue: fixture.fixture.venue,
      status: fixture.fixture.status,
      homeTeam: fixture.teams.home,
      awayTeam: fixture.teams.away,
      goals: fixture.goals
    };
  } catch (error) {
    console.error('API-Football Error:', error);
    return null;
  }
}
