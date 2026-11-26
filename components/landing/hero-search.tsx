"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, Wallet } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { PROJECTS, REGIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Jembatan Krajan", query: "Jembatan" },
  { label: "Drainase Merpati", query: "Drainase" },
  { label: "Puskesmas", query: "Puskesmas" },
  { label: "PJU Tenaga Surya", query: "PJU" },
];

/**
 * Project search styled as a pixel field with a stepped result board.
 * Behaviour, routing and listbox semantics are unchanged.
 */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  const normalized = query.trim().toLowerCase();

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

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(`/proyek?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={wrapperRef} className="relative mt-7 max-w-xl">
      <form
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
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Cari proyek, kelurahan, atau desa…"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
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

      {open && normalized.length >= 2 ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Hasil pencarian proyek"
          className="absolute z-30 mt-2 w-full border-4 border-pixel-line bg-white shadow-card animate-fade-in"
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
        </div>
      ) : null}

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
