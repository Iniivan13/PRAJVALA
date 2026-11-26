"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  Landmark,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { BudgetTable } from "@/components/budget/budget-table";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { SectorDonut } from "@/components/charts/sector-donut";
import { PageHero } from "@/components/layout/page-hero";
import { KpiCard } from "@/components/ui/kpi-card";
import { RegionPicker } from "@/components/ui/region-picker";
import { getBudgetItems } from "@/lib/data";
import { formatCompactIDR, formatPercent } from "@/lib/utils";

export function BudgetDashboard() {
  const { summary, activeRegion, activeRegionId } = useRegion();
  const items = getBudgetItems(activeRegionId);
  const reviewItems = items.filter((item) => item.fairness === "Perlu Tinjauan");
  const remaining = summary.totalBudget - summary.absorbed;
  const topSector = [...summary.sectors].sort((a, b) => b.pagu - a.pagu)[0];
  const topSectorShare =
    topSector && summary.totalBudget > 0
      ? (topSector.pagu / summary.totalBudget) * 100
      : 0;

  return (
    <>
      <PageHero
        eyebrow="Dashboard realisasi anggaran"
        title="Anggaran yang bisa dibaca semua orang."
        description="Bandingkan pagu dengan realisasi, telusuri harga satuan, dan temukan item yang memerlukan perhatian — semuanya dalam satu tampilan yang jelas."
        breadcrumb={[{ label: "Anggaran" }]}
        actions={
          <>
            <RegionPicker className="w-[270px]" label="Wilayah anggaran" />
            <Link href="/informasi#glosarium" className="btn-secondary h-[54px] px-4 py-0 text-[12.5px]">
              Panduan istilah
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Tahun anggaran {activeRegion?.budgetYear ?? 2026}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={12} className="text-ink-500" aria-hidden="true" />
            {summary.totalProjects} proyek terpantau
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeInfo size={12} className="text-ink-500" aria-hidden="true" />
            {activeRegion ? activeRegion.fullName : "Agregat 3 wilayah percontohan"}
          </span>
        </div>
      </PageHero>

      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Pagu Anggaran"
            value={summary.totalBudget}
            format="compactCurrency"
            icon={Landmark}
            tone="navy"
            delta={`${summary.totalProjects} proyek`}
            deltaDirection="neutral"
            hint="batas belanja TA 2026"
          />
          <KpiCard
            label="Realisasi Anggaran"
            value={summary.absorbed}
            format="compactCurrency"
            icon={TrendingUp}
            tone="emerald"
            delta={formatPercent(summary.absorptionRate)}
            deltaDirection="up"
            hint="dari total pagu"
          />
          <KpiCard
            label="Sisa Pagu Tersedia"
            value={remaining}
            format="compactCurrency"
            icon={PiggyBank}
            tone="amber"
            delta={`${items.length} item RAB`}
            deltaDirection="neutral"
            hint="belum terealisasi"
          />
          <KpiCard
            label="Item Perlu Tinjauan"
            value={reviewItems.length}
            format="number"
            icon={AlertTriangle}
            tone="rose"
            delta={`dari ${items.length} item`}
            deltaDirection={reviewItems.length > 0 ? "down" : "neutral"}
            hint="harga di atas acuan"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card-base p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  Arus kas bulanan
                </h2>
                <p className="mt-1 text-[12px] text-ink-500">
                  Pagu vs realisasi pengeluaran Januari–November 2026
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-ink-300" aria-hidden="true" />
                  Pagu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-navy" aria-hidden="true" />
                  Realisasi
                </span>
              </div>
            </div>
            <div className="mt-4">
              <CashflowChart data={summary.cashflow} height={278} />
            </div>
            <div className="mt-2 grid grid-cols-3 divide-x divide-ink-100 border-t border-ink-100 pt-3">
              <div className="px-3 first:pl-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Terserap
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] font-bold text-ink-900">
                  {formatCompactIDR(summary.absorbed)}
                </p>
              </div>
              <div className="px-3">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Sisa
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] font-bold text-ink-900">
                  {formatCompactIDR(remaining)}
                </p>
              </div>
              <div className="px-3">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Rata-rata/bulan
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] font-bold text-ink-900">
                  {formatCompactIDR(summary.absorbed / summary.cashflow.length)}
                </p>
              </div>
            </div>
          </div>

          <div className="card-base p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  Komposisi anggaran sektor
                </h2>
                <p className="mt-1 text-[12px] text-ink-500">
                  Alokasi pagu menurut bidang pembangunan
                </p>
              </div>
              <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[9.5px] font-semibold text-ink-500">
                {summary.sectors.length} sektor
              </span>
            </div>
            <div className="mt-6">
              <SectorDonut sectors={summary.sectors} total={summary.totalBudget} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-amber-900">Sorotan alokasi</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-amber-800/80">
                <span className="font-semibold">{topSector?.sector}</span> mendominasi{" "}
                {formatPercent(topSectorShare)} pagu wilayah (
                {formatCompactIDR(topSector?.pagu ?? 0)}). Pastikan porsi besar ini
                diikuti bukti fisik yang memadai.
              </p>
              <Link
                href="#tabel-rab"
                className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-semibold text-amber-900 hover:underline"
              >
                Periksa rincian item
                <ArrowRight size={11} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className={
              reviewItems.length > 0
                ? "flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4"
                : "flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4"
            }
          >
            <span
              className={
                reviewItems.length > 0
                  ? "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-700"
                  : "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700"
              }
            >
              {reviewItems.length > 0 ? (
                <AlertTriangle size={16} aria-hidden="true" />
              ) : (
                <Sparkles size={16} aria-hidden="true" />
              )}
            </span>
            <div>
              <p
                className={
                  reviewItems.length > 0
                    ? "text-[11px] font-bold text-rose-900"
                    : "text-[11px] font-bold text-emerald-900"
                }
              >
                {reviewItems.length > 0
                  ? `${reviewItems.length} item harga perlu tinjauan`
                  : "Tidak ada item harga yang mencolok"}
              </p>
              <p
                className={
                  reviewItems.length > 0
                    ? "mt-1 text-[11.5px] leading-relaxed text-rose-800/80"
                    : "mt-1 text-[11.5px] leading-relaxed text-emerald-800/80"
                }
              >
                {reviewItems.length > 0
                  ? "Harga satuan berada di atas harga acuan regional. Ini bukan tuduhan, melainkan ajakan meminta klarifikasi spesifikasi dan volume pekerjaan."
                  : "Seluruh harga satuan berada dalam rentang kewajaran harga acuan regional."}
              </p>
              {reviewItems.length > 0 ? (
                <Link
                  href="#tabel-rab"
                  className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-semibold text-rose-900 hover:underline"
                >
                  Lihat item bertanda
                  <ArrowRight size={11} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div id="tabel-rab" className="mt-6 scroll-mt-24">
          <BudgetTable />
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl border border-ink-200/70 bg-white/60 px-4 py-3 text-[10px] leading-relaxed text-ink-500">
          <BadgeInfo size={13} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
          Indikator kewajaran harga membandingkan harga satuan dengan harga acuan
          regional dan kontrak sejenis. Penanda “Perlu Tinjauan” bukan pernyataan
          pelanggaran, melainkan sinyal untuk meminta klarifikasi. Data pada versi ini
          bersifat percontohan.
        </p>
      </div>
    </>
  );
}
