"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
  Eye,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogIn,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuditLog } from "@/components/admin/audit-log";
import { EvidencePublisher } from "@/components/admin/evidence-publisher";
import { ModerationBoard } from "@/components/admin/moderation-board";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getAdminLogs,
  logAdminAction,
  type AdminLogEntry,
} from "@/lib/admin";
import { prajvalaApi } from "@/lib/api";
import type { CitizenReport, ModerationStatus } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

type TabValue = "moderasi" | "bukti" | "log" | "keamanan";

const TABS: { value: TabValue; label: string; icon: typeof LayoutDashboard }[] = [
  { value: "moderasi", label: "Moderasi", icon: BadgeCheck },
  { value: "bukti", label: "Bukti resmi", icon: Camera },
  { value: "log", label: "Log audit", icon: Eye },
  { value: "keamanan", label: "Keamanan", icon: LockKeyhole },
];

function statusOf(report: CitizenReport): ModerationStatus {
  return report.moderationStatus ?? (report.verified ? "verified" : "pending");
}

/** Panel gerbang saat pengunjung belum masuk atau bukan administrator. */
function Gate({
  variant,
  title,
  description,
}: {
  variant: "login" | "denied";
  title: string;
  description: string;
}) {
  const denied = variant === "denied";
  return (
    <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
      <div
        className="surface-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />
      <div className="container-page relative py-12 sm:py-16">
        <div className="mx-auto max-w-2xl border-4 border-pixel-line bg-white p-5 text-center shadow-panel sm:p-8">
          <span
            className={cn(
              "mx-auto grid h-14 w-14 place-items-center border-[3px] border-pixel-line",
              denied ? "bg-rose-100 text-rose-800" : "bg-pixel-sun text-pixel-line",
            )}
          >
            {denied ? (
              <ShieldX size={24} aria-hidden="true" />
            ) : (
              <LogIn size={24} aria-hidden="true" />
            )}
          </span>
          <p className="mt-4 inline-flex border-2 border-pixel-line bg-pixel-panel px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
            Panel administrator
          </p>
          <h1 className="mt-2.5 font-pixel text-[15px] uppercase leading-[1.8] text-pixel-line sm:text-[18px]">
            {title}
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-[12px] leading-relaxed text-pixel-ink/80">
            {description}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            {denied ? (
              <>
                <Link href="/akun" className="btn-primary">
                  <UserRound size={14} aria-hidden="true" />
                  Buka akun saya
                </Link>
                <Link href="/" className="btn-secondary">
                  Kembali ke beranda
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/masuk" className="btn-primary">
                  <LogIn size={14} aria-hidden="true" />
                  Masuk sebagai admin
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <Link href="/" className="btn-secondary">
                  Kembali ke beranda
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[9.5px] text-pixel-ink/65">
            <ShieldCheck size={11} className="text-emerald-700" aria-hidden="true" />
            Akses admin memakai custom claim Firebase Authentication.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AdminDashboard() {
  const { user, isHydrated, isAdmin, isFirebaseMode, changePassword } = useAuth();

  const [tab, setTab] = useState<TabValue>("moderasi");
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [logError, setLogError] = useState("");
  const [boardError, setBoardError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const loadReports = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingReports(true);
    setLoadError("");
    try {
      const stored = await prajvalaApi.getAllReports();
      setReports(stored.map((item) => prajvalaApi.toFeedItem(item, user?.id)));
    } catch {
      setLoadError(
        "Laporan belum dapat dimuat. Periksa koneksi Anda lalu muat ulang panel.",
      );
    } finally {
      setLoadingReports(false);
    }
  }, [isAdmin, user?.id]);

  const loadLogs = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingLogs(true);
    setLogError("");
    try {
      setLogs(await getAdminLogs(80));
    } catch {
      setLogError(
        "Log audit belum dapat dimuat. Pastikan aturan Firestore sudah dipasang dan akun masih admin.",
      );
    } finally {
      setLoadingLogs(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isHydrated || !isAdmin) return;
    void loadReports();
    void loadLogs();
  }, [isHydrated, isAdmin, loadReports, loadLogs]);

  const stats = useMemo(() => {
    const base = {
      total: reports.length,
      pending: 0,
      verified: 0,
      flagged: 0,
      official: 0,
      photos: 0,
    };
    reports.forEach((report) => {
      base[statusOf(report)] += 1;
      if (report.official) base.official += 1;
      if (report.photoUrl) base.photos += 1;
    });
    return base;
  }, [reports]);

  const handleModerate = async (
    report: CitizenReport,
    status: ModerationStatus,
  ) => {
    if (!user) return;
    setBusyId(report.id);
    setBoardError("");
    try {
      await prajvalaApi.moderateReport(report.id, status);
      setReports((previous) =>
        previous.map((item) =>
          item.id === report.id
            ? {
                ...item,
                verified: status === "verified",
                moderationStatus: status,
                moderatedAt: new Date().toISOString(),
                moderatedBy: user.id,
              }
            : item,
        ),
      );
      await logAdminAction({
        action: "moderate",
        targetId: report.id,
        projectId: report.projectId,
        detail:
          status === "verified"
            ? "Laporan diverifikasi dari panel admin."
            : status === "flagged"
              ? "Laporan ditandai untuk ditinjau."
              : "Verifikasi dibatalkan, laporan kembali menunggu.",
        actorId: user.id,
        actorName: user.name,
      }).catch(() => undefined);
      void loadLogs();
    } catch (error) {
      setBoardError(
        error instanceof Error ? error.message : "Tinjauan belum dapat disimpan.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (report: CitizenReport) => {
    if (!user) return;
    setBusyId(report.id);
    setBoardError("");
    try {
      await prajvalaApi.deleteReport(report.id);
      setReports((previous) => previous.filter((item) => item.id !== report.id));
      await logAdminAction({
        action: "delete",
        targetId: report.id,
        projectId: report.projectId,
        detail: `Laporan dari ${report.author} dihapus dari panel admin.`,
        actorId: user.id,
        actorName: user.name,
      }).catch(() => undefined);
      void loadLogs();
    } catch (error) {
      setBoardError(
        error instanceof Error ? error.message : "Laporan belum dapat dihapus.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handlePublished = (report: CitizenReport) => {
    setReports((previous) => [report, ...previous]);
    void loadLogs();
  };

  const handlePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (nextPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi belum sama.");
      return;
    }

    setPasswordBusy(true);
    const result = await changePassword(currentPassword, nextPassword);
    setPasswordBusy(false);

    if (result.ok) {
      setPasswordSuccess(result.message ?? "Kata sandi berhasil diperbarui.");
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      return;
    }

    setPasswordError(result.error ?? "Kata sandi belum dapat diperbarui.");
  };

  if (!isHydrated) {
    return (
      <section className="bg-pixel-cream">
        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="h-40 animate-pulse border-4 border-pixel-line bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse border-4 border-pixel-line bg-white"
                />
              ))}
            </div>
          </div>
          <p className="sr-only">Memuat panel administrator…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <Gate
        variant="login"
        title="Masuk untuk membuka panel administrator."
        description="Panel ini hanya tersedia bagi akun pengelola PRAJVALA. Masuk dengan akun yang sudah memiliki peran administrator."
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        variant="denied"
        title="Akun ini belum memiliki akses administrator."
        description={
          isFirebaseMode
            ? "Peran admin dipasang sebagai custom claim Firebase Authentication. Minta pemilik proyek memasang claim admin: true pada akun Anda, lalu masuk ulang."
            : "Mode Firebase belum aktif di perangkat ini, sehingga peran administrator tidak dapat diverifikasi."
        }
      />
    );
  }

  return (
    <>
      {/* ---------- Hero + statistik ---------- */}
      <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-dirt">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-20"
          aria-hidden="true"
        />
        <div className="container-page relative py-7 sm:py-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                <ShieldCheck size={10} aria-hidden="true" />
                Panel administrator
              </span>
              <h1 className="mt-2.5 font-pixel text-[17px] uppercase leading-[1.75] text-pixel-cream sm:text-[22px]">
                Ruang kendali PRAJVALA.
              </h1>
              <p className="mt-2 max-w-xl text-[11.5px] leading-relaxed text-pixel-cream/80">
                Tinjau laporan warga, terbitkan bukti resmi berfoto, dan jaga
                jejak audit tetap rapi. Semua tindakan tercatat.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 border border-pixel-cream/30 bg-pixel-line/30 px-2 py-0.5 text-[9.5px] text-pixel-cream/85">
                <UserRound size={10} aria-hidden="true" />
                {user.name} · {user.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void loadReports();
                  void loadLogs();
                }}
                disabled={loadingReports || loadingLogs}
                className="inline-flex min-h-10 items-center gap-1.5 border-[3px] border-pixel-line bg-pixel-sun px-3 font-pixel text-[8px] uppercase text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loadingReports || loadingLogs ? (
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw size={12} aria-hidden="true" />
                )}
                Muat ulang data
              </button>
              <Link
                href="/akun"
                className="inline-flex min-h-10 items-center gap-1.5 border-[3px] border-pixel-line bg-white px-3 font-pixel text-[8px] uppercase text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5"
              >
                <UserRound size={12} aria-hidden="true" />
                Akun saya
              </Link>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[
              {
                label: "Menunggu tinjauan",
                value: stats.pending,
                hint: "Belum dicocokkan",
                icon: Clock3,
                plate: "bg-amber-100 text-amber-900",
              },
              {
                label: "Terverifikasi",
                value: stats.verified,
                hint: `${formatNumber(stats.official)} bukti resmi`,
                icon: CheckCircle2,
                plate: "bg-emerald-100 text-emerald-900",
              },
              {
                label: "Ditandai",
                value: stats.flagged,
                hint: "Perlu tindak lanjut",
                icon: AlertTriangle,
                plate: "bg-rose-100 text-rose-900",
              },
              {
                label: "Total laporan",
                value: stats.total,
                hint: `${formatNumber(stats.photos)} berfoto`,
                icon: LayoutDashboard,
                plate: "bg-pixel-sun text-pixel-line",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="border-4 border-pixel-line bg-white p-3 shadow-card"
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center border-2 border-pixel-line",
                      stat.plate,
                    )}
                  >
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <p className="mt-2 font-pixel text-[11px] leading-[1.5] text-pixel-line">
                    {formatNumber(stat.value)}
                  </p>
                  <p className="mt-1 text-[9.5px] font-semibold leading-snug text-pixel-ink/80">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-pixel-ink/60">
                    {stat.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Tab ---------- */}
      <section className="bg-pixel-cream">
        <div className="container-page py-6 sm:py-8">
          <div
            role="tablist"
            aria-label="Bagian panel administrator"
            className="flex flex-wrap gap-1.5"
          >
            {TABS.map((item) => {
              const active = tab === item.value;
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  id={`admin-tab-${item.value}`}
                  aria-selected={active}
                  aria-controls={`admin-panel-${item.value}`}
                  onClick={() => setTab(item.value)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 border-2 border-pixel-line px-3 font-pixel text-[8px] uppercase leading-none shadow-chip transition-transform hover:-translate-y-0.5",
                    active
                      ? "bg-pixel-line text-pixel-sun"
                      : "bg-white text-pixel-line hover:bg-pixel-sun",
                  )}
                >
                  <Icon size={12} aria-hidden="true" />
                  {item.label}
                  {item.value === "moderasi" && stats.pending > 0 ? (
                    <span
                      className={cn(
                        "border px-1 text-[9px] font-bold",
                        active
                          ? "border-pixel-cream/40 text-pixel-cream"
                          : "border-pixel-line/30 text-pixel-line",
                      )}
                    >
                      {stats.pending}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {loadError ? (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 border-4 border-pixel-line bg-rose-50 px-3.5 py-2.5"
            >
              <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-rose-900">
                <AlertTriangle
                  size={13}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => void loadReports()}
                className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
              >
                <RefreshCw size={10} aria-hidden="true" />
                Coba lagi
              </button>
            </div>
          ) : null}

          <div className="mt-4">
            {loadingReports && reports.length === 0 ? (
              <div className="space-y-3" aria-live="polite">
                <div className="h-20 animate-pulse border-4 border-pixel-line bg-white" />
                <div className="h-28 animate-pulse border-4 border-pixel-line bg-white" />
                <div className="h-28 animate-pulse border-4 border-pixel-line bg-white" />
                <p className="sr-only">Memuat laporan Firebase…</p>
              </div>
            ) : (
              <>
                <div
                  role="tabpanel"
                  id="admin-panel-moderasi"
                  aria-labelledby="admin-tab-moderasi"
                  hidden={tab !== "moderasi"}
                >
                  <ModerationBoard
                    reports={reports}
                    busyId={busyId}
                    error={boardError}
                    onDismissError={() => setBoardError("")}
                    onModerate={handleModerate}
                    onDelete={handleDelete}
                  />
                </div>

                <div
                  role="tabpanel"
                  id="admin-panel-bukti"
                  aria-labelledby="admin-tab-bukti"
                  hidden={tab !== "bukti"}
                >
                  <EvidencePublisher
                    actor={{ id: user.id, name: user.name }}
                    onPublished={handlePublished}
                  />
                </div>

                <div
                  role="tabpanel"
                  id="admin-panel-log"
                  aria-labelledby="admin-tab-log"
                  hidden={tab !== "log"}
                >
                  <AuditLog
                    logs={logs}
                    loading={loadingLogs}
                    error={logError}
                    onRefresh={() => void loadLogs()}
                  />
                </div>

                <div
                  role="tabpanel"
                  id="admin-panel-keamanan"
                  aria-labelledby="admin-tab-keamanan"
                  hidden={tab !== "keamanan"}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <form
                      onSubmit={handlePassword}
                      className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3 border-b-[3px] border-pixel-line/20 pb-3">
                        <div>
                          <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                            Ganti kata sandi
                          </h2>
                          <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
                            Gunakan kata sandi baru yang kuat. Anda akan diminta
                            memasukkan kata sandi saat ini.
                          </p>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                          <KeyRound size={15} aria-hidden="true" />
                        </span>
                      </div>

                      {passwordError ? (
                        <div
                          role="alert"
                          className="mt-3 flex items-start gap-2 border-2 border-rose-700 bg-rose-50 p-2.5 text-[10.5px] leading-relaxed text-rose-900"
                        >
                          <AlertTriangle
                            size={13}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          {passwordError}
                        </div>
                      ) : null}

                      {passwordSuccess ? (
                        <div
                          role="status"
                          className="mt-3 flex items-start gap-2 border-2 border-emerald-800 bg-emerald-50 p-2.5 text-[10.5px] leading-relaxed text-emerald-900"
                        >
                          <CheckCircle2
                            size={13}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          {passwordSuccess}
                        </div>
                      ) : null}

                      <div className="mt-3.5 grid gap-3">
                        <div>
                          <label
                            htmlFor="admin-current-password"
                            className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                          >
                            Kata sandi saat ini
                          </label>
                          <input
                            id="admin-current-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={(event) =>
                              setCurrentPassword(event.target.value)
                            }
                            className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-3 text-[12px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="admin-next-password"
                              className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                            >
                              Kata sandi baru
                            </label>
                            <input
                              id="admin-next-password"
                              type="password"
                              autoComplete="new-password"
                              required
                              minLength={8}
                              value={nextPassword}
                              onChange={(event) =>
                                setNextPassword(event.target.value)
                              }
                              className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-3 text-[12px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="admin-confirm-password"
                              className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                            >
                              Ulangi kata sandi baru
                            </label>
                            <input
                              id="admin-confirm-password"
                              type="password"
                              autoComplete="new-password"
                              required
                              minLength={8}
                              value={confirmPassword}
                              onChange={(event) =>
                                setConfirmPassword(event.target.value)
                              }
                              className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-3 text-[12px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
                            />
                          </div>
                        </div>
                      </div>

                      <p className="mt-2.5 text-[9.5px] leading-relaxed text-pixel-ink/60">
                        Minimal 8 karakter, mengandung huruf dan angka. Setelah
                        berhasil, gunakan kata sandi baru pada perangkat lain.
                      </p>

                      <button
                        type="submit"
                        disabled={passwordBusy}
                        className="btn-primary mt-4 w-full sm:w-auto"
                      >
                        {passwordBusy ? (
                          <Loader2
                            size={13}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <KeyRound size={13} aria-hidden="true" />
                        )}
                        {passwordBusy ? "Menyimpan…" : "Perbarui kata sandi"}
                      </button>
                    </form>

                    <aside className="space-y-3">
                      <div className="border-4 border-pixel-line bg-pixel-wood-darker p-3 shadow-panel">
                        <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-sun">
                          <ShieldCheck size={11} aria-hidden="true" />
                          Peran administrator
                        </p>
                        <p className="mt-2 text-[10px] leading-relaxed text-pixel-cream/80">
                          Peran ini berasal dari custom claim Firebase Auth{" "}
                          <code className="border border-pixel-cream/25 bg-pixel-line/40 px-1">
                            admin: true
                          </code>
                          . Klien tidak dapat memasangnya sendiri.
                        </p>
                        <p className="mt-2 text-[10px] leading-relaxed text-pixel-cream/80">
                          Jika claim baru dipasang, keluar lalu masuk kembali agar
                          token memuat peran terbaru.
                        </p>
                      </div>

                      <div className="border-4 border-pixel-line bg-white p-3 shadow-card">
                        <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                          Akun aktif
                        </p>
                        <p className="mt-1 text-[11.5px] font-bold leading-snug text-pixel-line">
                          {user.name}
                        </p>
                        <p className="mt-0.5 break-all text-[10px] text-pixel-ink/70">
                          {user.email}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1 border border-pixel-line bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-900">
                          <BadgeCheck size={9} aria-hidden="true" />
                          Peran admin aktif
                        </p>
                      </div>
                    </aside>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
