"use client";

import { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';

interface DiaryEntry {
  id: string;
  image: string;
  text: string;
  date: string;
  weather: string;
  tags: string[];
  isPublic: boolean;
}

const mockEntries: DiaryEntry[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1766932102092-2799e86d0030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwemVuJTIwbmF0dXJlfGVufDF8fHx8MTc2ODE5NzEwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'The morning light filtered through the curtains, soft and unhurried. I sat with my tea and let the silence fill me. There is a particular kind of peace in doing nothing at all.',
    date: 'January 11, 2026',
    weather: '10°C / Rain',
    tags: ['calm', 'reflective'],
    isPublic: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1560996025-95b43d543770?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbW9ybmluZyUyMGxpZ2h0fGVufDF8fHx8MTc2ODE5NzEwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Today I walked without a destination. The city felt different when I wasn\'t rushing through it. I noticed the small café I\'d passed a hundred times, the way the trees bent toward each other over the street.',
    date: 'January 9, 2026',
    weather: '14°C / Clear',
    tags: ['wandering', 'present'],
    isPublic: false,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1710685375110-3b1f3bf8bb1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFucXVpbCUyMHdhdGVyJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3NjgxOTcxMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'The water was still this evening. I sat at the edge and watched my reflection ripple with each breath of wind. Sometimes I feel most myself when I\'m alone with nature.',
    date: 'January 7, 2026',
    weather: '8°C / Cloudy',
    tags: ['solitude', 'nature'],
    isPublic: true,
  },
];

export function StreamScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

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
      {/* Header */}
      <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">Stream</h1>
          <div className="text-[11px] text-[#9B9890] tracking-wider">
            {currentIndex + 1} of {mockEntries.length}
          </div>
        </div>
      </div>

      {/* Main Content - Zen Mode with Generous Gutters */}
      <div className="flex-1 px-6 pb-8 flex flex-col gap-8 lg:px-16 lg:pb-16">
        <div className="lg:max-w-4xl lg:mx-auto w-full">
          {/* Image */}
          <div className="w-full aspect-[4/5] lg:aspect-[16/10] bg-[#F5F4F0] rounded-sm overflow-hidden lg:shadow-lg">
            <img
              src={currentEntry.image}
              alt="Memory"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-[11px] lg:text-[12px] text-[#9B9890] tracking-wide mt-8 lg:mt-12 lg:px-4">
            <span>{currentEntry.date}</span>
            <span>{currentEntry.weather}</span>
          </div>

          {/* Text Content - Desktop: More generous spacing */}
          <div className="flex-1 space-y-6 lg:space-y-10 mt-8 lg:mt-12 lg:px-4">
            <p className="text-[15px] lg:text-[18px] leading-[1.9] lg:leading-[2.2] text-[#3D3D3A] tracking-wide lg:max-w-3xl" style={{ fontWeight: 400 }}>
              {currentEntry.text}
            </p>

            {/* Tags */}
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

      {/* Navigation Controls - Desktop: Fixed at bottom center */}
      <div className="px-6 pb-8 flex items-center justify-between lg:justify-center lg:gap-32 lg:pb-12 lg:max-w-4xl lg:mx-auto lg:w-full">
        <button
          onClick={handlePrevious}
          className="p-3 lg:p-4 text-[#A8A89E] transition-all hover:text-[#3D3D3A] hover:scale-110"
          aria-label="Previous entry"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
        </button>

        {/* Shiori Bookmark Icon - Larger and more interactive on desktop */}
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
            {isBookmarked ? 'Remove bookmark' : 'Save for later'}
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