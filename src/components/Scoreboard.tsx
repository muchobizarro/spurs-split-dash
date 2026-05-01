'use client';

import React from 'react';
import { Standing } from '@/lib/football';

interface Props {
  standing: Standing | null;
  theme: 'dark' | 'light';
}

export default function Scoreboard({ standing, theme }: Props) {
  if (!standing) return null;

  const formPips = standing.form.split('').map((result, i) => {
    let color = '';
    switch (result) {
      case 'W': color = 'bg-emerald-500'; break;
      case 'D': color = 'bg-amber-500'; break;
      case 'L': color = 'bg-red-500'; break;
      default: color = 'bg-gray-500';
    }
    return (
      <div 
        key={i} 
        className={`w-2 h-2 rounded-full ${color} shadow-sm`} 
        title={result}
      />
    );
  });

  const accentColor = theme === 'dark' ? 'text-white' : 'text-[#132257]';
  const mutedColor = theme === 'dark' ? 'text-white/40' : 'text-[#132257]/40';
  const bgColor = theme === 'dark' ? 'bg-white/5' : 'bg-[#132257]/5';

  return (
    <div className={`p-4 rounded-xl ${bgColor} border border-current/10 flex items-center justify-between gap-6`}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedColor}`}>Rank</span>
          <span className={`text-2xl font-black ${accentColor}`}>#{standing.rank}</span>
        </div>
        <div className="h-8 w-px bg-current/10" />
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedColor}`}>Points</span>
          <span className={`text-2xl font-black ${accentColor}`}>{standing.points}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedColor}`}>Form</span>
        <div className="flex gap-1">
          {formPips}
        </div>
      </div>
    </div>
  );
}
