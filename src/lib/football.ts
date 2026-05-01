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
        'x-apisports-key': apiKey
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
  const correctedTeamId = teamId === '33' ? '47' : teamId === '4944' ? '4899' : teamId;
  
  const data = await fetchFromApi(`fixtures?team=${correctedTeamId}&next=1`);
  
  if (data?.errors?.plan || !data?.response?.[0]) {
    const seasons = ['2025', '2024'];
    for (const season of seasons) {
      const seasonData = await fetchFromApi(`fixtures?team=${correctedTeamId}&season=${season}`);
      if (seasonData?.errors?.plan || !seasonData?.response) continue;
      
      const fixtures = seasonData?.response || [];
      const now = new Date().getTime();
      const next = fixtures
        .filter((f: any) => new Date(f.fixture.date).getTime() > now)
        .sort((a: any, b: any) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())[0];
        
      if (next) {
        return {
          id: next.fixture.id,
          date: next.fixture.date,
          venue: next.fixture.venue,
          status: next.fixture.status,
          homeTeam: next.teams.home,
          awayTeam: next.teams.away,
          goals: next.goals
        };
      }
    }
    return null;
  }

  const fixture = data.response[0];
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
  const correctedTeamId = teamId === '33' ? '47' : teamId === '4944' ? '4899' : teamId;
  
  const data = await fetchFromApi(`fixtures?team=${correctedTeamId}&last=1`);
  
  if (data?.errors?.plan || !data?.response?.[0]) {
    const seasons = ['2025', '2024'];
    for (const season of seasons) {
      const seasonData = await fetchFromApi(`fixtures?team=${correctedTeamId}&season=${season}`);
      if (seasonData?.errors?.plan || !seasonData?.response) continue;
      
      const fixtures = seasonData?.response || [];
      const now = new Date().getTime();
      const last = fixtures
        .filter((f: any) => new Date(f.fixture.date).getTime() < now)
        .sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())[0];
        
      if (last) {
        return {
          id: last.fixture.id,
          date: last.fixture.date,
          venue: last.fixture.venue,
          status: last.fixture.status,
          homeTeam: last.teams.home,
          awayTeam: last.teams.away,
          goals: last.goals
        };
      }
    }
    return null;
  }

  const fixture = data.response[0];
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
  const correctedTeamId = teamId === '33' ? '47' : teamId === '4944' ? '4899' : teamId;
  const leagueId = correctedTeamId === '47' ? '39' : '44';
  
  const seasons = ['2025', '2024'];
  for (const season of seasons) {
    const data = await fetchFromApi(`standings?league=${leagueId}&season=${season}`);
    if (data?.errors?.plan) continue;
    
    const standings = data?.response?.[0]?.league?.standings?.[0];
    if (!standings) continue;
    
    const teamStanding = standings.find((s: any) => s.team.id.toString() === correctedTeamId);
    if (teamStanding) return teamStanding;
  }
  
  return null;
}
