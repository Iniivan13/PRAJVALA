import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from "@/lib/data";
import type { ProjectCategory } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: ProjectCategory;
  className?: string;
  withDot?: boolean;
  onImage?: boolean;
}

/**
 * Category tag.
 *
 * `CATEGORY_COLORS` is reserved for dots and chart bars; the text uses the
 * darker `CATEGORY_TEXT_COLORS` family so labels clear 4.5:1 on their tint.
 */
export function CategoryBadge({
  category,
  className,
  withDot = true,
  onImage = false,
}: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? "#1E3A8A";
  const textColor = CATEGORY_TEXT_COLORS[category] ?? "#1E3A8A";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 border-pixel-line px-2 py-0.5 text-[10.5px] font-bold shadow-chip",
        onImage && "bg-pixel-cream",
        className,
      )}
      style={
        onImage
          ? { color: textColor }
          : { backgroundColor: `${color}22`, color: textColor }
      }
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 border border-pixel-line"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {category}
    </span>
  );
}
