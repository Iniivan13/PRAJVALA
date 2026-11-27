import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  markClassName?: string;
}

/**
 * PRAJVALA wordmark with the owner's pixel magnifier-bulb crest.
 *
 * The crest is the new brand mark (magnifier + lightbulb on a cream tile), so it
 * is kept as a raster asset and paired with the pixel display face for the
 * wordmark. The tile stays cream in both themes because it is part of the logo,
 * not a themed surface.
 */
export function Logo({
  theme = "light",
  showTagline = false,
  className,
  markClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-[3px] border-pixel-line bg-pixel-cream shadow-chip",
          markClassName,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/prajvala-mark.png"
          alt=""
          width={472}
          height={593}
          draggable={false}
          className="h-[31px] w-auto select-none [image-rendering:pixelated]"
        />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-pixel text-[12px] uppercase tracking-[0.06em] sm:text-[13px]",
            theme === "light" ? "text-pixel-line" : "text-pixel-cream",
          )}
        >
          PRAJVALA
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1.5 font-retro text-[12px] uppercase leading-none tracking-[0.05em] sm:text-[13px]",
              theme === "light" ? "text-pixel-wood-dark" : "text-pixel-panel",
            )}
          >
            Search · Discover · Empower
          </span>
        ) : null}
      </span>
    </span>
  );
}