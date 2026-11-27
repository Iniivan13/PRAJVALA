"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { REGIONS, getRegion } from "@/lib/data";
import {
  USER_ROLE_HINT,
  USER_ROLE_LABEL,
  type ManagedUser,
} from "@/lib/users";
import type { UserRole } from "@/types";
import { cn, formatDateLong, formatNumber, initialsFor } from "@/lib/utils";

type FilterValue = "all" | UserRole;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "admin", label: "Administrator" },
  { value: "pj_daerah", label: "PJ Daerah" },
  { value: "warga", label: "Warga" },
];

const ROLE_STYLE: Record<UserRole, string> = {
  admin: "bg-pixel-sun text-pixel-line",
  pj_daerah: "bg-sky-100 text-sky-900",
  warga: "bg-pixel-panel text-pixel-line",
};

interface UserDirectoryProps {
  users: ManagedUser[];
  currentUserId: string;
  busyId: string | null;
  error: string;
  onDismissError: () => void;
  onSave: (user: ManagedUser, role: UserRole, regionId: string) => Promise<void>;
}

function UserRow({
  user,
  isSelf,
  busy,
  onSave,
}: {
  user: ManagedUser;
  isSelf: boolean;
  busy: boolean;
  onSave: UserDirectoryProps["onSave"];
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [regionId, setRegionId] = useState(user.regionId);

  useEffect(() => {
    setRole(user.role);
    setRegionId(user.regionId);
  }, [user.role, user.regionId]);

  const dirty = role !== user.role || regionId !== user.regionId;
  const invalid = role === "pj_daerah" && regionId === "all";
  const region = regionId === "all" ? undefined : getRegion(regionId);

  return (
    <article className="border-4 border-pixel-line bg-white p-3.5 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-line font-pixel text-[10px] text-pixel-sun">
            {initialsFor(user.name)}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-pixel-line">
              {user.name}
              <span
                className={cn(
                  "inline-flex items-center gap-1 border border-pixel-line px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.04em]",
                  ROLE_STYLE[user.role],
                )}
              >
                {user.role === "admin" ? (
                  <ShieldCheck size={9} aria-hidden="true" />
                ) : user.role === "pj_daerah" ? (
                  <MapPin size={9} aria-hidden="true" />
                ) : (
                  <UserRound size={9} aria-hidden="true" />
                )}
                {USER_ROLE_LABEL[user.role]}
              </span>
              {isSelf ? (
                <span className="border border-pixel-line/40 bg-pixel-cream px-1.5 py-0.5 text-[8.5px] font-semibold text-pixel-ink/65">
                  Akun Anda
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] text-pixel-ink/65">
              {user.email || "Email tidak tersedia"}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9.5px] text-pixel-ink/60">
              <span className="inline-flex items-center gap-1">
                <MapPin size={9} aria-hidden="true" />
                {region ? region.name : "Semua wilayah"}
              </span>
              {user.createdAt ? (
                <span>Bergabung {formatDateLong(user.createdAt)}</span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-[150px_170px_auto] sm:items-end">
          <div>
            <label
              htmlFor={`role-${user.id}`}
              className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600"
            >
              Peran
            </label>
            <select
              id={`role-${user.id}`}
              value={role}
              disabled={isSelf || busy}
              onChange={(event) => {
                const next = event.target.value as UserRole;
                setRole(next);
                if (next === "pj_daerah" && regionId === "all") {
                  setRegionId(REGIONS[0]?.id ?? "all");
                }
              }}
              className="mt-1 h-9 w-full border-2 border-pixel-line bg-pixel-cream px-2 text-[10.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta disabled:opacity-60"
            >
              {(["warga", "pj_daerah", "admin"] as const).map((option) => (
                <option key={option} value={option}>
                  {USER_ROLE_LABEL[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`region-${user.id}`}
              className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600"
            >
              Wilayah tugas
            </label>
            <select
              id={`region-${user.id}`}
              value={regionId}
              disabled={isSelf || busy || role === "warga"}
              onChange={(event) => setRegionId(event.target.value)}
              className="mt-1 h-9 w-full border-2 border-pixel-line bg-pixel-cream px-2 text-[10.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta disabled:opacity-60"
            >
              <option value="all">Semua wilayah</option>
              {REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void onSave(user, role, regionId)}
            disabled={isSelf || busy || !dirty || invalid}
            className="inline-flex min-h-9 items-center justify-center gap-1 border-2 border-pixel-line bg-pixel-sun px-2.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <Loader2 size={10} className="animate-spin" aria-hidden="true" />
            ) : dirty ? (
              <Save size={10} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={10} aria-hidden="true" />
            )}
            {busy ? "Menyimpan…" : dirty ? "Simpan" : "Tersimpan"}
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t-2 border-pixel-line/15 pt-2">
        <p className="text-[9.5px] leading-relaxed text-pixel-ink/65">
          {USER_ROLE_HINT[role]}
        </p>
        {invalid ? (
          <p className="text-[9.5px] font-semibold text-rose-700">
            Pilih wilayah tugas untuk PJ daerah.
          </p>
        ) : null}
        {dirty && !invalid ? (
          <p className="text-[9.5px] font-semibold text-amber-800">
            Perubahan belum disimpan.
          </p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Direktori akun terdaftar.
 *
 * Hanya administrator yang dapat membuka panel ini. Peran disimpan di dokumen
 * profil dan ditegakkan oleh aturan Firestore; perubahan berlaku setelah
 * pengguna memuat ulang halaman atau masuk kembali.
 */
export function UserDirectory({
  users,
  currentUserId,
  busyId,
  error,
  onDismissError,
  onSave,
}: UserDirectoryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: users.length,
      admin: 0,
      pj_daerah: 0,
      warga: 0,
    };
    users.forEach((user) => {
      base[user.role] += 1;
    });
    return base;
  }, [users]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      if (filter !== "all" && user.role !== filter) return false;
      if (normalized.length === 0) return true;
      const region = user.regionId === "all" ? "" : getRegion(user.regionId)?.name ?? "";
      return [user.name, user.email, region, USER_ROLE_LABEL[user.role]]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [users, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-4 border-pixel-line bg-white p-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            <Users size={12} aria-hidden="true" />
            Pengguna terdaftar
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
            {formatNumber(users.length)} akun tersinkron di koleksi profil. Ubah
            peran dan wilayah tugas, lalu simpan.
          </p>
        </div>
        <label className="relative block w-full sm:w-[300px]">
          <span className="sr-only">Cari pengguna</span>
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/60"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, email, wilayah…"
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
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
            busy={busyId === user.id}
            onSave={onSave}
          />
        ))}

        {filtered.length === 0 ? (
          <div className="border-4 border-dashed border-pixel-line/45 bg-white px-5 py-12 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
              <Users size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
              {users.length === 0 ? "Belum ada pengguna" : "Tidak ada pengguna yang cocok"}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[10.5px] leading-relaxed text-pixel-ink/70">
              {users.length === 0
                ? "Akun yang mendaftar akan muncul di sini setelah profilnya tersimpan."
                : "Ubah kata kunci atau pilih peran lain untuk melihat pengguna."}
            </p>
          </div>
        ) : null}
      </div>

      <p className="mt-4 border-2 border-pixel-line/30 bg-pixel-panel px-3 py-2 text-[9.5px] leading-relaxed text-pixel-ink/70">
        Perubahan peran berlaku setelah pengguna memuat ulang halaman atau masuk
        kembali. Administrator pertama tetap memakai custom claim Firebase Auth.
      </p>
    </div>
  );
}
