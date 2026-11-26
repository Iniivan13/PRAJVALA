import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

/**
 * Inventory-style stat slot.
 *
 * The reference presents achievements as backpack slots: a small icon plate, a
 * large pixel counter, and a label. This component keeps that shape and repurposes
 * it for budget indicators.
 */
const TONES = {
  navy: { plate: "bg-navy-soft text-navy" },
  amber: { plate: "bg-amber-100 text-amber-800" },
  emerald: { plate: "bg-emerald-100 text-emerald-800" },
  sky: { plate: "bg-sky-100 text-sky-800" },
  rose: { plate: "bg-rose-100 text-rose-800" },
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
        "relative border-4 border-pixel-line bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-pixel text-[8px] uppercase leading-[1.7] tracking-[0.04em] text-pixel-line">
          {label}
        </p>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center border-[3px] border-pixel-line",
            style.plate,
          )}
        >
          <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 whitespace-nowrap font-pixel text-[10px] uppercase leading-[1.5] text-pixel-line min-[380px]:text-[12px] sm:text-[16px] xl:text-[18px]">
        <CountUp
          value={value}
          format={format}
          decimals={decimals}
          suffix={suffix}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 border-2 border-pixel-line px-1.5 py-0.5 text-[10px] font-bold",
              deltaDirection === "down"
                ? "bg-rose-50 text-rose-800"
                : deltaDirection === "neutral"
                  ? "bg-pixel-panel text-pixel-line"
                  : "bg-emerald-50 text-emerald-800",
            )}
          >
            {deltaDirection !== "neutral" ? <DeltaIcon size={10} /> : null}
            {delta}
          </span>
        ) : null}
        {hint ? <span className="text-[11px] text-pixel-ink/80">{hint}</span> : null}
      </div>
    </div>
  );
}
