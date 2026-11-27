"use client";

import Image from "next/image";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
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
import { logAdminAction } from "@/lib/admin";
import { getReportsForProject } from "@/lib/data";
import type { CitizenReport, ModerationStatus, Project, Suitability } from "@/types";
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
          className={star <= rating ? "text-amber-600" : "text-pixel-line/25"}
          fill={star <= rating ? "#F59E0B" : "transparent"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ValidationSection({ project }: { project: Project }) {
  const { user, isAdmin } = useAuth();
  const seedReports = useMemo(() => getReportsForProject(project.id), [project.id]);
  const [userReports, setUserReports] = useState<CitizenReport[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [pendingUpvotes, setPendingUpvotes] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState("");
  const [filter, setFilter] = useState<FilterValue>("Semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    prajvalaApi
      .getReports(project.id)
      .then(async (stored) => {
        if (cancelled) return;
        const mapped = stored.map((item) => prajvalaApi.toFeedItem(item, user?.id));
        setUserReports(mapped);

        const allIds = [...mapped, ...seedReports].map((report) => report.id);

        if (allIds.length > 0) {
          const summary = await prajvalaApi.getVoteSummary(allIds);
          if (cancelled) return;
          setVoteCounts(summary.counts);
          setVoted(new Set(summary.voted));
        } else {
          setVoteCounts({});
          setVoted(new Set());
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
          color: "#10B981",
          label: "Sangat baik",
          text: "text-emerald-800",
          chip: "bg-emerald-100 text-emerald-900",
        }
      : score >= 70
        ? {
            color: "#FBBF24",
            label: "Cukup baik",
            text: "text-amber-800",
            chip: "bg-amber-100 text-amber-900",
          }
        : {
            color: "#EF4444",
            label: "Perlu perhatian",
            text: "text-rose-800",
            chip: "bg-rose-100 text-rose-900",
          };

  const handleUpvote = async (report: CitizenReport) => {
    if (pendingUpvotes.has(report.id)) return;

    if (!user) {
      setVoteError("Masuk ke akun Anda terlebih dahulu untuk mendukung laporan.");
      return;
    }

    setVoteError("");
    const wasVoted = voted.has(report.id);
    const currentCount = voteCounts[report.id] ?? report.upvotes;

    setVoted((previous) => {
      const next = new Set(previous);
      if (wasVoted) next.delete(report.id);
      else next.add(report.id);
      return next;
    });
    setVoteCounts((previous) => ({
      ...previous,
      [report.id]: Math.max(0, currentCount + (wasVoted ? -1 : 1)),
    }));
    setPendingUpvotes((previous) => new Set(previous).add(report.id));

    try {
      const active = await prajvalaApi.toggleUpvote(report.id);
      setVoted((previous) => {
        const next = new Set(previous);
        if (active) next.add(report.id);
        else next.delete(report.id);
        return next;
      });
      setVoteCounts((previous) => {
        const base = Math.max(0, currentCount - (wasVoted ? 1 : 0));
        return { ...previous, [report.id]: Math.max(0, base + (active ? 1 : 0)) };
      });
    } catch (error) {
      setVoted((previous) => {
        const next = new Set(previous);
        if (wasVoted) next.add(report.id);
        else next.delete(report.id);
        return next;
      });
      setVoteCounts((previous) => ({ ...previous, [report.id]: currentCount }));
      setVoteError(
        error instanceof Error ? error.message : "Dukungan belum dapat disimpan.",
      );
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
      await prajvalaApi.deleteReport(report.id);
      setUserReports((previous) => previous.filter((item) => item.id !== report.id));
      setVoted((previous) => {
        const next = new Set(previous);
        next.delete(report.id);
        return next;
      });
      setVoteCounts((previous) => {
        const next = { ...previous };
        delete next[report.id];
        return next;
      });
      if (isAdmin && user) {
        await logAdminAction({
          action: "delete",
          targetId: report.id,
          projectId: project.id,
          detail: `Laporan ${report.author} dihapus dari halaman proyek.`,
          actorId: user.id,
          actorName: user.name,
        }).catch(() => undefined);
      }
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleModerate = async (report: CitizenReport, status: ModerationStatus) => {
    if (!user) return;
    setModeratingId(report.id);
    setModerationError("");
    try {
      await prajvalaApi.moderateReport(report.id, status);
      setUserReports((previous) =>
        previous.map((item) =>
          item.id === report.id
            ? {
                ...item,
                verified: status === "verified",
                moderationStatus: status,
                moderatedBy: user.id,
                moderatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      await logAdminAction({
        action: "moderate",
        targetId: report.id,
        projectId: project.id,
        detail:
          status === "verified"
            ? "Laporan diverifikasi."
            : status === "flagged"
              ? "Laporan ditandai untuk ditinjau."
              : "Verifikasi dibatalkan.",
        actorId: user.id,
        actorName: user.name,
      }).catch(() => undefined);
    } catch (error) {
      setModerationError(
        error instanceof Error ? error.message : "Tinjauan belum dapat disimpan.",
      );
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <section id="validasi" className="scroll-mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
            Validasi partisipatif warga
          </span>
          <h2 className="mt-2 font-pixel text-[15px] uppercase leading-[1.8] text-pixel-line sm:text-[18px]">
            Apa kata warga di lapangan?
          </h2>
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-pixel-ink/80">
            Laporan warga adalah bukti pendukung, bukan vonis. Setiap laporan dapat
            didukung, dikoreksi, dan ditindaklanjuti bersama.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="btn-amber shrink-0"
        >
          <Camera size={14} aria-hidden="true" />
          Kirim laporan lapangan
        </button>
      </div>

      {voteError ? (
        <div
          role="alert"
          className="mt-4 flex items-start justify-between gap-3 border-4 border-pixel-line bg-amber-50 px-3.5 py-2.5 shadow-card"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="text-[10.5px] leading-relaxed text-amber-900">{voteError}</p>
          </div>
          <button
            type="button"
            onClick={() => setVoteError("")}
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
            aria-label="Tutup peringatan"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}

      {moderationError ? (
        <div
          role="alert"
          className="mt-4 flex items-start justify-between gap-3 border-4 border-pixel-line bg-rose-50 px-3.5 py-2.5 shadow-card"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
            <p className="text-[10.5px] leading-relaxed text-rose-900">{moderationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setModerationError("")}
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
            aria-label="Tutup pesan tinjauan"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 border-4 border-pixel-line bg-emerald-50 px-3.5 py-2.5 shadow-card animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-2 border-pixel-line bg-emerald-600 text-white">
              <CheckCircle2 size={13} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11.5px] font-bold text-emerald-900">
                Laporan berhasil dikirim
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-emerald-800">
                Terima kasih. Laporan Anda masuk antrean tinjauan pengelola. Skor
                validasi diperbarui setelah laporan diverifikasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
            aria-label="Tutup notifikasi"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ---- Score board ---- */}
        <div className="border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel">
          <div className="border-[3px] border-pixel-line bg-pixel-cream p-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="shrink-0 border-[3px] border-pixel-line bg-white p-2 text-center shadow-chip">
                <p className="font-pixel text-[26px] leading-none text-pixel-line">{score}</p>
                <p className="mt-1.5 font-pixel text-[6px] uppercase leading-[1.6] text-ink-600">
                  dari 100
                </p>
              </div>

              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-ink-600">
                  <ShieldCheck size={11} aria-hidden="true" />
                  Skor validasi warga
                </p>
                <p className={cn("mt-1.5 font-pixel text-[13px] uppercase leading-[1.7]", scoreTone.text)}>
                  {scoreTone.label}
                </p>
                <div
                  className="mt-2 flex gap-[3px]"
                  role="img"
                  aria-label={`Skor validasi warga ${score} dari 100, ${scoreTone.label}`}
                >
                  {Array.from({ length: 10 }).map((_, index) => (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={
                        index < Math.round(score / 10)
                          ? "h-3 flex-1 border border-pixel-line"
                          : "h-3 flex-1 border border-pixel-line bg-pixel-panel"
                      }
                      style={
                        index < Math.round(score / 10)
                          ? { backgroundColor: scoreTone.color }
                          : undefined
                      }
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 border-2 border-pixel-line px-1.5 py-0.5 text-[9.5px] font-semibold",
                    scoreTone.chip,
                  )}
                >
                  {userReports.length === 0
                    ? "Dihitung dari laporan terverifikasi"
                    : delta === 0
                      ? "Skor stabil setelah laporan Anda"
                      : `${delta > 0 ? "↑" : "↓"} ${delta > 0 ? `+${delta}` : delta} poin dari laporan Anda`}
                </span>
                <p className="mt-2 text-[10px] leading-relaxed text-pixel-ink/80">
                  {formatNumber(distribution.total)} laporan warga ·{" "}
                  {formatNumber(distribution.sesuai)} sesuai target
                </p>
                <p className="mt-1 flex items-center gap-1 text-[9.5px] text-pixel-ink/70">
                  <Users size={10} aria-hidden="true" />
                  Skor diperbarui otomatis setiap laporan baru
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Distribution board ---- */}
        <div className="border-4 border-pixel-line bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b-[3px] border-pixel-line/20 pb-2">
            <h3 className="font-pixel text-[8.5px] uppercase leading-[1.8] text-pixel-line">
              Sebaran penilaian warga
            </h3>
            <span className="text-[9.5px] font-medium text-pixel-ink/70">
              {formatNumber(distribution.total)} laporan
            </span>
          </div>
          <div className="mt-3.5 space-y-3.5">
            {[
              {
                label: "Sesuai target",
                count: distribution.sesuai,
                pct: distribution.sesuaiPct,
                color: "#10B981",
              },
              {
                label: "Terlambat",
                count: distribution.terlambat,
                pct: distribution.terlambatPct,
                color: "#F59E0B",
              },
              {
                label: "Indikasi kejanggalan",
                count: distribution.kejanggalan,
                pct: distribution.kejanggalanPct,
                color: "#EF4444",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="flex items-center gap-1.5 font-medium text-pixel-ink/85">
                    <span
                      className="h-2 w-2 border border-pixel-line"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    {row.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[9.5px] text-pixel-ink/60">
                      {formatNumber(row.count)}
                    </span>
                    <span className="w-10 text-right font-mono font-bold tabular text-pixel-line">
                      {formatPercent(row.pct)}
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden border-2 border-pixel-line bg-pixel-panel">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${row.pct}%`,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3.5 border-t-2 border-pixel-line/20 pt-2.5 text-[9.5px] leading-relaxed text-pixel-ink/70">
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
                  "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1.5 font-pixel text-[7px] uppercase leading-[1.6] shadow-chip",
                  active
                    ? "bg-pixel-line text-pixel-sun"
                    : "bg-white text-pixel-line hover:bg-pixel-sun",
                )}
              >
                {option.shortLabel}
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
        </div>
        <p className="flex items-center gap-1.5 text-[9.5px] text-pixel-ink/70">
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
          const isUpvoted = voted.has(report.id);
          const upvoteCount = voteCounts[report.id] ?? report.upvotes;
          const isPending = pendingUpvotes.has(report.id);

          return (
            <article
              key={report.id}
              className={cn(
                "overflow-hidden border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5",
                report.isUserSubmitted && "border-amber-700",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-wood-cta font-pixel text-[8px] text-pixel-cream">
                    {report.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-pixel-line">
                      <span className="truncate">{report.author}</span>
                      {report.official ? (
                        <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-pixel-line px-1 py-0.5 text-[9px] font-semibold text-pixel-sun">
                          <ShieldCheck size={9} aria-hidden="true" />
                          Bukti resmi
                        </span>
                      ) : report.moderationStatus === "pending" ? (
                        <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-900">
                          <Clock3 size={9} aria-hidden="true" />
                          Menunggu tinjauan
                        </span>
                      ) : report.moderationStatus === "flagged" ? (
                        <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-rose-50 px-1 py-0.5 text-[9px] font-semibold text-rose-900">
                          <AlertTriangle size={9} aria-hidden="true" />
                          Ditandai
                        </span>
                      ) : report.verified ? (
                        <span className="inline-flex items-center gap-0.5 border border-pixel-line bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-900">
                          <BadgeCheck size={9} aria-hidden="true" />
                          Terverifikasi
                        </span>
                      ) : null}
                      {report.isUserSubmitted ? (
                        <span className="border border-pixel-line bg-pixel-sun px-1 py-0.5 text-[9px] font-bold text-pixel-line">
                          Laporan Anda
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-pixel-ink/65">
                      {formatDateShort(report.createdAt)} ·{" "}
                      {report.source === "firebase" ? "Tersinkron Firebase" : "Laporan warga"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 border-2 border-pixel-line px-1.5 py-0.5 text-[9px] font-semibold",
                    report.suitability === "Sesuai Target" &&
                      "bg-emerald-50 text-emerald-900",
                    report.suitability === "Terlambat" &&
                      "bg-amber-50 text-amber-900",
                    report.suitability === "Indikasi Kejanggalan" &&
                      "bg-rose-50 text-rose-900",
                  )}
                >
                  {report.suitability}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <ReportStars rating={report.rating} />
                <span className="text-[9.5px] text-pixel-ink/70">
                  Kesesuaian dengan RAB: {report.rating}/5
                </span>
              </div>

              <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-pixel-ink/90">
                {report.comment}
              </p>

              {report.photoUrl ? (
                <div className="mt-3 border-[3px] border-pixel-line bg-pixel-panel p-1">
                  <div className="relative h-[180px] w-full overflow-hidden border-2 border-pixel-line bg-pixel-panel sm:h-[220px]">
                    <Image
                      src={report.photoUrl}
                      alt={`Foto bukti laporan dari ${report.author}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="pixelated object-cover"
                      unoptimized={report.photoUrl.startsWith("data:")}
                    />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-line/90 px-1.5 py-0.5 text-[9px] font-semibold text-pixel-cream">
                      <ImageIcon size={9} aria-hidden="true" />
                      Bukti foto warga
                    </span>
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-cream px-1.5 py-0.5 text-[9px] font-medium text-pixel-line">
                      <ShieldCheck size={9} className="text-emerald-700" aria-hidden="true" />
                      Metadata dibersihkan
                    </span>
                  </div>
                </div>
              ) : null}

              {isAdmin && report.source === "firebase" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-2 border-pixel-line bg-pixel-panel px-2.5 py-2">
                  <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-line">
                    Tinjauan admin
                  </span>
                  <button
                    type="button"
                    onClick={() => handleModerate(report, "verified")}
                    disabled={
                      moderatingId === report.id || report.moderationStatus === "verified"
                    }
                    className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-emerald-50 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-900 shadow-chip hover:bg-emerald-100 disabled:opacity-45"
                  >
                    <CheckCircle2 size={10} aria-hidden="true" />
                    Verifikasi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate(report, "flagged")}
                    disabled={
                      moderatingId === report.id || report.moderationStatus === "flagged"
                    }
                    className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-rose-50 px-2 py-0.5 text-[9.5px] font-semibold text-rose-900 shadow-chip hover:bg-rose-100 disabled:opacity-45"
                  >
                    <AlertTriangle size={10} aria-hidden="true" />
                    Tandai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate(report, "pending")}
                    disabled={
                      moderatingId === report.id || report.moderationStatus === "pending"
                    }
                    className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 py-0.5 text-[9.5px] font-semibold text-pixel-line shadow-chip hover:bg-pixel-sun disabled:opacity-45"
                  >
                    <Clock3 size={10} aria-hidden="true" />
                    Pending
                  </button>
                  {moderatingId === report.id ? (
                    <Loader2 size={11} className="animate-spin text-pixel-line" aria-hidden="true" />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-pixel-line/20 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpvote(report)}
                    disabled={isPending}
                    aria-pressed={isUpvoted}
                    aria-label={`Tandai laporan ini membantu. Saat ini ${upvoteCount} dukungan`}
                    className={cn(
                      "inline-flex min-h-8 items-center gap-1.5 border-2 border-pixel-line px-2 py-1 text-[9.5px] font-semibold shadow-chip disabled:opacity-60",
                      isUpvoted
                        ? "bg-pixel-sun text-pixel-line"
                        : "bg-white text-pixel-line hover:bg-pixel-sun/50",
                    )}
                  >
                    <ThumbsUp
                      size={11}
                      className={isUpvoted ? "fill-amber-600 text-amber-700" : ""}
                      aria-hidden="true"
                    />
                    Membantu · {formatNumber(upvoteCount)}
                  </button>
                  {(report.isUserSubmitted || isAdmin) && report.source === "firebase" ? (
                    deleteTarget === report.id ? (
                      <span className="inline-flex items-center gap-1.5 border-2 border-rose-700 bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-rose-900">
                        Hapus laporan?
                        <button
                          type="button"
                          onClick={() => handleDelete(report)}
                          disabled={deletingId === report.id}
                          className="border border-pixel-line bg-rose-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-800 disabled:opacity-60"
                        >
                          {deletingId === report.id ? "Menghapus…" : "Ya, hapus"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(null)}
                          className="text-[9px] font-semibold text-rose-900/75 underline underline-offset-2 hover:text-rose-950"
                        >
                          Batal
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(report.id)}
                        className="inline-flex min-h-8 items-center gap-1 border-2 border-transparent px-2 py-1 text-[9.5px] font-semibold text-pixel-ink/60 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        aria-label={`Hapus laporan ${report.author} tentang ${project.name}`}
                      >
                        <Trash2 size={10} aria-hidden="true" />
                        Hapus
                      </button>
                    )
                  ) : null}
                  <span className="hidden items-center gap-1 text-[9.5px] text-pixel-ink/60 sm:inline-flex">
                    <MapPin size={9} aria-hidden="true" />
                    Lokasi sesuai proyek
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[9.5px] text-pixel-ink/60">
                  {report.moderationStatus === "pending" ? (
                    <>
                      <Clock3 size={9} aria-hidden="true" />
                      Menunggu pencocokan lokasi
                    </>
                  ) : report.moderationStatus === "flagged" ? (
                    <>
                      <AlertTriangle size={9} aria-hidden="true" />
                      Perlu tinjauan tambahan
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={9} className="text-emerald-700" aria-hidden="true" />
                      Diverifikasi kecocokan lokasi
                    </>
                  )}
                </span>
              </div>
            </article>
          );
        })}

        {filteredReports.length === 0 ? (
          <div className="border-4 border-dashed border-pixel-line/50 bg-white px-5 py-10 text-center">
            <p className="text-[12px] font-semibold text-pixel-line">
              Belum ada laporan dengan kategori ini
            </p>
            <button
              type="button"
              onClick={() => setFilter("Semua")}
              className="mt-2 border-2 border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[7px] uppercase text-pixel-line shadow-chip"
            >
              Tampilkan semua laporan
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-pixel-ink/70">
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
