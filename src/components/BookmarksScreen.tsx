'use client';

import { useState } from 'react';
import { Bookmark, ArrowLeft, Lock, Globe } from 'lucide-react';
import { mockEntries } from '@/app/data/mockEntries';
import { ArchiveEntry } from '@/app/types/entry';
interface BookmarkListProps {
  onBack?: () => void;
  onEntryClick?: (entryId: string) => void;
}

export function BookmarksScreen({ onBack, onEntryClick }: BookmarkListProps) {
  const [bookmarkedEntries] = useState<ArchiveEntry[]>(
    mockEntries.filter(entry => entry.isBookmarked)
  );

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

      {/* Content */}
      {bookmarkedEntries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <Bookmark className="w-12 h-12 text-[#D4CFC3] mb-6" strokeWidth={1.5} />
          <p
            className="text-[14px] leading-[1.8] text-[#9B9890] tracking-wide text-center max-w-md"
            style={{ fontWeight: 300 }}
          >
            No memories marked yet.
            <br />
            Save a moment to find it here later.
          </p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="space-y-1 lg:space-y-0 lg:px-16">
          <div className="lg:max-w-7xl lg:mx-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            {bookmarkedEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onEntryClick?.(entry.id)}
                className="px-6 py-6 transition-all hover:bg-[#E8E6E0]/30 cursor-pointer lg:px-8 lg:py-8 lg:rounded-sm lg:border lg:border-transparent lg:hover:border-[#D4CFC3]/20 lg:hover:shadow-md group"
                style={{
                  backgroundColor: entry.isPublic ? '#FAFAF8' : '#F9F8F5',
                }}
              >
                <div className="flex gap-4 lg:flex-col lg:gap-5">
                  {/* Thumbnail - Desktop: Full width */}
                  <div className="w-20 h-20 flex-shrink-0 bg-[#F5F4F0] rounded-sm overflow-hidden lg:w-full lg:h-48 lg:aspect-[4/3] relative">
                    <img
                      src={entry.image}
                      alt="Entry thumbnail"
                      className="w-full h-full object-cover transition-transform lg:group-hover:scale-105"
                    />
                    {/* Bookmark Badge */}
                    <div className="absolute top-2 right-2 bg-[#FAFAF8]/90 backdrop-blur-sm rounded-sm p-1.5">
                      <Bookmark 
                        className="w-3 h-3 fill-[#D4CFC3] stroke-[#D4CFC3]" 
                        strokeWidth={1.5} 
                      />
                    </div>
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
