"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { Project } from "@/types";
import { STATUS_STYLES } from "@/components/ui/status-badge";
import { SpriteQuest } from "@/components/ui/pixel-sprites";

const MapCanvas = dynamic(
  () => import("./map-canvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-pixel-panel">
        <span className="absolute inset-0 animate-pulse bg-pixel-cream-deep/60" />
      </div>
    ),
  },
);

interface ProjectMapProps {
  projects: Project[];
  activeRegionId: string;
  heightClass?: string;
}

/**
 * Map framed like a pixel window: wood-dark bezel, square legend plates, and a
 * static halo on each marker. Attribution stays on the map itself.
 */
export function ProjectMap({
  projects,
  activeRegionId,
  heightClass = "h-[430px]",
}: ProjectMapProps) {
  return (
    <div className="border-4 border-pixel-line bg-pixel-wood-dark p-1.5 shadow-panel">
      <div className={`relative w-full overflow-hidden border-[3px] border-pixel-line ${heightClass}`}>
        <MapCanvas projects={projects} activeRegionId={activeRegionId} />

        <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-2 border-2 border-pixel-line bg-pixel-cream px-2 py-1.5 shadow-chip">
          <span className="grid h-6 w-6 place-items-center border border-pixel-line bg-pixel-sun text-pixel-line">
            <SpriteQuest size={13} />
          </span>
          <div>
            <p className="font-pixel text-[6.5px] uppercase leading-[1.6] text-ink-600">
              Peta sebaran
            </p>
            <p className="text-[10.5px] font-semibold leading-tight text-pixel-line">
              {projects.length} proyek dipetakan
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden border-2 border-pixel-line bg-pixel-cream p-2 shadow-chip sm:block">
          <p className="flex items-center gap-1 border-b border-pixel-line/25 px-0.5 pb-1 font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
            <MapPin size={9} aria-hidden="true" />
            Keterangan
          </p>
          <div className="mt-1 flex flex-col gap-1">
            {(["Terverifikasi", "Dalam Pengerjaan", "Perlu Audit"] as const).map(
              (status) => (
                <span
                  key={status}
                  className="flex items-center gap-1.5 px-0.5 text-[9.5px] font-medium text-pixel-line"
                >
                  <span
                    className={`h-2 w-2 border border-pixel-line ${STATUS_STYLES[status].dot}`}
                    aria-hidden="true"
                  />
                  {status}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
