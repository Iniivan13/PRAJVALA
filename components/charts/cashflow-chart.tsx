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

function CashflowTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const planned = payload.find((entry) => entry.dataKey === "planned")?.value as number | undefined;
  const realized = payload.find((entry) => entry.dataKey === "realized")?.value as number | undefined;

  return (
    <div className="min-w-[200px] rounded-xl border border-ink-200 bg-white p-3 shadow-lifted">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
        {label} 2026
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="h-2 w-2 rounded-sm bg-ink-300" aria-hidden="true" />
            Pagu
          </span>
          <span className="font-mono text-[11px] font-semibold tabular text-ink-700">
            {planned !== undefined ? formatIDR(planned) : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="h-2 w-2 rounded-sm bg-navy" aria-hidden="true" />
            Realisasi
          </span>
          <span className="font-mono text-[11px] font-semibold tabular text-ink-900">
            {realized !== undefined ? formatIDR(realized) : "-"}
          </span>
        </div>
      </div>
      {planned && realized !== undefined ? (
        <p className="mt-2 border-t border-ink-100 pt-2 text-[10px] text-ink-500">
          Serapan bulan ini{" "}
          <span className="font-semibold text-ink-700">
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
          <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            tickFormatter={(value: number) => formatCompactIDR(value)}
            width={78}
            tickCount={4}
          />
          <Tooltip
            content={<CashflowTooltip />}
            cursor={{ fill: "rgba(15, 23, 42, 0.035)" }}
          />
          <Bar
            dataKey="planned"
            name="Pagu"
            fill="#CBD5E1"
            radius={[5, 5, 0, 0]}
            maxBarSize={20}
          />
          <Bar
            dataKey="realized"
            name="Realisasi"
            fill="#1E3A8A"
            radius={[5, 5, 0, 0]}
            maxBarSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
