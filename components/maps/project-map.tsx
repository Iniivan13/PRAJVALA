"use client";

import dynamic from "next/dynamic";
import { Layers, MapPin } from "lucide-react";
import type { Project } from "@/types";
import { STATUS_STYLES } from "@/components/ui/status-badge";

const MapCanvas = dynamic(
  () => import("./map-canvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-ink-100 via-ink-50 to-ink-200" />
    ),
  },
);

interface ProjectMapProps {
  projects: Project[];
  activeRegionId: string;
  heightClass?: string;
}

export function ProjectMap({
  projects,
  activeRegionId,
  heightClass = "h-[430px]",
}: ProjectMapProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-soft ${heightClass}`}
    >
      <MapCanvas projects={projects} activeRegionId={activeRegionId} />

      <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl border border-ink-200/80 bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-navy-soft text-navy">
          <Layers size={14} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
            Peta sebaran
          </p>
          <p className="text-[11px] font-semibold text-ink-800">
            {projects.length} proyek dipetakan
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden rounded-xl border border-ink-200/80 bg-white/95 p-2.5 shadow-soft backdrop-blur sm:block">
        <p className="flex items-center gap-1 px-1 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
          <MapPin size={10} aria-hidden="true" />
          Keterangan
        </p>
        <div className="flex flex-col gap-1">
          {(["Terverifikasi", "Dalam Pengerjaan", "Perlu Audit"] as const).map((status) => (
            <span
              key={status}
              className="flex items-center gap-1.5 px-1 text-[9.5px] font-medium text-ink-600"
            >
              <span
                className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`}
                aria-hidden="true"
              />
              {status}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
