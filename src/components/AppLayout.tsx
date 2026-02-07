"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Waves, Archive, BookmarkIcon, CircleUser } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // アクティブなパスを判定するヘルパー関数
    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <div className="flex flex-col h-screen max-w-[430px] lg:max-w-none mx-auto bg-[#FAFAF8] relative">
            {/* メインコンテンツ */}
            <div className="flex-1 overflow-auto lg:ml-20 xl:ml-24">
                {children}
            </div>

            {/* ボトムナビゲーション（モバイル用） */}
            <nav className="border-t border-[#D4CFC3]/10 bg-[#FAFAF8]/95 backdrop-blur-sm lg:hidden fixed bottom-0 w-full max-w-[430px] z-50">
                <div className="flex items-center justify-around px-6 py-4">
                    <SignedIn>
                        {/* コンポーズ */}
                        <Link
                            href="/compose"
                            className={`
                                flex flex-col items-center gap-1.5 transition-colors
                                ${isActive('/compose')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Compose"
                        >
                            <PenLine className="w-5 h-5" strokeWidth={1.5} />
                            <span className="text-[10px] tracking-wider" style={{ fontWeight: 400 }}>
                                Compose
                            </span>
                        </Link>
                    </SignedIn>
                    {/* ストリーム */}
                    <Link
                        href="/stream"
                        className={`
                            flex flex-col items-center gap-1.5 transition-colors
                            ${isActive('/stream') || pathname === '/'
                                ? 'text-[#3D3D3A]'
                                : 'text-[#A8A89E]'
                            }
                            `}
                        aria-label="Stream"
                    >
                        <Waves className="w-5 h-5" strokeWidth={1.5} />
                        <span className="text-[10px] tracking-wider" style={{ fontWeight: 400 }}>
                            Stream
                        </span>
                    </Link>
                    <SignedIn>
                        {/* アーカイブ */}
                        <Link
                            href="/archive"
                            className={`
                                flex flex-col items-center gap-1.5 transition-colors
                                ${isActive('/archive')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Archive"
                        >
                            <Archive className="w-5 h-5" strokeWidth={1.5} />
                            <span className="text-[10px] tracking-wider" style={{ fontWeight: 400 }}>
                                Archive
                            </span>
                        </Link>
                        {/* ブックマーク */}
                        <Link
                            href="/bookmarks"
                            className={`
                                flex flex-col items-center gap-1.5 transition-colors
                                ${isActive('/bookmarks')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Bookmarks"
                        >
                            <BookmarkIcon className="w-5 h-5" strokeWidth={1.5} />
                            <span className="text-[10px] tracking-wider" style={{ fontWeight: 400 }}>
                                Saved
                            </span>
                        </Link>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <Link
                            href="/sign-in"
                            className="flex flex-col items-center gap-1.5 text-[#A8A89E]"
                            aria-label="Sign In"
                        >
                            <CircleUser className="w-5 h-5" strokeWidth={1.5} />
                            <span className="text-[10px] tracking-wider" style={{ fontWeight: 400 }}>
                                Sign In
                            </span>
                        </Link>
                    </SignedOut>
                </div>
            </nav>

            {/* デスクトップ用ナビゲーション - 上部サイドバー、デスクトップでのみ表示 */}
            <nav className="hidden lg:flex fixed top-0 left-0 h-full w-20 xl:w-24 border-r border-[#D4CFC3]/10 bg-[#F9F8F5]/95 backdrop-blur-sm flex-col items-center py-12 gap-12 z-50">
                {/* ロゴ */}
                <Link href="/" className="text-[11px] tracking-[0.2em] uppercase text-[#9B9890] hover:text-[#3D3D3A] transition-colors mb-8">
                    AWAI
                </Link>

                {/* ナビゲーションアイテム */}
                <div className="flex flex-col gap-8">
                    <SignedIn>
                        {/* コンポーズ */}
                        <Link
                            href="/compose"
                            className={`
                                flex flex-col items-center gap-2 transition-all hover:scale-110
                                ${isActive('/compose')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Compose"
                            title="Compose"
                        >
                            <PenLine className="w-6 h-6" strokeWidth={1.5} />
                        </Link>
                    </SignedIn>
                    {/* ストリーム */}
                    <Link
                        href="/stream"
                        className={`
                            flex flex-col items-center gap-2 transition-all hover:scale-110
                            ${isActive('/stream') || pathname === '/'
                                ? 'text-[#3D3D3A]'
                                : 'text-[#A8A89E]'
                            }
                        `}
                        aria-label="Stream"
                        title="Stream"
                    >
                        <Waves className="w-6 h-6" strokeWidth={1.5} />
                    </Link>
                    <SignedIn>
                        {/* アーカイブ */}
                        <Link
                            href="/archive"
                            className={`
                                flex flex-col items-center gap-2 transition-all hover:scale-110
                                ${isActive('/archive')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Archive"
                            title="Archive"
                        >
                            <Archive className="w-6 h-6" strokeWidth={1.5} />
                        </Link>
                        {/* ブックマーク */}
                        <Link
                            href="/bookmarks"
                            className={`
                                flex flex-col items-center gap-2 transition-all hover:scale-110
                                ${isActive('/bookmarks')
                                    ? 'text-[#3D3D3A]'
                                    : 'text-[#A8A89E]'
                                }
                            `}
                            aria-label="Bookmarks"
                            title="Bookmarks"
                        >
                            <BookmarkIcon className="w-6 h-6" strokeWidth={1.5} />
                        </Link>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <Link
                            href="/sign-in"
                            className="flex flex-col items-center gap-1.5 text-[#A8A89E]"
                            aria-label="Sign In"
                        >
                            <CircleUser className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                    </SignedOut>
                </div>

                {/* アクティブインディケーター*/}
                <div className="mt-auto mb-8 flex flex-col gap-2">
                    <div
                        className="w-1 h-1 rounded-full mx-auto transition-all"
                        style={{
                            backgroundColor: '#D4CFC3',
                            opacity: isActive('/compose') ? 1 : 0
                        }}
                    />
                    <div
                        className="w-1 h-1 rounded-full mx-auto transition-all"
                        style={{
                            backgroundColor: '#D4CFC3',
                            opacity: isActive('/stream') || pathname === '/' ? 1 : 0
                        }}
                    />
                    <div
                        className="w-1 h-1 rounded-full mx-auto transition-all"
                        style={{
                            backgroundColor: '#D4CFC3',
                            opacity: isActive('/archive') ? 1 : 0
                        }}
                    />
                </div>
            </nav>
        </div>
    );
}
