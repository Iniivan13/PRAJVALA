"use client";

import { useState } from "react";
import type { SectorAllocation } from "@/types";
import { formatCompactIDR, formatIDR, formatPercent } from "@/lib/utils";

interface SectorDonutProps {
  sectors: SectorAllocation[];
  total: number;
}

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
            stroke="#F1F5F9"
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
                strokeLinecap="round"
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {active ? (
            <>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active.color }}
                aria-hidden="true"
              />
              <span className="mt-1.5 line-clamp-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                {active.sector}
              </span>
              <span className="mt-0.5 font-display text-[21px] font-extrabold tracking-tight text-ink-900">
                {formatCompactIDR(active.pagu)}
              </span>
              <span className="text-[10px] font-semibold text-ink-500">
                {formatPercent(activePercentage)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Total Pagu
              </span>
              <span className="mt-1 font-display text-[23px] font-extrabold tracking-tight text-ink-900">
                {formatCompactIDR(total)}
              </span>
              <span className="mt-0.5 text-[10px] text-ink-500">
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
                className="group block w-full rounded-lg text-left outline-offset-4"
              >
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: sector.color }}
                      aria-hidden="true"
                    />
                    <span
                      className={
                        isActive
                          ? "truncate font-semibold text-ink-900"
                          : "truncate text-ink-600 group-hover:text-ink-900"
                      }
                    >
                      {sector.sector}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-semibold tabular text-ink-900">
                    {formatPercent(percentage)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: sector.color }}
                    />
                  </div>
                  <span className="w-[70px] shrink-0 text-right text-[10px] font-medium text-ink-500">
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
