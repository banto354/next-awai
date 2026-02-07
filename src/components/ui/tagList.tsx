interface TagListProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export function TagList({ tags = [], onTagClick }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 lg:gap-2`}>
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className={`text-[10px] lg:text-[12px] text-[#A8A89E] tracking-wider hover:text-[#3D3D3A] transition-colors ${onTagClick ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ fontWeight: 400 }}
          onClick={onTagClick ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag);
          } : undefined}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}