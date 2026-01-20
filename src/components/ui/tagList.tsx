interface TagListProps {
  tags: string[];
}

export function TagList({ tags = [] }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 lg:gap-2`}>
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="text-[10px] lg:text-[11px] text-[#A8A89E] tracking-wider hover:text-[#3D3D3A] transition-colors cursor-default"
          style={{ fontWeight: 400 }}
        >
          {/* 文脈に応じて '#' をつけるか、あるいは別の記号（例：· ）にするのも詩的です */}
          #{tag}
        </span>
      ))}
    </div>
  );
}