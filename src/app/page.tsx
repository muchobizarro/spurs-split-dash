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

export default async function DashboardPage() {
  // 1. Fetch News
  const { data: menNews, isStale: isMenNewsStale } = await fetchWithGovernance('brave_news_men', () => fetchBraveNews('Tottenham Hotspur'), 'news');
  const { data: womenNews, isStale: isWomenNewsStale } = await fetchWithGovernance('brave_news_women', () => fetchBraveNews('Tottenham Hotspur Women'), 'news');
  
  // 2. Fetch Stats
  const { data: menStats, isStale: isMenStale } = await fetchWithGovernance('men_stats', () => fetchTeamStats('33'));
  const { data: womenStats, isStale: isWomenStale } = await fetchWithGovernance('women_stats', () => fetchTeamStats('4944'));

  // 3. Fetch Matches
  const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'];
  
  let { data: menMatch, isStale: isMenMatchStale } = await fetchWithGovernance('men_match', () => fetchNextMatch('33'), 'news');
  if (menMatch && liveStatuses.includes(menMatch.status.short)) {
    ({ data: menMatch, isStale: isMenMatchStale } = await fetchWithGovernance('men_match', () => fetchNextMatch('33'), 'live'));
  }
  
  if (!menMatch) {
    const { data: lastMenMatch } = await fetchWithGovernance('last_men_match', () => fetchLastMatch('33'), 'news');
    menMatch = lastMenMatch;
  }

  let { data: womenMatch, isStale: isWomenMatchStale } = await fetchWithGovernance('women_match', () => fetchNextMatch('4944'), 'news');
  if (womenMatch && liveStatuses.includes(womenMatch.status.short)) {
    ({ data: womenMatch, isStale: isWomenMatchStale } = await fetchWithGovernance('women_match', () => fetchNextMatch('4944'), 'live'));
  }

  if (!womenMatch) {
    const { data: lastWomenMatch } = await fetchWithGovernance('last_women_match', () => fetchLastMatch('4944'), 'news');
    womenMatch = lastWomenMatch;
  }

  // 4. Fetch Standings
  const { data: menStanding, isStale: isMenStandingStale } = await fetchWithGovernance('men_standing', () => fetchStandings('33'), 'news');
  const { data: womenStanding, isStale: isWomenStandingStale } = await fetchWithGovernance('women_standing', () => fetchStandings('4944'), 'news');

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

      {/* Global Sync Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-3 border-t border-white/10 flex justify-center items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
          <Zap size={12} className="text-amber-400" />
          <span>Global Sync Status: Operational</span>
        </div>
      </footer>
    </main>
  );
}
