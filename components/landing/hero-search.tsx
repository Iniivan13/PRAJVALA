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

  const results = normalized.length >= 2
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
        className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white p-1.5 pl-4 shadow-soft transition-shadow focus-within:border-ink-300 focus-within:shadow-lifted"
      >
        <Search size={18} className="shrink-0 text-ink-400" aria-hidden="true" />
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
          className="h-11 min-w-0 flex-1 bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          className="btn-primary h-11 shrink-0 px-4 py-0 text-[13px] sm:px-5"
          aria-label="Cari proyek"
        >
          <span className="hidden sm:inline">Cari</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      {open && normalized.length >= 2 ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Hasil pencarian proyek"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lifted animate-fade-in"
        >
          {results.length > 0 ? (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                {results.length} proyek ditemukan
              </p>
              {results.map((project) => {
                const region = REGIONS.find((item) => item.id === project.regionId);
                return (
                  <Link
                    key={project.id}
                    href={`/proyek/${project.id}`}
                    role="option"
                    aria-selected={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-ink-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                      <Wallet size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink-900">
                        {project.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-ink-400">
                        <MapPin size={10} aria-hidden="true" />
                        {region?.name} · {project.category}
                      </span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-ink-300" aria-hidden="true" />
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => submit(query)}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-200 px-3 py-2.5 text-[11.5px] font-semibold text-ink-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                Lihat semua hasil untuk “{query.trim()}”
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-[12.5px] font-semibold text-ink-700">
                Belum ada hasil untuk “{query.trim()}”
              </p>
              <p className="mt-1 text-[11px] text-ink-400">
                Coba kata kunci seperti “jalan”, “drainase”, atau nama desa.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10.5px] font-medium text-ink-400">Coba:</span>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => {
              setQuery(link.query);
              submit(link.query);
            }}
            className={cn(
              "rounded-full border border-ink-200 bg-white/70 px-2.5 py-1 text-[10.5px] font-medium text-ink-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",
            )}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
