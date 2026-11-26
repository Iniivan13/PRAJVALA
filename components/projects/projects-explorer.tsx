"use client";

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  FolderSearch,
  Landmark,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRegion } from "@/components/providers/region-provider";
import { ProjectMap } from "@/components/maps/project-map";
import { ProjectCard } from "@/components/projects/project-card";
import { STATUS_STYLES } from "@/components/ui/status-badge";
import { getProjectsForRegion } from "@/lib/data";
import type { ProjectCategory, ProjectStatus } from "@/types";
import { cn, formatCompactIDR, formatNumber } from "@/lib/utils";

const CATEGORIES: (ProjectCategory | "Semua kategori")[] = [
  "Semua kategori",
  "Infrastruktur Jalan",
  "Pendidikan",
  "Kesehatan",
  "Pemberdayaan UMKM",
  "Bantuan Sosial",
  "Infrastruktur Umum",
];

const STATUSES: (ProjectStatus | "Semua status")[] = [
  "Semua status",
  "Terverifikasi",
  "Dalam Pengerjaan",
  "Perlu Audit",
  "Direncanakan",
];

type SortOption = "validasi" | "pagu-desc" | "pagu-asc" | "progres-desc" | "terbaru";

interface ProjectsExplorerProps {
  initialQuery?: string;
  initialCategory?: string;
}

export function ProjectsExplorer({ initialQuery = "", initialCategory }: ProjectsExplorerProps) {
  const { activeRegionId, summary } = useRegion();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ProjectCategory | "Semua kategori">(
    CATEGORIES.includes(initialCategory as ProjectCategory)
      ? (initialCategory as ProjectCategory)
      : "Semua kategori",
  );
  const [status, setStatus] = useState<ProjectStatus | "Semua status">("Semua status");
  const [sort, setSort] = useState<SortOption>("validasi");

  const regionProjects = useMemo(
    () => getProjectsForRegion(activeRegionId),
    [activeRegionId],
  );

  const statusCounts = useMemo(
    () => ({
      Terverifikasi: regionProjects.filter((project) => project.status === "Terverifikasi").length,
      "Dalam Pengerjaan": regionProjects.filter(
        (project) => project.status === "Dalam Pengerjaan",
      ).length,
      "Perlu Audit": regionProjects.filter((project) => project.status === "Perlu Audit").length,
      Direncanakan: regionProjects.filter((project) => project.status === "Direncanakan").length,
    }),
    [regionProjects],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = regionProjects.filter((project) => {
      const matchesQuery =
        normalized.length === 0 ||
        [
          project.name,
          project.category,
          project.status,
          project.location.address,
          project.location.district,
          project.vendor,
          project.summary,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory = category === "Semua kategori" || project.category === category;
      const matchesStatus = status === "Semua status" || project.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "pagu-desc":
          return b.budget - a.budget;
        case "pagu-asc":
          return a.budget - b.budget;
        case "progres-desc":
          return b.progress - a.progress;
        case "terbaru":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case "validasi":
        default:
          return b.validationScore - a.validationScore;
      }
    });

    return result;
  }, [regionProjects, query, category, status, sort]);

  const hasFilters =
    query.trim().length > 0 || category !== "Semua kategori" || status !== "Semua status";

  const reset = () => {
    setQuery("");
    setCategory("Semua kategori");
    setStatus("Semua status");
    setSort("validasi");
  };

  const totalPagu = filtered.reduce((sum, project) => sum + project.budget, 0);
  const averageValidation =
    filtered.length > 0
      ? filtered.reduce((sum, project) => sum + project.validationScore, 0) / filtered.length
      : 0;

  const summaryStats = [
    {
      label: "Proyek ditampilkan",
      value: formatNumber(filtered.length),
      hint: `dari ${regionProjects.length} proyek`,
      icon: FolderSearch,
      color: "text-navy",
    },
    {
      label: "Total pagu proyek",
      value: formatCompactIDR(totalPagu),
      hint: "sesuai filter aktif",
      icon: Landmark,
      color: "text-pixel-wood-cta",
    },
    {
      label: "Rata-rata validasi",
      value: `${formatNumber(averageValidation, 0)}/100`,
      hint: "skor laporan warga",
      icon: ShieldCheck,
      color: "text-emerald-600",
    },
    {
      label: "Perlu perhatian",
      value: formatNumber(
        filtered.filter((project) => project.status === "Perlu Audit").length,
      ),
      hint: "proyek perlu audit",
      icon: AlertTriangle,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      {/* Inventory counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="border-4 border-pixel-line bg-white px-3 py-3 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                {stat.label}
              </p>
              <stat.icon size={13} className={stat.color} aria-hidden="true" />
            </div>
            <p className="mt-2 font-pixel text-[12px] leading-[1.5] text-pixel-line">
              {stat.value}
            </p>
            <p className="mt-1 text-[9.5px] text-pixel-ink/70">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Status chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus("Semua status")}
          aria-pressed={status === "Semua status"}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1.5 font-pixel text-[7.5px] uppercase leading-[1.6] shadow-chip transition-transform",
            status === "Semua status"
              ? "bg-pixel-line text-pixel-sun"
              : "bg-white text-pixel-line hover:bg-pixel-sun",
          )}
        >
          Semua
          <span
            className={cn(
              "border px-1 text-[9px] font-bold",
              status === "Semua status"
                ? "border-pixel-cream/40 text-pixel-cream"
                : "border-pixel-line/30 text-pixel-line",
            )}
          >
            {regionProjects.length}
          </span>
        </button>
        {(
          [
            "Terverifikasi",
            "Dalam Pengerjaan",
            "Perlu Audit",
          ] as const
        ).map((label) => {
          const isActive = status === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStatus(isActive ? "Semua status" : label)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1.5 font-pixel text-[7.5px] uppercase leading-[1.6] shadow-chip transition-transform",
                isActive
                  ? "bg-pixel-sun text-pixel-line"
                  : "bg-white text-pixel-line hover:bg-pixel-panel",
              )}
            >
              <span
                className={`h-2 w-2 border border-pixel-line ${STATUS_STYLES[label].dot}`}
                aria-hidden="true"
              />
              {label}
              <span className="text-[9px] text-pixel-ink/60">{statusCounts[label]}</span>
            </button>
          );
        })}
        <span className="ml-auto hidden items-center gap-1.5 text-[10px] text-pixel-ink/70 sm:flex">
          <MapPin size={11} aria-hidden="true" />
          {activeRegionId === "all" ? "3 wilayah percontohan" : summary.name} · peta interaktif
        </span>
      </div>

      {/* Filter board */}
      <div className="mt-3 border-4 border-pixel-line bg-pixel-panel p-3 shadow-card">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/70"
              aria-hidden="true"
            />
            <label htmlFor="project-search" className="sr-only">
              Cari proyek atau wilayah
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama proyek, alamat, atau penyedia…"
              className="h-10 w-full border-2 border-pixel-line bg-white pl-9 pr-3 text-[12px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div>
              <label htmlFor="project-category" className="sr-only">
                Kategori proyek
              </label>
              <select
                id="project-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProjectCategory | "Semua kategori")
                }
                className="h-10 w-full appearance-none border-2 border-pixel-line bg-white px-2 text-[11px] font-medium text-pixel-line outline-none focus:border-pixel-wood-cta sm:min-w-[150px] sm:px-3"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project-status" className="sr-only">
                Status proyek
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProjectStatus | "Semua status")
                }
                className="h-10 w-full appearance-none border-2 border-pixel-line bg-white px-2 text-[11px] font-medium text-pixel-line outline-none focus:border-pixel-wood-cta sm:min-w-[132px] sm:px-3"
              >
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project-sort" className="sr-only">
                Urutkan proyek
              </label>
              <select
                id="project-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="h-10 w-full appearance-none border-2 border-pixel-line bg-white px-2 text-[11px] font-medium text-pixel-line outline-none focus:border-pixel-wood-cta sm:min-w-[150px] sm:px-3"
              >
                <option value="validasi">Validasi tertinggi</option>
                <option value="pagu-desc">Anggaran terbesar</option>
                <option value="pagu-asc">Anggaran terkecil</option>
                <option value="progres-desc">Progres tertinggi</option>
                <option value="terbaru">Terbaru dimulai</option>
              </select>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={!hasFilters}
              className="inline-flex h-10 items-center justify-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 font-pixel text-[7.5px] uppercase text-pixel-line shadow-chip transition-transform hover:bg-pixel-sun disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:px-3"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ProjectMap projects={filtered} activeRegionId={activeRegionId} />
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-pixel text-[12px] uppercase leading-[1.8] text-pixel-line sm:text-[14px]">
            {hasFilters ? "Hasil pencarian proyek" : "Proyek di wilayah ini"}
          </h2>
          <p className="mt-1.5 text-[11.5px] text-pixel-ink/75">
            {filtered.length} proyek · total pagu {formatCompactIDR(totalPagu)} · klik kartu
            untuk melihat bukti fisik dan validasi warga.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2 py-1 font-pixel text-[7px] uppercase text-pixel-line shadow-chip">
          <BadgeCheck size={10} className="text-emerald-600" aria-hidden="true" />
          Data diperbarui November 2026
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center border-4 border-dashed border-pixel-line/50 bg-white px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
            <FolderSearch size={20} aria-hidden="true" />
          </span>
          <h3 className="mt-3 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            Belum ada proyek yang cocok
          </h3>
          <p className="mt-1.5 max-w-sm text-[11.5px] leading-relaxed text-pixel-ink/75">
            Coba kata kunci lain, ubah kategori, atau pilih wilayah berbeda melalui
            tombol wilayah di atas.
          </p>
          <button type="button" onClick={reset} className="btn-secondary mt-4 h-9 px-3 py-0 text-[8px]">
            <RotateCcw size={12} aria-hidden="true" />
            Tampilkan semua proyek
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-4 border-4 border-pixel-line bg-pixel-cream-deep p-4 shadow-card sm:grid-cols-3">
        {[
          {
            icon: Building2,
            title: "Lokasi terverifikasi",
            text: "Setiap pin peta memiliki koordinat dan alamat proyek.",
          },
          {
            icon: TrendingUp,
            title: "Progres transparan",
            text: "Bandingkan progres fisik dengan pencairan anggaran.",
          },
          {
            icon: ShieldCheck,
            title: "Validasi warga",
            text: "Baca laporan lapangan atau kirim temuan Anda sendiri.",
          },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
              <item.icon size={14} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-pixel-line">{item.title}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-pixel-ink/75">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-4 border-pixel-line bg-pixel-sun/30 px-4 py-3 text-[10.5px] text-pixel-line shadow-card">
        <p className="flex items-center gap-2">
          <ShieldCheck size={13} aria-hidden="true" />
          Menemukan ketidaksesuaian? Bukti lapangan Anda membantu warga lain menilai.
        </p>
        <a
          href={filtered[0] ? `/proyek/${filtered[0].id}#validasi` : "/proyek"}
          className="inline-flex min-h-8 items-center gap-1 font-pixel text-[7.5px] uppercase underline decoration-2 underline-offset-4 hover:text-pixel-wood-cta"
        >
          Kirim laporan warga
          <ArrowRight size={11} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
