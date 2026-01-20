"use client";

import { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { mockEntries } from '@/app/data/mockEntries';

export function StreamScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  // モック
  const currentEntry = mockEntries[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockEntries.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockEntries.length) % mockEntries.length);
  };

  const toggleBookmark = () => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentEntry.id)) {
        newSet.delete(currentEntry.id);
      } else {
        newSet.add(currentEntry.id);
      }
      return newSet;
    });
  };

  const isBookmarked = bookmarkedIds.has(currentEntry.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">Stream</h1>
          <div className="text-[11px] text-[#9B9890] tracking-wider">
            {currentIndex + 1} of {mockEntries.length}
          </div>
        </div>
      </div>

      {/* 画像コンテンツ - Zen Mode with Generous Gutters */}
      <div className="flex-1 px-6 pb-8 flex flex-col gap-8 lg:px-16 lg:pb-16">
        <div className="lg:max-w-4xl lg:mx-auto w-full">
          {/* 画像 */}
          <div className="relative w-full aspect-[4/5] lg:aspect-[16/10] bg-[#F5F4F0] rounded-sm overflow-hidden lg:shadow-lg">
            <Image
              src={currentEntry.image}
              alt="Memory"
              fill
              className="object-cover"
              // ブラウザに適切な画像サイズを選択させるための設定
              sizes="(max-width: 1024px) 100vw, 80vw"
              // 画面の主役となる画像なので、優先的に読み込む設定
              priority
            />
          </div>

          {/* メタデータ */}
          <div className="flex items-center justify-between text-[11px] lg:text-[12px] text-[#9B9890] tracking-wide mt-8 lg:mt-12 lg:px-4">
            <span>{currentEntry.date}</span>
            <span>{currentEntry.weather}</span>
          </div>

          {/* テキストコンテンツ - Desktop: More generous spacing */}
          <div className="flex-1 space-y-6 lg:space-y-10 mt-8 lg:mt-12 lg:px-4">
            <p className="text-[15px] lg:text-[18px] leading-[1.9] lg:leading-[2.2] text-[#3D3D3A] tracking-wide lg:max-w-3xl" style={{ fontWeight: 400 }}>
              {currentEntry.text}
            </p>

            {/* タグ */}
            {currentEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:gap-3">
                {currentEntry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 lg:px-4 lg:py-1.5 bg-[#E8E6E0] text-[#A8A89E] text-[11px] lg:text-[12px] tracking-wider rounded-full transition-colors hover:bg-[#D4CFC3]/30"
                    style={{ fontWeight: 400 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ナビゲーションコントロール　*/}
      <div className="px-6 pb-8 flex items-center justify-between lg:justify-center lg:gap-32 lg:pb-12 lg:max-w-4xl lg:mx-auto lg:w-full">
        <button
          onClick={handlePrevious}
          className="p-3 lg:p-4 text-[#A8A89E] transition-all hover:text-[#3D3D3A] hover:scale-110"
          aria-label="Previous entry"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
        </button>

        {/* ブックマークアイコン */}
        <button
          onClick={toggleBookmark}
          className="relative transition-all group"
          aria-label="Bookmark this entry"
        >
          <Bookmark
            className="w-6 h-6 lg:w-8 lg:h-8 transition-all group-hover:scale-110"
            strokeWidth={1.5}
            fill={isBookmarked ? '#C5A088' : 'none'}
            stroke={isBookmarked ? '#C5A088' : '#A8A89E'}
          />
          {/* Desktop hover tooltip */}
          <span className="hidden lg:block absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#3D3D3A] text-white text-[11px] tracking-wide rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isBookmarked ? 'ブックマークを外す' : 'ブックマークする'}
          </span>
        </button>

        <button
          onClick={handleNext}
          className="p-3 lg:p-4 text-[#A8A89E] transition-all hover:text-[#3D3D3A] hover:scale-110"
          aria-label="Next entry"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Privacy Indicator - Subtle */}
      <div className="px-6 pb-4 flex justify-center lg:pb-8">
        <div
          className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full"
          style={{
            backgroundColor: currentEntry.isPublic ? '#A8A89E' : '#D4CFC3'
          }}
        />
      </div>
    </div>
  );
}