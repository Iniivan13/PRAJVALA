"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  ChartNoAxesCombined,
  CheckCircle2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { TOTAL_CITIZEN_REPORTS } from "@/lib/data";
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

export function HeroPreview() {
  const { summary, activeRegion, activeRegionId } = useRegion();
  const maxCashflow = Math.max(...summary.cashflow.map((item) => item.realized), 1);
  const latestMonth = summary.cashflow[summary.cashflow.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[470px] px-3 pb-10 sm:px-0">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[40px] bg-amber-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-ink-900 p-5 shadow-lifted sm:p-6">
        <div className="surface-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-[70px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-navy/50 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-ink-900 shadow-glow">
                <Wallet size={17} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  Ruang Pantau
                </p>
                <p className="text-[12px] font-semibold text-white">Ringkasan Wilayah</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              Aktif
            </span>
          </div>

          <div className="mt-5 flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-300">
                <MapPin size={12} className="text-amber-400" aria-hidden="true" />
                {activeRegionId === "all" ? "Agregat 3 wilayah" : activeRegion?.fullName}
              </p>
              <p className="mt-2 font-display text-[34px] font-extrabold leading-none tracking-tight text-white">
                {formatCompactIDR(summary.totalBudget)}
              </p>
              <p className="mt-1.5 text-[10.5px] text-ink-400">
                Total pagu anggaran · TA 2026
              </p>
            </div>
            <div
              className="relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#F59E0B 0 ${summary.accountabilityScore}%, rgba(255,255,255,0.1) ${summary.accountabilityScore}% 100%)`,
              }}
              aria-label={`Skor akuntabilitas ${summary.accountabilityScore} dari 100`}
              role="img"
            >
              <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-ink-900">
                <span className="text-center">
                  <span className="block font-display text-[16px] font-extrabold leading-none text-white">
                    {formatNumber(summary.accountabilityScore, 1)}
                  </span>
                  <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.1em] text-ink-500">
                    Skor
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-medium text-ink-300">Serapan anggaran</span>
              <span className="font-mono font-semibold text-amber-400">
                {formatPercent(summary.absorptionRate)}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000"
                style={{ width: `${summary.absorptionRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[9.5px] text-ink-500">
              <span>{formatCompactIDR(summary.absorbed)} terealisasi</span>
              <span>{formatCompactIDR(summary.totalBudget - summary.absorbed)} sisa</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.13em] text-ink-400">
                Arus realisasi bulanan
              </p>
              <span className="text-[9.5px] text-ink-500">Jan – Nov</span>
            </div>
            <div className="mt-2.5 flex h-[64px] items-end gap-1.5" aria-hidden="true">
              {summary.cashflow.map((point, index) => {
                const height = Math.max((point.realized / maxCashflow) * 100, 8);
                const isLatest = index === summary.cashflow.length - 1;
                return (
                  <div key={point.month} className="group/bar relative flex-1">
                    <div
                      className={
                        isLatest
                          ? "w-full rounded-sm bg-gradient-to-t from-amber-500 to-amber-300"
                          : "w-full rounded-sm bg-white/15 transition-colors group-hover/bar:bg-white/25"
                      }
                      style={{ height: `${height * 0.64}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[8px] font-medium text-ink-600">
              <span>Jan</span>
              <span>{latestMonth?.month ?? "Nov"}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] py-2.5">
            <div className="px-3">
              <p className="font-display text-[15px] font-extrabold text-white">
                {summary.totalProjects}
              </p>
              <p className="mt-0.5 text-[8.5px] font-medium uppercase tracking-[0.06em] text-ink-500">
                Proyek
              </p>
            </div>
            <div className="px-3">
              <p className="font-display text-[15px] font-extrabold text-white">
                {formatNumber(TOTAL_CITIZEN_REPORTS)}
              </p>
              <p className="mt-0.5 text-[8.5px] font-medium uppercase tracking-[0.06em] text-ink-500">
                Laporan warga
              </p>
            </div>
            <div className="px-3">
              <p className="font-display text-[15px] font-extrabold text-white">
                {summary.verifiedProjects}
              </p>
              <p className="mt-0.5 text-[8.5px] font-medium uppercase tracking-[0.06em] text-ink-500">
                Terverifikasi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-1 top-24 hidden w-[190px] rounded-2xl border border-ink-100 bg-white p-3 shadow-lifted animate-float sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10.5px] font-bold text-ink-900">Laporan terverifikasi</p>
            <p className="truncate text-[9px] text-ink-400">Drainase Merpati · 4 jam lalu</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 border-t border-ink-100 pt-2 text-[8.5px] font-medium text-ink-500">
          <ShieldCheck size={11} className="text-emerald-500" aria-hidden="true" />
          124 warga mendukung temuan
        </div>
      </div>

      <div className="absolute -left-1 bottom-0 hidden w-[205px] rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lifted sm:block">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-400">
          <ChartNoAxesCombined size={12} className="text-amber-500" aria-hidden="true" />
          Akuntabilitas wilayah
        </p>
        <div className="mt-2 flex items-end justify-between">
          <p className="font-display text-[22px] font-extrabold leading-none text-ink-900">
            {formatNumber(summary.accountabilityScore, 1)}
            <span className="text-[11px] font-semibold text-ink-400">/100</span>
          </p>
          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
            Baik
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
            style={{ width: `${summary.accountabilityScore}%` }}
          />
        </div>
        <p className="mt-2 flex items-center justify-between text-[8.5px] text-ink-400">
          <span className="flex items-center gap-1">
            <MessageSquare size={10} aria-hidden="true" />
            {summary.totalProjects} proyek dipantau
          </span>
          <span className="flex items-center gap-0.5 font-semibold text-ink-600">
            <BadgeCheck size={10} className="text-emerald-500" aria-hidden="true" />
            {summary.verifiedProjects} tervalidasi
          </span>
        </p>
      </div>

      <Link
        href="/anggaran"
        className="absolute -bottom-1 right-3 hidden items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink-700 shadow-soft transition-colors hover:border-amber-300 hover:text-amber-700 sm:inline-flex"
      >
        Buka dashboard
        <ArrowUpRight size={12} aria-hidden="true" />
      </Link>
    </div>
  );
}
