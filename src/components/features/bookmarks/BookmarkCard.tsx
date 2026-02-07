import Link from 'next/link';
import Image from 'next/image';
import { Lock, Globe, Bookmark, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudFog, Snowflake } from 'lucide-react';
import { TagList } from '@/components/ui/tagList';
import { BookmarkEntry } from '@/app/types/entry';
import { getWeatherIconName, WeatherIconName } from '@/lib/weatherUtils';

// プロパティの型定義
interface BookmarkCardProps {
  entry: BookmarkEntry;
}

export function BookmarkCard({ entry }: BookmarkCardProps) {
  return (
    <Link
      href={`/entry/${entry.id}`}
      key={entry.id}
      className="px-6 py-6 transition-all hover:bg-[#E8E6E0]/30 cursor-pointer lg:px-8 lg:py-8 lg:rounded-sm lg:border lg:border-transparent lg:hover:border-[#D4CFC3]/20 lg:hover:shadow-md group"
      style={{
        backgroundColor: entry.isPublic ? '#FAFAF8' : '#F9F8F5',
      }}
    >
      <div className="flex gap-4 lg:flex-col lg:gap-5">
        {/* サムネイル */}
        <div className="w-20 h-20 flex-shrink-0 bg-[#F5F4F0] rounded-sm overflow-hidden lg:w-full lg:h-48 lg:aspect-[16/10] relative">
          <Image
            src={entry.image}
            alt="Entry thumbnail"
            fill
            sizes="(max-width: 1024px) 80px, (max-width: 1280px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform lg:group-hover:scale-105"
          />
          {/* ブックマークバッジ */}
          <div className="absolute top-2 right-2 bg-[#FAFAF8]/90 backdrop-blur-sm rounded-sm p-1.5">
            <Bookmark
              className="w-3 h-3 fill-[#D4CFC3] stroke-[#D4CFC3]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 flex flex-col justify-between min-w-0 lg:gap-4">
          {/* Text Preview */}
          <p
            className="text-[14px] lg:text-[16px] leading-[1.6] lg:leading-[1.8] text-[#3D3D3A] tracking-wide truncate lg:line-clamp-2"
            style={{ fontWeight: 400 }}
          >
            {entry.text}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-3 lg:mt-0">
            <div className="flex items-center gap-3 text-[11px] lg:text-[13px] text-[#9B9890] tracking-wide">
              <span>{entry.date}</span>
              <span className="text-[#D4CFC3]">·</span>
              {/* 天気アイコン + 気温 */}
              {(() => {
                const iconName = getWeatherIconName(entry.weatherId);
                const iconProps = { className: "w-3 h-3", strokeWidth: 1.5 };
                const icons: Record<WeatherIconName, React.ReactNode> = {
                  Sun: <Sun {...iconProps} />,
                  Cloud: <Cloud {...iconProps} />,
                  CloudRain: <CloudRain {...iconProps} />,
                  CloudDrizzle: <CloudDrizzle {...iconProps} />,
                  CloudLightning: <CloudLightning {...iconProps} />,
                  CloudFog: <CloudFog {...iconProps} />,
                  Snowflake: <Snowflake {...iconProps} />,
                };
                return icons[iconName];
              })()}
              <span>{entry.temperature}°C</span>
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
                  className="text-[10px] lg:text-[12px] text-[#A8A89E] tracking-wider"
                  style={{ fontWeight: 400 }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {/* 作成ユーザー情報 */}
          {entry.user && (
            <div className="flex items-center gap-2 mt-4 lg:mt-5 pt-3 lg:pt-4 border-t border-[#E8E6E0]/50">
              {/* Tiny Avatar */}
              <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#E8E6E0] overflow-hidden flex-shrink-0">
                {entry.user.userImage ? (
                  <img
                    src={entry.user.userImage}
                    alt={entry.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D4CFC3]" />
                )}
              </div>

              {/* Author Name */}
              <span
                className="text-[11px] lg:text-[13px] text-[#A8A89E] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                {entry.user.displayName}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}