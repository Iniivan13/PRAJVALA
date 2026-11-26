"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Progress as a stepped pixel meter.
 *
 * The fill is a striped block with hard edges rather than a rounded gradient
 * bar, keeping charts and cards inside the pixel language while the value stays
 * exact and screen-reader accessible.
 */
const TONES = {
  navy: "bg-navy",
  amber: "bg-amber-500",
  emerald: "bg-emerald-600",
  rose: "bg-rose-600",
  sky: "bg-sky-700",
  ink: "bg-pixel-line",
} as const;

const TRACKS = {
  navy: "bg-pixel-panel",
  amber: "bg-pixel-panel",
  emerald: "bg-pixel-panel",
  rose: "bg-pixel-panel",
  sky: "bg-pixel-panel",
  ink: "bg-pixel-panel",
} as const;

interface ProgressBarProps {
  value: number;
  tone?: keyof typeof TONES;
  className?: string;
  height?: "sm" | "md";
  ariaLabel: string;
}

export function ProgressBar({
  value,
  tone = "navy",
  className,
  height = "sm",
  ariaLabel,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setWidth(Math.min(Math.max(value, 0), 100)),
      120,
    );
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn(
        "w-full overflow-hidden border-2 border-pixel-line",
        height === "sm" ? "h-2.5" : "h-3.5",
        TRACKS[tone],
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-700 ease-out",
          TONES[tone],
        )}
        style={{
          width: `${width}%`,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 6px)",
        }}
      />
    </div>
  );
}
