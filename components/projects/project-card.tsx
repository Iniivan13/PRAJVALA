import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageSquare, ShieldCheck } from "lucide-react";
import type { Project } from "@/types";
import { getRegion } from "@/lib/data";
import { formatCompactIDR } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/**
 * Quest card.
 *
 * Mirrors the reference's project card: a framed photo plate, a stamped status
 * block, then a paper body with a stepped progress meter and the budget figure.
 * The whole card is one link, so the hit area stays large on mobile.
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const region = getRegion(project.regionId);

  return (
    <Link
      href={`/proyek/${project.id}`}
      className={cn(
        "group flex flex-col border-4 border-pixel-line bg-white shadow-card transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 focus-visible:outline-offset-4",
        className,
      )}
      aria-label={`Lihat detail proyek ${project.name}`}
    >
      {/* Photo plate */}
      <div className="border-b-4 border-pixel-line bg-pixel-panel p-1.5">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-[3px] border-pixel-line">
          <Image
            src={project.after.src}
            alt={project.after.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="pixelated object-cover"
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            <StatusBadge status={project.status} variant="block" />
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
            <CategoryBadge category={project.category} onImage />
            <span className="inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-cream px-1.5 py-0.5 font-pixel text-[7px] uppercase text-pixel-line">
              <ShieldCheck size={9} className="text-emerald-700" aria-hidden="true" />
              {project.validationScore}/100
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-pixel-ink/75">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">
            {region?.name ?? project.location.district} · {region?.city}
          </span>
        </p>
        <h3 className="mt-2 font-pixel text-[10px] uppercase leading-[1.85] text-pixel-line">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-pixel-ink/80">
          {project.summary}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="font-semibold uppercase tracking-[0.05em] text-pixel-ink/70">
              Progres fisik
            </span>
            <span className="tabular font-mono text-[11.5px] font-bold text-pixel-line">
              {project.progress}%
            </span>
          </div>
          <ProgressBar
            value={project.progress}
            ariaLabel={`Progres fisik ${project.name}`}
            tone={
              project.status === "Perlu Audit"
                ? "rose"
                : project.status === "Terverifikasi"
                  ? "emerald"
                  : "navy"
            }
            className="mt-1.5"
          />

          <div className="mt-3.5 flex items-end justify-between gap-3 border-t-[3px] border-pixel-line/20 pt-3">
            <div>
              <p className="font-pixel text-[6.5px] uppercase leading-[1.7] tracking-[0.03em] text-pixel-ink/60">
                Pagu anggaran
              </p>
              <p className="mt-1 tabular font-mono text-[12.5px] font-bold text-pixel-line">
                {formatCompactIDR(project.budget)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10.5px] font-medium text-pixel-ink/70">
                <MessageSquare size={12} aria-hidden="true" />
                {project.reportCount}
              </span>
              <span className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-pixel-panel font-pixel text-[9px] text-pixel-line transition-colors group-hover:bg-pixel-sun">
                <span aria-hidden="true">&gt;</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
