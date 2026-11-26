import Link from "next/link";
import { SpriteArrowRight } from "@/components/ui/pixel-sprites";
import { cn } from "@/lib/utils";

/**
 * Pixel plaque used as an in-page call to action.
 *
 * Kept as a thin wrapper around `next/link` so routing, prefetch, focus rings
 * and analytics hooks behave exactly like a normal link.
 */
export function PixelAction({
  href,
  children,
  variant = "primary",
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "sun" | "ghost";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 border-4 border-pixel-line px-4 py-2 font-pixel text-[10px] uppercase leading-none shadow-btn-wood transition-transform duration-100 hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-btn-pressed",
        variant === "primary" && "bg-pixel-wood-cta text-pixel-cream",
        variant === "secondary" && "bg-pixel-blue text-white shadow-btn-blue",
        variant === "sun" && "bg-pixel-sun text-pixel-line shadow-btn-sun",
        variant === "ghost" && "bg-white text-pixel-line shadow-card",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Small inline "read more" link with a pixel arrow. */
export function PixelInlineLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 font-pixel text-[9px] uppercase text-pixel-line underline decoration-2 underline-offset-4 hover:decoration-pixel-line",
        className,
      )}
    >
      {children}
      <SpriteArrowRight size={11} className="shrink-0" />
    </Link>
  );
}