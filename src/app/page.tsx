import React from 'react';
import NewsFeed from '@/components/NewsFeed';
import DeepStats from '@/components/DeepStats';
import NextMatch from '@/components/NextMatch';
import Scoreboard from '@/components/Scoreboard';
import { fetchWithGovernance } from '@/lib/governance';
import { fetchBraveNews } from '@/lib/brave';
import { fetchTeamStats } from '@/lib/rapidapi';
import { fetchNextMatch, fetchLastMatch, fetchStandings } from '@/lib/football';
import { AlertTriangle, Zap } from 'lucide-react';

export const revalidate = 3600; // Revalidate page every hour

const SPURS_MEN_ID = '47';
const SPURS_WOMEN_ID = '4899';

export default async function DashboardPage() {
  // 1. Fetch News
  const { data: menNews, isStale: isMenNewsStale } = await fetchWithGovernance('brave_news_men_v9', () => fetchBraveNews('Tottenham Hotspur'), 'news');
  const { data: womenNews, isStale: isWomenNewsStale } = await fetchWithGovernance('brave_news_women_v9', () => fetchBraveNews('Tottenham Hotspur Women'), 'news');
  
  // 2. Fetch Stats
  const { data: menStats, isStale: isMenStale } = await fetchWithGovernance('men_stats_v9', () => fetchTeamStats(SPURS_MEN_ID));
  const { data: womenStats, isStale: isWomenStale } = await fetchWithGovernance('women_stats_v9', () => fetchTeamStats(SPURS_WOMEN_ID));

  // 3. Fetch Matches
  const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'];

  let { data: menMatch, isStale: isMenMatchStale } = await fetchWithGovernance('men_match_v9', () => fetchNextMatch(SPURS_MEN_ID), 'news');
  if (menMatch && liveStatuses.includes(menMatch.status.short)) {
    ({ data: menMatch, isStale: isMenMatchStale } = await fetchWithGovernance('men_match_v9', () => fetchNextMatch(SPURS_MEN_ID), 'live'));
  }
  
  if (!menMatch) {
    const { data: lastMenMatch, isStale: isLastMenStale } = await fetchWithGovernance('last_men_match_v9', () => fetchLastMatch(SPURS_MEN_ID), 'news');
    menMatch = lastMenMatch;
    isMenMatchStale = isLastMenStale;
  }

  let { data: womenMatch, isStale: isWomenMatchStale } = await fetchWithGovernance('women_match_v9', () => fetchNextMatch(SPURS_WOMEN_ID), 'news');
  if (womenMatch && liveStatuses.includes(womenMatch.status.short)) {
    ({ data: womenMatch, isStale: isWomenMatchStale } = await fetchWithGovernance('women_match_v9', () => fetchNextMatch(SPURS_WOMEN_ID), 'live'));
  }

  if (!womenMatch) {
    const { data: lastWomenMatch, isStale: isLastWomenStale } = await fetchWithGovernance('last_women_match_v9', () => fetchLastMatch(SPURS_WOMEN_ID), 'news');
    womenMatch = lastWomenMatch;
    isWomenMatchStale = isLastWomenStale;
  }

  // 4. Fetch Standings
  const { data: menStanding, isStale: isMenStandingStale } = await fetchWithGovernance('men_standing_v9', () => fetchStandings(SPURS_MEN_ID), 'news');
  const { data: womenStanding, isStale: isWomenStandingStale } = await fetchWithGovernance('women_standing_v9', () => fetchStandings(SPURS_WOMEN_ID), 'news');

  const isDataSavingMode = isMenNewsStale || isWomenNewsStale || isMenStale || isWomenStale || isMenMatchStale || isWomenMatchStale || isMenStandingStale || isWomenStandingStale;

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
