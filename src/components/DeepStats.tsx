import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Target } from 'lucide-react';

interface Stats {
  goalsScored?: number;
  goalsConceded?: number;
  cleanSheets?: number;
  avgBallPossession?: number;
  matchesPlayed?: number;
}

interface Props {
  stats: Stats | null;
  title: string;
}

export default function DeepStats({ stats, title }: Props) {
  if (!stats) return null;

  const metrics = [
    { label: 'Goals Scored', value: stats.goalsScored || 0, icon: Target },
    { label: 'Clean Sheets', value: stats.cleanSheets || 0, icon: ShieldAlert },
    { label: 'Possession', value: `${(stats.avgBallPossession || 0).toFixed(1)}%`, icon: TrendingUp },
    { label: 'Played', value: stats.matchesPlayed || 0, icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        <h2 className="text-xl font-bold uppercase tracking-tight">{title} Stats</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 opacity-50">
              <m.icon size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
            </div>
            <span className="text-2xl font-black">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
