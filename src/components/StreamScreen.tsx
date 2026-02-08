"use client";

import { useState, useEffect, useTransition } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudFog, Snowflake } from 'lucide-react';
import Image from 'next/image';
import { mockEntries } from '@/app/data/mockEntries';
import { getStreamPostsAction } from '@/app/stream/action';
import { toggleBookmarkAction } from '@/app/bookmarks/action';
import { StreamEntry } from '@/app/types/entry';
import { getWeatherIconName, WeatherIconName } from '@/lib/weatherUtils';

// 初期状態（ローディング中など）
const LOADING_ENTRY: StreamEntry = {
  id: 'loading',
  text: '読み込み中...',
  image: '',
  date: '',
  weather: '',
  weatherId: 0,
  temperature: 0,
  tags: [],
  isPublic: true,
  latitude: 0,
  longitude: 0,
  user: { userName: '', displayName: '', userImage: '' }
};

export function StreamScreen() {
  const [entries, setEntries] = useState<StreamEntry[]>([LOADING_ENTRY]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // 位置情報を取得して投稿をロードする関数
  const loadStream = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const posts = await getStreamPostsAction(position.coords.latitude, position.coords.longitude);
      if (posts.length > 0) {
        setEntries(posts);
        const initialBookmarks = new Set(
          posts.filter((p) => p.isBookmarked).map((p) => p.id)
        );
        setBookmarkedIds(initialBookmarks);
      } else {
        // データがない場合はフォールバック（モック or 全体ランダム）
        setEntries([]);
      }
    } catch (error) {
      console.warn("Geolocation failed, using mock data", error);

    } finally {
      setLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    loadStream();
  }, []);

  const currentEntry = entries.length > 0 ? entries[currentIndex] : LOADING_ENTRY;

  const handleNext = () => {
    if (entries.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % entries.length);
  };

  const handlePrevious = () => {
    if (entries.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + entries.length) % entries.length);
  };

  const toggleBookmark = () => {
    const previousBookmarked = bookmarkedIds.has(currentEntry.id);
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentEntry.id)) {
        newSet.delete(currentEntry.id);
      } else {
        newSet.add(currentEntry.id);
      }
      return newSet;
    });
    startTransition(async () => {
      const result = await toggleBookmarkAction(currentEntry.id);
      if (!result.success) {
        // ロールバック
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          if (previousBookmarked) {
            newSet.add(currentEntry.id);
          } else {
            newSet.delete(currentEntry.id);
          }
          return newSet;
        });
      }
    });
  };

  const isBookmarked = bookmarkedIds.has(currentEntry.id);

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
        {/* ヘッダー */}
        <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
          <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
            <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">
              Stream
            </h1>
          </div>
        </div>

        {/* 画像エリアと同じ大きさのローディング枠 */}
        <div className="flex-1 px-6 pb-8 lg:px-16 lg:pb-16">
          <div className="lg:max-w-4xl lg:mx-auto w-full">
            <div className="w-full aspect-[16/10] bg-[#F5F4F0] rounded-sm flex items-center justify-center lg:shadow-lg">
              <span className="text-[#9B9890] text-[14px] lg:text-[15px] tracking-wide animate-pulse">
                読み込み中...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // データが0件の場合の表示
  if (!loading && entries.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] text-[#9B9890]">
      まだ公開された投稿がありません。
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">
            Stream
          </h1>
          <div className="text-[11px] text-[#9B9890] tracking-wider">
            {currentIndex + 1} of {entries.length}
          </div>
        </div>
      </div>

      {/* 画像コンテンツ - Zen Mode with Generous Gutters */}
      <div className="flex-1 px-6 pb-8 flex flex-col gap-8 lg:px-16 lg:pb-16">
        <div className="lg:max-w-4xl lg:mx-auto w-full">

          {/* Image Area */}
          <div className="relative w-full aspect-[16/10] lg:aspect-[16/10] bg-[#F5F4F0] rounded-sm overflow-hidden lg:shadow-lg">
            {currentEntry.image ? (
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F5F4F0]">
                <span className="text-[#D4CFC3] text-xs tracking-widest">NO IMAGE</span>
              </div>
            )}
          </div>

          {/* テキスト */}
          <div className="mt-6 lg:mt-8 lg:px-4">
            <p className="text-[15px] lg:text-[20px] leading-[1.9] lg:leading-[2.2] text-[#3D3D3A] tracking-wide lg:max-w-3xl font-normal whitespace-pre-wrap">
              {currentEntry.text}
            </p>
          </div>

          {/* メタデータ (日付・天気・気温) + ブックマーク */}
          <div className="flex items-center justify-between mt-6 lg:mt-8 lg:px-4">
            {/* 左: 日付・天気・気温 */}
            <div className="flex items-center gap-3 text-[13px] lg:text-[15px] text-[#9B9890] tracking-wide">
              <span>{currentEntry.date}</span>
              <span className="text-[#D4CFC3]">·</span>
              {/* 天気アイコン */}
              {(() => {
                const iconName = getWeatherIconName(currentEntry.weatherId);
                const iconProps = { className: "w-4 h-4", strokeWidth: 1.5 };
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
              <span>{currentEntry.temperature}°C</span>
            </div>

            {/* 右: ブックマークアイコン */}
            <div className="flex items-center gap-3">
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
          </div>

          {/* タグ */}
          {currentEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:gap-3 mt-4 lg:mt-6 lg:px-4">
              {currentEntry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 lg:px-4 lg:py-1.5 bg-[#E8E6E0] text-[#A8A89E] text-[11px] lg:text-[13px] tracking-wider rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 仕切り線 */}
          <div className="mt-6 lg:mt-8 lg:px-4">
            <div className="h-px bg-[#D4CFC3]/20" />
          </div>

          {/* ユーザー情報 */}
          <div className="flex items-center gap-3 mt-4 lg:mt-6 lg:px-4">
            <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#E8E6E0] overflow-hidden flex-shrink-0">
              {currentEntry.user.userImage ? (
                <Image
                  src={currentEntry.user.userImage}
                  alt={currentEntry.user.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#D4CFC3]" />
              )}
            </div>
            <span className="text-[13px] lg:text-[15px] text-[#9B9890] tracking-wide font-normal max-w-[120px] lg:max-w-[180px] truncate">
              {currentEntry.user.displayName}
            </span>
          </div>

          {/* ナビゲーションコントロール */}
          <div className="flex items-center justify-between mt-8 lg:justify-center lg:gap-32 lg:mt-12">
            <button
              onClick={handlePrevious}
              className="p-3 lg:p-4 text-[#A8A89E] transition-all hover:text-[#3D3D3A] hover:scale-110"
              aria-label="Previous entry"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
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
          <div className="pt-4 pb-2 flex justify-center lg:pt-6 lg:pb-4">
            <div
              className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full"
              style={{
                backgroundColor: currentEntry.isPublic ? '#A8A89E' : '#D4CFC3'
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}