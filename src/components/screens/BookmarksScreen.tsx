'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { BookmarkEntry } from '@/types/entry';
import { BookmarkCard } from '@/components/features/bookmarks/BookmarkCard';
import { TagFilter } from '@/components/features/archive/TagFilter';
import { getBookmarkedPostsAction } from '@/app/bookmarks/loadMoreAction';

interface BookmarksScreenProps {
  bookmarkedEntries: BookmarkEntry[];
  initialOffset: number;
  initialHasMore: boolean;
  initialTag?: string;
}

export function BookmarksScreen({ bookmarkedEntries, initialOffset, initialHasMore, initialTag }: BookmarksScreenProps) {
  const [entries, setEntries] = useState<BookmarkEntry[]>(bookmarkedEntries);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag ?? null);
  const [offset, setOffset] = useState<number>(initialOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 追加読み込み
  const loadMore = useCallback(() => {
    if (!hasMore || isPending) return;

    startTransition(async () => {
      const result = await getBookmarkedPostsAction(offset);
      setEntries(prev => [...prev, ...result.entries]);
      setOffset(result.nextOffset);
      setHasMore(result.hasMore);
    });
  }, [offset, hasMore, isPending]);

  const filteredEntries = selectedTag
    ? entries.filter((entry) => entry.tags.includes(selectedTag))
    : entries;

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
  };

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-8 lg:pb-16">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-6 lg:px-16 lg:pt-16 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">
              BOOKMARK - 栞
            </h1>
          </div>
        </div>
      </div>

      {/* タグフィルター */}
      <div className="px-6 pb-8 lg:px-16 lg:pb-12">
        <TagFilter
          active={selectedTag !== null}
          tag={selectedTag || ''}
          onClick={clearTagFilter}
        />
      </div>

      {/* フィルター適用中で該当なしメッセージ */}
      {selectedTag !== null && filteredEntries.length === 0 && (
        <div className="px-6 pb-8 lg:px-16 lg:pb-12">
          <div className="lg:max-w-7xl lg:mx-auto">
            <p className="text-[11px] text-[#9B9890] tracking-wide animate-in fade-in duration-500">
              この条件に重なる投稿はありません
            </p>
          </div>
        </div>
      )}

      {/* コンテンツ */}
      {entries.length === 0 && !isPending ? (
        /* データがない場合 */
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <Bookmark className="w-12 h-12 text-[#D4CFC3] mb-6" strokeWidth={1.5} />
          <p
            className="text-[14px] leading-[1.8] text-[#9B9890] tracking-wide text-center max-w-md"
            style={{ fontWeight: 300 }}
          >
            まだお気に入りの投稿はありません。
            <br />
            お気に入りの投稿を見つけて、ここに保存しましょう。
          </p>
        </div>
      ) : (
        /* グリッドレイアウト */
        <div className="px-6 space-y-1 lg:space-y-0 lg:px-16">
          <div className="lg:max-w-7xl lg:mx-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            {filteredEntries.map((entry) => (
              <BookmarkCard key={entry.id} entry={entry} onTagClick={handleTagClick} />
            ))}
          </div>
        </div>
      )}

      {/* ローディング / 追加読み込みトリガー */}
      {entries.length > 0 && (
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
      )}
    </div>
  );
}

