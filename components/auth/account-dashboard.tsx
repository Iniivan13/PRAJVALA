"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderSearch,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundPlus,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRegion } from "@/components/providers/region-provider";
import { RegionPicker } from "@/components/ui/region-picker";
import { getAccountData, type DeviceActivity } from "@/lib/api";
import { getProject, getRegion } from "@/lib/data";
import type { CitizenReport, Suitability } from "@/types";
import {
  cn,
  formatDateLong,
  formatNumber,
  initialsFor,
  timeAgo,
} from "@/lib/utils";

const SUITABILITY_STYLES: Record<
  Suitability,
  { chip: string; bar: string; icon: typeof CheckCircle2 }
> = {
  "Sesuai Target": {
    chip: "bg-emerald-50 text-emerald-900",
    bar: "bg-emerald-600",
    icon: CheckCircle2,
  },
  Terlambat: {
    chip: "bg-amber-50 text-amber-900",
    bar: "bg-amber-500",
    icon: Clock3,
  },
  "Indikasi Kejanggalan": {
    chip: "bg-rose-50 text-rose-900",
    bar: "bg-rose-600",
    icon: AlertTriangle,
  },
};

const QUICK_ACTIONS = [
  {
    href: "/anggaran",
    label: "Pantau anggaran",
    description: "Lihat pagu, realisasi, dan rincian RAB-LPJ wilayah Anda.",
    icon: Wallet,
  },
  {
    href: "/proyek",
    label: "Cari proyek di peta",
    description: "Telusuri proyek dan kirim laporan kondisi lapangan.",
    icon: FolderSearch,
  },
  {
    href: "/informasi",
    label: "Baca dokumen publik",
    description: "Ringkasan APBD/APBDes, FAQ, dan glosarium istilah.",
    icon: KeyRound,
  },
];

/** Section frame used across the dashboard. */
function Panel({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn("border-4 border-pixel-line bg-white shadow-card", className)}
    >
      {children}
    </div>
  );
}

export function AccountDashboard() {
  const router = useRouter();
  const { user, isHydrated, isAdmin, isModerator, logout, deleteAccount } = useAuth();
  const { activeRegionId, setActiveRegionId } = useRegion();

  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [activity, setActivity] = useState<DeviceActivity>(() => ({
    reportCount: 0,
    upvoteCount: 0,
    reportsBySuitability: {
      "Sesuai Target": 0,
      Terlambat: 0,
      "Indikasi Kejanggalan": 0,
    },
    latestReportAt: null,
    projectIds: [],
  }));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!isHydrated || !user) {
      setLoadingActivity(false);
      return;
    }

    let cancelled = false;
    setLoadingActivity(true);

    getAccountData({ id: user.id, source: user.source })
      .then((snapshot) => {
        if (cancelled) return;
        setReports(snapshot.reports);
        setActivity(snapshot.activity);
      })
      .catch(() => {
        // Biarkan data kosong; pengguna dapat memuat ulang halaman.
      })
      .finally(() => {
        if (!cancelled) setLoadingActivity(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, user]);

  const accountRegion = useMemo(
    () => (user ? getRegion(user.regionId) : undefined),
    [user],
  );
  const quickActions = useMemo(
    () =>
      isModerator
        ? [
            {
              href: "/admin",
              label: isAdmin ? "Panel administrator" : "Panel daerah",
              description: isAdmin
                ? "Tinjau laporan warga, kelola pengguna, terbitkan bukti resmi, dan baca log audit."
                : "Tinjau laporan warga di wilayah tugas Anda.",
              icon: ShieldCheck,
            },
            ...QUICK_ACTIONS,
          ]
        : QUICK_ACTIONS,
    [isAdmin, isModerator],
  );
  const activeRegion = useMemo(
    () => (activeRegionId === "all" ? undefined : getRegion(activeRegionId)),
    [activeRegionId],
  );

  const reportTotal = activity.reportCount;
  const distributionRows = (
    [
      { key: "Sesuai Target", label: "Sesuai" },
      { key: "Terlambat", label: "Terlambat" },
      { key: "Indikasi Kejanggalan", label: "Kejanggalan" },
    ] as const
  ).map((row) => ({
    ...row,
    style: SUITABILITY_STYLES[row.key],
    count: activity.reportsBySuitability[row.key],
    pct:
      reportTotal > 0
        ? Math.round((activity.reportsBySuitability[row.key] / reportTotal) * 100)
        : 0,
  }));

  if (!isHydrated) {
    return (
      <section className="bg-pixel-cream">
        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto max-w-5xl space-y-4">
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
          <p className="sr-only">Memuat data akun…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div className="container-page relative py-12 sm:py-16">
          <div className="mx-auto max-w-2xl border-4 border-pixel-line bg-white p-5 text-center shadow-panel sm:p-8">
            <span className="mx-auto grid h-14 w-14 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
              <UserRound size={24} aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-pixel text-[15px] uppercase leading-[1.8] text-pixel-line sm:text-[18px]">
              Akun Anda belum aktif di perangkat ini.
            </h1>
            <p className="mx-auto mt-2.5 max-w-md text-[12px] leading-relaxed text-pixel-ink/80">
              Masuk untuk melihat ringkasan kontribusi, menyimpan identitas laporan, dan
              mengatur wilayah pantau.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href="/masuk" className="btn-primary">
                <LogIn size={14} aria-hidden="true" />
                Masuk ke akun
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
              <Link href="/daftar" className="btn-secondary">
                <UserRoundPlus size={14} aria-hidden="true" />
                Daftar gratis
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[9.5px] text-pixel-ink/65">
              <ShieldCheck size={11} className="text-emerald-700" aria-hidden="true" />
              Akun dan kontribusi tersinkron langsung melalui Firebase.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (result.ok) {
      router.push("/");
    }
  };

  return (
    <>
      <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div className="container-page relative py-7 sm:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                Ruang akun warga
              </span>
              <h1 className="mt-2.5 font-pixel text-[17px] uppercase leading-[1.75] text-pixel-line text-shadow-pixel-light sm:text-[22px]">
                Selamat datang, {user.name.split(" ")[0]}.
              </h1>
              <p className="mt-2 max-w-xl text-[11.5px] leading-relaxed text-pixel-ink/80">
                Ringkasan kontribusi yang tersinkron langsung melalui Firebase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/proyek" className="btn-secondary">
                <FolderSearch size={13} aria-hidden="true" />
                Cari proyek
              </Link>
              <Link href="/anggaran" className="btn-primary">
                <Wallet size={13} aria-hidden="true" />
                Buka anggaran
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Panel className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-line font-pixel text-[13px] text-pixel-sun shadow-chip">
                    {initialsFor(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-pixel-line">
                      {user.name}
                      <span className="inline-flex items-center gap-1 border-2 border-pixel-line bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em] text-emerald-900">
                        <BadgeCheck size={9} aria-hidden="true" />
                        Akun aktif
                      </span>
                      {isModerator ? (
                        <span className="inline-flex items-center gap-1 border-2 border-pixel-line bg-pixel-sun px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em] text-pixel-line">
                          <ShieldCheck size={9} aria-hidden="true" />
                          {isAdmin ? "Administrator" : "PJ Daerah"}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-pixel-ink/65">
                      {user.email}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-pixel-ink/65">
                      <CalendarDays size={11} aria-hidden="true" />
                      Bergabung {formatDateLong(user.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 text-[10.5px] font-semibold text-pixel-line shadow-chip transition-colors hover:bg-rose-50 hover:text-rose-800"
                >
                  <LogOut size={12} aria-hidden="true" />
                  Keluar
                </button>
              </div>

              <div className="mt-4 grid gap-2.5 border-t-[3px] border-pixel-line/20 pt-3.5 sm:grid-cols-2">
                <div className="border-2 border-pixel-line bg-pixel-cream-deep p-2.5">
                  <p className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                    Wilayah akun
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-pixel-line">
                    <MapPin size={11} className="text-pixel-wood-cta" aria-hidden="true" />
                    {accountRegion ? accountRegion.name : "Semua wilayah"}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-pixel-ink/65">
                    {accountRegion
                      ? `${accountRegion.level}, ${accountRegion.city}`
                      : "Agregat tiga wilayah percontohan"}
                  </p>
                </div>
                <div className="border-2 border-pixel-line bg-pixel-cream-deep p-2.5">
                  <p className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                    Wilayah pantau saat ini
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-pixel-line">
                    <LayoutDashboard size={11} className="text-pixel-wood-cta" aria-hidden="true" />
                    {activeRegion ? activeRegion.name : "Semua wilayah"}
                  </p>
                  {activeRegionId !== user.regionId ? (
                    <button
                      type="button"
                      onClick={() => setActiveRegionId(user.regionId)}
                      className="mt-1 text-[9.5px] font-semibold text-pixel-wood-cta underline decoration-2 underline-offset-2 hover:text-pixel-line"
                    >
                      Terapkan wilayah akun
                    </button>
                  ) : (
                    <p className="mt-0.5 text-[9.5px] text-pixel-ink/65">
                      Sudah sesuai wilayah akun
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <RegionPicker className="w-full sm:w-[280px]" label="Ubah wilayah pantau" />
                <Link
                  href="/proyek"
                  className="inline-flex min-h-8 items-center gap-1 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                >
                  Kirim laporan baru
                  <ArrowUpRight size={11} aria-hidden="true" />
                </Link>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  label: "Laporan Anda",
                  value: formatNumber(activity.reportCount),
                  hint:
                    activity.latestReportAt !== null
                      ? `Terakhir ${timeAgo(activity.latestReportAt)}`
                      : "Belum ada laporan",
                  icon: MessageSquare,
                  plate: "bg-pixel-sun text-pixel-line",
                },
                {
                  label: "Dukungan diberikan",
                  value: formatNumber(activity.upvoteCount),
                  hint: "Laporan warga yang Anda dukung",
                  icon: UsersRound,
                  plate: "bg-emerald-100 text-emerald-900",
                },
                {
                  label: "Proyek terjangkau",
                  value: formatNumber(activity.projectIds.length),
                  hint: "Proyek yang pernah Anda laporkan",
                  icon: FolderSearch,
                  plate: "bg-amber-100 text-amber-900",
                },
                {
                  label: "Status akun",
                  value: "Firebase",
                  hint: "Tersinkron ke server",
                  icon: ShieldCheck,
                  plate: "bg-emerald-100 text-emerald-900",
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
                    <p className="mt-2 whitespace-nowrap font-pixel text-[9.5px] leading-[1.5] text-pixel-line">
                      {stat.value}
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
        </div>
      </section>

      <section className="bg-pixel-cream">
        <div className="container-page py-7 sm:py-9">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-4">
              <Panel id="laporan" className="scroll-mt-24">
                <div className="flex items-start justify-between gap-3 border-b-[3px] border-pixel-line bg-pixel-panel px-4 py-3">
                  <div>
                    <h2 className="font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
                      Laporan terbaru Anda
                    </h2>
                    <p className="mt-1 text-[9.5px] text-pixel-ink/70">
                      {loadingActivity
                        ? "Memuat riwayat kontribusi…"
                        : reports.length > 0
                          ? `${formatNumber(reports.length)} laporan tersimpan di Firebase`
                          : "Laporan yang Anda kirim akan muncul di sini"}
                    </p>
                  </div>
                  <Link
                    href="/proyek"
                    className="shrink-0 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                  >
                    Kirim laporan
                  </Link>
                </div>

                {reports.length === 0 ? (
                  <div className="px-4 py-9 text-center">
                    <span className="mx-auto grid h-11 w-11 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
                      <MessageSquare size={18} aria-hidden="true" />
                    </span>
                    <p className="mt-2.5 text-[11.5px] font-semibold text-pixel-line">
                      Belum ada laporan lapangan
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-pixel-ink/70">
                      Pilih proyek di peta, buka bagian validasi, lalu kirim temuan Anda.
                      Nama akan disamarkan otomatis.
                    </p>
                    <Link href="/proyek" className="btn-primary mt-4">
                      <FolderSearch size={13} aria-hidden="true" />
                      Cari proyek terdekat
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y-2 divide-pixel-line/10">
                    {reports.slice(0, 5).map((report) => {
                      const project = getProject(report.projectId);
                      const style = SUITABILITY_STYLES[report.suitability];
                      const Icon = style.icon;
                      return (
                        <li key={report.id} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 border-2 border-pixel-line px-1.5 py-0.5 text-[9px] font-bold",
                                style.chip,
                              )}
                            >
                              <Icon size={9} aria-hidden="true" />
                              {report.suitability}
                            </span>
                            <span className="text-[9.5px] text-pixel-ink/60">
                              {timeAgo(report.createdAt)}
                            </span>
                            {project ? (
                              <Link
                                href={`/proyek/${project.id}#validasi`}
                                className="ml-auto inline-flex items-center gap-1 font-pixel text-[6.5px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                              >
                                Lihat proyek
                                <ArrowUpRight size={10} aria-hidden="true" />
                              </Link>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-[11px] font-semibold text-pixel-line">
                            {project ? project.name : "Proyek publik"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-pixel-ink/75">
                            {report.comment}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>

              <Panel className="p-4">
                <h2 className="font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
                  Sebaran laporan Anda
                </h2>
                <p className="mt-1 text-[9.5px] text-pixel-ink/70">
                  Berdasarkan status kesesuaian yang Anda pilih.
                </p>
                {reports.length === 0 ? (
                  <p className="mt-3.5 border-2 border-dashed border-pixel-line/40 bg-pixel-panel px-4 py-4 text-center text-[10.5px] text-pixel-ink/65">
                    Belum ada data untuk ditampilkan.
                  </p>
                ) : (
                  <>
                    <div className="mt-3.5 flex h-3 overflow-hidden border-2 border-pixel-line bg-pixel-panel">
                      {distributionRows.map((row) =>
                        row.count > 0 ? (
                          <span
                            key={row.key}
                            className={cn("h-full", row.style.bar)}
                            style={{ width: `${row.pct}%` }}
                            aria-hidden="true"
                          />
                        ) : null,
                      )}
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {distributionRows.map((row) => (
                        <div
                          key={row.key}
                          className="border-2 border-pixel-line/40 bg-pixel-cream-deep p-2"
                        >
                          <p className="flex items-center gap-1.5 text-[9px] font-medium text-pixel-ink/70">
                            <span
                              className={cn("h-2 w-2 border border-pixel-line", row.style.bar)}
                              aria-hidden="true"
                            />
                            {row.label}
                          </p>
                          <p className="mt-1 font-pixel text-[9px] leading-[1.5] text-pixel-line">
                            {formatNumber(row.count)}
                            <span className="ml-1 font-sans text-[9px] font-medium text-pixel-ink/60">
                              {row.pct}%
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Panel>
            </div>

            <div className="space-y-4">
              <Panel className="p-4">
                <h2 className="font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
                  Langkah cepat
                </h2>
                <ul className="mt-3 space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <li key={action.href}>
                        <Link
                          href={action.href}
                          className="group flex items-start gap-2.5 border-2 border-pixel-line/35 p-2.5 transition-colors hover:border-pixel-line hover:bg-pixel-sun/25"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-panel text-pixel-line transition-colors group-hover:bg-pixel-sun">
                            <Icon size={14} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold text-pixel-line">
                              {action.label}
                            </span>
                            <span className="mt-0.5 block text-[9.5px] leading-relaxed text-pixel-ink/70">
                              {action.description}
                            </span>
                          </span>
                          <ArrowUpRight
                            size={13}
                            className="mt-1 shrink-0 text-pixel-line/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pixel-line"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              <Panel className="p-4">
                <h2 className="font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
                  Detail akun
                </h2>
                <dl className="mt-3 space-y-2.5">
                  <div>
                    <dt className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                      Nama tampilan
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-pixel-line">
                      <UserRound size={11} className="text-pixel-ink/50" aria-hidden="true" />
                      {user.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                      Email
                    </dt>
                    <dd className="mt-1 truncate text-[11px] font-medium text-pixel-line">
                      {user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                      Penyimpanan
                    </dt>
                    <dd className="mt-1 flex items-start gap-1.5 text-[10px] leading-relaxed text-pixel-ink/75">
                      <ShieldCheck
                        size={11}
                        className="mt-0.5 shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                      Akun &amp; kontribusi tersinkron aman di Firebase. Kata sandi
                      dikelola Firebase Authentication.
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 border-t-[3px] border-pixel-line/20 pt-3">
                  <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-pixel-ink/70">
                    <ShieldCheck
                      size={11}
                      className="mt-0.5 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                    Akun ini tersimpan di Firebase. Anda dapat menghapusnya kapan saja.
                  </p>
                  {confirmDelete ? (
                    <div className="mt-3 border-2 border-rose-700 bg-rose-50 p-2.5">
                      <p className="text-[10.5px] font-semibold text-rose-900">
                        Hapus akun secara permanen?
                      </p>
                      <p className="mt-0.5 text-[9.5px] leading-relaxed text-rose-800">
                        Akun auth dan profil Firebase akan dihapus. Laporan yang sudah
                        terkirim tetap tersimpan sebagai laporan anonim.
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="inline-flex h-8 flex-1 items-center justify-center gap-1 border-2 border-pixel-line bg-rose-700 px-2 text-[10px] font-bold text-white hover:bg-rose-800 disabled:opacity-60"
                        >
                          {deleting ? (
                            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={12} aria-hidden="true" />
                          )}
                          {deleting ? "Menghapus…" : "Ya, hapus akun"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                          className="h-8 flex-1 border-2 border-rose-700 bg-white px-2 text-[10px] font-semibold text-rose-800 hover:bg-rose-100/70 disabled:opacity-60"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-pixel-ink/55 transition-colors hover:text-rose-700"
                    >
                      <Trash2 size={11} aria-hidden="true" />
                      Hapus akun permanen
                    </button>
                  )}
                </div>
              </Panel>

              <div className="border-4 border-pixel-line bg-pixel-wood-darker p-4 shadow-panel">
                <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-sun">
                  <ShieldCheck size={11} aria-hidden="true" />
                  Privasi warga
                </p>
                <p className="mt-2 text-[10.5px] leading-relaxed text-pixel-cream/80">
                  Nama pada laporan disamarkan menjadi inisial. Metadata foto dan lokasi
                  persis dibersihkan sebelum laporan tampil publik.
                </p>
                <Link
                  href="/informasi#faq"
                  className="mt-2.5 inline-flex items-center gap-1 font-pixel text-[7px] uppercase text-pixel-sun underline decoration-2 underline-offset-4 hover:text-pixel-cream"
                >
                  Baca pertanyaan privasi
                  <ArrowRight size={10} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
