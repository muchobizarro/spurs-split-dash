'use client';

import React from 'react';
import { Newspaper, Clock } from 'lucide-react';

interface NewsItem {
  title: string;
  url: string;
  description: string;
  published_time: string;
  source: string;
}

interface Props {
  news: NewsItem[];
}

export default function NewsFeed({ news }: Props) {
  const groupNews = (items: NewsItem[]) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const groups: { [key: string]: NewsItem[] } = {
      Today: [],
      Yesterday: [],
    };

    items.forEach((item) => {
      const pubDate = new Date(item.published_time);
      const diffDays = Math.floor((today.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));

      if (pubDate.toDateString() === today.toDateString()) {
        groups.Today.push(item);
      } else if (pubDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(item);
      } else if (diffDays < 7) {
        const dayName = pubDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (!groups[dayName]) groups[dayName] = [];
        groups[dayName].push(item);
      }
    });

    return groups;
  };

  const grouped = groupNews(news);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5" />
        <h2 className="text-xl font-bold uppercase tracking-tight">Latest News</h2>
      </div>

      {Object.entries(grouped).map(([day, items]) => (
        items.length > 0 && (
          <div key={day} className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-opacity-50 border-b border-current pb-1">
              {day}
            </h3>
            <div className="grid gap-4">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-secondary">{item.source}</span>
                    <div className="flex items-center gap-1 text-[10px] opacity-50">
                      <Clock size={10} />
                      {new Date(item.published_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold leading-tight group-hover:underline">{item.title}</h4>
                </a>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
