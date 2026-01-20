import { Calendar } from 'lucide-react';

interface TemperatureFilterProps {
  active: boolean;
  temp: number;
  onClick: () => void;
  hasMatches: boolean; 
}

export function TemperatureFilter({
  active,
  temp,
  onClick,
  hasMatches,
}: TemperatureFilterProps) {
  return (
    <div className="lg:max-w-7xl lg:mx-auto">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-3 px-4 py-2.5 lg:px-6 lg:py-3 rounded-sm text-[12px] lg:text-[13px] tracking-wide transition-all
          ${active
            ? 'bg-[#D4CFC3] text-[#3D3D3A]'
            : 'bg-[#E8E6E0] text-[#A8A89E]'
          }
        `}
        style={{ fontWeight: 400 }}
      >
        <Calendar className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
        <span>今日と同じ気温 ({temp}°C)</span>
      </button>

      {/* 該当なしメッセージ */}
      {active && !hasMatches && (
        <p className="mt-3 text-[11px] text-[#9B9890] tracking-wide animate-in fade-in duration-500">
          この気温に重なる投稿はありません
        </p>
      )}
    </div>
  );
}