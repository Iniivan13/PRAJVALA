"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import type { CashflowPoint } from "@/types";
import { formatCompactIDR, formatIDR } from "@/lib/utils";

/**
 * Cashflow comparison.
 *
 * Recharts is kept for scale and tooltip behaviour, but the chart is restyled
 * to the pixel world: square bars, dotted paper grid, solid tooltip plaque.
 */
function CashflowTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const planned = payload.find((entry) => entry.dataKey === "planned")?.value as
    | number
    | undefined;
  const realized = payload.find((entry) => entry.dataKey === "realized")?.value as
    | number
    | undefined;

  return (
    <div className="min-w-[210px] border-4 border-pixel-line bg-pixel-cream p-3 shadow-card">
      <p className="font-pixel text-[8px] uppercase tracking-[0.04em] text-pixel-line">
        {label} 2026
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-pixel-ink/80">
            <span
              aria-hidden="true"
              className="h-2 w-2 border border-pixel-line bg-pixel-panel"
            />
            Pagu
          </span>
          <span className="tabular font-mono text-[11px] font-semibold text-pixel-line">
            {planned !== undefined ? formatIDR(planned) : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-pixel-ink/80">
            <span aria-hidden="true" className="h-2 w-2 border border-pixel-line bg-navy" />
            Realisasi
          </span>
          <span className="tabular font-mono text-[11px] font-semibold text-pixel-line">
            {realized !== undefined ? formatIDR(realized) : "-"}
          </span>
        </div>
      </div>
      {planned && realized !== undefined ? (
        <p className="mt-2 border-t-2 border-pixel-line/25 pt-2 text-[10px] text-pixel-ink/75">
          Serapan bulan ini{" "}
          <span className="font-semibold text-pixel-line">
            {Math.round((realized / planned) * 100)}%
          </span>
        </p>
      ) : null}
    </div>
  );
}

interface CashflowChartProps {
  data: CashflowPoint[];
  height?: number;
}

export function CashflowChart({ data, height = 300 }: CashflowChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 4, left: -2, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#B9BEC4" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: "#2B2B2B", strokeWidth: 2 }}
            tick={{ fill: "#3E2723", fontSize: 11 }}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#3E2723", fontSize: 10 }}
            tickFormatter={(value: number) => formatCompactIDR(value)}
            width={78}
            tickCount={4}
          />
          <Tooltip
            content={<CashflowTooltip />}
            cursor={{ fill: "rgba(255, 215, 0, 0.22)" }}
          />
          <Bar dataKey="planned" name="Pagu" fill="#B9BEC4" maxBarSize={20} />
          <Bar dataKey="realized" name="Realisasi" fill="#1E3A8A" maxBarSize={20} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
