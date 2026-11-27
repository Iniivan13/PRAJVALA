"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { RegionPicker } from "@/components/ui/region-picker";
import {
  SpriteAccount,
  SpriteBudget,
  SpriteClose,
  SpriteCrest,
  SpriteDocument,
  SpriteHelp,
  SpriteHome,
  SpriteJournal,
  SpriteMore,
  SpriteQuest,
  SpriteReport,
} from "@/components/ui/pixel-sprites";
import { useAuth } from "@/components/providers/auth-provider";
import { cn, initialsFor } from "@/lib/utils";

/**
 * Fixed five-item mobile navigation.
 *
 * Deliberately not a hamburger: every primary destination keeps an icon and a
 * visible label, and secondary routes live in a pixel bottom sheet behind
 * "Lainnya" (DESIGN.md §6).
 */
const ITEMS = [
  { href: "/", label: "Beranda", Sprite: SpriteHome },
  { href: "/anggaran", label: "Anggaran", Sprite: SpriteBudget },
  { href: "/proyek", label: "Proyek", Sprite: SpriteQuest },
  { href: "/laporan", label: "Laporan", Sprite: SpriteReport },
] as const;

const MORE_LINKS = [
  { href: "/informasi#dokumen", label: "Dokumen publik", note: "APBD, RAB, LPJ", Sprite: SpriteDocument },
  { href: "/write-up", label: "Write Up", note: "Jurnal & panduan", Sprite: SpriteJournal },
  { href: "/informasi#faq", label: "Pertanyaan umum", note: "6 jawaban singkat", Sprite: SpriteHelp },
  { href: "/informasi#glosarium", label: "Glosarium", note: "Istilah anggaran", Sprite: SpriteDocument },
  { href: "/akun", label: "Akun saya", note: "Profil & kontribusi", Sprite: SpriteAccount },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isHydrated, isAdmin, isModerator, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const moreLinks = isModerator
    ? [
        {
          href: "/admin",
          label: isAdmin ? "Panel admin" : "Panel daerah",
          note: isAdmin ? "Moderasi, pengguna & bukti" : "Moderasi wilayah tugas",
          Sprite: SpriteCrest,
        },
        ...MORE_LINKS,
      ]
    : MORE_LINKS;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Close the sheet whenever the route changes.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Lock scroll, handle Escape, and move focus into the sheet while open.
  useEffect(() => {
    if (!moreOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstFocusable = sheetRef.current?.querySelector<HTMLElement>(
      "a, button, [tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Let an open region-picker listbox handle Escape first; a second
        // Escape then closes the sheet itself.
        if (document.querySelector('[role="listbox"]')) return;
        setMoreOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const listbox = document.querySelector('[role="listbox"]');
      const focusables = [
        ...sheetRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
        ...(listbox?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        ) ?? []),
      ];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  return (
    <>
      {/* ---------- Bottom bar: mobile and tablet only ---------- */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-pixel-line bg-pixel-panel safe-bottom lg:hidden"
      >
        <ul className="flex items-stretch">
          {ITEMS.map((item) => {
            const active = isActive(item.href);
            const Sprite = item.Sprite;
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 min-h-11 flex-col items-center justify-center gap-1 px-0.5 transition-colors",
                    active
                      ? "bg-pixel-sun text-pixel-line"
                      : "text-pixel-line hover:bg-white",
                  )}
                >
                  <Sprite size={20} className="shrink-0" />
                  <span className="w-full truncate text-center font-pixel text-[7px] uppercase leading-none tracking-[0.02em]">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1 w-6",
                      active ? "bg-pixel-line" : "bg-transparent",
                    )}
                  />
                </Link>
              </li>
            );
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-controls={panelId}
              className={cn(
                "flex h-16 w-full min-h-11 flex-col items-center justify-center gap-1 px-0.5 transition-colors",
                moreOpen ? "bg-pixel-sun text-pixel-line" : "text-pixel-line hover:bg-white",
              )}
            >
              <SpriteMore size={20} className="shrink-0" />
              <span className="w-full truncate text-center font-pixel text-[7px] uppercase leading-none tracking-[0.02em]">
                Lainnya
              </span>
              <span
                aria-hidden="true"
                className={cn("h-1 w-6", moreOpen ? "bg-pixel-line" : "bg-transparent")}
              />
            </button>
          </li>
        </ul>
      </nav>

      {/* ---------- More sheet ---------- */}
      {moreOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu lainnya"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 h-full w-full bg-pixel-line/60"
          />
          <div
            ref={sheetRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto border-t-4 border-pixel-line bg-pixel-cream pb-[calc(1rem+env(safe-area-inset-bottom,0px))] animate-sheet-up"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-4 border-pixel-line bg-pixel-panel px-4 py-3">
              <div className="min-w-0">
                <p className="font-pixel text-[8px] uppercase tracking-[0.08em] text-ink-600">
                  Menu lainnya
                </p>
                <h2
                  id={`${panelId}-title`}
                  className="mt-1 font-pixel text-[11px] uppercase text-pixel-line"
                >
                  Jelajahi PRAJVALA
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Tutup menu"
                className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-pixel-line bg-white text-pixel-line shadow-chip active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <SpriteClose size={16} />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <RegionPicker label="Wilayah pantau" align="left" className="w-full" />

              {isHydrated ? (
                user ? (
                  <div className="border-[3px] border-pixel-line bg-white p-3 shadow-chip">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-line font-pixel text-[9px] text-pixel-sun">
                        {initialsFor(user.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-pixel-line">
                          {user.name}
                        </p>
                        <p className="truncate text-[11px] text-ink-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMoreOpen(false);
                      }}
                      className="mt-2.5 flex min-h-10 w-full items-center justify-center border-[3px] border-pixel-line bg-rose-50 px-3 font-pixel text-[8px] uppercase text-rose-700 shadow-chip"
                    >
                      Keluar dari akun
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/masuk"
                      className="flex min-h-11 items-center justify-center border-[3px] border-pixel-line bg-white px-3 font-pixel text-[8px] uppercase text-pixel-line shadow-chip"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/daftar"
                      className="flex min-h-11 items-center justify-center border-[3px] border-pixel-line bg-pixel-sun px-3 font-pixel text-[8px] uppercase text-pixel-line shadow-chip"
                    >
                      Daftar
                    </Link>
                  </div>
                )
              ) : null}

              <ul className="grid gap-2">
                {moreLinks.map((link) => {
                  const Sprite = link.Sprite;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex min-h-14 items-center gap-3 border-[3px] border-pixel-line bg-white px-3 py-2.5 shadow-chip transition-colors hover:bg-pixel-sun/40"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-panel text-pixel-line">
                          <Sprite size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-pixel-line">
                            {link.label}
                          </span>
                          <span className="block truncate text-[11px] text-ink-600">
                            {link.note}
                          </span>
                        </span>
                        <span aria-hidden="true" className="font-pixel text-[9px] text-pixel-line">
                          &gt;
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
