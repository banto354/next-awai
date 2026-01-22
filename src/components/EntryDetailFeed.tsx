'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Globe, Bookmark } from 'lucide-react';
import { mockEntries } from '@/app/data/mockEntries';
import { ArchiveEntry } from '@/app/types/entry';
import Image from 'next/image';

interface EntryDetailFeedProps {
  initialEntryId?: string;
  onBack?: () => void;
}

export function EntryDetailFeed({ initialEntryId, onBack }: EntryDetailFeedProps) {
  const [entries] = useState<ArchiveEntry[]>(mockEntries);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 最初の投稿インデックスを設定
  useEffect(() => {
    if (initialEntryId) {
      const index = entries.findIndex(entry => entry.id === initialEntryId);
      if (index !== -1) {
        setCurrentIndex(index);
        // エントリーまでスクロール
        setTimeout(() => {
          document.getElementById(`entry-${initialEntryId}`)?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [initialEntryId, entries]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* バックボタン */}
      {/* <div className="fixed top-6 left-6 z-50 lg:left-32">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#3D3D3A] hover:text-[#9B9890] transition-colors"
          aria-label="Back to Archive"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ fontWeight: 400 }}>
            Archive
          </span>
        </button>
      </div> */}

      {/* 垂直フィード */}
      <div className="pt-24 pb-16">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            id={`entry-${entry.id}`}
            className="mb-16 last:mb-0"
          >
            {/* 投稿コンテナ */}
            <div className="max-w-2xl mx-auto px-6 lg:px-8">
              {/* 画像 */}
              {/* <div className="mb-6 aspect-[4/5] lg:aspect-square overflow-hidden rounded-sm bg-[#F5F4F0]">
                <Image
                    src={entry.image}
                    alt={entry.text}
                    fill
                    sizes="(max-width: 1024px) 80px, (max-width: 1280px) 50vw, 33vw"
                    className="w-full h-full object-cover"
                />
              </div> */}
            <div className="relative aspect-[16/10] w-full bg-[#F5F4F0] rounded-sm overflow-hidden shadow-sm mb-8 lg:aspect-[16/10] lg:mb-12">
                <Image
                src={entry.image}
                alt="Memory"
                fill
                className="object-cover"
                priority
                />
            </div>

              {/* テキストコンテンツ */}
              <div className="space-y-6">
                {/* メインテキスト */}
                <p
                  className="text-[16px] lg:text-[18px] leading-[1.8] lg:leading-[2] text-[#3D3D3A] tracking-wide"
                  style={{ fontWeight: 400 }}
                >
                  {entry.text}
                </p>

                {/* メタデータ */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[12px] text-[#9B9890] tracking-wide">
                    <span>{entry.date}</span>
                    <span className="text-[#D4CFC3]">·</span>
                    <span>{entry.weather}</span>
                    <span className="text-[#D4CFC3]">·</span>
                    <span>{entry.temperature}°C</span>
                  </div>

                  {/* アイコン */}
                  <div className="flex items-center gap-3 text-[#A8A89E]">
                    {entry.isPublic ? (
                      <Globe className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                    )}
                    {entry.isBookmarked && (
                      <Bookmark className="w-4 h-4 fill-[#D4CFC3] stroke-[#D4CFC3]" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                {/* タグ */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-[11px] text-[#A8A89E] tracking-wider"
                        style={{ fontWeight: 400 }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 分割 */}
            {index < entries.length - 1 && (
              <div className="mt-16 max-w-2xl mx-auto px-6 lg:px-8">
                <div className="h-px bg-[#E8E6E0]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* スクロールインジケーター */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-[#9B9890] opacity-50">
        Scroll for more
      </div> */}
    </div>
  );
}
