"use client";

import { useState } from "react";
import type { SectorAllocation } from "@/types";
import { formatCompactIDR, formatIDR, formatPercent } from "@/lib/utils";

interface SectorDonutProps {
  sectors: SectorAllocation[];
  total: number;
}

/**
 * Sector composition ring.
 *
 * Recharts/Chart-free SVG. The arcs keep square line caps and the legend bars
 * are solid blocks, so the chart belongs to the pixel language without losing
 * an accurate read of the proportions. Hover and focus still drive the centre
 * readout, and the whole graphic keeps its text alternative.
 */
export function SectorDonut({ sectors, total }: SectorDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const centerSectors = sectors.slice(0, 6);
  const size = 196;
  const radius = size / 2;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2 - 4);
  let offset = 0;

  const active = activeIndex !== null ? centerSectors[activeIndex] : undefined;
  const activePercentage = active && total > 0 ? (active.pagu / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-label={`Komposisi anggaran menurut sektor, total ${formatIDR(total)}`}
        role="img"
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2 - 4}
            fill="none"
            stroke="#D6D9DD"
            strokeWidth={strokeWidth}
          />
          {centerSectors.map((sector, index) => {
            const fraction = total > 0 ? sector.pagu / total : 0;
            const dash = Math.max(fraction * circumference - 2, 0);
            const circle = (
              <circle
                key={sector.sector}
                cx={radius}
                cy={radius}
                r={radius - strokeWidth / 2 - 4}
                fill="none"
                stroke={sector.color}
                strokeWidth={activeIndex === index ? strokeWidth + 5 : strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.28}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
            offset += fraction * circumference;
            return circle;
          })}
        </svg>
        {/* Centre plate sits on a solid pixel window, not bare canvas. */}
        <div className="pointer-events-none absolute inset-[38px] flex flex-col items-center justify-center border-2 border-pixel-line bg-pixel-cream px-3 text-center">
          {active ? (
            <>
              <span
                className="h-2 w-2 border border-pixel-line"
                style={{ backgroundColor: active.color }}
                aria-hidden="true"
              />
              <span className="mt-1 line-clamp-2 font-pixel text-[6.5px] uppercase leading-[1.6] text-pixel-ink/70">
                {active.sector}
              </span>
              <span className="mt-1 font-pixel text-[11px] leading-none tabular text-pixel-line">
                {formatCompactIDR(active.pagu)}
              </span>
              <span className="mt-1 text-[10px] font-semibold tabular text-pixel-ink/70">
                {formatPercent(activePercentage)}
              </span>
            </>
          ) : (
            <>
              <span className="font-pixel text-[6px] uppercase leading-[1.6] tracking-[0.04em] text-pixel-ink/60">
                Total pagu
              </span>
              <span className="mt-1 font-pixel text-[11px] leading-none tabular text-pixel-line">
                {formatCompactIDR(total)}
              </span>
              <span className="mt-1 text-[10px] tabular text-pixel-ink/70">
                {sectors.length} sektor
              </span>
            </>
          )}
        </div>
      </div>

      <ul className="w-full space-y-2.5" aria-label="Rincian sektor anggaran">
        {sectors.map((sector, index) => {
          const percentage = total > 0 ? (sector.pagu / total) * 100 : 0;
          const isActive = activeIndex === index;
          return (
            <li key={sector.sector}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(isActive ? null : index)}
                aria-pressed={isActive}
                className="group block w-full text-left outline-offset-4"
              >
                <div className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 border border-pixel-line"
                      style={{ backgroundColor: sector.color }}
                      aria-hidden="true"
                    />
                    <span
                      className={
                        isActive
                          ? "truncate font-bold text-pixel-line"
                          : "truncate text-pixel-ink/80 group-hover:text-pixel-line"
                      }
                    >
                      {sector.sector}
                    </span>
                  </span>
                  <span className="shrink-0 tabular font-mono text-[11px] font-semibold text-pixel-line">
                    {formatPercent(percentage)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden border border-pixel-line bg-pixel-panel">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: sector.color }}
                    />
                  </div>
                  <span className="w-[70px] shrink-0 text-right tabular font-mono text-[10px] font-medium text-pixel-ink/70">
                    {formatCompactIDR(sector.pagu)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
