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
  if (!news || !Array.isArray(news)) return null;

  const groupNews = (items: NewsItem[]) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const groups: { [key: string]: NewsItem[] } = {
      Today: [],
      Yesterday: [],
      Recent: [],
    };

    items.forEach((item: any) => {
      const time = item.published_time || item.age;
      const pubDate = new Date(time);
      const isValidDate = !isNaN(pubDate.getTime());
      
      if (!isValidDate) {
        groups.Recent.push(item);
        return;
      }

      const diffDays = Math.floor((today.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));

      if (pubDate.toDateString() === today.toDateString()) {
        groups.Today.push(item);
      } else if (pubDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(item);
      } else if (diffDays < 7) {
        const dayName = pubDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (!groups[dayName]) groups[dayName] = [];
        groups[dayName].push(item);
      } else {
        groups.Recent.push(item);
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
                  className="group block p-3 bg-current/5 hover:bg-current/10 transition-colors border border-current/10"
                >
                  <div className="flex justify-end items-start gap-2 mb-1">
                    <div className="flex items-center gap-1 text-[10px] opacity-50">
                      <Clock size={10} />
                      {(() => {
                        const time = item.published_time || (item as any).age;
                        const date = new Date(time);
                        return isNaN(date.getTime()) 
                          ? time 
                          : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
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
