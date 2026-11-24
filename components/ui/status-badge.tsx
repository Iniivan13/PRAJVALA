import type { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

export const STATUS_STYLES: Record<
  ProjectStatus,
  { badge: string; dot: string; label: string; marker: string; soft: string }
> = {
  Terverifikasi: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    label: "Terverifikasi",
    marker: "#10B981",
    soft: "bg-emerald-50 text-emerald-700",
  },
  "Dalam Pengerjaan": {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    label: "Dalam Pengerjaan",
    marker: "#F59E0B",
    soft: "bg-amber-50 text-amber-700",
  },
  "Perlu Audit": {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    label: "Perlu Audit",
    marker: "#EF4444",
    soft: "bg-rose-50 text-rose-700",
  },
  Direncanakan: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    label: "Direncanakan",
    marker: "#0EA5E9",
    soft: "bg-sky-50 text-sky-700",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  dot?: boolean;
  withLabelPrefix?: boolean;
}

export function StatusBadge({
  status,
  className,
  dot = true,
  withLabelPrefix = false,
}: StatusBadgeProps) {
  const config = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        config.badge,
        className,
      )}
    >
      {dot ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden="true" />
      ) : null}
      {withLabelPrefix ? <span className="font-medium opacity-70">Status:</span> : null}
      {config.label}
    </span>
  );
}
