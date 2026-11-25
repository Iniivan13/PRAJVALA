"use client";

import Image from "next/image";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ReportForm } from "@/components/validation/report-form";
import { computeValidationScore, prajvalaApi } from "@/lib/api";
import { getReportsForProject } from "@/lib/data";
import type { CitizenReport, Project, Suitability } from "@/types";
import {
  cn,
  formatDateShort,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

type FilterValue = "Semua" | Suitability;

const FILTERS: { value: FilterValue; label: string; shortLabel: string }[] = [
  { value: "Semua", label: "Semua laporan", shortLabel: "Semua" },
  { value: "Sesuai Target", label: "Sesuai target", shortLabel: "Sesuai" },
  { value: "Terlambat", label: "Terlambat", shortLabel: "Terlambat" },
  { value: "Indikasi Kejanggalan", label: "Indikasi kejanggalan", shortLabel: "Kejanggalan" },
];

function ReportStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={11}
          className={star <= rating ? "text-amber-500" : "text-ink-200"}
          fill={star <= rating ? "#F59E0B" : "transparent"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ValidationSection({ project }: { project: Project }) {
  const { user } = useAuth();
  const seedReports = useMemo(() => getReportsForProject(project.id), [project.id]);
  const [userReports, setUserReports] = useState<CitizenReport[]>([]);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [serverVoted, setServerVoted] = useState<Set<string>>(new Set());
  const [serverVotes, setServerVotes] = useState<Record<string, number>>({});
  const [pendingUpvotes, setPendingUpvotes] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterValue>("Semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    prajvalaApi
      .getReports(project.id)
      .then(async (stored) => {
        if (cancelled) return;
        const mapped = stored.map((item) => prajvalaApi.toFeedItem(item, user?.id));
        setUserReports(mapped);

        const localIds = new Set<string>();
        [...mapped, ...seedReports].forEach((report) => {
          const usesLocalVote =
            report.source !== "supabase" || user?.source !== "supabase";
          if (usesLocalVote && prajvalaApi.readUpvoted(report.id)) {
            localIds.add(report.id);
          }
        });
        setUpvoted(localIds);

        const remoteIds = mapped
          .filter((report) => report.source === "supabase")
          .map((report) => report.id);

        if (remoteIds.length > 0) {
          const summary = await prajvalaApi.getVoteSummary(remoteIds);
          if (cancelled) return;
          setServerVotes(summary.counts);
          setServerVoted(new Set(summary.voted));
        } else {
          setServerVotes({});
          setServerVoted(new Set());
        }

        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project.id, seedReports, user?.id]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(false), 9000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const allReports = useMemo(
    () =>
      [...userReports, ...seedReports].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [userReports, seedReports],
  );

  const score = computeValidationScore(project.validationScore, allReports);
  const delta = score - project.validationScore;

  const distribution = useMemo(() => {
    const base = { ...project.distribution };
    userReports.forEach((report) => {
      if (report.suitability === "Sesuai Target") base.sesuai += 1;
      if (report.suitability === "Terlambat") base.terlambat += 1;
      if (report.suitability === "Indikasi Kejanggalan") base.kejanggalan += 1;
    });
    const total = base.sesuai + base.terlambat + base.kejanggalan;
    return {
      ...base,
      total,
      sesuaiPct: total > 0 ? (base.sesuai / total) * 100 : 0,
      terlambatPct: total > 0 ? (base.terlambat / total) * 100 : 0,
      kejanggalanPct: total > 0 ? (base.kejanggalan / total) * 100 : 0,
    };
  }, [project.distribution, userReports]);

  const filteredReports =
    filter === "Semua"
      ? allReports
      : allReports.filter((report) => report.suitability === filter);

  const counts: Record<FilterValue, number> = {
    Semua: allReports.length,
    "Sesuai Target": allReports.filter((report) => report.suitability === "Sesuai Target")
      .length,
    Terlambat: allReports.filter((report) => report.suitability === "Terlambat").length,
    "Indikasi Kejanggalan": allReports.filter(
      (report) => report.suitability === "Indikasi Kejanggalan",
    ).length,
  };

  const scoreTone =
    score >= 85
      ? {
          color: "#34D399",
          label: "Sangat baik",
          text: "text-emerald-400",
          chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
        }
      : score >= 70
        ? {
            color: "#FBBF24",
            label: "Cukup baik",
            text: "text-amber-400",
            chip: "bg-amber-400/10 text-amber-300 border-amber-400/20",
          }
        : {
            color: "#FB7185",
            label: "Perlu perhatian",
            text: "text-rose-400",
            chip: "bg-rose-400/10 text-rose-300 border-rose-400/20",
          };

  const handleUpvote = async (report: CitizenReport) => {
    if (pendingUpvotes.has(report.id)) return;
    const isRemote = report.source === "supabase";
    const usesServerVote = isRemote && user?.source === "supabase";

    if (usesServerVote) {
      const wasUpvoted = serverVoted.has(report.id);
      const currentCount = serverVotes[report.id] ?? report.upvotes;
      setServerVoted((previous) => {
        const next = new Set(previous);
        if (wasUpvoted) next.delete(report.id);
        else next.add(report.id);
        return next;
      });
      setServerVotes((previous) => ({
        ...previous,
        [report.id]: Math.max(0, currentCount + (wasUpvoted ? -1 : 1)),
      }));
      setPendingUpvotes((previous) => new Set(previous).add(report.id));

      try {
        const active = await prajvalaApi.toggleUpvote(report.id, true);
        setServerVoted((previous) => {
          const next = new Set(previous);
          if (active) next.add(report.id);
          else next.delete(report.id);
          return next;
        });
        setServerVotes((previous) => {
          const base = Math.max(0, currentCount - (wasUpvoted ? 1 : 0));
          return { ...previous, [report.id]: Math.max(0, base + (active ? 1 : 0)) };
        });
      } catch {
        setServerVoted((previous) => {
          const next = new Set(previous);
          if (wasUpvoted) next.add(report.id);
          else next.delete(report.id);
          return next;
        });
        setServerVotes((previous) => ({ ...previous, [report.id]: currentCount }));
      } finally {
        setPendingUpvotes((previous) => {
          const next = new Set(previous);
          next.delete(report.id);
          return next;
        });
      }
      return;
    }

    const wasUpvoted = upvoted.has(report.id);
    setUpvoted((previous) => {
      const next = new Set(previous);
      if (wasUpvoted) next.delete(report.id);
      else next.add(report.id);
      return next;
    });
    setPendingUpvotes((previous) => new Set(previous).add(report.id));

    try {
      const active = await prajvalaApi.toggleUpvote(report.id);
      setUpvoted((previous) => {
        const next = new Set(previous);
        if (active) next.add(report.id);
        else next.delete(report.id);
        return next;
      });
    } catch {
      setUpvoted((previous) => {
        const next = new Set(previous);
        if (wasUpvoted) next.add(report.id);
        else next.delete(report.id);
        return next;
      });
    } finally {
      setPendingUpvotes((previous) => {
        const next = new Set(previous);
        next.delete(report.id);
        return next;
      });
    }
  };

  const handleSubmitted = (report: CitizenReport) => {
    setUserReports((previous) => [report, ...previous]);
    setIsFormOpen(false);
    setSuccess(true);
    setFilter("Semua");
  };

  const handleDelete = async (report: CitizenReport) => {
    setDeletingId(report.id);
    try {
      await prajvalaApi.deleteReport(report.id, report.source === "supabase");
      setUserReports((previous) => previous.filter((item) => item.id !== report.id));
      setUpvoted((previous) => {
        const next = new Set(previous);
        next.delete(report.id);
        return next;
      });
      setServerVoted((previous) => {
        const next = new Set(previous);
        next.delete(report.id);
        return next;
      });
      setServerVotes((previous) => {
        const next = { ...previous };
        delete next[report.id];
        return next;
      });
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="validasi" className="scroll-mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">
            <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
            Validasi partisipatif warga
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
            Apa kata warga di lapangan?
          </h2>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-ink-500">
            Laporan warga adalah bukti pendukung, bukan vonis. Setiap laporan dapat
            didukung, dikoreksi, dan ditindaklanjuti bersama.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="btn-amber h-11 shrink-0 px-4 py-0 text-[12px]"
        >
          <Camera size={15} aria-hidden="true" />
          Kirim laporan lapangan
        </button>
      </div>

      {success ? (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 size={14} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11.5px] font-bold text-emerald-900">
                Laporan berhasil dikirim
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-emerald-700">
                Terima kasih. Laporan Anda masuk ke feed dan skor validasi warga telah
                diperbarui{delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta} poin)` : ""}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="shrink-0 rounded-md p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-2xl bg-ink-900 p-5 text-white shadow-soft">
          <div className="surface-grid-dark absolute inset-0 opacity-40" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-[55px]"
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div
              className="relative grid h-[124px] w-[124px] shrink-0 place-items-center rounded-full transition-all duration-700"
              style={{
                background: `conic-gradient(${scoreTone.color} 0 ${score}%, rgba(255,255,255,0.08) ${score}% 100%)`,
              }}
              role="img"
              aria-label={`Skor validasi warga ${score} dari 100, ${scoreTone.label}`}
            >
              <div className="grid h-[102px] w-[102px] place-items-center rounded-full bg-ink-900">
                <div className="text-center">
                  <p className="font-display text-[30px] font-extrabold leading-none text-white">
                    {score}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-500">
                    dari 100
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                <ShieldCheck size={11} aria-hidden="true" />
                Skor validasi warga
              </p>
              <p className={cn("mt-1 font-display text-xl font-extrabold", scoreTone.text)}>
                {scoreTone.label}
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold",
                  scoreTone.chip,
                )}
              >
                {userReports.length === 0
                  ? "• Dihitung dari laporan warga terverifikasi"
                  : delta === 0
                    ? "• Skor tetap stabil setelah laporan Anda"
                    : `${delta > 0 ? "↑" : "↓"} ${delta > 0 ? `+${delta}` : delta} poin dari laporan Anda`}
              </span>
              <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
                {formatNumber(distribution.total)} laporan warga ·{" "}
                {formatNumber(distribution.sesuai)} sesuai target
              </p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-ink-500">
                <Users size={10} aria-hidden="true" />
                Skor diperbarui otomatis setiap laporan baru
              </p>
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-[14px] font-bold text-ink-900">
              Sebaran penilaian warga
            </h3>
            <span className="text-[9px] font-medium text-ink-400">
              {formatNumber(distribution.total)} laporan
            </span>
          </div>
          <div className="mt-4 space-y-3.5">
            {[
              {
                label: "Sesuai target",
                count: distribution.sesuai,
                pct: distribution.sesuaiPct,
                color: "#10B981",
                track: "#D1FAE5",
              },
              {
                label: "Terlambat",
                count: distribution.terlambat,
                pct: distribution.terlambatPct,
                color: "#F59E0B",
                track: "#FEF3C7",
              },
              {
                label: "Indikasi kejanggalan",
                count: distribution.kejanggalan,
                pct: distribution.kejanggalanPct,
                color: "#EF4444",
                track: "#FFE4E6",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="flex items-center gap-1.5 font-medium text-ink-600">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    {row.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[9.5px] text-ink-400">
                      {formatNumber(row.count)}
                    </span>
                    <span className="w-10 text-right font-mono font-semibold tabular text-ink-800">
                      {formatPercent(row.pct)}
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: row.track }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${row.pct}%`,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3.5 border-t border-ink-100 pt-2.5 text-[9px] leading-relaxed text-ink-400">
            Persentase dihitung dari seluruh laporan terverifikasi, termasuk laporan
            yang tidak ditampilkan di feed terbaru.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition-colors",
                  active
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                )}
              >
                {option.shortLabel}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[8.5px]",
                    active ? "bg-white/15 text-white" : "bg-ink-100 text-ink-500",
                  )}
                >
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
        </div>
        <p className="flex items-center gap-1.5 text-[9.5px] text-ink-400">
          {loading ? (
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
          ) : (
            <MessageSquare size={11} aria-hidden="true" />
          )}
          Menampilkan {filteredReports.length} laporan terbaru dari{" "}
          {formatNumber(distribution.total)} laporan
        </p>
      </div>

      <div className="mt-4 space-y-3.5">
        {filteredReports.map((report) => {
          const isRemote = report.source === "supabase";
          const usesServerVote = isRemote && user?.source === "supabase";
          const isUpvoted = usesServerVote
            ? serverVoted.has(report.id)
            : upvoted.has(report.id);
          const upvoteCount = usesServerVote
            ? (serverVotes[report.id] ?? report.upvotes)
            : (isRemote ? (serverVotes[report.id] ?? report.upvotes) : report.upvotes) +
              (isUpvoted ? 1 : 0);
          const isPending = pendingUpvotes.has(report.id);

          return (
            <article
              key={report.id}
              className={cn(
                "card-base overflow-hidden p-4 sm:p-5",
                report.isUserSubmitted && "border-amber-300/80 ring-1 ring-amber-500/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy to-ink-800 text-[10px] font-bold text-white">
                    {report.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-ink-900">
                      <span className="truncate">{report.author}</span>
                      {report.verified ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700">
                          <BadgeCheck size={9} aria-hidden="true" />
                          Terverifikasi
                        </span>
                      ) : null}
                      {report.isUserSubmitted ? (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-800">
                          Laporan Anda
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[9px] text-ink-400">
                      {formatDateShort(report.createdAt)} ·{" "}
                      {report.source === "supabase" ? "Tersinkron Supabase" : "Pelapor warga"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[8.5px] font-semibold",
                    report.suitability === "Sesuai Target" &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700",
                    report.suitability === "Terlambat" &&
                      "border-amber-200 bg-amber-50 text-amber-700",
                    report.suitability === "Indikasi Kejanggalan" &&
                      "border-rose-200 bg-rose-50 text-rose-700",
                  )}
                >
                  {report.suitability}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <ReportStars rating={report.rating} />
                <span className="text-[9px] text-ink-400">
                  Kesesuaian dengan RAB: {report.rating}/5
                </span>
              </div>

              <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-ink-700">
                {report.comment}
              </p>

              {report.photoUrl ? (
                <div className="relative mt-3 h-[190px] w-full overflow-hidden rounded-xl border border-ink-200 bg-ink-100 sm:h-[230px]">
                  <Image
                    src={report.photoUrl}
                    alt={`Foto bukti laporan dari ${report.author}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    className="object-cover"
                    unoptimized={report.photoUrl.startsWith("data:")}
                  />
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-ink-950/60 px-2 py-0.5 text-[8px] font-semibold text-white backdrop-blur">
                    <ImageIcon size={9} aria-hidden="true" />
                    Bukti foto warga
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-ink-950/60 px-2 py-0.5 text-[8px] font-medium text-white/90 backdrop-blur">
                    <ShieldCheck size={9} className="text-emerald-400" aria-hidden="true" />
                    Metadata dibersihkan
                  </span>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpvote(report)}
                    disabled={isPending}
                    aria-pressed={isUpvoted}
                    aria-label={`Tandai laporan ini membantu. Saat ini ${upvoteCount} dukungan`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-semibold transition-colors disabled:opacity-60",
                      isUpvoted
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-ink-200 bg-white text-ink-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",
                    )}
                  >
                    <ThumbsUp
                      size={11}
                      className={isUpvoted ? "fill-amber-500 text-amber-600" : ""}
                      aria-hidden="true"
                    />
                    Membantu · {formatNumber(upvoteCount)}
                  </button>
                  {report.isUserSubmitted ? (
                    deleteTarget === report.id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-700">
                        Hapus laporan?
                        <button
                          type="button"
                          onClick={() => handleDelete(report)}
                          disabled={deletingId === report.id}
                          className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[8.5px] font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                        >
                          {deletingId === report.id ? "Menghapus…" : "Ya, hapus"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(null)}
                          className="text-[8.5px] font-semibold text-rose-700/70 underline underline-offset-2 hover:text-rose-900"
                        >
                          Batal
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(report.id)}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Hapus laporan Anda tentang ${project.name}`}
                      >
                        <Trash2 size={10} aria-hidden="true" />
                        Hapus
                      </button>
                    )
                  ) : null}
                  <span className="hidden items-center gap-1 text-[8.5px] text-ink-400 sm:inline-flex">
                    <MapPin size={9} aria-hidden="true" />
                    Lokasi sesuai proyek
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[8.5px] text-ink-400">
                  <ShieldCheck size={9} className="text-emerald-500" aria-hidden="true" />
                  Diverifikasi kecocokan lokasi
                </span>
              </div>
            </article>
          );
        })}

        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-5 py-10 text-center">
            <p className="text-[12px] font-semibold text-ink-700">
              Belum ada laporan dengan kategori ini
            </p>
            <button
              type="button"
              onClick={() => setFilter("Semua")}
              className="mt-2 text-[10.5px] font-semibold text-amber-700 underline underline-offset-4"
            >
              Tampilkan semua laporan
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-ink-400">
        <AlertTriangle size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
        Laporan warga tidak menggantikan audit resmi. Status “Perlu Audit” adalah
        penanda untuk ditindaklanjuti, bukan pernyataan bersalah.
      </p>

      {isFormOpen ? (
        <ReportForm
          project={project}
          onClose={() => setIsFormOpen(false)}
          onSubmitted={handleSubmitted}
        />
      ) : null}
    </section>
  );
}
