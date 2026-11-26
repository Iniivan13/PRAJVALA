import { Check, Clock3, Loader2 } from "lucide-react";
import type { Milestone } from "@/types";
import { cn, formatDateLong } from "@/lib/utils";

interface ProjectTimelineProps {
  milestones: Milestone[];
}

export function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  const completed = milestones.filter((milestone) => milestone.status === "selesai").length;
  const progress = milestones.length > 0 ? (completed / milestones.length) * 100 : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200/70 bg-ink-50/60 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-500">
            Tahap pelaksanaan
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-ink-800">
            {completed} dari {milestones.length} tahap selesai
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[10.5px] font-semibold text-ink-700">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <ol className="relative">
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;
          const isDone = milestone.status === "selesai";
          const isActive = milestone.status === "aktif";

          return (
            <li key={`${milestone.label}-${index}`} className="relative flex gap-3.5 pb-5 last:pb-0">
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px",
                    isDone ? "bg-emerald-200" : "bg-ink-200",
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-[1] grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border-2",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  isActive &&
                    "border-amber-500 bg-amber-50 text-amber-600 ring-4 ring-amber-500/15",
                  !isDone && !isActive && "border-ink-200 bg-white text-ink-300",
                )}
                aria-hidden="true"
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Clock3 size={12} />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p
                    className={cn(
                      "text-[12px] font-semibold leading-snug",
                      isDone || isActive ? "text-ink-900" : "text-ink-500",
                    )}
                  >
                    {milestone.label}
                  </p>
                  <time
                    dateTime={milestone.date}
                    className={cn(
                      "shrink-0 font-mono text-[9.5px]",
                      isActive ? "font-semibold text-amber-600" : "text-ink-500",
                    )}
                  >
                    {formatDateLong(milestone.date)}
                  </time>
                </div>
                {milestone.note ? (
                  <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
                    {milestone.note}
                  </p>
                ) : null}
                {isActive ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    Sedang berlangsung
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
