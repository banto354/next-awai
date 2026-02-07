import { Tag, X } from 'lucide-react';

interface TagFilterProps {
    active: boolean;
    tag: string;
    onClick: () => void;
    hasMatches: boolean;
}

export function TagFilter({
    active,
    tag,
    onClick,
    hasMatches,
}: TagFilterProps) {
    if (!active) return null;

    return (
        <div className="lg:max-w-7xl lg:mx-auto">
            <button
                onClick={onClick}
                className={`
          flex items-center gap-3 px-4 py-2.5 lg:px-6 lg:py-3 rounded-sm text-[12px] lg:text-[14px] tracking-wide transition-all
          bg-[#D4CFC3] text-[#3D3D3A] hover:bg-[#C9C4B8]
        `}
                style={{ fontWeight: 400 }}
            >
                <Tag className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
                <span>#{tag}</span>
                <X className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-1" strokeWidth={2} />
            </button>

            {/* 該当なしメッセージ */}
            {!hasMatches && (
                <p className="mt-3 text-[11px] text-[#9B9890] tracking-wide animate-in fade-in duration-500">
                    このタグの投稿はありません
                </p>
            )}
        </div>
    );
}
