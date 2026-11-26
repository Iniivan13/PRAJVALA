"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImageIcon,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldCheck,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRegion } from "@/components/providers/region-provider";
import { CITIZEN_REPORTS, getProject, getRegion } from "@/lib/data";
import type { Project, Suitability } from "@/types";
import {
  cn,
  formatDateLong,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

type FilterValue = "Semua" | Suitability;

const FILTERS: { value: FilterValue; label: string; short: string }[] = [
  { value: "Semua", label: "Semua laporan", short: "Semua" },
  { value: "Sesuai Target", label: "Sesuai target", short: "Sesuai" },
  { value: "Terlambat", label: "Terlambat", short: "Terlambat" },
  { value: "Indikasi Kejanggalan", label: "Indikasi kejanggalan", short: "Kejanggalan" },
];

const SUITABILITY_TONE: Record<Suitability, string> = {
  "Sesuai Target": "bg-emerald-50 text-emerald-900",
  Terlambat: "bg-amber-50 text-amber-900",
  "Indikasi Kejanggalan": "bg-rose-50 text-rose-900",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={cn(
            "h-2 w-2 border border-pixel-line",
            star <= rating ? "bg-amber-500" : "bg-pixel-panel",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Citizen report board.
 *
 * Built entirely from `CITIZEN_REPORTS`; every card links back to the project it
 * belongs to. No aggregation is invented — all counters are computed from the
 * seed list at render time.
 */
export function ReportsBoard() {
  const { activeRegionId, summary } = useRegion();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("Semua");

  const reports = useMemo(() => {
    const withProject = CITIZEN_REPORTS.map((report) => ({
      report,
      project: getProject(report.projectId),
    })).filter(
      (entry): entry is { report: (typeof CITIZEN_REPORTS)[number]; project: Project } =>
        Boolean(entry.project),
    );

    const scoped =
      activeRegionId === "all"
        ? withProject
        : withProject.filter((entry) => entry.project.regionId === activeRegionId);

    return scoped.sort(
      (a, b) =>
        new Date(b.report.createdAt).getTime() - new Date(a.report.createdAt).getTime(),
    );
  }, [activeRegionId]);

  const counts: Record<FilterValue, number> = useMemo(
    () => ({
      Semua: reports.length,
      "Sesuai Target": reports.filter((entry) => entry.report.suitability === "Sesuai Target")
        .length,
      Terlambat: reports.filter((entry) => entry.report.suitability === "Terlambat").length,
      "Indikasi Kejanggalan": reports.filter(
        (entry) => entry.report.suitability === "Indikasi Kejanggalan",
      ).length,
    }),
    [reports],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter(({ report, project }) => {
      const matchesFilter = filter === "Semua" || report.suitability === filter;
      if (!matchesFilter) return false;
      if (normalized.length === 0) return true;
      return [report.author, report.comment, project.name, project.location.district]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [reports, filter, query]);

  const totalUpvotes = reports.reduce((sum, entry) => sum + entry.report.upvotes, 0);
  const verifiedCount = reports.filter((entry) => entry.report.verified).length;

  const stats = [
    {
      label: "Laporan terkumpul",
      value: formatNumber(reports.length),
      hint: `${formatNumber(verifiedCount)} terverifikasi lokasi`,
      icon: MessageSquare,
      tone: "bg-pixel-sun text-pixel-line",
    },
    {
      label: "Sesuai target",
      value:
        counts.Semua > 0
          ? formatPercent((counts["Sesuai Target"] / counts.Semua) * 100)
          : "0%",
      hint: `${formatNumber(counts["Sesuai Target"])} laporan warga`,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-900",
    },
    {
      label: "Perlu tindak lanjut",
      value: formatNumber(counts["Indikasi Kejanggalan"] + counts.Terlambat),
      hint: "terlambat atau kejanggalan",
      icon: AlertTriangle,
      tone: "bg-rose-100 text-rose-900",
    },
    {
      label: "Dukungan warga",
      value: formatNumber(totalUpvotes),
      hint: "total tanda membantu",
      icon: ThumbsUp,
      tone: "bg-navy-soft text-navy",
    },
  ];

  const hasFilters = filter !== "Semua" || query.trim().length > 0;
  const reset = () => {
    setFilter("Semua");
    setQuery("");
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-4 border-pixel-line bg-white p-3.5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                {stat.label}
              </p>
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center border-2 border-pixel-line",
                  stat.tone,
                )}
              >
                <stat.icon size={12} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 font-pixel text-[12px] leading-[1.5] text-pixel-line">
              {stat.value}
            </p>
            <p className="mt-1 text-[9.5px] leading-snug text-pixel-ink/70">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
            Papan laporan warga
          </span>
          <h2 className="mt-2 font-pixel text-[16px] uppercase leading-[1.8] text-pixel-line sm:text-[19px]">
            Catatan lapangan dari warga.
          </h2>
          <p className="mt-2.5 font-retro text-[17px] leading-snug text-pixel-ink/85">
            {activeRegionId === "all"
              ? "Gabungan laporan dari tiga wilayah percontohan."
              : `Laporan warga untuk ${summary.name}.`}{" "}
            Setiap laporan adalah bukti pendukung, bukan vonis.
          </p>
        </div>

        <label className="relative block w-full lg:w-[330px]">
          <span className="sr-only">Cari laporan warga</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/70"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, proyek, atau isi laporan…"
            className="h-11 w-full border-2 border-pixel-line bg-white pl-9 pr-9 text-[12px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus kata kunci pencarian"
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border border-pixel-line/40 text-pixel-line hover:bg-pixel-sun"
            >
              <X size={13} aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1 font-pixel text-[7px] uppercase leading-[1.6] shadow-chip transition-transform",
                active
                  ? "bg-pixel-line text-pixel-sun"
                  : "bg-white text-pixel-line hover:bg-pixel-sun",
              )}
            >
              {option.short}
              <span
                className={cn(
                  "border px-1 text-[9px] font-bold",
                  active
                    ? "border-pixel-cream/40 text-pixel-cream"
                    : "border-pixel-line/30 text-pixel-line",
                )}
              >
                {counts[option.value]}
              </span>
            </button>
          );
        })}
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-9 items-center gap-1 border-2 border-transparent px-2 py-1 font-pixel text-[7px] uppercase text-pixel-ink/60 hover:border-pixel-line hover:text-pixel-line"
          >
            <RotateCcw size={10} aria-hidden="true" />
            Reset
          </button>
        ) : null}
        <span className="ml-auto hidden items-center gap-1.5 text-[10px] text-pixel-ink/70 sm:flex">
          <Users size={11} aria-hidden="true" />
          {formatNumber(filtered.length)} dari {formatNumber(reports.length)} laporan
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filtered.map(({ report, project }) => {
            const region = getRegion(project.regionId);
            return (
              <article
                key={report.id}
                className="flex h-full flex-col border-4 border-pixel-line bg-white shadow-card"
              >
                <div className="flex items-start justify-between gap-3 border-b-[3px] border-pixel-line/20 px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-wood-cta font-pixel text-[8px] text-pixel-cream">
                      {report.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-pixel-line">
                        <span className="truncate">{report.author}</span>
                        {report.verified ? (
                          <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-900">
                            <BadgeCheck size={9} aria-hidden="true" />
                            Terverifikasi
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-pixel-ink/65">
                        <CalendarDays size={9} aria-hidden="true" />
                        {formatDateLong(report.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 border-2 border-pixel-line px-1.5 py-0.5 text-[8.5px] font-semibold leading-[1.6]",
                      SUITABILITY_TONE[report.suitability],
                    )}
                  >
                    {report.suitability}
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <Stars rating={report.rating} />
                    <span className="text-[9.5px] text-pixel-ink/70">
                      Kesesuaian dengan RAB: {report.rating}/5
                    </span>
                  </div>

                  <p className="mt-2 flex-1 whitespace-pre-line text-[11.5px] leading-relaxed text-pixel-ink/90">
                    {report.comment}
                  </p>

                  {report.photoUrl ? (
                    <div className="mt-2.5 border-[3px] border-pixel-line bg-pixel-panel p-1">
                      <div className="relative h-[150px] w-full overflow-hidden border-2 border-pixel-line bg-pixel-panel">
                        <Image
                          src={report.photoUrl}
                          alt={`Foto bukti laporan dari ${report.author}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="pixelated object-cover"
                        />
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-line/90 px-1.5 py-0.5 text-[9px] font-semibold text-pixel-cream">
                          <ImageIcon size={9} aria-hidden="true" />
                          Bukti foto warga
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="border-t-[3px] border-pixel-line/20 px-3.5 py-2.5">
                  <p className="flex items-start gap-1.5 text-[10px] font-semibold leading-snug text-pixel-line">
                    <MapPin size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <Link href={`/proyek/${project.id}`} className="hover:text-pixel-wood-cta">
                      {project.name}
                    </Link>
                  </p>
                  <p className="mt-0.5 pl-[18px] text-[9.5px] text-pixel-ink/65">
                    {project.location.district} · {region?.city}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[9.5px] text-pixel-ink/65">
                      <ThumbsUp size={9} aria-hidden="true" />
                      {formatNumber(report.upvotes)} dukungan warga
                    </span>
                    <Link
                      href={`/proyek/${project.id}#validasi`}
                      className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:-translate-y-0.5"
                    >
                      Buka proyek
                      <ArrowRight size={10} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 border-4 border-dashed border-pixel-line/50 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
            <Search size={19} aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            Belum ada laporan yang cocok
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-[11.5px] leading-relaxed text-pixel-ink/75">
            Coba kata kunci lain, pilih kategori berbeda, atau ubah wilayah pantau pada
            pemilih di atas.
          </p>
          <button type="button" onClick={reset} className="btn-secondary mt-4">
            <RotateCcw size={12} aria-hidden="true" />
            Tampilkan semua laporan
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-3 border-4 border-pixel-line bg-pixel-cream-deep p-4 shadow-card sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Lokasi dicocokkan",
            text: "Laporan hanya diterima jika koordinatnya sesuai lokasi proyek.",
          },
          {
            icon: Clock3,
            title: "Waktu tercatat",
            text: "Setiap laporan menyimpan tanggal kirim agar mudah ditelusuri.",
          },
          {
            icon: AlertTriangle,
            title: "Bukan vonis",
            text: "Temuan warga adalah sinyal untuk diperiksa, bukan putusan hukum.",
          },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
              <item.icon size={14} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-pixel-line">{item.title}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-pixel-ink/75">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
