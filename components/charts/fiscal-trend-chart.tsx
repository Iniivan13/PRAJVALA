"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import type { RegionalBudgetPeriodPoint } from "@/types";
import { DJPK_MONTHS } from "@/lib/djpk/config";
import { formatCompactIDR, formatIDR, formatPercent } from "@/lib/utils";

interface FiscalTrendChartProps {
  points: RegionalBudgetPeriodPoint[];
  height?: number;
}

function axisLabel(value: number): string {
  if (value === 0) return "0";
  return formatCompactIDR(value).replace("Rp", "");
}

/**
 * Tren realisasi kumulatif per periode, digambar dengan garis bertangga agar
 * terasa seperti grafik dari dunia pixel — bukan kurva SaaS halus.
 *
 * Angka berasal langsung dari laporan SIKD; titik tidak diinterpolasi dan bulan
 * yang tidak tersedia tidak digambar.
 */
export function FiscalTrendChart({ points, height = 280 }: FiscalTrendChartProps) {
  const data = points.map((point) => ({
    label: `${DJPK_MONTHS[point.period_month - 1].slice(0, 3)}`,
    pendapatan: point.revenue.realization_amount,
    belanja: point.spending.realization_amount,
    pendapatanPct: point.revenue.realization_percentage,
    belanjaPct: point.spending.realization_percentage,
    version: point.budget_version,
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="#2B2B2B"
            strokeOpacity={0.18}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "#2B2B2B", strokeWidth: 2 }}
            tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fill: "#3E2723" }}
            interval="preserveStartEnd"
            padding={{ left: 4, right: 4 }}
          />
          <YAxis
            tickFormatter={axisLabel}
            tickLine={false}
            axisLine={false}
            width={62}
            tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fill: "#3E2723" }}
          />
          <Tooltip
            cursor={{ stroke: "#2B2B2B", strokeWidth: 2, strokeDasharray: "4 4" }}
            content={<FiscalTrendTooltip />}
          />
          <Line
            type="stepAfter"
            dataKey="pendapatan"
            name="Pendapatan"
            stroke="#1D5FA8"
            strokeWidth={4}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#2B2B2B", fill: "#FFD700" }}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="belanja"
            name="Belanja"
            stroke="#047857"
            strokeWidth={4}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#2B2B2B", fill: "#FFD700" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FiscalTrendTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as
    | {
        pendapatan?: number | null;
        belanja?: number | null;
        pendapatanPct?: number | null;
        belanjaPct?: number | null;
        version?: string;
      }
    | undefined;
  if (!row) return null;

  return (
    <div className="min-w-[230px] border-4 border-pixel-line bg-pixel-cream p-3 shadow-card">
      <p className="font-pixel text-[8px] uppercase tracking-[0.04em] text-pixel-line">
        {label} · {row.version ?? "APBD"}
      </p>
      <div className="mt-2.5 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-pixel-ink/85">
            <span className="h-2.5 w-2.5 border border-pixel-line bg-[#1D5FA8]" />
            Pendapatan
          </span>
          <span className="tabular font-mono text-[11px] font-bold text-pixel-line">
            {row.pendapatan == null ? "tidak tersedia" : formatIDR(row.pendapatan)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-pixel-ink/85">
            <span className="h-2.5 w-2.5 border border-pixel-line bg-[#047857]" />
            Belanja
          </span>
          <span className="tabular font-mono text-[11px] font-bold text-pixel-line">
            {row.belanja == null ? "tidak tersedia" : formatIDR(row.belanja)}
          </span>
        </div>
      </div>
      <p className="mt-2.5 border-t-2 border-pixel-line/20 pt-2 text-[10.5px] text-pixel-ink/75">
        {row.pendapatanPct == null ? "—" : formatPercent(row.pendapatanPct)} pendapatan ·{" "}
        {row.belanjaPct == null ? "—" : formatPercent(row.belanjaPct)} belanja
      </p>
    </div>
  );
}