import { Check, Clock3 } from "lucide-react";
import type { Milestone } from "@/types";
import { cn, formatDateLong } from "@/lib/utils";

interface ProjectTimelineProps {
  milestones: Milestone[];
}

/**
 * Mission path.
 *
 * Stages read as a trail of square waypoints joined by a dashed path. No
 * perpetual spinners: the active stage is marked with a static sun tile.
 */
export function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  const completed = milestones.filter((milestone) => milestone.status === "selesai").length;
  const progress = milestones.length > 0 ? (completed / milestones.length) * 100 : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-[3px] border-pixel-line bg-pixel-cream px-3 py-2.5">
        <div>
          <p className="font-pixel text-[7px] uppercase leading-[1.7] text-ink-600">
            Tahap pelaksanaan
          </p>
          <p className="mt-1 text-[11.5px] font-semibold text-pixel-line">
            {completed} dari {milestones.length} tahap selesai
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 overflow-hidden border-2 border-pixel-line bg-pixel-panel">
            <div
              className="h-full bg-pixel-grass-deep transition-all duration-700"
              style={{
                width: `${progress}%`,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 5px)",
              }}
            />
          </div>
          <span className="tabular font-mono text-[10.5px] font-bold text-pixel-line">
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
                    "absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-[3px]",
                    isDone ? "bg-pixel-grass-deep/50" : "bg-pixel-line/20",
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-[1] grid h-[27px] w-[27px] shrink-0 place-items-center border-[3px] border-pixel-line",
                  isDone && "bg-pixel-grass-deep text-white",
                  isActive && "bg-pixel-sun text-pixel-line shadow-chip",
                  !isDone && !isActive && "bg-white text-pixel-line/40",
                )}
                aria-hidden="true"
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <Clock3 size={12} />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p
                    className={cn(
                      "text-[12px] font-semibold leading-snug",
                      isDone || isActive ? "text-pixel-line" : "text-pixel-ink/55",
                    )}
                  >
                    {milestone.label}
                  </p>
                  <time
                    dateTime={milestone.date}
                    className={cn(
                      "shrink-0 font-mono text-[9.5px]",
                      isActive
                        ? "font-bold text-pixel-wood-cta"
                        : "text-pixel-ink/60",
                    )}
                  >
                    {formatDateLong(milestone.date)}
                  </time>
                </div>
                {milestone.note ? (
                  <p className="mt-1 text-[10.5px] leading-relaxed text-pixel-ink/75">
                    {milestone.note}
                  </p>
                ) : null}
                {isActive ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-sun px-1.5 py-0.5 font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-line">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 border border-pixel-line bg-pixel-wood-cta"
                    />
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
