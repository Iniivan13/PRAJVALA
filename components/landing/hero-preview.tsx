"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { TOTAL_CITIZEN_REPORTS } from "@/lib/data";
import { SpriteBudget, SpriteQuest } from "@/components/ui/pixel-sprites";
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

/**
 * Region summary board inside the hero.
 *
 * Framed like the reference's inventory window: a wood-dark chassis, inset
 * cream screen, and stepped bars. All numbers come from the existing region
 * summary — nothing is invented.
 */
export function HeroPreview() {
  const { summary, activeRegion, activeRegionId } = useRegion();
  const maxCashflow = Math.max(...summary.cashflow.map((item) => item.realized), 1);
  const latestMonth = summary.cashflow[summary.cashflow.length - 1];
  const scoreSteps = 10;
  const filledSteps = Math.round((summary.accountabilityScore / 100) * scoreSteps);

  return (
    <div className="relative mx-auto w-full max-w-[470px]">
      <div className="border-4 border-pixel-line bg-pixel-wood-dark p-2 shadow-panel">
        <div className="border-[3px] border-pixel-line bg-pixel-cream p-4 text-pixel-line sm:p-5">
          {/* Title bar */}
          <div className="flex items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                <SpriteBudget size={16} />
              </span>
              <div>
                <p className="font-pixel text-[7px] uppercase leading-[1.7] tracking-[0.04em] text-ink-600">
                  Ruang Pantau
                </p>
                <p className="mt-0.5 font-pixel text-[9px] uppercase leading-[1.7]">
                  Ringkasan Wilayah
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-emerald-100 px-2 py-0.5 font-pixel text-[7px] uppercase text-emerald-900">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-pixel-line bg-emerald-600"
              />
              Aktif
            </span>
          </div>

          {/* Headline figure */}
          <div className="mt-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-pixel-ink/80">
              <MapPin size={11} className="text-pixel-wood-cta" aria-hidden="true" />
              {activeRegionId === "all" ? "Agregat 3 wilayah" : activeRegion?.fullName}
            </p>
            <p className="mt-2 font-pixel text-[22px] leading-[1.5] tabular">
              {formatCompactIDR(summary.totalBudget)}
            </p>
            <p className="mt-1 text-[10.5px] text-pixel-ink/70">
              Total pagu anggaran · TA 2026
            </p>
          </div>

          {/* Accountability gauge — stepped, not a gradient ring */}
          <div className="mt-3.5 border-[3px] border-pixel-line bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-pixel text-[7px] uppercase leading-[1.7] text-ink-600">
                Skor akuntabilitas
              </span>
              <span className="font-pixel text-[9px] leading-none tabular">
                {formatNumber(summary.accountabilityScore, 1)}
                <span className="text-[7px] text-pixel-ink/60">/100</span>
              </span>
            </div>
            <div
              className="mt-2 flex gap-[3px]"
              role="img"
              aria-label={`Skor akuntabilitas ${summary.accountabilityScore} dari 100`}
            >
              {Array.from({ length: scoreSteps }).map((_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className={
                    index < filledSteps
                      ? "h-3 flex-1 border border-pixel-line bg-pixel-sun"
                      : "h-3 flex-1 border border-pixel-line bg-pixel-panel"
                  }
                />
              ))}
            </div>
          </div>

          {/* Absorption */}
          <div className="mt-3 border-[3px] border-pixel-line bg-white px-3 py-2.5">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-semibold text-pixel-ink/85">Serapan anggaran</span>
              <span className="tabular font-mono text-[11px] font-bold text-pixel-wood-cta">
                {formatPercent(summary.absorptionRate)}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden border-2 border-pixel-line bg-pixel-panel">
              <div
                className="h-full bg-pixel-grass-deep transition-[width] duration-700"
                style={{
                  width: `${summary.absorptionRate}%`,
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 6px)",
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-pixel-ink/70">
              <span>{formatCompactIDR(summary.absorbed)} terealisasi</span>
              <span>{formatCompactIDR(summary.totalBudget - summary.absorbed)} sisa</span>
            </div>
          </div>

          {/* Monthly cashflow — block bars */}
          <div className="mt-3 border-[3px] border-pixel-line bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="font-pixel text-[7px] uppercase leading-[1.7] text-ink-600">
                Arus realisasi
              </p>
              <span className="text-[9.5px] text-pixel-ink/70">Jan – Nov</span>
            </div>
            <div className="mt-2 flex h-[52px] items-end gap-[3px]" aria-hidden="true">
              {summary.cashflow.map((point, index) => {
                const height = Math.max((point.realized / maxCashflow) * 100, 10);
                const isLatest = index === summary.cashflow.length - 1;
                return (
                  <div
                    key={point.month}
                    className={
                      isLatest
                        ? "flex-1 border border-pixel-line bg-pixel-sun"
                        : "flex-1 border border-pixel-line bg-pixel-grass-deep/70"
                    }
                    style={{ height: `${height * 0.5}px` }}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between font-pixel text-[6.5px] uppercase text-pixel-ink/60">
              <span>Jan</span>
              <span>{latestMonth?.month ?? "Nov"}</span>
            </div>
          </div>

          {/* Footer counters */}
          <div className="mt-3 grid grid-cols-3 border-[3px] border-pixel-line bg-pixel-panel">
            {[
              { value: summary.totalProjects, label: "Proyek" },
              { value: formatNumber(TOTAL_CITIZEN_REPORTS), label: "Laporan" },
              { value: summary.verifiedProjects, label: "Valid" },
            ].map((item, index) => (
              <div
                key={item.label}
                className={
                  index > 0
                    ? "border-l-[3px] border-pixel-line px-2 py-2"
                    : "px-2 py-2"
                }
              >
                <p className="font-pixel text-[10px] leading-none tabular">{item.value}</p>
                <p className="mt-1.5 font-pixel text-[6.5px] uppercase leading-[1.6] text-ink-600">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/anggaran"
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 border-4 border-pixel-line bg-pixel-sun px-3 font-pixel text-[9px] uppercase text-pixel-line shadow-btn-sun transition-transform hover:-translate-y-0.5 sm:w-auto"
      >
        <SpriteQuest size={12} />
        Buka dashboard anggaran
      </Link>
    </div>
  );
}
