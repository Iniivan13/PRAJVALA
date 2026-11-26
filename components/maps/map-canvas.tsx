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
    html: `<div style="position:relative;width:32px;height:32px;display:grid;place-items:center;">
      <span class="marker-pulse" style="background:${color};"></span>
      <span style="position:relative;display:block;width:17px;height:17px;background:${color};border:3px solid #fff;border-radius:9999px;box-shadow:0 3px 10px rgba(15,23,42,0.4);"></span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -15],
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
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_STYLES[project.status].marker }}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
                    {project.status}
                  </span>
                  <span className="ml-auto rounded bg-ink-100 px-1 py-0.5 text-[9.5px] font-semibold text-ink-500">
                    {project.category}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] font-bold leading-snug text-ink-900">
                  {project.name}
                </p>
                <p className="mt-1 text-[9.5px] text-ink-500">
                  {region?.name} · {project.location.district}
                </p>
                <div className="mt-2 flex items-center justify-between text-[9.5px]">
                  <span className="text-ink-500">Pagu</span>
                  <span className="font-mono font-semibold text-ink-900">
                    {formatCompactIDR(project.budget)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink-100"
                  role="progressbar"
                  aria-label={`Progres ${project.name}`}
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: STATUS_STYLES[project.status].marker,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[9.5px] text-ink-500">
                  <span>Progres fisik</span>
                  <span className="font-semibold text-ink-600">{project.progress}%</span>
                </div>
                <Link
                  href={`/proyek/${project.id}`}
                  className="mt-2.5 flex items-center justify-center gap-1 rounded-lg bg-ink-900 px-3 py-2 text-[10px] font-semibold !text-white no-underline transition-colors hover:bg-ink-800"
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
