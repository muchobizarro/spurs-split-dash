import { Fixture, Standing } from './football';

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

const LEAGUE_MAP: Record<string, string> = {
  '47': 'eng.1',    // Men
  '4899': 'eng.w.1' // Women
};

const TEAM_MAP: Record<string, string> = {
  '47': '367',     // Men
  '4899': '20062'  // Women
};

export async function fetchEspnMatch(teamId: string, type: 'next' | 'last'): Promise<Fixture | null> {
  const league = LEAGUE_MAP[teamId];
  const espnTeamId = TEAM_MAP[teamId];
  if (!league || !espnTeamId) return null;

  try {
    const url = `${ESPN_BASE}/${league}/scoreboard`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();

    const events = data.events || [];
    const teamEvents = events.filter((e: any) => 
      e.competitions[0]?.competitors?.some((c: any) => c.team.id === espnTeamId)
    );

    if (teamEvents.length === 0) {
      // If no match today, look for future/past matches
      // This is a simplified version of the Replit logic
      return null; 
    }

    // For now, just take the first one found in the scoreboard (usually today's)
    const event = teamEvents[0];
    return mapEspnEventToFixture(event);
  } catch (error) {
    console.error('ESPN Match Error:', error);
    return null;
  }
}

export async function fetchEspnNextMatch(teamId: string): Promise<Fixture | null> {
  const league = LEAGUE_MAP[teamId];
  const espnTeamId = TEAM_MAP[teamId];
  if (!league || !espnTeamId) return null;

  try {
    // 1. Check today's scoreboard
    const todayRes = await fetch(`${ESPN_BASE}/${league}/scoreboard`, { next: { revalidate: 300 } });
    const todayData = await todayRes.json();
    const todayMatch = todayData.events?.find((e: any) => 
      e.competitions[0]?.competitors?.some((c: any) => c.team.id === espnTeamId) &&
      !e.competitions[0]?.status.type.completed
    );

    if (todayMatch) return mapEspnEventToFixture(todayMatch);

    // 2. Check future matches (next 30 days)
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dateStr = formatDateRange(now, future);
    
    const futureRes = await fetch(`${ESPN_BASE}/${league}/scoreboard?dates=${dateStr}`, { next: { revalidate: 3600 } });
    const futureData = await futureRes.json();
    const nextMatch = futureData.events?.find((e: any) => 
      e.competitions[0]?.competitors?.some((c: any) => c.team.id === espnTeamId)
    );

    if (nextMatch) return mapEspnEventToFixture(nextMatch);

    return null;
  } catch (error) {
    console.error('ESPN Next Match Error:', error);
    return null;
  }
}

export async function fetchEspnLastMatch(teamId: string): Promise<Fixture | null> {
  const league = LEAGUE_MAP[teamId];
  const espnTeamId = TEAM_MAP[teamId];
  if (!league || !espnTeamId) return null;

  try {
    const now = new Date();
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateStr = formatDateRange(past, now);
    
    const pastRes = await fetch(`${ESPN_BASE}/${league}/scoreboard?dates=${dateStr}`, { next: { revalidate: 3600 } });
    const pastData = await pastRes.json();
    
    // Sort by date descending and find the first completed match
    const lastMatch = pastData.events
      ?.filter((e: any) => e.competitions[0]?.competitors?.some((c: any) => c.team.id === espnTeamId))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find((e: any) => e.competitions[0]?.status.type.completed);

    if (lastMatch) return mapEspnEventToFixture(lastMatch);

    return null;
  } catch (error) {
    console.error('ESPN Last Match Error:', error);
    return null;
  }
}

export async function fetchEspnStandings(teamId: string): Promise<Standing | null> {
  const league = LEAGUE_MAP[teamId];
  const espnTeamId = TEAM_MAP[teamId];
  if (!league || !espnTeamId) return null;

  try {
    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league}/standings`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();

    const standings = data.children?.[0]?.standings?.entries;
    if (!standings) return null;

    const teamStanding = standings.find((s: any) => s.team.id === espnTeamId);
    if (!teamStanding) return null;

    return mapEspnStandingToStanding(teamStanding);
  } catch (error) {
    console.error('ESPN Standings Error:', error);
    return null;
  }
}

function mapEspnEventToFixture(event: any): Fixture {
  const comp = event.competitions[0];
  const home = comp.competitors.find((c: any) => c.homeAway === "home");
  const away = comp.competitors.find((c: any) => c.homeAway === "away");

  return {
    id: parseInt(event.id),
    date: event.date,
    venue: {
      name: comp.venue?.fullName || 'TBD',
      city: comp.venue?.address?.city || ''
    },
    status: {
      long: comp.status.type.description,
      short: comp.status.type.shortDetail,
      elapsed: comp.status.clock || null
    },
    homeTeam: {
      name: home.team.displayName,
      logo: home.team.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${home.team.id}.png`,
      winner: home.winner || null
    },
    awayTeam: {
      name: away.team.displayName,
      logo: away.team.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${away.team.id}.png`,
      winner: away.winner || null
    },
    goals: {
      home: home.score ? parseInt(home.score) : null,
      away: away.score ? parseInt(away.score) : null
    }
  };
}

function mapEspnStandingToStanding(entry: any): Standing {
  const stats = entry.stats;
  const findStat = (name: string) => stats.find((s: any) => s.name === name)?.value;

  return {
    rank: findStat('rank') || 0,
    points: findStat('points') || 0,
    goalsDiff: findStat('pointDifferential') || 0,
    form: '', // ESPN standings don't always have form in this endpoint
    status: 'same',
    description: entry.note?.description || '',
    team: {
      id: parseInt(entry.team.id),
      name: entry.team.displayName,
      logo: entry.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${entry.team.id}.png`
    }
  };
}

function formatDateRange(fromDate: Date, toDate: Date): string {
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(fromDate)}-${fmt(toDate)}`;
}
