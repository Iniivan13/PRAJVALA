import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

const TONES = {
  navy: {
    icon: "bg-navy-soft text-navy",
    accent: "from-navy/[0.06]",
    delta: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    accent: "from-amber-500/[0.08]",
    delta: "bg-amber-50 text-amber-700",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-500/[0.08]",
    delta: "bg-emerald-50 text-emerald-700",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600",
    accent: "from-sky-500/[0.08]",
    delta: "bg-sky-50 text-sky-700",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600",
    accent: "from-rose-500/[0.08]",
    delta: "bg-rose-50 text-rose-700",
  },
} as const;

type Tone = keyof typeof TONES;

interface KpiCardProps {
  label: string;
  value: number;
  format?: "compactCurrency" | "currency" | "percent" | "number" | "score";
  decimals?: number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  suffix?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  format = "compactCurrency",
  decimals,
  icon: Icon,
  tone = "navy",
  hint,
  delta,
  deltaDirection = "up",
  suffix,
  className,
}: KpiCardProps) {
  const style = TONES[tone];
  const DeltaIcon = deltaDirection === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:border-ink-300 hover:shadow-lifted",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-80 blur-2xl",
          style.accent,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold leading-snug text-ink-500">{label}</p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6",
            style.icon,
          )}
        >
          <Icon size={17} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-3 font-display text-[26px] font-extrabold leading-none tracking-tight text-ink-900 sm:text-[28px]">
        <CountUp
          value={value}
          format={format}
          decimals={decimals}
          suffix={suffix}
        />
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold",
              style.delta,
            )}
          >
            {deltaDirection !== "neutral" ? <DeltaIcon size={11} /> : null}
            {delta}
          </span>
        ) : null}
        {hint ? <span className="text-[11px] text-ink-400">{hint}</span> : null}
      </div>
    </div>
  );
}
