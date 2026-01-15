"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Waves, Archive } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Helper to check active state
    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <div className="flex flex-col h-screen max-w-[430px] lg:max-w-none mx-auto bg-[#FAFAF8] relative">
            {/* Main Content */}
            <div className="flex-1 overflow-auto lg:ml-20 xl:ml-24">
                {children}
            </div>

            {/* Bottom Navigation - Mobile only, hidden on desktop */}
            <nav className="border-t border-[#D4CFC3]/10 bg-[#FAFAF8]/95 backdrop-blur-sm lg:hidden fixed bottom-0 w-full max-w-[430px] z-50">
                <div className="flex items-center justify-around px-6 py-4">
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
                </div>
            </nav>

            {/* Desktop Navigation - Top sidebar, visible only on desktop */}
            <nav className="hidden lg:flex fixed top-0 left-0 h-full w-20 xl:w-24 border-r border-[#D4CFC3]/10 bg-[#F9F8F5]/95 backdrop-blur-sm flex-col items-center py-12 gap-12 z-50">
                {/* Logo */}
                <div className="text-[11px] tracking-[0.2em] uppercase text-[#9B9890] rotate-0 mb-8">
                    AWAI
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col gap-8">
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
                </div>

                {/* Active indicator */}
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
