"use client";

import { useState } from 'react';
import { ArchiveCard } from './features/archive/ArchiveCard';
import { TemperatureFilter } from './features/archive/TemperatureFilter';
import { TagFilter } from './features/archive/TagFilter';
import { ArchiveEntry } from '@/app/types/entry';

// Propsの定義（この画面専用の受け皿）
interface ArchiveScreenProps {
  initialEntries: ArchiveEntry[]; // ★ArchiveEntry型を使う
}

export function ArchiveScreen({ initialEntries }: ArchiveScreenProps) {
  const [tempFilterActive, setTempFilterActive] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const currentTemp = 10; // Mock current temperature

  // フィルタリングロジック：気温とタグの両方を適用
  const filteredEntries = initialEntries.filter((entry) => {
    const tempMatch = tempFilterActive ? entry.temperature === currentTemp : true;
    const tagMatch = selectedTag ? entry.tags.includes(selectedTag) : true;
    return tempMatch && tagMatch;
  });

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-8 lg:pb-16">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-6 lg:px-16 lg:pt-16 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">過去の投稿</h1>
        </div>
      </div>

      {/* フィルター */}
      <div className="px-6 pb-4 lg:px-16 lg:pb-6">
        <TemperatureFilter
          active={tempFilterActive}
          temp={currentTemp}
          onClick={() => setTempFilterActive(!tempFilterActive)}
          hasMatches={filteredEntries.length > 0}
        />
      </div>

      {/* タグフィルター表示 */}
      <div className="px-6 pb-8 lg:px-16 lg:pb-12">
        <TagFilter
          active={selectedTag !== null}
          tag={selectedTag || ''}
          onClick={clearTagFilter}
          hasMatches={filteredEntries.length > 0}
        />
      </div>

      {/* 出力投稿　モバイル；リスト、デスクトップ：グリッド */}
      <div className="space-y-1 lg:space-y-0 lg:px-16">
        <div className="lg:max-w-7xl lg:mx-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {filteredEntries.map((entry) => (
            <ArchiveCard
              key={entry.id}
              entry={entry}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      </div>

      {/* エンドマーカー */}
      <div className="px-6 pt-12 flex justify-center lg:pt-16">
        <div className="text-[10px] lg:text-[12px] text-[#9B9890] tracking-[0.2em] uppercase">
          {filteredEntries.length} 件の投稿
        </div>
      </div>
    </div>
  );
}