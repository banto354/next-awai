"use client";

import { useActionState, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ImagePlus, CloudRain, Lock, Globe, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { addPostAction } from '@/app/compose/action';
import { useLocationWeather } from '@/hooks/useLocationWeather';
import imageCompression from 'browser-image-compression';

// バリデーション定数（action.tsと同期）
const MAX_TEXT_LENGTH = 50;
const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 10;

// 投稿データの形状を定義
interface PostState {
  image: string | null;
  text: string;
  isPublic: boolean;
  tags: string;
  // longitude: number;
  // latitude: number;
  locationAvailable: boolean;
  file: File | null;
}

// 初期値の設定
const initialState: PostState = {
  image: null,
  text: '',
  isPublic: false,
  tags: '',
  // longitude: 0,
  // latitude: 0,
  locationAvailable: true,
  file: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  console.log('SubmitButton pending:', pending);
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-8 lg:px-12 py-2.5 lg:py-3 bg-[#D4CFC3] text-[#3D3D3A] text-[13px] lg:text-[15px] tracking-[0.08em] rounded-sm transition-all hover:opacity-80 hover:shadow-md"
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
  // タグ管理用のState
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  // 天気情報
  const { location, weather, loading } = useLocationWeather();
  // トリミング用のState
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null); // 切り抜き範囲(pixel)
  const [tempImgSrc, setTempImgSrc] = useState<string | null>(null); // 一時的に切り抜いた画像
  const [isCropOpen, setIsCropOpen] = useState(false); // トリミングが開いているかどうか
  const [showError, setShowError] = useState(false); // エラー表示のタイマー管理用

  // デスクトップ用：画像の下端と右パネルの下端を揃えるためのref
  const imageRef = useRef<HTMLLabelElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [rightPadTop, setRightPadTop] = useState<number | undefined>(undefined);

  useEffect(() => {
    const sync = () => {
      const img = imageRef.current;
      const panel = rightPanelRef.current;
      if (!img || !panel || window.innerWidth < 1024) {
        setRightPadTop(undefined);
        return;
      }
      const imageBottom = img.getBoundingClientRect().bottom;
      const panelRect = panel.getBoundingClientRect();
      // 右パネル内のコンテンツの自然な高さを取得（paddingTopを除く）
      const currentPadTop = parseFloat(getComputedStyle(panel).paddingTop);
      const contentHeight = panel.scrollHeight - currentPadTop;
      // コンテンツの下端が画像の下端に揃うようにpaddingTopを算出
      const desiredTop = imageBottom - contentHeight;
      const newPad = Math.max(16, desiredTop - panelRect.top);
      setRightPadTop(newPad);
    };

    sync();
    const ro = new ResizeObserver(sync);
    if (imageRef.current) ro.observe(imageRef.current);
    if (rightPanelRef.current) ro.observe(rightPanelRef.current);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  // エラー表示のタイマー（3秒後に自動消去）
  useEffect(() => {
    if (formState.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000); // 3秒後に消える
      return () => clearTimeout(timer);
    }
  }, [formState]); // formState全体を監視して、同じエラーでも再トリガーされるように

  // バリデーション警告を計算
  const validationWarnings = useMemo(() => {
    const warnings: { text?: string; tags?: string; tagInput?: string } = {};

    // テキスト長チェック
    if (post.text.length > MAX_TEXT_LENGTH) {
      warnings.text = `テキストは${MAX_TEXT_LENGTH}文字以内にしてください（現在${post.text.length}文字）`;
    }

    // タグ数チェック（上限を超えた場合のみ警告）
    if (tagList.length > MAX_TAG_COUNT) {
      warnings.tags = `タグは${MAX_TAG_COUNT}個以内にしてください（現在${tagList.length}個）`;
    }
    // 上限に達した状態で新しいタグを入力しようとしている場合
    else if (tagList.length >= MAX_TAG_COUNT && tagInput.trim().length > 0) {
      warnings.tags = `タグは${MAX_TAG_COUNT}個までです。これ以上追加できません`;
    }

    // タグ入力中の長さチェック
    if (tagInput.length > MAX_TAG_LENGTH) {
      warnings.tagInput = `タグは${MAX_TAG_LENGTH}文字以内にしてください（現在${tagInput.length}文字）`;
    }

    return warnings;
  }, [post.text, tagList.length, tagInput]);

  // ファイル選択時の処理（まずはトリミング画面を開く）
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImgSrc(reader.result as string);
      setIsCropOpen(true); // モーダルを開く
      setZoom(1); // ズーム初期化
    };
    reader.readAsDataURL(file);

    // 同じファイルを再選択できるようにinputをリセット
    e.target.value = '';
  };

  // トリミング完了時の処理
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 「決定」ボタンを押したときの処理 (トリミング実行 -> 圧縮 -> state保存)
  const handleCropConfirm = async () => {
    if (!tempImgSrc || !croppedAreaPixels) return;

    try {
      // トリミング実行 (Blobを取得)
      const croppedBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels);
      if (!croppedBlob) return;

      // BlobをFileオブジェクトに変換
      const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });

      // 圧縮実行 
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedBlob = await imageCompression(croppedFile, options);
      const compressedFile = new File([compressedBlob], "compressed.jpg", {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
      // プレビュー表示用のURL生成をPromiseでラップ
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
      })
      // プレビュー表示更新
      setPost(prev => ({
        ...prev,
        image: previewUrl,
        file: compressedFile
      }));

      setIsCropOpen(false); // モーダル閉じる
    } catch (e) {
      console.error(e);
    }
  };

  // タグ入力のキーボード操作
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 変換中（IME使用中）はイベントを無視する
    if (e.nativeEvent.isComposing) return;

    // Enterの判定でタグを追加
    if (e.key === 'Enter') {
      e.preventDefault(); // フォーム送信を防ぐ

      const newTag = tagInput.trim();
      // バリデーションチェック
      if (newTag.length > MAX_TAG_LENGTH) {
        return; // 長すぎるタグは追加しない
      }
      if (tagList.length >= MAX_TAG_COUNT) {
        return; // タグ数上限
      }
      // 重複チェックと空文字チェック
      if (newTag && !tagList.includes(newTag)) {
        const newTags = [...tagList, newTag];
        setTagList(newTags);
        setPost({ ...post, tags: newTags.join(',') });
        setTagInput("");
      }
    }
  };
  const handleTagBlur = () => {
    const newTag = tagInput.trim();
    if (newTag && !tagList.includes(newTag)) {
      const newTags = [...tagList, newTag];
      setTagList(newTags);
      setPost({ ...post, tags: newTags.join(',') });
      setTagInput("");
    }
  };

  // タグの削除機能
  const removeTag = (tagToRemove: string) => {
    const newTags = tagList.filter(tag => tag !== tagToRemove);
    setTagList(newTags);
    setPost({ ...post, tags: newTags.join(',') });
  };

  useEffect(() => {
    if (post.file) {
      // inputタグを探す
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;

      if (fileInput) {
        // DataTransferを使ってファイルをセット可能な形式にする
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(post.file);

        // 3. inputタグにファイルを復元！
        fileInput.files = dataTransfer.files;
      }
    }
  }, [post.file, formState]); // ファイルが変わった時や、エラーが出た時(formState)に実行

  return (
    <>
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
              <span className="text-[13px] tracking-wide">{weather?.temp}°C / {weather?.description}</span>
            </div>
          </div>
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
            ref={imageRef}
            htmlFor="image-upload"
            className="block w-full aspect-[16/10] bg-[#F5F4F0] border border-[#D4CFC3]/20 rounded-sm cursor-pointer transition-all hover:bg-[#E8E6E0]/30 hover:border-[#D4CFC3]/40 relative overflow-hidden lg:shadow-sm"
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
                <span className="text-[13px] lg:text-[16px] text-[#9B9890] tracking-wider">風景を追加</span>
              </div>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            name="image"
          />

          {/* デスクトップ時の天気表示 */}
          <div className="hidden lg:flex items-center gap-3 text-[#7A7A70] mt-6">
            <CloudRain className="w-5 h-5" />
            <span className="text-[15px] font-medium tracking-wide">{weather?.temp}°C / {weather?.description}</span>
          </div>
        </div>

        {/* モバイル分割 */}
        <div className="h-px bg-[#D4CFC3]/10 mx-6 lg:hidden" />

        {/* テキストエリア */}
        <div
          ref={rightPanelRef}
          className="flex-1 px-6 pt-6 pb-28 flex flex-col gap-6 lg:w-2/5 lg:px-16 lg:py-16 lg:gap-8 lg:bg-[#F9F8F5]"
          style={rightPadTop != null ? { paddingTop: rightPadTop } : undefined}
        >
          <div className="flex-1 lg:flex-initial lg:space-y-4">
            <textarea
              value={post.text}
              onChange={(e) => setPost({ ...post, text: e.target.value })}
              placeholder="今考えていることを書き留めましょう..."
              className={`w-full h-32 lg:h-20 bg-transparent border-none outline-none resize-none text-[15px] lg:text-[17px] leading-[1.8] lg:leading-[2] text-[#3D3D3A] placeholder:text-[#9B9890] tracking-wide ${validationWarnings.text ? 'text-red-800/80' : ''}`}
              style={{ fontWeight: 400 }}
              name="text"
            />
            {/* テキストバリデーション警告 */}
            {validationWarnings.text && (
              <div className="flex items-center gap-1.5 text-red-500 text-[11px] lg:text-[12px] mt-1 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{validationWarnings.text}</span>
              </div>
            )}

            {/* タグ */}
            <div className="space-y-2 lg:space-y-3">
              <label className="text-[11px] tracking-[0.12em] uppercase text-[#9B9890]" style={{ fontWeight: 400 }}>
                タグ
              </label>
              <div className="flex flex-wrap items-center gap-2 w-full border-[#D4CFC3]/20 py-2 min-h-[40px]">
                {/* 実際の入力欄 */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  placeholder={tagList.length === 0 ? "春, 食べ物, 晴れ..." : ""}
                  className="w-full bg-transparent border-b border-[#D4CFC3]/20 py-2 lg:py-3 text-[14px] lg:text-[16px] text-[#3D3D3A] placeholder:text-[#9B9890]/60 outline-none focus:border-[#D4CFC3]/40 transition-colors tracking-wide"
                  style={{ fontWeight: 400 }}
                // name="tags"
                />
                {/* 確定したタグの表示 */}
                {tagList.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="group px-3.5 py-1.5 lg:px-4 lg:py-2 bg-[#E8E6E0]/80 hover:bg-[#D4CFC3]/60 text-[#3D3D3A] text-[12px] lg:text-[14px] tracking-wide rounded-full transition-all hover:shadow-sm flex items-center gap-1.5 animate-fadeIn"
                    style={{ fontWeight: 400 }}
                  >
                    <span>#{tag}</span>
                    <X className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#A8A89E] group-hover:text-[#3D3D3A] transition-colors" strokeWidth={2} />
                  </button>
                ))}
              </div>
              {/* タグバリデーション警告 */}
              {(validationWarnings.tags || validationWarnings.tagInput) && (
                <div className="flex items-center gap-1.5 text-red-500 text-[11px] lg:text-[12px] mt-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{validationWarnings.tagInput || validationWarnings.tags}</span>
                </div>
              )}
              {/* サーバー送信用の隠しフィールド */}
              <input type="hidden" name="tags" value={post.tags} />

            </div>
          </div>

          {/* 公開設定 */}
          <div className="flex items-center justify-between pt-4 lg:pt-12 lg:border-t lg:border-[#D4CFC3]/10">
            <button
              type="button"
              onClick={() => setPost({ ...post, isPublic: !post.isPublic })}
              className="flex items-center gap-3 text-[13px] lg:text-[15px] text-[#A8A89E] tracking-wide transition-colors hover:text-[#3D3D3A]"
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
            <input type="hidden" name="latitude" value={location?.lat ?? ""} />
            <input type="hidden" name="longitude" value={location?.lng ?? ""} />
            <input type="hidden" name="temp" value={weather?.temp ?? 0} />
            <input type="hidden" name="weather" value={weather?.description ?? "天気不明"} />
            <input type="hidden" name="weatherId" value={weather?.weatherId ?? 0} />
            <SubmitButton />

          </div>
        </div>
      </form>

      {/* エラートースト（formの外に配置してfixedが正しく動作するように） */}
      <div
        className={`fixed bottom-28 left-4 right-4 z-[100] bg-red-50/95 backdrop-blur-md border border-red-100 px-4 py-3 rounded-lg shadow-lg lg:bottom-10 lg:left-auto lg:right-10 lg:w-auto lg:min-w-[300px] transition-all duration-300 ${formState.error && showError
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
      >
        <div className="flex items-center justify-center gap-2">
          {/* 警告アイコン */}
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 text-[12px] font-medium tracking-wide">
            {typeof formState.error === 'string' ? formState.error : "入力内容を確認してください"}
          </p>
        </div>
      </div>
      {/* トリミング用モーダル */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="max-w-[90vw] w-[500px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#FAFAF8]">
          <DialogHeader className="p-4 bg-[#FAFAF8] z-10">
            <DialogTitle className="text-[#3D3D3A]">調整</DialogTitle>
          </DialogHeader>

          {/* Cropperエリア (相対配置で広げる) */}
          <div className="relative flex-1 w-full bg-[#E8E6E0]">
            {tempImgSrc && (
              <Cropper
                image={tempImgSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 10} // ★仕様アドバイス: アプリのアスペクト比に合わせる
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true} // お好みで
                restrictPosition={true}
                objectFit="contain"
                minZoom={0.8}
                zoomSpeed={1}
              />
            )}
          </div>

          {/* コントロールエリア */}
          <div className="p-6 bg-[#FAFAF8] flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#9B9890]">Zoom</span>
              <Slider
                value={[zoom]}
                min={1} max={4} step={0.1}
                onValueChange={(val) => setZoom(val[0])}
                className="flex-1"
              />
            </div>
            <DialogFooter className="flex-row gap-2 sm:gap-2">
              <button
                onClick={() => setIsCropOpen(false)}
                className="flex-1 py-2.5 border border-[#D4CFC3] text-[#9B9890] text-[13px] lg:text-[15px] tracking-[0.08em] rounded-sm transition-all hover:text-[#3D3D3A] hover:bg-[#E8E6E0]/50"
                style={{ fontWeight: 400 }}
              >
                キャンセル
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 py-2.5 bg-[#D4CFC3] text-[#3D3D3A] text-[13px] lg:text-[15px] tracking-[0.08em] rounded-sm transition-all hover:opacity-80 hover:shadow-md"
                style={{ fontWeight: 400 }}
              >
                完了
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
