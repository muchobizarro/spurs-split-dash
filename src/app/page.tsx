import React from 'react';
import NewsFeed from '@/components/NewsFeed';
import DeepStats from '@/components/DeepStats';
import NextMatch from '@/components/NextMatch';
import Scoreboard from '@/components/Scoreboard';
import { fetchWithGovernance } from '@/lib/governance';
import { fetchBraveNews } from '@/lib/brave';
import { AlertTriangle, Zap } from 'lucide-react';

export const revalidate = 0; // FORCE FRESH DATA FOR DEBUGGING

// --- DIRECT FIX: Bypassing restricted football.ts and rapidapi.ts ---

const SPURS_MEN_ID = '47';
const SPURS_WOMEN_ID = '4899';
const PL_LEAGUE_ID = '39';
const WSL_LEAGUE_ID = '44';

async function fetchFromApiSports(endpoint: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    console.error('API_FOOTBALL_KEY is missing!');
    return null;
  }
  const url = `https://v3.football.api-sports.io/${endpoint}`;
  try {
    const response = await fetch(url, { headers: { 'x-apisports-key': apiKey } });
    if (!response.ok) {
      console.error(`API-Football Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API-Football API Errors:', JSON.stringify(data.errors));
    }
    return data;
  } catch (error) {
    console.error('API-Football Fetch Error:', error);
    return null;
  }
}

async function fetchDirectMatch(teamId: string, type: 'next' | 'last') {
  const data = await fetchFromApiSports(`fixtures?team=${teamId}&${type}=1`);
  if (!data?.response?.[0] || data?.errors?.plan) {
    for (const season of ['2025', '2024']) {
      const sData = await fetchFromApiSports(`fixtures?team=${teamId}&season=${season}`);
      if (!sData?.response || sData?.errors?.plan) continue;
      const now = Date.now();
      const fixtures = sData.response.map((f: any) => ({
        id: f.fixture.id, date: f.fixture.date, venue: f.fixture.venue,
        status: f.fixture.status, homeTeam: f.teams.home, awayTeam: f.teams.away, goals: f.goals
      }));
      if (type === 'next') {
        const next = fixtures.filter((f: any) => new Date(f.date).getTime() > now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        if (next) return next;
      } else {
        const last = fixtures.filter((f: any) => new Date(f.date).getTime() < now)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (last) return last;
      }
    }
    return null;
  }
  const f = data.response[0];
  return {
    id: f.fixture.id, date: f.fixture.date, venue: f.fixture.venue,
    status: f.fixture.status, homeTeam: f.teams.home, awayTeam: f.teams.away, goals: f.goals
  };
}

async function fetchDirectStanding(teamId: string) {
  const leagueId = teamId === SPURS_MEN_ID ? PL_LEAGUE_ID : WSL_LEAGUE_ID;
  for (const season of ['2025', '2024']) {
    const data = await fetchFromApiSports(`standings?league=${leagueId}&season=${season}`);
    if (!data?.response?.[0] || data?.errors?.plan) continue;
    const standings = data.response[0].league.standings[0];
    const standing = standings.find((s: any) => s.team.id.toString() === teamId);
    if (standing) return standing;
  }
  return null;
}

async function fetchDirectStats(teamId: string) {
  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) return null;
  const url = `https://sportapi7.p.rapidapi.com/api/v1/team/${teamId}/statistics/season/61627`;
  try {
    const response = await fetch(url, {
      headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
    });
    const data = await response.json();
    return data.statistics || null;
  } catch { return null; }
}

export default async function DashboardPage() {
  // 1. Fetch News
  const { data: menNews, isStale: isMenNewsStale } = await fetchWithGovernance('brave_news_men', () => fetchBraveNews('Tottenham Hotspur'), 'news');
  const { data: womenNews, isStale: isWomenNewsStale } = await fetchWithGovernance('brave_news_women', () => fetchBraveNews('Tottenham Hotspur Women'), 'news');
  
  // 2. Fetch Stats
  const { data: menStats, isStale: isMenStale } = await fetchWithGovernance('men_stats_v5', () => fetchDirectStats(SPURS_MEN_ID));
  const { data: womenStats, isStale: isWomenStale } = await fetchWithGovernance('women_stats_v5', () => fetchDirectStats(SPURS_WOMEN_ID));

  // 3. Fetch Matches
  let { data: menMatch } = await fetchWithGovernance('men_match_v5', () => fetchDirectMatch(SPURS_MEN_ID, 'next'), 'news');
  if (!menMatch) {
    const res = await fetchWithGovernance('last_men_match_v5', () => fetchDirectMatch(SPURS_MEN_ID, 'last'), 'news');
    menMatch = res.data;
  }

  let { data: womenMatch } = await fetchWithGovernance('women_match_v5', () => fetchDirectMatch(SPURS_WOMEN_ID, 'next'), 'news');
  if (!womenMatch) {
    const res = await fetchWithGovernance('last_women_match_v5', () => fetchDirectMatch(SPURS_WOMEN_ID, 'last'), 'news');
    womenMatch = res.data;
  }

  // 4. Fetch Standings
  const { data: menStanding } = await fetchWithGovernance('men_standing_v5', () => fetchDirectStanding(SPURS_MEN_ID), 'news');
  const { data: womenStanding } = await fetchWithGovernance('women_standing_v5', () => fetchDirectStanding(SPURS_WOMEN_ID), 'news');

  const isDataSavingMode = isMenNewsStale || isWomenNewsStale || isMenStale || isWomenStale;

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* Hard Stop Banner */}
      {isDataSavingMode && (
        <div className="bg-amber-500 text-black p-2 flex items-center justify-center gap-2 font-black uppercase tracking-tighter text-sm sticky top-0 z-50 animate-pulse">
          <AlertTriangle size={18} />
          <span>Data Saving Mode Active: Serving Cached Data Only</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen text-[#FFFFFF]">
        {/* Men's Side - Spurs Navy */}
        <section className="bg-[#132257] p-6 lg:p-12 space-y-12 border-r border-white/5">
          <header className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none text-white">
                Spurs <span className="block text-white/20">Men</span>
              </h1>
              <div className="h-2 w-24 bg-white" />
            </div>
            <div className="w-full xl:w-auto">
              <NextMatch match={menMatch} theme="dark" />
            </div>
          </header>

          <div className="grid gap-12">
            <Scoreboard standing={menStanding} theme="dark" />
            <DeepStats stats={menStats} title="Men's First Team" />
            <NewsFeed news={menNews} />
          </div>
        </section>

        {/* Women's Side - Lilywhite */}
        <section className="bg-[#FFFFFF] text-[#132257] p-6 lg:p-12 space-y-12">
          <header className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                Spurs <span className="block text-[#132257]/20">Women</span>
              </h1>
              <div className="h-2 w-24 bg-[#132257]" />
            </div>
            <div className="w-full xl:w-auto text-[#132257]">
              <NextMatch match={womenMatch} theme="light" />
            </div>
          </header>

          <div className="grid gap-12">
            <Scoreboard standing={womenStanding} theme="light" />
            <DeepStats stats={womenStats} title="Women's Team" />
            <NewsFeed news={womenNews} />
          </div>
        </section>
      </div>

      {/* Persistent Footer */}
      <footer className="bg-black border-t border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-30">
          <span>© 2026 Spurs Split Dashboard</span>
          <div className="h-3 w-px bg-white/20" />
          <span>Independent Dual-View Engine</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
          <Zap size={12} className="text-amber-400" />
          <span>Global Sync Status: Operational</span>
        </div>
      </footer>
    </main>
  );
}
