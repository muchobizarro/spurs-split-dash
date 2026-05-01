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

export interface Standing {
  rank: number;
  points: number;
  goalsDiff: number;
  form: string;
  status: string;
  description: string;
  team: {
    id: number;
    name: string;
    logo: string;
  };
}

async function fetchFromApi(endpoint: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;

  const url = `https://v3.football.api-sports.io/${endpoint}`;
  
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

    return await response.json();
  } catch (error) {
    console.error('API-Football Error:', error);
    return null;
  }
}

export async function fetchNextMatch(teamId: string): Promise<Fixture | null> {
  const data = await fetchFromApi(`fixtures?team=${teamId}&next=1`);
  const fixture = data?.response?.[0];
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
}

export async function fetchLastMatch(teamId: string): Promise<Fixture | null> {
  const data = await fetchFromApi(`fixtures?team=${teamId}&last=1`);
  const fixture = data?.response?.[0];
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
}

export async function fetchStandings(teamId: string): Promise<Standing | null> {
  // We need to fetch standings for the league the team is in.
  // For Spurs Men (33), it's Premier League (39)
  // For Spurs Women (4944), it's WSL (144)
  const leagueId = teamId === '33' ? '39' : '144';
  const season = '2025'; // Current season
  
  const data = await fetchFromApi(`standings?league=${leagueId}&season=${season}`);
  const standings = data?.response?.[0]?.league?.standings?.[0];
  
  if (!standings) return null;
  
  const teamStanding = standings.find((s: { team: { id: number } }) => s.team.id.toString() === teamId);
  return teamStanding || null;
}
