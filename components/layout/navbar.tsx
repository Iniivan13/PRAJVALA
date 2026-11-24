"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { RegionPicker } from "@/components/ui/region-picker";
import { cn, initialsFor } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/anggaran", label: "Anggaran" },
  { href: "/proyek", label: "Peta Proyek" },
  { href: "/informasi", label: "Informasi Publik" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isHydrated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <div className="bg-ink-900 text-white">
        <div className="container-page flex h-8 items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-[10.5px] font-medium text-white/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Pemantauan anggaran tahun 2026 aktif
          </p>
          <p className="hidden items-center gap-1.5 text-[10.5px] font-medium text-white/45 sm:flex">
            <ShieldCheck size={12} className="text-amber-400" aria-hidden="true" />
            Data demonstrasi · Techcomfest 2027
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/95 backdrop-blur-xl">
        <div className="container-page flex h-[70px] items-center justify-between gap-5">
          <Link
            href="/"
            className="shrink-0 rounded-lg focus-visible:outline-offset-4"
            aria-label="PRAJVALA — kembali ke beranda"
          >
            <Logo />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "text-ink-900"
                          : "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
                      )}
                    >
                      {link.label}
                      {active ? (
                        <span
                          className="absolute inset-x-3.5 -bottom-[19px] h-[2px] rounded-full bg-amber-500"
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <RegionPicker className="hidden w-[218px] xl:block" label="Wilayah" />
            <Link
              href="/anggaran"
              className="btn-primary hidden h-10 px-4 py-0 text-[13px] md:inline-flex"
            >
              Pantau Anggaran
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>

            {!isHydrated ? (
              <span
                className="hidden h-10 w-[104px] animate-pulse rounded-xl bg-ink-100 md:block"
                aria-hidden="true"
              />
            ) : user ? (
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((previous) => !previous)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label={`Menu akun ${user.name}`}
                  className="flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white pl-1.5 pr-2.5 text-[12.5px] font-semibold text-ink-800 transition-colors hover:border-ink-300 hover:bg-ink-50"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-900 text-[10.5px] font-bold text-amber-400">
                    {initialsFor(user.name)}
                  </span>
                  <span className="max-w-[92px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-ink-400 transition-transform",
                      accountOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {accountOpen ? (
                  <div
                    role="menu"
                    aria-label="Menu akun warga"
                    className="absolute right-0 top-full mt-2 w-[264px] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lifted"
                  >
                    <div className="flex items-center gap-2.5 border-b border-ink-100 bg-ink-50/60 px-4 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-amber-400">
                        {initialsFor(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-ink-900">
                          {user.name}
                        </p>
                        <p className="truncate text-[10px] text-ink-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/akun"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                      >
                        <LayoutDashboard size={14} className="text-ink-400" aria-hidden="true" />
                        Akun saya
                      </Link>
                      <Link
                        href="/proyek"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                      >
                        <UserRound size={14} className="text-ink-400" aria-hidden="true" />
                        Jelajahi proyek
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <LogOut size={14} aria-hidden="true" />
                        Keluar dari akun
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/masuk"
                className="hidden h-10 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 text-[12.5px] font-semibold text-ink-800 transition-colors hover:border-ink-300 hover:bg-ink-50 md:inline-flex"
              >
                <LogIn size={14} className="text-ink-500" aria-hidden="true" />
                Masuk
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="menu-mobile"
            className="absolute inset-x-0 top-full h-[calc(100dvh-70px)] overflow-y-auto border-b border-ink-200 bg-white shadow-lifted lg:hidden"
          >
            <div className="container-page space-y-4 py-5">
              <RegionPicker label="Wilayah pantau" align="left" className="w-full" />

              {isHydrated ? (
                user ? (
                  <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-900 text-[12px] font-bold text-amber-400">
                        {initialsFor(user.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-ink-900">
                          {user.name}
                        </p>
                        <p className="truncate text-[10.5px] text-ink-500">{user.email}</p>
                      </div>
                      <Link
                        href="/akun"
                        className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-navy shadow-sm"
                      >
                        Akun saya
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut size={13} aria-hidden="true" />
                      Keluar dari akun
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/masuk" className="btn-secondary h-10 px-3 py-0 text-[12px]">
                      <LogIn size={14} aria-hidden="true" />
                      Masuk
                    </Link>
                    <Link href="/daftar" className="btn-primary h-10 px-3 py-0 text-[12px]">
                      <UserRound size={14} aria-hidden="true" />
                      Daftar
                    </Link>
                  </div>
                )
              ) : null}

              <nav aria-label="Navigasi seluler">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-amber-50 text-ink-900"
                              : "text-ink-600 hover:bg-ink-50",
                          )}
                        >
                          {link.label}
                          {active ? (
                            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                          ) : (
                            <ArrowUpRight size={15} className="text-ink-300" aria-hidden="true" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <Link href="/anggaran" className="btn-primary w-full">
                Mulai Pantau Anggaran
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
