"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeInfo,
  Landmark,
  PiggyBank,
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
import { SpriteArrowRight, SpriteBudget, SpriteDocument, SpriteSun } from "@/components/ui/pixel-sprites";
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
            <RegionPicker className="w-full sm:w-[270px]" label="Wilayah anggaran" />
            <Link href="/informasi#glosarium" className="btn-secondary">
              Panduan istilah
              <SpriteDocument size={13} />
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-pixel-ink/85">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 border border-pixel-line bg-pixel-sun"
            />
            Tahun anggaran {activeRegion?.budgetYear ?? 2026}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={12} aria-hidden="true" />
            {summary.totalProjects} proyek terpantau
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeInfo size={12} aria-hidden="true" />
            {activeRegion ? activeRegion.fullName : "Agregat 3 wilayah percontohan"}
          </span>
        </div>
      </PageHero>

      <div className="bg-pixel-cream">
        <div className="container-page py-8 sm:py-10">
          <Link
            href="/fiskal"
            className="mb-4 flex items-start gap-3 border-4 border-pixel-line bg-pixel-sun/35 p-4 shadow-card transition-transform duration-100 hover:-translate-y-0.5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
              <SpriteBudget size={16} className="text-pixel-line" />
            </span>
            <span className="min-w-0">
              <span className="block font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                APBD resmi dari DJPK
              </span>
              <span className="mt-1.5 block text-[11.5px] leading-relaxed text-pixel-ink/90">
                Dashboard ini menampilkan item RAB percontohan. Untuk pagu dan realisasi
                APBD resmi Kota Depok, Kabupaten Bogor, dan DKI Jakarta dari Portal Data
                SIKD, buka Monitor Fiskal Daerah.
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 font-pixel text-[7.5px] uppercase text-pixel-line underline decoration-2 underline-offset-4">
                Buka monitor fiskal
                <SpriteArrowRight size={11} className="text-pixel-line" />
              </span>
            </span>
          </Link>

          {/* Inventory slots: 1 column on tiny phones, 2 up from 380px. */}
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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
            {/* ---- Cashflow board ---- */}
            <div className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-3">
                <div>
                  <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                    Arus kas bulanan
                  </h2>
                  <p className="mt-1.5 text-[11.5px] text-pixel-ink/75">
                    Pagu vs realisasi Januari–November 2026
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-medium text-pixel-ink/80">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 border border-pixel-line bg-pixel-panel"
                    />
                    Pagu
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 border border-pixel-line bg-navy"
                    />
                    Realisasi
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <CashflowChart data={summary.cashflow} height={278} />
              </div>
              <div className="mt-3 grid grid-cols-3 border-t-[3px] border-pixel-line/20 pt-3">
                {[
                  { label: "Terserap", value: formatCompactIDR(summary.absorbed) },
                  { label: "Sisa", value: formatCompactIDR(remaining) },
                  {
                    label: "Rata-rata/bln",
                    value: formatCompactIDR(summary.absorbed / summary.cashflow.length),
                  },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={
                      index > 0
                        ? "border-l-2 border-pixel-line/20 px-2.5"
                        : "px-0.5 pr-2.5"
                    }
                  >
                    <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-ink/60">
                      {stat.label}
                    </p>
                    <p className="mt-1 tabular font-mono text-[11px] font-bold text-pixel-line">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Sector board ---- */}
            <div className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-3">
                <div>
                  <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                    Komposisi sektor
                  </h2>
                  <p className="mt-1.5 text-[11.5px] text-pixel-ink/75">
                    Alokasi pagu menurut bidang pembangunan
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-panel px-2 py-0.5 font-pixel text-[7px] uppercase text-pixel-line">
                  {summary.sectors.length} sektor
                </span>
              </div>
              <div className="mt-5">
                <SectorDonut sectors={summary.sectors} total={summary.totalBudget} />
              </div>
            </div>
          </div>

          {/* ---- Notes ---- */}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 border-4 border-pixel-line bg-pixel-sun/35 p-4 shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
                <SpriteSun size={16} className="text-pixel-line" />
              </span>
              <div>
                <p className="font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                  Sorotan alokasi
                </p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-pixel-ink/90">
                  <span className="font-semibold">{topSector?.sector}</span> mendominasi{" "}
                  {formatPercent(topSectorShare)} pagu wilayah (
                  {formatCompactIDR(topSector?.pagu ?? 0)}). Pastikan porsi besar ini
                  diikuti bukti fisik yang memadai.
                </p>
                <Link
                  href="#tabel-rab"
                  className="mt-2 inline-flex min-h-8 items-center gap-1.5 font-pixel text-[7.5px] uppercase text-pixel-line underline decoration-2 underline-offset-4"
                >
                  Periksa rincian item
                </Link>
              </div>
            </div>

            <div
              className={
                reviewItems.length > 0
                  ? "flex items-start gap-3 border-4 border-pixel-line bg-rose-50 p-4 shadow-card"
                  : "flex items-start gap-3 border-4 border-pixel-line bg-emerald-50 p-4 shadow-card"
              }
            >
              <span
                className={
                  reviewItems.length > 0
                    ? "grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-rose-100 text-rose-800"
                    : "grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-emerald-100 text-emerald-800"
                }
              >
                {reviewItems.length > 0 ? (
                  <AlertTriangle size={16} aria-hidden="true" />
                ) : (
                  <SpriteSun size={16} className="text-pixel-line" />
                )}
              </span>
              <div>
                <p
                  className={
                    reviewItems.length > 0
                      ? "font-pixel text-[8px] uppercase leading-[1.7] text-rose-900"
                      : "font-pixel text-[8px] uppercase leading-[1.7] text-emerald-900"
                  }
                >
                  {reviewItems.length > 0
                    ? `${reviewItems.length} item harga perlu tinjauan`
                    : "Tidak ada item harga yang mencolok"}
                </p>
                <p
                  className={
                    reviewItems.length > 0
                      ? "mt-1.5 text-[11.5px] leading-relaxed text-rose-900/85"
                      : "mt-1.5 text-[11.5px] leading-relaxed text-emerald-900/85"
                  }
                >
                  {reviewItems.length > 0
                    ? "Harga satuan berada di atas harga acuan regional. Ini bukan tuduhan, melainkan ajakan meminta klarifikasi spesifikasi dan volume pekerjaan."
                    : "Seluruh harga satuan berada dalam rentang kewajaran harga acuan regional."}
                </p>
                {reviewItems.length > 0 ? (
                  <Link
                    href="#tabel-rab"
                    className="mt-2 inline-flex min-h-8 items-center gap-1.5 font-pixel text-[7.5px] uppercase text-rose-900 underline decoration-2 underline-offset-4"
                  >
                    Lihat item bertanda
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div id="tabel-rab" className="mt-6 scroll-mt-24">
            <BudgetTable />
          </div>

          <p className="mt-4 flex items-start gap-2.5 border-4 border-pixel-line bg-white px-4 py-3 text-[10.5px] leading-relaxed text-pixel-ink/80 shadow-card">
            <SpriteBudget size={16} className="mt-0.5 shrink-0 text-pixel-wood-cta" />
            Indikator kewajaran harga membandingkan harga satuan dengan harga acuan
            regional dan kontrak sejenis. Penanda “Perlu Tinjauan” bukan pernyataan
            pelanggaran, melainkan sinyal untuk meminta klarifikasi. Data pada versi ini
            bersifat percontohan.
          </p>
        </div>
      </div>
    </>
  );
}
