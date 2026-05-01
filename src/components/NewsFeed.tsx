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

  // Helper to parse both ISO strings and relative strings (e.g., "2 hours ago")
  const parseDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Handle relative dates
    const now = new Date();
    const match = dateStr.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      switch (unit) {
        case 'second': now.setSeconds(now.getSeconds() - value); break;
        case 'minute': now.setMinutes(now.getMinutes() - value); break;
        case 'hour': now.setHours(now.getHours() - value); break;
        case 'day': now.setDate(now.getDate() - value); break;
        case 'week': now.setDate(now.getDate() - (value * 7)); break;
        case 'month': now.setMonth(now.getMonth() - value); break;
        case 'year': now.setFullYear(now.getFullYear() - value); break;
      }
      return now;
    }

    return new Date(0); // Fallback for unparseable
  };

  // 1. Sort all news items by date (newest first)
  const sortedNews = [...news].sort((a, b) => {
    const dateA = parseDate(a.published_time).getTime();
    const dateB = parseDate(b.published_time).getTime();
    return dateB - dateA;
  });

  const groupNews = (items: NewsItem[]) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const groups: { [key: string]: NewsItem[] } = {
      Today: [],
      Yesterday: [],
    };

    items.forEach((item: NewsItem) => {
      const pubDate = parseDate(item.published_time);
      const isValidDate = pubDate.getTime() > 0;
      
      if (!isValidDate) {
        if (!groups.Recent) groups.Recent = [];
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
        if (!groups.Recent) groups.Recent = [];
        groups.Recent.push(item);
      }
    });

    return groups;
  };

  const grouped = groupNews(sortedNews);

  // Define display order for groups to maintain chronology
  const getOrderedGroups = () => {
    const today = new Date();
    const order = ['Today', 'Yesterday'];
    
    // Add the last 5 days of the week in order
    for (let i = 2; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      order.push(d.toLocaleDateString('en-US', { weekday: 'long' }));
    }
    
    order.push('Recent');
    return order;
  };

  const displayOrder = getOrderedGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5" />
        <h2 className="text-xl font-bold uppercase tracking-tight">Latest News</h2>
      </div>

      {displayOrder.map((day) => {
        const items = grouped[day];
        if (!items || items.length === 0) return null;

        return (
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
                        const time = item.published_time;
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
        );
      })}
    </div>
  );
}
