import Image from 'next/image';
import { Lock, Globe } from 'lucide-react';

// プロパティの型定義
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

interface ArchiveCardProps {
  entry: ArchiveEntry;
}

export function ArchiveCard({ entry }: ArchiveCardProps) {
  return (
    <div
      className="px-6 py-6 transition-all hover:bg-[#E8E6E0]/30 cursor-pointer lg:px-8 lg:py-8 lg:rounded-sm lg:border lg:border-transparent lg:hover:border-[#D4CFC3]/20 lg:hover:shadow-md group"
      style={{
        backgroundColor: entry.isPublic ? '#FAFAF8' : '#F9F8F5',
      }}
    >
      <div className="flex gap-4 lg:flex-col lg:gap-5">
        {/* サムネイル */}
        <div className="relative w-20 h-20 flex-shrink-0 bg-[#F5F4F0] rounded-sm overflow-hidden lg:w-full lg:h-48 lg:aspect-[4/3]">
          <Image
            src={entry.image}
            alt="Entry thumbnail"
            fill
            sizes="(max-width: 1024px) 80px, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform lg:group-hover:scale-105"
          />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 flex flex-col justify-between min-w-0 lg:gap-4">
          <p className="text-[14px] lg:text-[15px] leading-[1.6] lg:leading-[1.8] text-[#3D3D3A] tracking-wide truncate lg:line-clamp-2">
            {entry.text}
          </p>

          {/* メタデータ */}
          <div className="flex items-center justify-between mt-3 lg:mt-0">
            <div className="flex items-center gap-3 text-[11px] lg:text-[12px] text-[#9B9890] tracking-wide">
              <span>{entry.date}</span>
              <span className="text-[#D4CFC3]">·</span>
              <span>{entry.weather}</span>
            </div>

            <div className="text-[#A8A89E]">
              {entry.isPublic ? (
                <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
              ) : (
                <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* タグ */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 lg:gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-[10px] lg:text-[11px] text-[#A8A89E] tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}