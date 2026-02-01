"use client";

import { useState } from 'react';
import { ArchiveCard } from './features/archive/ArchiveCard';
import { TemperatureFilter } from './features/archive/TemperatureFilter';
import { mockEntries } from '@/app/data/mockEntries';
import { ArchiveEntry, Entry } from '@/app/types/entry';



// const Archive: ArchiveEntry[] = mockEntries;

// Propsの定義（この画面専用の受け皿）
interface ArchiveScreenProps {
  initialEntries: Entry[]; // ★共通のEntry型を使う
}

export function ArchiveScreen({ initialEntries }: ArchiveScreenProps) {
  const [filterActive, setFilterActive] = useState(false);
  const currentTemp = 10; // Mock current temperature

  const filteredEntries = filterActive
    ? initialEntries.filter((entry) => entry.temperature === currentTemp)
    : initialEntries;

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