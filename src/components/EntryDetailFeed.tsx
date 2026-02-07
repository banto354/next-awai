'use client';

import { useState, useTransition } from 'react';
import { Bookmark, ChevronLeft, Trash2 } from 'lucide-react'; // 戻るボタン用にChevronLeftを追加
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Entry } from '@/app/types/entry';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // コンポーネントのパスは環境に合わせて調整してください
import { deletePostAction } from '@/app/compose/action';
import { toggleBookmarkAction } from '@/app/bookmarks/action';

interface EntryDetailFeedProps {
  entry: Entry;
  isAuthor: boolean;
}

export function EntryDetailFeed({ entry, isAuthor }: EntryDetailFeedProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI上のブックマーク状態管理
  const [isBookmarked, setIsBookmarked] = useState(entry.isBookmarked);

  const toggleBookmark = () => {
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);
    startTransition(async () => {
      const result = await toggleBookmarkAction(entry.id);
      if (!result.success) {
        setIsBookmarked(previousState);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePostAction(entry.id, entry.image);
      if (result?.error) {
        alert(result.error); // 簡易エラー表示
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* ヘッダー */}
      <div className="px-6 pt-12 pb-8 lg:px-16 lg:pt-16 lg:pb-12">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          {/* 戻るボタン機能付きのヘッダー */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#3D3D3A] hover:text-[#9B9890] transition-colors group"
            aria-label="Back to Archive"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
            <span className="text-[11px] tracking-[0.15em] uppercase" style={{ fontWeight: 400 }}>
              一覧へ
            </span>
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

          {/* メタデータ行 (ユーザー左 / 日付・アクション右) */}
          <div className="flex items-center justify-between mt-8 lg:mt-12 lg:px-4">

            {/* 左: ユーザー情報 */}
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#E8E6E0] overflow-hidden flex-shrink-0">
                {entry.user.userImage ? (
                  <Image
                    src={entry.user.userImage}
                    alt={entry.user.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D4CFC3]" />
                )}
              </div>
              <span className="text-[13px] lg:text-[14px] text-[#9B9890] tracking-wide font-normal">
                {entry.user.displayName}
              </span>
            </div>

            {/* 右: 日付・天気・アクションボタン */}
            <div className="flex items-center gap-3 text-[13px] lg:text-[14px] text-[#9B9890] tracking-wide">
              <span>{entry.date}</span>
              <span className="text-[#D4CFC3]">·</span>
              <span>{entry.temperature}°C / {entry.weather}</span>
              <span className="text-[#D4CFC3]">·</span>
              {/* 削除ボタン (所有者のみ表示) */}
              {isAuthor && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="transition-all hover:scale-110 text-[#A8A89E] hover:text-[#C5A088]" // ホバー時に警告色（Soft Clay）に
                      aria-label="Delete entry"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </AlertDialogTrigger>

                  {/* ダイアログ本体: 背景色をAWAIのペーパーカラー(#FAFAF8)に合わせ、枠線をアクセントカラーに */}
                  <AlertDialogContent className="bg-[#FAFAF8] border-[#D4CFC3] shadow-md p-8 sm:rounded-sm max-w-[400px]">
                    <AlertDialogHeader className="space-y-3">
                      <AlertDialogTitle className="text-[#3D3D3A] tracking-wider text-[16px] font-medium">
                        この投稿を削除しますか？
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#9B9890] text-[13px] leading-relaxed tracking-wide">
                        この操作は取り消すことができません。<br />
                        投稿と画像データは完全に削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
                      {/* キャンセルボタン: 背景透明、枠線あり、文字はグレー */}
                      <AlertDialogCancel
                        className="border-[#D4CFC3] text-[#9B9890] hover:text-[#3D3D3A] hover:bg-[#E8E6E0]/50 bg-transparent text-[13px] tracking-[0.08em] h-10 px-6 rounded-sm transition-all"
                        style={{ fontWeight: 400 }}
                      >
                        キャンセル
                      </AlertDialogCancel>

                      {/* 削除ボタン: AWAIのDestructiveカラー(#C5A088)を使用 */}
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-[#C5A088] hover:opacity-80 text-[#FAFAF8] border-none text-[13px] tracking-[0.08em] h-10 px-6 rounded-sm shadow-sm transition-all hover:shadow-md"
                        style={{ fontWeight: 400 }}
                      >
                        {isPending ? '処理中...' : '削除する'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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