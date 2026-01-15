"use client";

import { useState } from 'react';
import { Lock, Globe, Calendar } from 'lucide-react';

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
      {/* Header */}
      <div className="px-6 pt-12 pb-6 lg:px-16 lg:pt-16 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">Archive</h1>
        </div>
      </div>

      {/* Weather Filter */}
      <div className="px-6 pb-8 lg:px-16 lg:pb-12">
        <div className="lg:max-w-7xl lg:mx-auto">
          <button
            onClick={() => setFilterActive(!filterActive)}
            className={`
              flex items-center gap-3 px-4 py-2.5 lg:px-6 lg:py-3 rounded-sm text-[12px] lg:text-[13px] tracking-wide transition-all
              ${filterActive
                ? 'bg-[#D4CFC3] text-[#3D3D3A]'
                : 'bg-[#E8E6E0] text-[#A8A89E]'
              }
            `}
            style={{ fontWeight: 400 }}
          >
            <Calendar className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
            <span>Same Temperature as Today ({currentTemp}°C)</span>
          </button>

          {filterActive && filteredEntries.length === 0 && (
            <p className="mt-3 text-[11px] text-[#9B9890] tracking-wide">
              No entries match this temperature
            </p>
          )}
        </div>
      </div>

      {/* Entries - Mobile: List, Desktop: Grid */}
      <div className="space-y-1 lg:space-y-0 lg:px-16">
        <div className="lg:max-w-7xl lg:mx-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="px-6 py-6 transition-all hover:bg-[#E8E6E0]/30 cursor-pointer lg:px-8 lg:py-8 lg:rounded-sm lg:border lg:border-transparent lg:hover:border-[#D4CFC3]/20 lg:hover:shadow-md group"
              style={{
                backgroundColor: entry.isPublic ? '#FAFAF8' : '#F9F8F5',
              }}
            >
              <div className="flex gap-4 lg:flex-col lg:gap-5">
                {/* Thumbnail - Desktop: Full width */}
                <div className="w-20 h-20 flex-shrink-0 bg-[#F5F4F0] rounded-sm overflow-hidden lg:w-full lg:h-48 lg:aspect-[4/3]">
                  <img
                    src={entry.image}
                    alt="Entry thumbnail"
                    className="w-full h-full object-cover transition-transform lg:group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0 lg:gap-4">
                  {/* Text Preview */}
                  <p
                    className="text-[14px] lg:text-[15px] leading-[1.6] lg:leading-[1.8] text-[#3D3D3A] tracking-wide truncate lg:line-clamp-2"
                    style={{ fontWeight: 400 }}
                  >
                    {entry.text}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-3 lg:mt-0">
                    <div className="flex items-center gap-3 text-[11px] lg:text-[12px] text-[#9B9890] tracking-wide">
                      <span>{entry.date}</span>
                      <span className="text-[#D4CFC3]">·</span>
                      <span>{entry.weather}</span>
                    </div>

                    {/* Privacy Icon */}
                    <div className="text-[#A8A89E]">
                      {entry.isPublic ? (
                        <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
                      ) : (
                        <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 lg:gap-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-[10px] lg:text-[11px] text-[#A8A89E] tracking-wider"
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
          ))}
        </div>
      </div>

      {/* Subtle End Marker */}
      <div className="px-6 pt-12 flex justify-center lg:pt-16">
        <div className="text-[10px] lg:text-[11px] text-[#9B9890] tracking-[0.2em] uppercase">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
        </div>
      </div>
    </div>
  );
}