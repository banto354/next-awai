"use client";

import { PenLine } from 'lucide-react';
import Link from 'next/link';

export function LandingPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAFAF8] relative overflow-hidden">
      {/* 背景の装飾（あわいグラデーション） */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#D4CFC3]/20 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-12 animate-in fade-in duration-1000 slide-in-from-bottom-4">
        {/* ロゴ */}
        <h1 className="text-[14px] tracking-[0.3em] uppercase text-[#9B9890]">
          AWAI
        </h1>

        {/* キャッチコピー */}
        <div className="text-center space-y-6">
          <p className="text-[24px] lg:text-[28px] text-[#3D3D3A] font-light leading-relaxed tracking-wide" style={{ fontFamily: 'serif' }}>
            言葉と、<br className="lg:hidden" />あわい。
          </p>
          <p className="text-[12px] text-[#9B9890] tracking-wider leading-loose">
            日々のうつろいを<br />
            静かに書き留める場所
          </p>
        </div>

        {/* Enterボタン（App.tsxの handleEnterApp に相当） */}
        <Link
          href="/stream"
          className="group relative px-8 lg:px-12 py-2.5 lg:py-3 overflow-hidden rounded-sm transition-all hover:shadow-md"
        >
          <div className="absolute inset-0 bg-[#E8E6E0] group-hover:bg-[#D4CFC3] transition-colors duration-500" />
          <div className="relative flex items-center gap-3 text-[#3D3D3A]">
            <PenLine className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
            <span className="text-[11px] tracking-[0.2em] uppercase" style={{ fontWeight: 400 }}>Enter</span>
          </div>
        </Link>
      </div>

      {/* フッター */}
      <div className="absolute bottom-12 text-[10px] text-[#D4CFC3] tracking-widest uppercase">
        Est. 2026
      </div>
    </div>
  );
}