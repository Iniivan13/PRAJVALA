"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PhotoLightbox } from "@/components/admin/photo-lightbox";
import { getProject } from "@/lib/data";
import type { CitizenReport, ModerationStatus } from "@/types";
import { cn, formatDateLong, formatNumber } from "@/lib/utils";

type FilterValue = "all" | ModerationStatus | "photo";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "verified", label: "Terverifikasi" },
  { value: "flagged", label: "Ditandai" },
  { value: "photo", label: "Berfoto" },
];

const STATUS_STYLE: Record<ModerationStatus, { label: string; chip: string; icon: typeof CheckCircle2 }> = {
  pending: {
    label: "Menunggu tinjauan",
    chip: "bg-amber-50 text-amber-900",
    icon: Clock3,
  },
  verified: {
    label: "Terverifikasi",
    chip: "bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
  flagged: {
    label: "Ditandai",
    chip: "bg-rose-50 text-rose-900",
    icon: AlertTriangle,
  },
};

function statusOf(report: CitizenReport): ModerationStatus {
  return report.moderationStatus ?? (report.verified ? "verified" : "pending");
}

interface ModerationBoardProps {
  reports: CitizenReport[];
  busyId: string | null;
  error: string;
  onDismissError: () => void;
  onModerate: (report: CitizenReport, status: ModerationStatus) => Promise<void>;
  onDelete: (report: CitizenReport) => Promise<void>;
}

export function ModerationBoard({
  reports,
  busyId,
  error,
  onDismissError,
  onModerate,
  onDelete,
}: ModerationBoardProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<CitizenReport | null>(null);

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: reports.length,
      pending: 0,
      verified: 0,
      flagged: 0,
      photo: 0,
    };
    reports.forEach((report) => {
      base[statusOf(report)] += 1;
      if (report.photoUrl) base.photo += 1;
    });
    return base;
  }, [reports]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (filter === "photo") {
        if (!report.photoUrl) return false;
      } else if (filter !== "all" && statusOf(report) !== filter) {
        return false;
      }
      if (normalized.length === 0) return true;
      const project = getProject(report.projectId);
      return [report.author, report.comment, project?.name ?? "", project?.location.district ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [reports, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-4 border-pixel-line bg-white p-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            Antrean moderasi
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
            {formatNumber(reports.length)} laporan tersinkron Firebase. Tinjau bukti, lalu
            verifikasi atau tandai.
          </p>
        </div>
        <label className="relative block w-full sm:w-[300px]">
          <span className="sr-only">Cari laporan</span>
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/60"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari pelapor, proyek, isi…"
            className="h-10 w-full border-2 border-pixel-line bg-pixel-cream pl-9 pr-8 text-[11.5px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border border-pixel-line/40 text-pixel-line hover:bg-pixel-sun"
            >
              <X size={12} aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3 flex items-start justify-between gap-3 border-4 border-pixel-line bg-rose-50 px-3 py-2.5"
        >
          <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-rose-900">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Tutup pesan kesalahan"
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1 font-pixel text-[7px] uppercase leading-[1.6] shadow-chip",
                active
                  ? "bg-pixel-line text-pixel-sun"
                  : "bg-white text-pixel-line hover:bg-pixel-sun",
              )}
            >
              {option.label}
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
        {query || filter !== "all" ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="inline-flex min-h-9 items-center gap-1 border-2 border-transparent px-2 py-1 font-pixel text-[7px] uppercase text-pixel-ink/60 hover:border-pixel-line hover:text-pixel-line"
          >
            <RotateCcw size={10} aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((report) => {
          const project = getProject(report.projectId);
          const status = statusOf(report);
          const style = STATUS_STYLE[status];
          const StatusIcon = style.icon;
          const busy = busyId === report.id;

          return (
            <article key={report.id} className="border-4 border-pixel-line bg-white shadow-card">
              <div className="flex flex-col gap-3 p-3.5 sm:flex-row">
                {report.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setLightbox(report)}
                    className="group relative h-[104px] w-full shrink-0 overflow-hidden border-[3px] border-pixel-line bg-pixel-panel sm:h-[92px] sm:w-[132px]"
                    aria-label={`Buka foto bukti dari ${report.author}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.photoUrl}
                      alt={`Foto bukti laporan ${report.author}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-pixel-line/0 text-transparent transition-colors group-hover:bg-pixel-line/45 group-hover:text-pixel-cream">
                      <ImageIcon size={18} aria-hidden="true" />
                    </span>
                  </button>
                ) : (
                  <div className="flex h-[72px] w-full shrink-0 items-center justify-center border-[3px] border-dashed border-pixel-line/40 bg-pixel-panel text-pixel-line/40 sm:h-[92px] sm:w-[132px]">
                    <ImageIcon size={18} aria-hidden="true" />
                    <span className="sr-only">Tanpa foto</span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-pixel-line">
                        {report.author}
                        {report.official ? (
                          <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-pixel-line px-1 py-0.5 text-[8.5px] font-semibold text-pixel-sun">
                            <ShieldCheck size={8} aria-hidden="true" />
                            Bukti resmi
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-pixel-ink/65">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={9} aria-hidden="true" />
                          {project ? project.name : "Proyek tidak dikenal"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={9} aria-hidden="true" />
                          {formatDateLong(report.createdAt)}
                        </span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 border-2 border-pixel-line px-1.5 py-0.5 text-[9px] font-semibold",
                        style.chip,
                      )}
                    >
                      <StatusIcon size={9} aria-hidden="true" />
                      {style.label}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-pixel-ink/85">
                    {report.comment}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-pixel-ink/65">
                    <span className="inline-flex items-center gap-1">
                      <Star size={9} className="text-amber-600" aria-hidden="true" />
                      {report.rating}/5 sesuai RAB
                    </span>
                    <span>{report.suitability}</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={9} aria-hidden="true" />
                      {formatNumber(report.upvotes)} dukungan
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t-2 border-pixel-line/15 pt-2.5">
                    <button
                      type="button"
                      onClick={() => onModerate(report, "verified")}
                      disabled={busy || status === "verified"}
                      className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-emerald-50 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-900 shadow-chip hover:bg-emerald-100 disabled:opacity-45"
                    >
                      <CheckCircle2 size={10} aria-hidden="true" />
                      Verifikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => onModerate(report, "flagged")}
                      disabled={busy || status === "flagged"}
                      className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-rose-50 px-2 py-0.5 text-[9.5px] font-semibold text-rose-900 shadow-chip hover:bg-rose-100 disabled:opacity-45"
                    >
                      <AlertTriangle size={10} aria-hidden="true" />
                      Tandai
                    </button>
                    <button
                      type="button"
                      onClick={() => onModerate(report, "pending")}
                      disabled={busy || status === "pending"}
                      className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 py-0.5 text-[9.5px] font-semibold text-pixel-line shadow-chip hover:bg-pixel-sun disabled:opacity-45"
                    >
                      <Clock3 size={10} aria-hidden="true" />
                      Pending
                    </button>

                    {confirmDelete === report.id ? (
                      <span className="inline-flex items-center gap-1.5 border-2 border-rose-700 bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-rose-900">
                        Hapus permanen?
                        <button
                          type="button"
                          onClick={() => onDelete(report)}
                          disabled={busy}
                          className="border border-pixel-line bg-rose-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-800 disabled:opacity-60"
                        >
                          {busy ? "Menghapus…" : "Ya, hapus"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="text-[9px] font-semibold underline underline-offset-2 hover:text-rose-950"
                        >
                          Batal
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(report.id)}
                        disabled={busy}
                        className="inline-flex min-h-8 items-center gap-1 border-2 border-transparent px-2 py-0.5 text-[9.5px] font-semibold text-pixel-ink/60 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      >
                        <Trash2 size={10} aria-hidden="true" />
                        Hapus
                      </button>
                    )}

                    {busy ? (
                      <Loader2 size={12} className="animate-spin text-pixel-line" aria-hidden="true" />
                    ) : null}

                    {project ? (
                      <Link
                        href={`/proyek/${project.id}#validasi`}
                        className="ml-auto inline-flex min-h-8 items-center gap-1 font-pixel text-[6.5px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                      >
                        Buka proyek
                        <ArrowUpRight size={10} aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="border-4 border-dashed border-pixel-line/45 bg-white px-5 py-12 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
              <BadgeCheck size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
              {reports.length === 0
                ? "Belum ada laporan masuk"
                : "Tidak ada laporan yang cocok"}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[10.5px] leading-relaxed text-pixel-ink/70">
              {reports.length === 0
                ? "Laporan warga dari halaman proyek akan muncul di sini untuk ditinjau."
                : "Ubah kata kunci atau pilih status lain untuk melihat laporan."}
            </p>
          </div>
        ) : null}
      </div>

      {lightbox ? (
        <PhotoLightbox
          src={lightbox.photoUrl ?? ""}
          alt={`Foto bukti laporan ${lightbox.author}`}
          caption={`${lightbox.author} · ${lightbox.suitability} · ${formatDateLong(lightbox.createdAt)}`}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
