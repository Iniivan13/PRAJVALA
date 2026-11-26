"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { RegionPicker } from "@/components/ui/region-picker";
import { SpriteArrowRight, SpriteChevronDown, SpriteClose } from "@/components/ui/pixel-sprites";
import { cn, initialsFor } from "@/lib/utils";

/**
 * Desktop header: horizontal pixel navigation, no hamburger at any breakpoint.
 *
 * Below `lg` the link row is removed entirely — navigation moves to the fixed
 * five-item bottom bar (components/layout/mobile-bottom-nav.tsx).
 */
export const PRIMARY_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/anggaran", label: "Anggaran" },
  { href: "/proyek", label: "Proyek" },
  { href: "/laporan", label: "Laporan" },
  { href: "/informasi", label: "Informasi" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, isHydrated, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

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

  return (
    <header className="sticky top-0 z-40 border-b-4 border-pixel-line bg-pixel-panel">
      {/* Thin pixel accent rail replaces the old SaaS utility bar. */}
      <div className="h-2 border-b-[3px] border-pixel-line bg-pixel-sun" aria-hidden="true" />

      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 p-1 focus-visible:outline-offset-4"
          aria-label="PRAJVALA — kembali ke beranda"
        >
          <Logo />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {PRIMARY_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-9 items-center border-[3px] border-pixel-line px-2.5 py-1.5 font-pixel text-[9px] uppercase leading-none transition-transform duration-100",
                      active
                        ? "bg-pixel-sun text-pixel-line shadow-chip"
                        : "bg-white text-pixel-line hover:-translate-y-0.5 hover:bg-pixel-sun/60",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <RegionPicker className="hidden w-[196px] xl:block" label="Wilayah" />

          {!isHydrated ? (
            <span
              aria-hidden="true"
              className="hidden h-10 w-[92px] border-[3px] border-pixel-line bg-pixel-panel-dark lg:block"
            />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((previous) => !previous)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label={`Menu akun ${user.name}`}
                className="flex min-h-10 items-center gap-2 border-[3px] border-pixel-line bg-white pl-1 pr-2 font-pixel text-[9px] uppercase text-pixel-line shadow-chip transition-transform duration-100 hover:-translate-y-0.5"
              >
                <span className="grid h-7 w-7 place-items-center bg-pixel-line text-[9px] text-pixel-sun">
                  {initialsFor(user.name)}
                </span>
                <span className="hidden max-w-[84px] truncate sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <SpriteChevronDown
                  size={12}
                  className={cn(
                    "text-pixel-line transition-transform",
                    accountOpen && "rotate-180",
                  )}
                />
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  aria-label="Menu akun warga"
                  className="absolute right-0 top-full z-50 mt-2 w-[248px] border-4 border-pixel-line bg-white shadow-card"
                >
                  <div className="flex items-center gap-2.5 border-b-4 border-pixel-line bg-pixel-panel px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center bg-pixel-line text-[10px] font-bold text-pixel-sun">
                      {initialsFor(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-pixel-line">
                        {user.name}
                      </p>
                      <p className="truncate text-[10.5px] text-ink-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/akun"
                      role="menuitem"
                      className="flex min-h-9 items-center gap-2 px-2 py-1.5 text-[12px] font-semibold text-pixel-line hover:bg-pixel-sun"
                    >
                      Akun saya
                    </Link>
                    <Link
                      href="/laporan"
                      role="menuitem"
                      className="flex min-h-9 items-center gap-2 px-2 py-1.5 text-[12px] font-semibold text-pixel-line hover:bg-pixel-sun"
                    >
                      Laporan saya
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                      className="flex min-h-9 w-full items-center gap-2 px-2 py-1.5 text-left text-[12px] font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Keluar dari akun
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex min-h-10 items-center gap-1.5 border-[3px] border-pixel-line bg-white px-3 font-pixel text-[9px] uppercase text-pixel-line shadow-chip transition-transform duration-100 hover:-translate-y-0.5 hover:bg-pixel-sun"
            >
              Masuk
              <SpriteArrowRight size={11} className="text-pixel-line" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/** Shared close affordance for pixel dialogs and sheets. */
export function PixelCloseButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center border-[3px] border-pixel-line bg-white text-pixel-line shadow-chip transition-transform duration-100 hover:bg-pixel-sun active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        className,
      )}
    >
      <SpriteClose size={14} />
    </button>
  );
}
