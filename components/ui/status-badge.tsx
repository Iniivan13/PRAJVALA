import type { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Status vocabulary.
 *
 * `badge` keeps the semantic tint used in dense rows; `block` is the pixel
 * stamp used on quest cards. Every status also carries an explicit label and a
 * distinct shape, so colour is never the only signal (DESIGN.md §12).
 */
export const STATUS_STYLES: Record<
  ProjectStatus,
  { badge: string; block: string; dot: string; label: string; marker: string; soft: string; short: string }
> = {
  Terverifikasi: {
    badge: "border-emerald-700 bg-emerald-50 text-emerald-800",
    block: "bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
    label: "Terverifikasi",
    marker: "#047857",
    soft: "bg-emerald-50 text-emerald-800",
    short: "OK",
  },
  "Dalam Pengerjaan": {
    badge: "border-amber-700 bg-amber-50 text-amber-800",
    block: "bg-amber-50 text-amber-800",
    dot: "bg-amber-600",
    label: "Dalam Pengerjaan",
    marker: "#B45309",
    soft: "bg-amber-50 text-amber-800",
    short: "JLN",
  },
  "Perlu Audit": {
    badge: "border-rose-700 bg-rose-50 text-rose-800",
    block: "bg-rose-50 text-rose-800",
    dot: "bg-rose-600",
    label: "Perlu Audit",
    marker: "#B91C1C",
    soft: "bg-rose-50 text-rose-800",
    short: "AUD",
  },
  Direncanakan: {
    badge: "border-sky-700 bg-sky-50 text-sky-800",
    block: "bg-sky-50 text-sky-800",
    dot: "bg-sky-700",
    label: "Direncanakan",
    marker: "#0369A1",
    soft: "bg-sky-50 text-sky-800",
    short: "RNC",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  dot?: boolean;
  withLabelPrefix?: boolean;
  /** `block` renders the chunky pixel stamp used on quest cards. */
  variant?: "chip" | "block";
}

export function StatusBadge({
  status,
  className,
  dot = true,
  withLabelPrefix = false,
  variant = "chip",
}: StatusBadgeProps) {
  const config = STATUS_STYLES[status];

  if (variant === "block") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border-[3px] border-pixel-line px-2 py-1 font-pixel text-[8px] uppercase leading-none shadow-chip",
          config.block,
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn("h-2 w-2 border border-pixel-line", config.dot)}
        />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 border-pixel-line px-2 py-1 text-[10.5px] font-bold shadow-chip",
        config.badge,
        className,
      )}
    >
      {dot ? (
        <span
          className={cn("h-2 w-2 border border-pixel-line", config.dot)}
          aria-hidden="true"
        />
      ) : null}
      {withLabelPrefix ? <span className="font-medium opacity-70">Status:</span> : null}
      {config.label}
    </span>
  );
}
