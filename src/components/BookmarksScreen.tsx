'use client';

import { useState } from 'react';
import { Bookmark, Lock, Globe } from 'lucide-react';
import { Entry } from '@/app/types/entry';
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkCard } from '@/components/features/bookmarks/BookmarkCard';

// interface BookmarkListProps {
//   onBack?: () => void;
//   onEntryClick?: (entryId: string) => void;
// }

interface BookmarksScreenProps {
  bookmarkedEntries: Entry[];
  // onEntryClick?: (entryId: string) => void;
}

export function BookmarksScreen({ bookmarkedEntries }: BookmarksScreenProps) {
  // const [bookmarkedEntries] = useState<Entry[]>(
  //   bookmarkedEntries.filter(entry => entry.isBookmarked)
  // );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-8 lg:pb-16">
      {/* Back Button */}
      <div className="px-6 pt-12 pb-6 lg:px-16 lg:pt-16 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-5 h-5 text-[#9B9890]" strokeWidth={1.5} />
            <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">
              栞 Saved Moments
            </h1>
          </div>
          <p className="text-[11px] text-[#A8A89E] tracking-wide">
            {bookmarkedEntries.length} {bookmarkedEntries.length === 1 ? 'entry' : 'entries'} marked
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      {bookmarkedEntries.length === 0 ? (
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
            {bookmarkedEntries.map((entry) => (
              <BookmarkCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Subtle End Marker */}
      {bookmarkedEntries.length > 0 && (
        <div className="px-6 pt-12 flex justify-center lg:pt-16">
          <div className="text-[10px] lg:text-[11px] text-[#9B9890] tracking-[0.2em] uppercase">
            End of saved moments
          </div>
        </div>
      )}
    </div>
  );
}
