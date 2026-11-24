import { CATEGORY_COLORS } from "@/lib/data";
import type { ProjectCategory } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: ProjectCategory;
  className?: string;
  withDot?: boolean;
  onImage?: boolean;
}

export function CategoryBadge({
  category,
  className,
  withDot = true,
  onImage = false,
}: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? "#1E3A8A";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        onImage && "border border-white/50 bg-white/95 shadow-sm backdrop-blur",
        className,
      )}
      style={onImage ? { color } : { backgroundColor: `${color}12`, color }}
    >
      {withDot ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : null}
      {category}
    </span>
  );
}
