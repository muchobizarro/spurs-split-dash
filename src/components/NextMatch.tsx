'use client';

import React from 'react';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { Fixture } from '@/lib/football';

interface Props {
  match: Fixture | null;
  theme: 'dark' | 'light';
}

export default function NextMatch({ match, theme }: Props) {
  if (!match) return null;

  const isLive = ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'].includes(match.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(match.status.short);
  
  const date = new Date(match.date);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

  const accentColor = theme === 'dark' ? 'bg-white/10' : 'bg-[#132257]/5';

  return (
    <div className={`p-4 rounded-xl ${accentColor} border border-current/10 max-w-sm ml-auto`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest opacity-70">
          <Trophy size={12} />
          {isLive ? 'Live Now' : isFinished ? 'Final Score' : 'Next Up'}
        </div>
        {isLive && (
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Matchday</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1 text-center gap-1">
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
            <span className="text-[10px] font-bold leading-tight line-clamp-1 uppercase">{match.homeTeam.name}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {(isLive || isFinished) ? (
              <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                <span>{match.goals.home ?? 0}</span>
                <span className="opacity-30">-</span>
                <span>{match.goals.away ?? 0}</span>
              </div>
            ) : (
              <div className="text-lg font-black tracking-tighter uppercase italic">VS</div>
            )}
            {isLive && match.status.elapsed && (
              <span className="text-[10px] font-bold text-red-500">{match.status.elapsed}&apos;</span>
            )}
          </div>

          <div className="flex flex-col items-center flex-1 text-center gap-1">
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
            <span className="text-[10px] font-bold leading-tight line-clamp-1 uppercase">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* Info Footer */}
        {!isLive && !isFinished && (
          <div className="pt-2 border-t border-current/5 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-60">
              <Calendar size={10} />
              <span>{dateStr} @ {timeStr}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-60 truncate">
              <MapPin size={10} />
              <span className="truncate">{match.venue.name}</span>
            </div>
          </div>
        )}
        
        {(isLive || isFinished) && (
          <div className="pt-1 flex justify-center">
             <div className="flex items-center gap-1 text-[10px] font-medium opacity-60">
              <MapPin size={10} />
              <span>{match.venue.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
