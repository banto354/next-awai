"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { ArchiveCard } from './features/archive/ArchiveCard';
import { TemperatureFilter } from './features/archive/TemperatureFilter';
import { TagFilter } from './features/archive/TagFilter';
import { ArchiveEntry } from '@/app/types/entry';
import { getArchivePostsAction } from '@/app/archive/action';
import { useLocationWeather } from '@/hooks/useLocationWeather';

// Propsの定義
interface ArchiveScreenProps {
  initialEntries: ArchiveEntry[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

export function ArchiveScreen({ initialEntries, initialCursor, initialHasMore }: ArchiveScreenProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>(initialEntries);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const [tempFilterActive, setTempFilterActive] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { weather, loading: weatherLoading } = useLocationWeather();
  const currentTemp = weather?.temp ?? null;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 追加読み込み
  const loadMore = useCallback(() => {
    if (!hasMore || isPending) return;

    startTransition(async () => {
      const result = await getArchivePostsAction(cursor);
      setEntries(prev => [...prev, ...result.entries]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    });
  }, [cursor, hasMore, isPending]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isPending) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isPending, loadMore]);

  // フィルタリングロジック
  const filteredEntries = entries.filter((entry) => {
    const tempMatch = tempFilterActive && currentTemp !== null ? entry.temperature === currentTemp : true;
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
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">LOG - 過去の投稿</h1>
        </div>
      </div>

      {/* フィルター */}
      <div className="px-6 pb-4 lg:px-16 lg:pb-6">
        <TemperatureFilter
          active={tempFilterActive}
          temp={currentTemp}
          loading={weatherLoading}
          onClick={() => setTempFilterActive(!tempFilterActive)}
        />
      </div>

      {/* タグフィルター表示 */}
      <div className="px-6 pb-8 lg:px-16 lg:pb-12">
        <TagFilter
          active={selectedTag !== null}
          tag={selectedTag || ''}
          onClick={clearTagFilter}
        />
      </div>

      {/* フィルター適用中で該当なしメッセージ */}
      {(tempFilterActive || selectedTag !== null) && filteredEntries.length === 0 && (
        <div className="px-6 pb-8 lg:px-16 lg:pb-12">
          <div className="lg:max-w-7xl lg:mx-auto">
            <p className="text-[11px] text-[#9B9890] tracking-wide animate-in fade-in duration-500">
              この条件に重なる投稿はありません
            </p>
          </div>
        </div>
      )}

      {/* 出力投稿 */}
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

      {/* ローディング / 追加読み込みトリガー */}
      <div ref={loadMoreRef} className="px-6 pt-12 flex justify-center lg:pt-16">
        {isPending ? (
          <div className="text-[10px] lg:text-[12px] text-[#9B9890] tracking-[0.2em] uppercase animate-pulse">
            読み込み中...
          </div>
        ) : hasMore ? (
          <div className="text-[10px] lg:text-[12px] text-[#D4CFC3] tracking-[0.2em] uppercase">
            スクロールで追加読み込み
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="text-[10px] lg:text-[12px] text-[#9B9890] tracking-[0.2em] uppercase">
            {filteredEntries.length} 件の投稿
          </div>
        ) : null}
      </div>
    </div>
  );
}