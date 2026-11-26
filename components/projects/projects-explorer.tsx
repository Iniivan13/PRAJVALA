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
      color: "text-amber-600",
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
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 shadow-soft sm:grid-cols-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-500">
                {stat.label}
              </p>
              <stat.icon size={13} className={stat.color} aria-hidden="true" />
            </div>
            <p className="mt-1 font-display text-[17px] font-extrabold tracking-tight text-ink-900">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[9.5px] text-ink-500">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus("Semua status")}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors",
            status === "Semua status"
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
          )}
        >
          Semua
          <span className="rounded-full bg-white/15 px-1.5 text-[9.5px]">
            {regionProjects.length}
          </span>
        </button>
        {(
          [
            ["Terverifikasi", "#10B981"],
            ["Dalam Pengerjaan", "#F59E0B"],
            ["Perlu Audit", "#EF4444"],
          ] as const
        ).map(([label, color]) => {
          const isActive = status === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStatus(isActive ? "Semua status" : label)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                isActive
                  ? "border-ink-300 bg-white text-ink-900 shadow-sm"
                  : "border-ink-200 bg-white/70 text-ink-500 hover:border-ink-300",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {label}
              <span className="text-[9.5px] text-ink-500">{statusCounts[label]}</span>
            </button>
          );
        })}
        <span className="ml-auto hidden items-center gap-1.5 text-[10px] text-ink-500 sm:flex">
          <MapPin size={11} aria-hidden="true" />
          {activeRegionId === "all" ? "3 wilayah percontohan" : summary.name} · peta interaktif
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
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
              className="h-10 w-full rounded-xl border border-transparent bg-ink-50 pl-9 pr-4 text-[12.5px] text-ink-800 placeholder:text-ink-500 transition-colors focus:border-ink-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-ink-900/5"
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
                className="h-10 w-full min-w-[150px] appearance-none rounded-xl border border-ink-200 bg-white px-3 text-[11px] font-medium text-ink-700 focus:border-ink-300 focus:outline-none focus:ring-4 focus:ring-ink-900/5"
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
                className="h-10 w-full min-w-[132px] appearance-none rounded-xl border border-ink-200 bg-white px-3 text-[11px] font-medium text-ink-700 focus:border-ink-300 focus:outline-none focus:ring-4 focus:ring-ink-900/5"
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
                className="h-10 w-full min-w-[150px] appearance-none rounded-xl border border-ink-200 bg-white px-3 text-[11px] font-medium text-ink-700 focus:border-ink-300 focus:outline-none focus:ring-4 focus:ring-ink-900/5"
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
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[11px] font-semibold text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={13} aria-hidden="true" />
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
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            {hasFilters ? "Hasil pencarian proyek" : "Proyek di wilayah ini"}
          </h2>
          <p className="mt-1 text-[11.5px] text-ink-500">
            {filtered.length} proyek · total pagu {formatCompactIDR(totalPagu)} · klik kartu
            untuk melihat bukti fisik dan validasi warga.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-500">
          <BadgeCheck size={11} className="text-emerald-500" aria-hidden="true" />
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
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-500">
            <FolderSearch size={20} aria-hidden="true" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-ink-900">
            Belum ada proyek yang cocok
          </h3>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink-500">
            Coba kata kunci lain, ubah kategori, atau pilih wilayah berbeda melalui
            tombol wilayah di atas.
          </p>
          <button type="button" onClick={reset} className="btn-secondary mt-4 h-9 px-4 py-0 text-[11.5px]">
            <RotateCcw size={13} aria-hidden="true" />
            Tampilkan semua proyek
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-3 rounded-2xl border border-ink-200/70 bg-white/70 p-4 sm:grid-cols-3">
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
          <div key={item.title} className="flex items-start gap-2.5 px-1 py-1">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
              <item.icon size={14} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-ink-800">{item.title}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 text-[10.5px] text-amber-900">
        <p className="flex items-center gap-2">
          <ShieldCheck size={13} aria-hidden="true" />
          Menemukan ketidaksesuaian? Bukti lapangan Anda membantu warga lain menilai.
        </p>
        <a
          href={filtered[0] ? `/proyek/${filtered[0].id}#validasi` : "/proyek"}
          className="inline-flex min-h-8 items-center gap-1 font-semibold hover:underline"
        >
          Kirim laporan warga
          <ArrowRight size={11} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
