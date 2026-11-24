"use client";

import { Check, ChevronDown, Globe2, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { REGIONS } from "@/lib/data";
import { useRegion } from "@/components/providers/region-provider";
import { cn, formatCompactIDR } from "@/lib/utils";

interface RegionPickerProps {
  variant?: "light" | "dark" | "inline";
  className?: string;
  align?: "left" | "right";
  label?: string;
}

export function RegionPicker({
  variant = "light",
  className,
  align = "right",
  label = "Wilayah pantau",
}: RegionPickerProps) {
  const { activeRegionId, setActiveRegionId, summary } = useRegion();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isDark = variant === "dark";
  const activeLabel = activeRegionId === "all" ? "Semua Wilayah" : summary.name;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`${label}: ${activeLabel}. Ubah wilayah`}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
          isDark
            ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50",
          variant === "inline" && "border-transparent bg-transparent hover:bg-ink-100",
        )}
      >
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
            isDark ? "bg-white/10 text-amber-400" : "bg-amber-50 text-amber-600",
          )}
        >
          {activeRegionId === "all" ? <Globe2 size={16} /> : <MapPin size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[10px] font-semibold uppercase tracking-[0.12em]",
              isDark ? "text-ink-300" : "text-ink-400",
            )}
          >
            {label}
          </span>
          <span className="block truncate text-[13px] font-semibold">{activeLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 transition-transform duration-200",
            open && "rotate-180",
            isDark ? "text-ink-300" : "text-ink-400",
          )}
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Pilih wilayah pantau"
          className={cn(
            "absolute z-50 mt-2 w-[19rem] overflow-hidden rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lifted animate-fade-in",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">
            Cakupan data
          </p>
          <button
            type="button"
            role="option"
            aria-selected={activeRegionId === "all"}
            onClick={() => {
              setActiveRegionId("all");
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
              activeRegionId === "all" ? "bg-amber-50" : "hover:bg-ink-50",
            )}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-amber-400">
              <Globe2 size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-900">
                Semua Wilayah
              </span>
              <span className="block text-[11px] text-ink-500">
                Agregat nasional · 3 wilayah percontohan
              </span>
            </span>
            {activeRegionId === "all" ? (
              <Check size={16} className="shrink-0 text-amber-600" />
            ) : null}
          </button>

          <div className="my-1.5 h-px bg-ink-100" />

          {REGIONS.map((region) => {
            const isActive = region.id === activeRegionId;
            return (
              <button
                key={region.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setActiveRegionId(region.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                  isActive ? "bg-amber-50" : "hover:bg-ink-50",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg",
                    isActive ? "bg-amber-500 text-white" : "bg-ink-100 text-ink-600",
                  )}
                >
                  <MapPin size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink-900">
                      {region.name}
                    </span>
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-500">
                      {region.level}
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-ink-500">
                    {region.city} · {formatCompactIDR(region.totalBudget)}
                  </span>
                </span>
                {isActive ? (
                  <Check size={16} className="shrink-0 text-amber-600" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
