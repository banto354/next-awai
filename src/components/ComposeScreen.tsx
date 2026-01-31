"use client";

import { useActionState, useState } from 'react';
import { ImagePlus, CloudRain, Lock, Globe, Form } from 'lucide-react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { addPostAction } from '@/app/compose/action';

// 投稿データの形状を定義
interface PostState {
  image: string | null;
  text: string;
  isPublic: boolean;
  tags: string;
  locationAvailable: boolean;
}

// 初期値の設定
const initialState: PostState = {
  image: null,
  text: '',
  isPublic: false,
  tags: '',
  locationAvailable: true,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  console.log('SubmitButton pending:', pending);
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-8 lg:px-12 py-2.5 lg:py-3 bg-[#D4CFC3] text-[#3D3D3A] text-[13px] lg:text-[14px] tracking-[0.08em] rounded-sm transition-all hover:opacity-80 hover:shadow-md"
      style={{ fontWeight: 400 }}
      onClick={() => console.log('SubmitButton clicked')}
    >
      {pending ? '保存中...' : '保存'}
    </button>
  );
}

export function ComposeScreen() {
  // フォームの状態管理
  const [formState, dispatch] = useActionState(addPostAction, { success: false, error: '' });
  // UI用のStateを定義
  const [post, setPost] = useState<PostState>(initialState);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPost({ ...post, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={dispatch} className="min-h-screen flex flex-col bg-[#FAFAF8] lg:flex-row lg:gap-0">
      {/* モバイル用ヘッダー */}
      <div className="px-6 pt-12 pb-6 lg:hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">AWAI</h1>
          </div>
          <div className="flex items-center gap-2 text-[#A8A89E]">
            <CloudRain className="w-4 h-4" />
            {/* 気候情報取得要 */}
            {/* 仮置き */}
            <span className="text-[13px] tracking-wide">10°C / Rain</span>
          </div>
        </div>

        {/* ロケーション */}
        {/* 仮置き */}
        {!post.locationAvailable && (
          <div className="mt-4 text-[11px] text-[#9B9890] tracking-wide bg-gradient-to-r from-[#E8E6E0] to-transparent py-2 px-3 rounded-sm">
            どこか
          </div>
        )}
      </div>

      {/* 画像アップロード */}
      <div className="flex-1 px-6 pb-4 lg:w-3/5 lg:px-16 lg:py-16 lg:pb-16 lg:flex lg:flex-col lg:justify-center">
        {/* デスクトップヘッダー */}
        <div className="hidden lg:block mb-12">
          <h1 className="text-[13px] tracking-[0.2em] uppercase text-[#9B9890] mb-8">AWAI — 書く</h1>
          {!post.locationAvailable && (
            <div className="text-[11px] text-[#9B9890] tracking-wide bg-gradient-to-r from-[#E8E6E0] to-transparent py-2 px-3 rounded-sm inline-block">
              どこか
            </div>
          )}
        </div>

        <label
          htmlFor="image-upload"
          className="block h-full aspect-[16/10] bg-[#F5F4F0] border border-[#D4CFC3]/20 rounded-sm cursor-pointer transition-all hover:bg-[#E8E6E0]/30 hover:border-[#D4CFC3]/40 relative overflow-hidden lg:shadow-sm"
        >
          {post.image ? (
            <Image
              src={post.image}
              alt="Uploaded memory"
              fill
              className="object-cover" // 画面幅に応じた最適化（モバイルはフル幅、デスクトップは最大幅を考慮）
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority // 投稿画面のメインビジュアルなので優先的に読み込み
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 lg:gap-6">
              <ImagePlus className="w-10 h-10 lg:w-16 lg:h-16 text-[#D4CFC3] transition-transform hover:scale-110" strokeWidth={1.5} />
              <span className="text-[13px] lg:text-[15px] text-[#9B9890] tracking-wider">風景を追加</span>
            </div>
          )}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          name="image"
        />

        {/* デスクトップ時の天気表示 */}
        <div className="hidden lg:flex items-center gap-2 text-[#A8A89E] mt-6">
          <CloudRain className="w-4 h-4" />
          <span className="text-[13px] tracking-wide">10°C / Rain</span>
        </div>
      </div>

      {/* モバイル分割 */}
      <div className="h-px bg-[#D4CFC3]/10 mx-6 lg:hidden" />

      {/* テキストエリア */}
      <div className="flex-1 px-6 pt-6 pb-28 flex flex-col gap-6 lg:w-2/5 lg:px-16 lg:py-16 lg:gap-8 lg:justify-center lg:bg-[#F9F8F5]">
        <div className="flex-1 lg:flex-initial lg:space-y-8">
          <textarea
            value={post.text}
            onChange={(e) => setPost({ ...post, text: e.target.value })}
            placeholder="Write a quiet thought..."
            className="w-full h-32 lg:h-48 bg-transparent border-none outline-none resize-none text-[15px] lg:text-[16px] leading-[1.8] lg:leading-[2] text-[#3D3D3A] placeholder:text-[#9B9890] tracking-wide"
            style={{ fontWeight: 400 }}
            name="text"
          />

          {/* タグ */}
          <div className="space-y-2 lg:space-y-3">
            <label className="text-[11px] tracking-[0.12em] uppercase text-[#9B9890]" style={{ fontWeight: 400 }}>
              タグ
            </label>
            <input
              type="text"
              value={post.tags}
              onChange={(e) => setPost({ ...post, tags: e.target.value })}
              placeholder="春, 静寂, 発見..."
              className="w-full bg-transparent border-b border-[#D4CFC3]/20 py-2 lg:py-3 text-[14px] lg:text-[15px] text-[#3D3D3A] placeholder:text-[#9B9890]/60 outline-none focus:border-[#D4CFC3]/40 transition-colors tracking-wide"
              style={{ fontWeight: 400 }}
              name="tags"
            />
          </div>
        </div>

        {/* 公開設定 */}
        <div className="flex items-center justify-between pt-4 lg:pt-12 lg:border-t lg:border-[#D4CFC3]/10">
          <button
            type="button"
            onClick={() => setPost({ ...post, isPublic: !post.isPublic })}
            className="flex items-center gap-3 text-[13px] lg:text-[14px] text-[#A8A89E] tracking-wide transition-colors hover:text-[#3D3D3A]"
            style={{ fontWeight: 400 }}
          >
            {post.isPublic ? (
              <>
                <Globe className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
                <span>公開</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
                <span>非公開</span>
              </>
            )}
          </button>
          <input type="hidden" name="isPublic" value={post.isPublic ? 'true' : 'false'} />
          <input type="hidden" name="locationAvailable" value={String(post.locationAvailable)} />
          <SubmitButton />

        </div>
      </div>
      {formState.error && (
        <div className="fixed bottom-24 left-6 right-6 z-50 animate-in slide-in-from-bottom-2 bg-red-50/95 backdrop-blur-md border border-red-100 px-4 py-3 rounded-sm shadow-sm lg:bottom-10 lg:left-auto lg:right-10 lg:translate-x-0 lg:w-auto lg:min-w-[300px] lg:rounded-md">
          <div className="flex items-center justify-center gap-2">
            {/* 警告アイコン（オプション） */}
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-600 text-[12px] font-medium tracking-wide">
              {typeof formState.error === 'string' ? formState.error : "入力内容を確認してください"}
            </p>
          </div>
        </div>
      )}
    </form>

  );
}