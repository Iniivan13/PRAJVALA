"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  navy: "bg-navy",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  ink: "bg-ink-500",
} as const;

const TRACKS = {
  navy: "bg-navy/10",
  amber: "bg-amber-500/15",
  emerald: "bg-emerald-500/15",
  rose: "bg-rose-500/15",
  sky: "bg-sky-500/15",
  ink: "bg-ink-200",
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
    const timer = window.setTimeout(() => setWidth(Math.min(Math.max(value, 0), 100)), 120);
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
        "w-full overflow-hidden rounded-full",
        height === "sm" ? "h-1.5" : "h-2.5",
        TRACKS[tone],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-1000 ease-out",
          TONES[tone],
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
