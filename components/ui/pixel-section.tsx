import { cn } from "@/lib/utils";

/**
 * Pixel section plaque — the reference frames every section title in a bordered
 * panel rather than floating type. `tone` selects the world (sky, paper, wood).
 */
export function PixelPlaque({
  children,
  tone = "panel",
  className,
}: {
  children: React.ReactNode;
  tone?: "panel" | "paper" | "sun";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block border-4 border-pixel-line px-4 py-3 shadow-plaque",
        tone === "panel" && "bg-pixel-panel",
        tone === "paper" && "bg-pixel-cream",
        tone === "sun" && "bg-pixel-sun",
        className,
      )}
    >
      <span className="block font-pixel text-[11px] uppercase leading-[1.65] tracking-[0.04em] text-pixel-line sm:text-[13px]">
        {children}
      </span>
    </span>
  );
}

/**
 * Section heading with an optional plaque. Left-aligned or centred, matching
 * the reference's centred village-sign composition.
 */
export function PixelSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
  plaqueTone = "panel",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
  plaqueTone?: "panel" | "paper" | "sun";
}) {
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
          <p className="mb-3 flex w-fit items-center gap-2 border-2 border-pixel-line bg-white px-2 py-1 font-pixel text-[8px] uppercase tracking-[0.06em] text-pixel-line shadow-chip">
            {eyebrow}
          </p>
        ) : null}
        <PixelPlaque tone={plaqueTone}>{title}</PixelPlaque>
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

/** Stepped terrain edge — separates two worlds vertically. */
export function PixelDivider({
  from = "grass",
  className,
}: {
  from?: "grass" | "dirt" | "line";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-2 w-full",
        from === "grass" && "bg-pixel-grass-deep",
        from === "dirt" && "bg-pixel-dirt",
        from === "line" && "bg-pixel-line",
        className,
      )}
    />
  );
}
