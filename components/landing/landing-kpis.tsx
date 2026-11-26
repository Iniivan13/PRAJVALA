"use client";

import {
  BadgeCheck,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { KpiCard } from "@/components/ui/kpi-card";
import { TOTAL_CITIZEN_REPORTS } from "@/lib/data";
import { formatCompactIDR, formatNumber } from "@/lib/utils";

/**
 * Budget indicators as a 2×2 inventory on mobile (matching the reference's
 * backpack grid) and a single row of four slots on wide screens.
 */
export function LandingKpis() {
  const { summary } = useRegion();

  return (
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <KpiCard
        label="Total Anggaran Terpantau"
        value={summary.totalBudget}
        format="compactCurrency"
        icon={Landmark}
        tone="navy"
        delta="TA 2026"
        deltaDirection="neutral"
        hint={`${summary.totalProjects} proyek · ${formatNumber(TOTAL_CITIZEN_REPORTS)} laporan`}
      />
      <KpiCard
        label="Persentase Serapan Dana"
        value={summary.absorptionRate}
        format="percent"
        decimals={1}
        icon={TrendingUp}
        tone="amber"
        delta={formatCompactIDR(summary.absorbed)}
        deltaDirection="neutral"
        hint="terealisasi dari pagu"
      />
      <KpiCard
        label="Proyek Terverifikasi Warga"
        value={summary.verifiedProjects}
        format="number"
        icon={BadgeCheck}
        tone="emerald"
        delta={`dari ${summary.totalProjects} proyek`}
        deltaDirection="neutral"
        hint="skor validasi ≥ 85"
      />
      <KpiCard
        label="Tingkat Akuntabilitas"
        value={summary.accountabilityScore}
        format="score"
        decimals={1}
        suffix="/100"
        icon={ShieldCheck}
        tone="sky"
        delta="Indeks wilayah"
        deltaDirection="neutral"
        hint="gabungan transparansi & validasi"
      />
    </div>
  );
}
