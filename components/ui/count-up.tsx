"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatCompactIDR,
  formatIDR,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

type CountFormat = "compactCurrency" | "currency" | "percent" | "number" | "score";

interface CountUpProps {
  value: number;
  format?: CountFormat;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function renderValue(value: number, format: CountFormat, decimals?: number): string {
  switch (format) {
    case "compactCurrency":
      return formatCompactIDR(value);
    case "currency":
      return formatIDR(value);
    case "percent":
      return formatPercent(value, decimals ?? 1);
    case "score":
      return formatNumber(value, decimals ?? 0);
    case "number":
    default:
      return formatNumber(value, decimals ?? 0);
  }
}

export function CountUp({
  value,
  format = "number",
  decimals,
  duration = 1200,
  className,
  prefix,
  suffix,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const finalLabel = `${prefix ?? ""}${renderValue(value, format, decimals)}${suffix ?? ""}`;

  return (
    <span className={className} aria-label={finalLabel}>
      <span aria-hidden="true" className="tabular">
        {prefix}
        {renderValue(display, format, decimals)}
        {suffix}
      </span>
    </span>
  );
}
