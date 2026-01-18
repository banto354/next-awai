"use client";

import { useState } from 'react';
import { ArchiveCard } from './features/archive/ArchiveCard';
import { TemperatureFilter } from './features/archive/TemperatureFilter';

interface ArchiveEntry {
  id: string;
  image: string;
  text: string;
  date: string;
  weather: string;
  temperature: number;
  tags: string[];
  isPublic: boolean;
}

const mockArchive: ArchiveEntry[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1766932102092-2799e86d0030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwemVuJTIwbmF0dXJlfGVufDF8fHx8MTc2ODE5NzEwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'The morning light filtered through the curtains, soft and unhurried.',
    date: 'Jan 11',
    weather: 'Rain',
    temperature: 10,
    tags: ['calm', 'reflective'],
    isPublic: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1560996025-95b43d543770?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbW9ybmluZyUyMGxpZ2h0fGVufDF8fHx8MTc2ODE5NzEwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Today I walked without a destination. The city felt different.',
    date: 'Jan 9',
    weather: 'Clear',
    temperature: 14,
    tags: ['wandering'],
    isPublic: false,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1710685375110-3b1f3bf8bb1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFucXVpbCUyMHdhdGVyJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3NjgxOTcxMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'The water was still this evening. I sat at the edge and watched.',
    date: 'Jan 7',
    weather: 'Cloudy',
    temperature: 8,
    tags: ['solitude'],
    isPublic: true,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1715830853302-28a141710e11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGphcGFuZXNlJTIwZ2FyZGVufGVufDF8fHx8MTc2ODE5NzEwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Found a small garden tucked between buildings. A secret oasis.',
    date: 'Jan 5',
    weather: 'Rain',
    temperature: 10,
    tags: ['discovery', 'nature'],
    isPublic: false,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1766932102092-2799e86d0030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwemVuJTIwbmF0dXJlfGVufDF8fHx8MTc2ODE5NzEwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Rereading old letters. How much we change, how much stays the same.',
    date: 'Jan 3',
    weather: 'Snow',
    temperature: 2,
    tags: ['nostalgia'],
    isPublic: true,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1560996025-95b43d543770?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbW9ybmluZyUyMGxpZ2h0fGVufDF8fHx8MTc2ODE5NzEwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Early morning coffee on the balcony. The world before it wakes.',
    date: 'Jan 1',
    weather: 'Clear',
    temperature: 5,
    tags: ['quiet', 'new year'],
    isPublic: false,
  },
];

export function ArchiveScreen() {
  const [filterActive, setFilterActive] = useState(false);
  const currentTemp = 10; // Mock current temperature

  const filteredEntries = filterActive
    ? mockArchive.filter((entry) => entry.temperature === currentTemp)
    : mockArchive;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-8 lg:pb-16">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-6 lg:px-16 lg:pt-16 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto"> 
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">過去の投稿</h1>
        </div>
      </div>

      {/* フィルター */}
      <div className="px-6 pb-8 lg:px-16 lg:pb-12">
        <TemperatureFilter
          active={filterActive}
          temp={currentTemp}
          onClick={() => setFilterActive(!filterActive)}
          hasMatches={filteredEntries.length > 0}
        />
      </div>

      {/* 出力投稿　モバイル；リスト、デスクトップ：グリッド */}
      <div className="space-y-1 lg:space-y-0 lg:px-16">
        <div className="lg:max-w-7xl lg:mx-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {filteredEntries.map((entry) => (
            <ArchiveCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {/* エンドマーカー */}
      <div className="px-6 pt-12 flex justify-center lg:pt-16">
        <div className="text-[10px] lg:text-[11px] text-[#9B9890] tracking-[0.2em] uppercase">
          {filteredEntries.length} 件の投稿
        </div>
      </div>
    </div>
  );
}