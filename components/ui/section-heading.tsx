import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
  titleClassName?: string;
  /** Plaque surface — follows the world the section sits in. */
  plaqueTone?: "panel" | "paper" | "sun";
}

/**
 * Section opener rendered as a pixel village sign.
 *
 * The title sits inside a bordered plaque (as on the reference) instead of
 * floating display type, which is what makes scroll feel like moving through a
 * designed world rather than reading a dashboard.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
  titleClassName,
  plaqueTone = "panel",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-3 flex w-fit items-center gap-2 border-2 border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[8px] uppercase tracking-[0.06em] text-pixel-line shadow-chip">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "inline-block border-4 border-pixel-line px-3.5 py-3 shadow-plaque",
            plaqueTone === "panel" && "bg-pixel-panel",
            plaqueTone === "paper" && "bg-pixel-cream",
            plaqueTone === "sun" && "bg-pixel-sun",
            titleClassName,
          )}
        >
          <span className="block font-pixel text-[11px] uppercase leading-[1.65] tracking-[0.03em] text-pixel-line sm:text-[13px]">
            {title}
          </span>
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl font-retro text-[17px] leading-snug text-pixel-ink">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
