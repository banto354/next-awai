import { Calendar } from 'lucide-react';

interface TemperatureFilterProps {
  active: boolean;
  temp: number | null;
  loading: boolean;
  onClick: () => void;
}

export function TemperatureFilter({
  active,
  temp,
  loading,
  onClick,
}: TemperatureFilterProps) {
  const disabled = loading || temp === null;

  return (
    <div className="lg:max-w-7xl lg:mx-auto">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center gap-3 px-4 py-2.5 lg:px-6 lg:py-3 rounded-sm text-[12px] lg:text-[14px] tracking-wide transition-all
          ${disabled
            ? 'bg-[#E8E6E0]/60 text-[#A8A89E]/60 cursor-not-allowed'
            : active
              ? 'bg-[#D4CFC3] text-[#3D3D3A]'
              : 'bg-[#E8E6E0] text-[#A8A89E]'
          }
        `}
        style={{ fontWeight: 400 }}
      >
        <Calendar className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
        <span>
          {loading
            ? '気温を取得中...'
            : temp !== null
              ? `今と同じ気温 (${temp}°C)`
              : '気温を取得できません'
          }
        </span>
      </button>
    </div>
  );
}