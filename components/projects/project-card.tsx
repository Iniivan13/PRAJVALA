import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageSquare, ShieldCheck } from "lucide-react";
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

export function ProjectCard({ project, className }: ProjectCardProps) {
  const region = getRegion(project.regionId);

  return (
    <Link
      href={`/proyek/${project.id}`}
      className={cn(
        "card-base card-hover group flex flex-col overflow-hidden focus-visible:outline-offset-4",
        className,
      )}
      aria-label={`Lihat detail proyek ${project.name}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-100">
        <Image
          src={project.after.src}
          alt={project.after.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/5 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusBadge status={project.status} className="bg-white/95 backdrop-blur" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <CategoryBadge category={project.category} onImage />
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
            <ShieldCheck size={11} className="text-amber-400" aria-hidden="true" />
            {project.validationScore}/100
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
          <MapPin size={12} aria-hidden="true" />
          <span className="truncate">
            {region?.name ?? project.location.district} · {region?.city}
          </span>
        </p>
        <h3 className="mt-1.5 font-display text-[16.5px] font-bold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-navy">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">
          {project.summary}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-ink-500">Progres fisik</span>
            <span className="font-mono font-semibold tabular text-ink-700">
              {project.progress}%
            </span>
          </div>
          <ProgressBar
            value={project.progress}
            ariaLabel={`Progres fisik ${project.name}`}
            tone={project.status === "Perlu Audit" ? "rose" : project.status === "Terverifikasi" ? "emerald" : "navy"}
            className="mt-1.5"
          />

          <div className="mt-3.5 flex items-end justify-between gap-3 border-t border-ink-100 pt-3.5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-ink-500">
                Pagu anggaran
              </p>
              <p className="mt-0.5 font-mono text-[13px] font-bold tabular text-ink-900">
                {formatCompactIDR(project.budget)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10.5px] font-medium text-ink-500">
                <MessageSquare size={12} aria-hidden="true" />
                {project.reportCount}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 text-ink-500 transition-all group-hover:border-amber-400 group-hover:bg-amber-50 group-hover:text-amber-600">
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
