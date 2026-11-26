"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { Project } from "@/types";
import { getRegion } from "@/lib/data";
import { STATUS_STYLES } from "@/components/ui/status-badge";
import { formatCompactIDR } from "@/lib/utils";

interface MapCanvasProps {
  projects: Project[];
  activeRegionId: string;
}

function createMarkerIcon(color: string) {
  return L.divIcon({
    className: "prajvala-marker",
    html: `<div style="position:relative;width:30px;height:30px;display:grid;place-items:center;">
      <span class="marker-halo" style="background:${color};"></span>
      <span style="position:relative;display:block;width:16px;height:16px;background:${color};border:3px solid #2B2B2B;box-shadow:2px 2px 0 rgba(43,43,43,0.55);"></span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

function FitBounds({
  projects,
  activeRegionId,
}: {
  projects: Project[];
  activeRegionId: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (projects.length === 0) return;
    const bounds = L.latLngBounds(
      projects.map((project) => [
        project.location.coordinates.lat,
        project.location.coordinates.lng,
      ]),
    );
    map.fitBounds(bounds, {
      padding: [52, 52],
      maxZoom: activeRegionId === "all" ? 8 : 16,
    });
  }, [projects, activeRegionId, map]);

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 220);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export function MapCanvas({ projects, activeRegionId }: MapCanvasProps) {
  const icons = useMemo(
    () => ({
      Terverifikasi: createMarkerIcon(STATUS_STYLES.Terverifikasi.marker),
      "Dalam Pengerjaan": createMarkerIcon(STATUS_STYLES["Dalam Pengerjaan"].marker),
      "Perlu Audit": createMarkerIcon(STATUS_STYLES["Perlu Audit"].marker),
      Direncanakan: createMarkerIcon(STATUS_STYLES.Direncanakan.marker),
    }),
    [],
  );

  return (
    <MapContainer
      center={[-6.75, 108.6]}
      zoom={7}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <FitBounds projects={projects} activeRegionId={activeRegionId} />

      {projects.map((project) => {
        const region = getRegion(project.regionId);
        return (
          <Marker
            key={project.id}
            position={[
              project.location.coordinates.lat,
              project.location.coordinates.lng,
            ]}
            icon={icons[project.status]}
            title={project.name}
          >
            <Popup>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 border border-pixel-line"
                    style={{ backgroundColor: STATUS_STYLES[project.status].marker }}
                    aria-hidden="true"
                  />
                  <span className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                    {project.status}
                  </span>
                  <span className="ml-auto border border-pixel-line/40 bg-pixel-panel px-1 py-0.5 text-[9px] font-semibold text-pixel-line">
                    {project.category}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] font-bold leading-snug text-pixel-line">
                  {project.name}
                </p>
                <p className="mt-1 text-[9.5px] text-pixel-ink/65">
                  {region?.name} · {project.location.district}
                </p>
                <div className="mt-2 flex items-center justify-between border-t-2 border-pixel-line/20 pt-1.5 text-[9.5px]">
                  <span className="text-pixel-ink/70">Pagu</span>
                  <span className="font-mono font-semibold text-pixel-line">
                    {formatCompactIDR(project.budget)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden border border-pixel-line bg-pixel-panel"
                  role="progressbar"
                  aria-label={`Progres ${project.name}`}
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: STATUS_STYLES[project.status].marker,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[9.5px] text-pixel-ink/70">
                  <span>Progres fisik</span>
                  <span className="font-semibold text-pixel-line">{project.progress}%</span>
                </div>
                <Link
                  href={`/proyek/${project.id}`}
                  className="mt-2.5 flex items-center justify-center gap-1 border-2 border-pixel-line bg-pixel-sun px-3 py-2 font-pixel text-[7.5px] uppercase !text-pixel-line no-underline shadow-chip transition-transform hover:-translate-y-0.5"
                >
                  Lihat detail proyek
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
