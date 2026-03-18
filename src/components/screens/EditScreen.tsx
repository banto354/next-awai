"use client";

import { useActionState, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ImagePlus, Lock, Globe, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { updatePostAction } from '@/app/entry/[id]/edit/action';
import imageCompression from 'browser-image-compression';

const MAX_TEXT_LENGTH = 50;
const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 10;

interface EditScreenProps {
  postId: string;
  initialText: string;
  initialTags: string[];
  initialIsPublic: boolean;
  initialImageUrl: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-8 lg:px-12 py-2.5 lg:py-3 bg-[#D4CFC3] text-[#3D3D3A] text-[13px] lg:text-[15px] tracking-[0.08em] rounded-sm transition-all hover:opacity-80 hover:shadow-md"
      style={{ fontWeight: 400 }}
    >
      {pending ? '更新中...' : '更新する'}
    </button>
  );
}

export function EditScreen({ postId, initialText, initialTags, initialIsPublic, initialImageUrl }: EditScreenProps) {
  const router = useRouter();
  const [formState, dispatch] = useActionState(updatePostAction, { success: false, error: '', postId: '' });

  const [text, setText] = useState(initialText);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [tagList, setTagList] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialTags.join(','));

  // 画像管理
  const [previewImage, setPreviewImage] = useState<string>(initialImageUrl);
  const [newFile, setNewFile] = useState<File | null>(null);

  // トリミング
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // 更新成功時: 履歴を置き換えて詳細ページへ（router.back()が正しく動くように）
  useEffect(() => {
    if (formState.success && formState.postId) {
      router.replace(`/entry/${formState.postId}`);
    }
  }, [formState.success, formState.postId, router]);

  // エラー表示
  const [showError, setShowError] = useState(false);
  const [prevFormState, setPrevFormState] = useState(formState);
  if (formState !== prevFormState) {
    setPrevFormState(formState);
    if (formState.error) setShowError(true);
  }
  useEffect(() => {
    if (!showError) return;
    const timer = setTimeout(() => setShowError(false), 3000);
    return () => clearTimeout(timer);
  }, [showError]);

  const validationWarnings = useMemo(() => {
    const warnings: { text?: string; tags?: string; tagInput?: string } = {};
    if (text.length > MAX_TEXT_LENGTH) {
      warnings.text = `テキストは${MAX_TEXT_LENGTH}文字以内にしてください（現在${text.length}文字）`;
    }
    if (tagList.length > MAX_TAG_COUNT) {
      warnings.tags = `タグは${MAX_TAG_COUNT}個以内にしてください（現在${tagList.length}個）`;
    } else if (tagList.length >= MAX_TAG_COUNT && tagInput.trim().length > 0) {
      warnings.tags = `タグは${MAX_TAG_COUNT}個までです。これ以上追加できません`;
    }
    if (tagInput.length > MAX_TAG_LENGTH) {
      warnings.tagInput = `タグは${MAX_TAG_LENGTH}文字以内にしてください（現在${tagInput.length}文字）`;
    }
    return warnings;
  }, [text, tagList.length, tagInput]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTempImgSrc(reader.result as string);
      setIsCropOpen(true);
      setZoom(1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!tempImgSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels);
      if (!croppedBlob) return;
      const croppedFile = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      const compressedBlob = await imageCompression(croppedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      const compressedFile = new File([compressedBlob], 'compressed.jpg', {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      setPreviewImage(previewUrl);
      setNewFile(compressedFile);
      setIsCropOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag.length > MAX_TAG_LENGTH || tagList.length >= MAX_TAG_COUNT) return;
      if (newTag && !tagList.includes(newTag)) {
        const newTags = [...tagList, newTag];
        setTagList(newTags);
        setTags(newTags.join(','));
        setTagInput('');
      }
    }
  };

  const handleTagBlur = () => {
    const newTag = tagInput.trim();
    if (newTag && !tagList.includes(newTag)) {
      const newTags = [...tagList, newTag];
      setTagList(newTags);
      setTags(newTags.join(','));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tagList.filter((t) => t !== tagToRemove);
    setTagList(newTags);
    setTags(newTags.join(','));
  };

  // newFileをinputに反映
  useEffect(() => {
    if (newFile) {
      const fileInput = document.getElementById('image-upload-edit') as HTMLInputElement;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(newFile);
        fileInput.files = dataTransfer.files;
      }
    }
  }, [newFile, formState]);

  return (
    <>
      <form action={dispatch} className="min-h-screen flex flex-col bg-[#FAFAF8] lg:flex-row lg:gap-0">
        {/* モバイル用ヘッダー */}
        <div className="px-6 pt-12 pb-6 lg:hidden">
          <h1 className="text-[13px] tracking-[0.15em] uppercase text-[#9B9890]">AWAI — 編集</h1>
        </div>

        {/* 左パネル：画像 */}
        <div className="flex-1 px-6 pb-4 lg:w-3/5 lg:px-16 lg:py-16 lg:flex lg:flex-col lg:justify-center">
          <div className="hidden lg:block mb-12">
            <h1 className="text-[13px] tracking-[0.2em] uppercase text-[#9B9890]">AWAI — 編集</h1>
          </div>

          <label
            htmlFor="image-upload-edit"
            className="block w-full aspect-[16/10] bg-[#F5F4F0] border border-[#D4CFC3]/20 rounded-sm cursor-pointer transition-all hover:bg-[#E8E6E0]/30 hover:border-[#D4CFC3]/40 relative overflow-hidden lg:shadow-sm"
          >
            {previewImage ? (
              <Image
                src={previewImage}
                alt="投稿画像"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 lg:gap-6">
                <ImagePlus className="w-10 h-10 lg:w-16 lg:h-16 text-[#D4CFC3]" strokeWidth={1.5} />
                <span className="text-[13px] lg:text-[16px] text-[#9B9890] tracking-wider">画像を変更</span>
              </div>
            )}
            {/* 画像変更オーバーレイ */}
            {previewImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                <span className="opacity-0 hover:opacity-100 text-white text-[13px] tracking-wider transition-opacity">
                  画像を変更
                </span>
              </div>
            )}
          </label>
          <input
            id="image-upload-edit"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            name="image"
          />
        </div>

        {/* モバイル分割線 */}
        <div className="h-px bg-[#D4CFC3]/10 mx-6 lg:hidden" />

        {/* 右パネル：フォーム */}
        <div className="flex-1 px-6 pt-6 pb-28 flex flex-col gap-6 lg:w-2/5 lg:px-16 lg:py-16 lg:gap-8 lg:bg-[#F9F8F5] lg:justify-end">
          <div className="flex-1 lg:flex-initial lg:space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="今考えていることを書き留めましょう..."
              className={`w-full h-32 lg:h-20 bg-transparent border-none outline-none resize-none text-[15px] lg:text-[17px] leading-[1.8] lg:leading-[2] text-[#3D3D3A] placeholder:text-[#9B9890] tracking-wide ${validationWarnings.text ? 'text-red-800/80' : ''}`}
              style={{ fontWeight: 400 }}
              name="text"
            />
            {validationWarnings.text && (
              <div className="flex items-center gap-1.5 text-red-500 text-[11px] lg:text-[12px] mt-1">
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
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  placeholder={tagList.length === 0 ? '春, 食べ物, 晴れ...' : ''}
                  className="w-full bg-transparent border-b border-[#D4CFC3]/20 py-2 lg:py-3 text-[14px] lg:text-[16px] text-[#3D3D3A] placeholder:text-[#9B9890]/60 outline-none focus:border-[#D4CFC3]/40 transition-colors tracking-wide"
                  style={{ fontWeight: 400 }}
                />
                {tagList.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="group px-3.5 py-1.5 lg:px-4 lg:py-2 bg-[#E8E6E0]/80 hover:bg-[#D4CFC3]/60 text-[#3D3D3A] text-[12px] lg:text-[14px] tracking-wide rounded-full transition-all flex items-center gap-1.5"
                    style={{ fontWeight: 400 }}
                  >
                    <span>#{tag}</span>
                    <X className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#A8A89E] group-hover:text-[#3D3D3A] transition-colors" strokeWidth={2} />
                  </button>
                ))}
              </div>
              {(validationWarnings.tags || validationWarnings.tagInput) && (
                <div className="flex items-center gap-1.5 text-red-500 text-[11px] lg:text-[12px] mt-1">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{validationWarnings.tagInput || validationWarnings.tags}</span>
                </div>
              )}
              <input type="hidden" name="tags" value={tags} />
            </div>
          </div>

          {/* 公開設定 + 更新ボタン */}
          <div className="flex items-center justify-between pt-4 lg:pt-12 lg:border-t lg:border-[#D4CFC3]/10">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className="flex items-center gap-3 text-[13px] lg:text-[15px] text-[#A8A89E] tracking-wide transition-colors hover:text-[#3D3D3A]"
              style={{ fontWeight: 400 }}
            >
              {isPublic ? (
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
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="isPublic" value={isPublic ? 'true' : 'false'} />
            <input type="hidden" name="existingImageUrl" value={initialImageUrl} />
            <SubmitButton />
          </div>
        </div>
      </form>

      {/* エラートースト */}
      <div
        className={`fixed bottom-28 left-4 right-4 z-[100] bg-red-50/95 backdrop-blur-md border border-red-100 px-4 py-3 rounded-lg shadow-lg lg:bottom-10 lg:left-auto lg:right-10 lg:w-auto lg:min-w-[300px] transition-all duration-300 ${
          formState.error && showError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 text-[12px] font-medium tracking-wide">
            {typeof formState.error === 'string' ? formState.error : "入力内容を確認してください"}
          </p>
        </div>
      </div>

      {/* トリミングモーダル */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="max-w-[90vw] w-[500px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#FAFAF8]">
          <DialogHeader className="p-4 bg-[#FAFAF8] z-10">
            <DialogTitle className="text-[#3D3D3A]">調整</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 w-full bg-[#E8E6E0]">
            {tempImgSrc && (
              <Cropper
                image={tempImgSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 10}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid
                restrictPosition
                objectFit="contain"
                minZoom={0.8}
                zoomSpeed={1}
              />
            )}
          </div>
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
                className="flex-1 py-2.5 border border-[#D4CFC3] text-[#9B9890] text-[13px] tracking-[0.08em] rounded-sm transition-all hover:text-[#3D3D3A] hover:bg-[#E8E6E0]/50"
                style={{ fontWeight: 400 }}
              >
                キャンセル
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 py-2.5 bg-[#D4CFC3] text-[#3D3D3A] text-[13px] tracking-[0.08em] rounded-sm transition-all hover:opacity-80 hover:shadow-md"
                style={{ fontWeight: 400 }}
              >
                完了
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
