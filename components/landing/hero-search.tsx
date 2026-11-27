"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, Wallet } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { PROJECTS, REGIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Jembatan Krajan", query: "Jembatan" },
  { label: "Drainase Merpati", query: "Drainase" },
  { label: "Puskesmas", query: "Puskesmas" },
  { label: "PJU Tenaga Surya", query: "PJU" },
];

const VIEWPORT_MARGIN = 8;
const ESTIMATED_HEIGHT = 380;

interface SearchPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
}

/**
 * Project search styled as a pixel field with a stepped result board.
 *
 * The result board is portalled to `document.body` so the hero's
 * `overflow-hidden` (used to contain the pixel landscape) cannot clip it.
 */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<SearchPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Escape closes the board and returns focus to the input. Without this guard
  // the input's onFocus handler immediately reopens it.
  const suppressFocusOpenRef = useRef(false);
  const listboxId = useId();

  const normalized = query.trim().toLowerCase();
  const shouldRender = open && normalized.length >= 2;

  const updatePosition = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const rect = form.getBoundingClientRect();
    const width = Math.min(rect.width, window.innerWidth - VIEWPORT_MARGIN * 2);
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN),
    );
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const placement: SearchPosition["placement"] =
      spaceBelow < Math.min(ESTIMATED_HEIGHT, 300) && spaceAbove > spaceBelow
        ? "top"
        : "bottom";
    const available = placement === "bottom" ? spaceBelow : spaceAbove;
    const maxHeight = Math.max(120, Math.min(420, available));

    setPosition(
      placement === "bottom"
        ? { top: rect.bottom + VIEWPORT_MARGIN, left, width, maxHeight, placement }
        : {
            bottom: window.innerHeight - rect.top + VIEWPORT_MARGIN,
            left,
            width,
            maxHeight,
            placement,
          },
    );
  }, []);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    updatePosition();
    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [shouldRender, query, updatePosition]);

  const focusFirstResult = () => {
    const panel = panelRef.current;
    if (!panel) return;
    const target =
      panel.querySelector<HTMLElement>('[role="option"]') ??
      panel.querySelector<HTMLElement>("button");
    target?.focus({ preventScroll: true });
  };

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(`/proyek?q=${encodeURIComponent(trimmed)}`);
  };

  const closeAndRestoreFocus = () => {
    setOpen(false);
    suppressFocusOpenRef.current = true;
    inputRef.current?.focus({ preventScroll: true });
    window.requestAnimationFrame(() => {
      suppressFocusOpenRef.current = false;
    });
  };

  const results =
    normalized.length >= 2
      ? PROJECTS.filter((project) => {
          const region = REGIONS.find((item) => item.id === project.regionId);
          return [
            project.name,
            project.category,
            project.location.district,
            project.location.address,
            project.vendor,
            region?.name ?? "",
            region?.city ?? "",
            region?.province ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized);
        }).slice(0, 5)
      : [];

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[role="option"], button',
      ) ?? [],
    );
    if (items.length === 0) return;

    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next = current;

    if (event.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % items.length;
    if (event.key === "ArrowUp") next = current <= 0 ? items.length - 1 : current - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;

    items[next]?.focus({ preventScroll: true });
  };

  return (
    <div ref={wrapperRef} className="relative mt-7 max-w-xl">
      <form
        ref={formRef}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-2 border-4 border-pixel-line bg-white p-1.5 pl-3 shadow-card"
      >
        <Search size={17} className="shrink-0 text-pixel-line" aria-hidden="true" />
        <label htmlFor="hero-search" className="sr-only">
          Cari proyek atau wilayah
        </label>
        <input
          ref={inputRef}
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (!suppressFocusOpenRef.current) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (event.key === "ArrowDown" && shouldRender) {
              event.preventDefault();
              focusFirstResult();
            }
          }}
          placeholder="Cari proyek, kelurahan, atau desa…"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={shouldRender}
          aria-controls={listboxId}
          className="h-11 min-w-0 flex-1 bg-transparent text-[13.5px] text-pixel-line outline-none placeholder:text-ink-500 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          className="btn-primary h-11 shrink-0 px-3 py-0 text-[9px] sm:px-4"
          aria-label="Cari proyek"
        >
          <span className="hidden sm:inline">Cari</span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </form>

      {shouldRender && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              id={listboxId}
              role="listbox"
              aria-label="Hasil pencarian proyek"
              onKeyDown={handlePanelKeyDown}
              style={{
                position: "fixed",
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                zIndex: 120,
                ...(position.placement === "bottom"
                  ? { top: position.top }
                  : { bottom: position.bottom }),
              }}
              className="overflow-y-auto border-4 border-pixel-line bg-white shadow-card animate-fade-in"
            >
              {results.length > 0 ? (
                <>
                  <p className="border-b-[3px] border-pixel-line bg-pixel-panel px-3 py-2 font-pixel text-[8px] uppercase tracking-[0.04em] text-pixel-line">
                    {results.length} proyek ditemukan
                  </p>
                  <div className="p-1.5">
                    {results.map((project) => {
                      const region = REGIONS.find((item) => item.id === project.regionId);
                      return (
                        <Link
                          key={project.id}
                          href={`/proyek/${project.id}`}
                          role="option"
                          aria-selected={false}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-pixel-sun/40"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                            <Wallet size={15} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-pixel-line">
                              {project.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-pixel-ink/70">
                              <MapPin size={10} aria-hidden="true" />
                              {region?.name} · {project.category}
                            </span>
                          </span>
                          <ArrowRight
                            size={13}
                            className="shrink-0 text-pixel-line/40"
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => submit(query)}
                      className="mt-1 flex min-h-10 w-full items-center justify-center gap-1.5 border-2 border-pixel-line bg-pixel-cream px-3 py-2 text-[11.5px] font-semibold text-pixel-line transition-colors hover:bg-pixel-sun"
                    >
                      Lihat semua hasil untuk “{query.trim()}”
                      <ArrowRight size={12} aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-[12.5px] font-semibold text-pixel-line">
                    Belum ada hasil untuk “{query.trim()}”
                  </p>
                  <p className="mt-1.5 text-[11px] text-pixel-ink/75">
                    Coba kata kunci seperti “jalan”, “drainase”, atau nama desa.
                  </p>
                </div>
              )}
            </div>,
            document.body,
          )
        : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-pixel text-[7.5px] uppercase text-pixel-line/70">Coba:</span>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => {
              setQuery(link.query);
              submit(link.query);
            }}
            className={cn(
              "inline-flex min-h-9 items-center border-2 border-pixel-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5 hover:bg-pixel-sun",
            )}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}