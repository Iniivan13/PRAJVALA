import { SpriteCrest } from "@/components/ui/pixel-sprites";
import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  markClassName?: string;
}

/**
 * PRAJVALA wordmark in the reference's pixel display face.
 *
 * The mark is a 16×16 civic crest sprite on a sun block rather than a rounded
 * app tile, so the brand reads as part of the pixel world from the first glance.
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
          "grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun shadow-chip",
          markClassName,
        )}
      >
        <SpriteCrest size={22} className="text-pixel-line" />
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
              "mt-1.5 font-retro text-[13px] uppercase leading-none tracking-[0.06em]",
              theme === "light" ? "text-pixel-wood-dark" : "text-pixel-panel",
            )}
          >
            Cahaya Anggaran Publik
          </span>
        ) : null}
      </span>
    </span>
  );
}
