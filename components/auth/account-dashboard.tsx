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

const SUITABILITY_STYLES: Record<Suitability, { chip: string; dot: string; icon: typeof CheckCircle2 }> = {
  "Sesuai Target": {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "#10B981",
    icon: CheckCircle2,
  },
  Terlambat: {
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "#F59E0B",
    icon: Clock3,
  },
  "Indikasi Kejanggalan": {
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "#EF4444",
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

export function AccountDashboard() {
  const router = useRouter();
  const { user, isHydrated, logout, deleteAccount } = useAuth();
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
  const activeRegion = useMemo(
    () => (activeRegionId === "all" ? undefined : getRegion(activeRegionId)),
    [activeRegionId],
  );

  const reportTotal = activity.reportCount;
  const distributionRows = (
    [
      { key: "Sesuai Target", label: "Sesuai", color: "#10B981" },
      { key: "Terlambat", label: "Terlambat", color: "#F59E0B" },
      { key: "Indikasi Kejanggalan", label: "Kejanggalan", color: "#EF4444" },
    ] as const
  ).map((row) => ({
    ...row,
    count: activity.reportsBySuitability[row.key],
    pct:
      reportTotal > 0
        ? Math.round((activity.reportsBySuitability[row.key] / reportTotal) * 100)
        : 0,
  }));

  if (!isHydrated) {
    return (
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl bg-white shadow-soft" />
            ))}
          </div>
        </div>
        <p className="sr-only">Memuat data akun…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="relative overflow-hidden border-b border-ink-200/70 bg-ink-50">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="container-page relative py-14 sm:py-20">
          <div className="mx-auto max-w-2xl rounded-3xl border border-ink-200/80 bg-white p-6 text-center shadow-soft sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <UserRound size={24} aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink-900">
              Akun Anda belum aktif di perangkat ini.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-500">
              Masuk untuk melihat ringkasan kontribusi, menyimpan identitas laporan, dan
              mengatur wilayah pantau.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href="/masuk" className="btn-primary h-11 px-5 py-0 text-[12.5px]">
                <LogIn size={15} aria-hidden="true" />
                Masuk ke akun
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href="/daftar" className="btn-secondary h-11 px-5 py-0 text-[12.5px]">
                <UserRoundPlus size={15} aria-hidden="true" />
                Daftar gratis
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-[9.5px] text-ink-400">
              <ShieldCheck size={11} className="text-emerald-500" aria-hidden="true" />
              Akun dan kontribusi tersinkron langsung melalui Supabase.
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
      <section className="relative overflow-hidden border-b border-ink-200/70 bg-ink-50">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="container-page relative py-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">
                <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
                Ruang akun warga
              </span>
              <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[32px]">
                Selamat datang, {user.name.split(" ")[0]}.
              </h1>
              <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-ink-500">
                Ringkasan kontribusi yang tersinkron langsung melalui Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/proyek" className="btn-secondary h-10 px-4 py-0 text-[12px]">
                <FolderSearch size={14} aria-hidden="true" />
                Cari proyek
              </Link>
              <Link href="/anggaran" className="btn-primary h-10 px-4 py-0 text-[12px]">
                <Wallet size={14} aria-hidden="true" />
                Buka anggaran
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink-900 font-display text-lg font-extrabold text-amber-400 shadow-sm">
                    {initialsFor(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-ink-900">
                      {user.name}
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                        <BadgeCheck size={9} aria-hidden="true" />
                        Akun aktif
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-500">{user.email}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-ink-400">
                      <CalendarDays size={11} aria-hidden="true" />
                      Bergabung {formatDateLong(user.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[11px] font-semibold text-ink-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut size={13} aria-hidden="true" />
                  Keluar
                </button>
              </div>

              <div className="mt-5 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
                <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Wilayah akun
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-ink-800">
                    <MapPin size={12} className="text-amber-600" aria-hidden="true" />
                    {accountRegion ? accountRegion.name : "Semua wilayah"}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-ink-400">
                    {accountRegion
                      ? `${accountRegion.level}, ${accountRegion.city}`
                      : "Agregat tiga wilayah percontohan"}
                  </p>
                </div>
                <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Wilayah pantau saat ini
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-ink-800">
                    <LayoutDashboard size={12} className="text-navy" aria-hidden="true" />
                    {activeRegion ? activeRegion.name : "Semua wilayah"}
                  </p>
                  {activeRegionId !== user.regionId ? (
                    <button
                      type="button"
                      onClick={() => setActiveRegionId(user.regionId)}
                      className="mt-1 text-[9.5px] font-semibold text-navy underline underline-offset-2 hover:text-amber-600"
                    >
                      Terapkan wilayah akun
                    </button>
                  ) : (
                    <p className="mt-0.5 text-[9.5px] text-ink-400">Sudah sesuai wilayah akun</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <RegionPicker className="w-full sm:w-[280px]" label="Ubah wilayah pantau" />
                <Link
                  href="/proyek"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy hover:text-amber-600"
                >
                  Kirim laporan baru
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Laporan Anda",
                  value: formatNumber(activity.reportCount),
                  hint:
                    activity.latestReportAt !== null
                      ? `Terakhir ${timeAgo(activity.latestReportAt)}`
                      : "Belum ada laporan",
                  icon: MessageSquare,
                  tone: "text-navy",
                  bg: "bg-navy-soft",
                },
                {
                  label: "Dukungan diberikan",
                  value: formatNumber(activity.upvoteCount),
                  hint: "Laporan warga yang Anda dukung",
                  icon: UsersRound,
                  tone: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Proyek terjangkau",
                  value: formatNumber(activity.projectIds.length),
                  hint: "Proyek yang pernah Anda laporkan",
                  icon: FolderSearch,
                  tone: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  label: "Status akun",
                  value: "Supabase",
                  hint: "Tersinkron ke server",
                  icon: ShieldCheck,
                  tone: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-ink-200/80 bg-white p-3.5 shadow-soft"
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg",
                        stat.bg,
                        stat.tone,
                      )}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <p className="mt-2.5 font-display text-xl font-extrabold tracking-tight text-ink-900">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold text-ink-600">{stat.label}</p>
                    <p className="mt-0.5 text-[8.5px] leading-relaxed text-ink-400">{stat.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5">
            <div id="laporan" className="scroll-mt-24 rounded-2xl border border-ink-200/80 bg-white shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <div>
                  <h2 className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
                    Laporan terbaru Anda
                  </h2>
                  <p className="mt-0.5 text-[10px] text-ink-400">
                    {loadingActivity
                      ? "Memuat riwayat kontribusi…"
                      : reports.length > 0
                        ? `${formatNumber(reports.length)} laporan tersimpan di Supabase`
                        : "Laporan yang Anda kirim akan muncul di sini"}
                  </p>
                </div>
                <Link
                  href="/proyek"
                  className="shrink-0 text-[10.5px] font-semibold text-navy hover:text-amber-600"
                >
                  Kirim laporan
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-ink-50 text-ink-400">
                    <MessageSquare size={18} aria-hidden="true" />
                  </span>
                  <p className="mt-2.5 text-[12px] font-semibold text-ink-700">
                    Belum ada laporan lapangan
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-ink-400">
                    Pilih proyek di peta, buka bagian validasi, lalu kirim temuan Anda.
                    Nama akan disamarkan otomatis.
                  </p>
                  <Link
                    href="/proyek"
                    className="btn-primary mt-4 h-9 px-4 py-0 text-[11.5px]"
                  >
                    <FolderSearch size={13} aria-hidden="true" />
                    Cari proyek terdekat
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {reports.slice(0, 5).map((report) => {
                    const project = getProject(report.projectId);
                    const style = SUITABILITY_STYLES[report.suitability];
                    const Icon = style.icon;
                    return (
                      <li key={report.id} className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold",
                              style.chip,
                            )}
                          >
                            <Icon size={9} aria-hidden="true" />
                            {report.suitability}
                          </span>
                          <span className="text-[9.5px] text-ink-400">
                            {timeAgo(report.createdAt)}
                          </span>
                          {project ? (
                            <Link
                              href={`/proyek/${project.id}#validasi`}
                              className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-navy hover:text-amber-600"
                            >
                              Lihat proyek
                              <ArrowUpRight size={11} aria-hidden="true" />
                            </Link>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-[11.5px] font-semibold text-ink-800">
                          {project ? project.name : "Proyek publik"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-ink-500">
                          {report.comment}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
                Sebaran laporan Anda
              </h2>
              <p className="mt-0.5 text-[10px] text-ink-400">
                Berdasarkan status kesesuaian yang Anda pilih.
              </p>
              {reports.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-4 py-5 text-center text-[10.5px] text-ink-400">
                  Belum ada data untuk ditampilkan.
                </p>
              ) : (
                <>
                  <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-ink-100">
                    {distributionRows.map((row) =>
                      row.count > 0 ? (
                        <span
                          key={row.key}
                          style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                      ) : null,
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {distributionRows.map((row) => (
                      <div key={row.key} className="rounded-lg border border-ink-100 p-2.5">
                        <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-ink-500">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: row.color }}
                            aria-hidden="true"
                          />
                          {row.label}
                        </p>
                        <p className="mt-1 font-display text-base font-extrabold text-ink-900">
                          {formatNumber(row.count)}
                          <span className="ml-1 text-[9px] font-medium text-ink-400">
                            {row.pct}%
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
                Langkah cepat
              </h2>
              <ul className="mt-3.5 space-y-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <li key={action.href}>
                      <Link
                        href={action.href}
                        className="group flex items-start gap-2.5 rounded-xl border border-ink-100 p-3 transition-colors hover:border-amber-200 hover:bg-amber-50/40"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-500 transition-colors group-hover:bg-white group-hover:text-amber-600">
                          <Icon size={14} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11.5px] font-semibold text-ink-800">
                            {action.label}
                          </span>
                          <span className="mt-0.5 block text-[9.5px] leading-relaxed text-ink-400">
                            {action.description}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="mt-1 shrink-0 text-ink-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
                Detail akun
              </h2>
              <dl className="mt-3.5 space-y-3">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Nama tampilan
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-ink-800">
                    <UserRound size={12} className="text-ink-400" aria-hidden="true" />
                    {user.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Email
                  </dt>
                  <dd className="mt-0.5 truncate text-[11.5px] font-medium text-ink-800">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Penyimpanan
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-500">
                    <ShieldCheck size={12} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    Akun & kontribusi tersinkron aman di Supabase. Kata sandi dikelola
                    Supabase Auth.
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-ink-100 pt-4">
                <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-ink-400">
                  <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  Akun ini tersimpan di Supabase. Anda dapat menghapusnya kapan saja.
                </p>
                {confirmDelete ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <p className="text-[10.5px] font-semibold text-rose-800">
                      Hapus akun secara permanen?
                    </p>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-rose-700">
                      Akun auth dan profil Supabase akan dihapus. Laporan yang sudah terkirim
                      tetap tersimpan sebagai laporan anonim.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 text-[10.5px] font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
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
                        className="h-8 flex-1 rounded-lg border border-rose-200 bg-white px-3 text-[10.5px] font-semibold text-rose-700 transition-colors hover:bg-rose-100/60 disabled:opacity-60"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-400 transition-colors hover:text-rose-600"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    Hapus akun permanen
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-ink-200/80 bg-ink-900 p-5 text-white shadow-soft">
              <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-amber-400">
                <ShieldCheck size={12} aria-hidden="true" />
                Privasi warga
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-300">
                Nama pada laporan disamarkan menjadi inisial. Metadata foto dan lokasi
                persis dibersihkan sebelum laporan tampil publik.
              </p>
              <Link
                href="/informasi#faq"
                className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-400 hover:text-amber-300"
              >
                Baca pertanyaan privasi
                <ArrowRight size={11} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
