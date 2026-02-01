'use client';

import { useState } from 'react';
import { Bookmark, ChevronLeft } from 'lucide-react'; // 戻るボタン用にChevronLeftを追加
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Entry } from '@/app/types/entry';

interface EntryDetailFeedProps {
  entry: Entry;
}

export function EntryDetailFeed({ entry }: EntryDetailFeedProps) {
  const router = useRouter();

  // UI上のブックマーク状態管理
  const [isBookmarked, setIsBookmarked] = useState(entry.isBookmarked);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: ここで Server Action を呼んでDB更新を行う

  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          {/* 戻るボタン機能付きのヘッダー */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#9B9890] hover:text-[#3D3D3A] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <h1 className="text-[13px] tracking-[0.15em] uppercase">Entry</h1>
          </button>
        </div>
      </div>

      {/* 画像コンテンツ - StreamScreenのデザインを踏襲 */}
      <div className="flex-1 px-6 pb-8 flex flex-col gap-8 lg:px-16 lg:pb-16">
        <div className="lg:max-w-4xl lg:mx-auto w-full">

          {/* 画像 */}
          <div className="relative w-full aspect-[16/10] lg:aspect-[16/10] bg-[#F5F4F0] rounded-sm overflow-hidden lg:shadow-lg">
            {entry.image ? (
              <Image
                src={entry.image}
                alt="Memory"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#D4CFC3]">
                No Image
              </div>
            )}
          </div>

          {/* メタデータ */}
          <div className="flex items-center justify-between text-[11px] lg:text-[12px] text-[#9B9890] tracking-wide mt-8 lg:mt-12 lg:px-4">
            <div className="flex gap-4">
              <span>{entry.date}</span>
              <span>{entry.weather}</span>
              {entry.temperature !== null && <span>{entry.temperature}°C</span>}
            </div>

            {/* ブックマークボタン (メタデータ列に配置) */}
            <button
              onClick={toggleBookmark}
              className="transition-all hover:scale-110"
              aria-label="Bookmark this entry"
            >
              <Bookmark
                className="w-5 h-5"
                strokeWidth={1.5}
                fill={isBookmarked ? '#C5A088' : 'none'}
                stroke={isBookmarked ? '#C5A088' : '#A8A89E'}
              />
            </button>
          </div>

          {/* テキストコンテンツ */}
          <div className="flex-1 space-y-6 lg:space-y-10 mt-8 lg:mt-12 lg:px-4">
            <p
              className="text-[15px] lg:text-[18px] leading-[1.9] lg:leading-[2.2] text-[#3D3D3A] tracking-wide lg:max-w-3xl"
              style={{ fontWeight: 400 }}
            >
              {entry.text}
            </p>

            {/* タグ */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:gap-3">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 lg:px-4 lg:py-1.5 bg-[#E8E6E0] text-[#A8A89E] text-[11px] lg:text-[12px] tracking-wider rounded-full transition-colors hover:bg-[#D4CFC3]/30"
                    style={{ fontWeight: 400 }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* フッター / プライバシーインジケーター */}
      <div className="px-6 pb-8 flex justify-center">
        <div
          className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full"
          style={{
            backgroundColor: entry.isPublic ? '#A8A89E' : '#D4CFC3'
          }}
          title={entry.isPublic ? "Public" : "Private"}
        />
      </div>
    </div>
  );
}