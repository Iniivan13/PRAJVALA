"use client";

import { Check, Globe2, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { REGIONS } from "@/lib/data";
import { useRegion } from "@/components/providers/region-provider";
import { SpriteChevronDown } from "@/components/ui/pixel-sprites";
import { cn } from "@/lib/utils";

interface RegionPickerProps {
  variant?: "light" | "dark" | "inline";
  className?: string;
  align?: "left" | "right";
  label?: string;
}

/**
 * Region selector styled as a pixel field with a stepped dropdown.
 * Behaviour, keyboard support and ARIA semantics are unchanged.
 */
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
          "flex w-full min-h-10 items-center gap-2 border-[3px] border-pixel-line px-2 py-1.5 text-left shadow-chip transition-transform duration-100",
          isDark ? "bg-pixel-wood-darker" : "bg-white",
          "hover:-translate-y-0.5",
        )}
      >
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center border-2 border-pixel-line",
            isDark ? "bg-pixel-sun text-pixel-line" : "bg-pixel-sun text-pixel-line",
          )}
          aria-hidden="true"
        >
          {activeRegionId === "all" ? <Globe2 size={12} /> : <MapPin size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-pixel text-[7.5px] uppercase leading-none tracking-[0.08em]",
              isDark ? "text-pixel-panel" : "text-ink-600",
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              "mt-1 block truncate text-[12px] font-semibold",
              isDark ? "text-pixel-cream" : "text-pixel-line",
            )}
          >
            {activeLabel}
          </span>
        </span>
        <SpriteChevronDown
          size={12}
          className={cn(
            "shrink-0 transition-transform",
            isDark ? "text-pixel-panel" : "text-pixel-line",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Pilih wilayah pantau"
          className={cn(
            "absolute z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] border-4 border-pixel-line bg-white shadow-card animate-pop-in",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="border-b-[3px] border-pixel-line bg-pixel-panel px-3 py-2 font-pixel text-[8px] uppercase tracking-[0.08em] text-pixel-line">
            Pilih wilayah pantau
          </p>
          <div className="max-h-[60vh] overflow-y-auto p-1.5">
            <button
              type="button"
              role="option"
              aria-selected={activeRegionId === "all"}
              onClick={() => {
                setActiveRegionId("all");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-2 text-left transition-colors",
                activeRegionId === "all" ? "bg-pixel-sun" : "hover:bg-pixel-cream",
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center border-2 border-pixel-line bg-white text-pixel-line">
                <Globe2 size={12} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold text-pixel-line">
                  Semua wilayah
                </span>
                <span className="block text-[10px] text-ink-600">
                  Agregat tiga wilayah percontohan
                </span>
              </span>
              {activeRegionId === "all" ? (
                <Check size={13} className="shrink-0 text-pixel-line" aria-hidden="true" />
              ) : null}
            </button>

            {REGIONS.map((region) => {
              const active = activeRegionId === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setActiveRegionId(region.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-2 py-2 text-left transition-colors",
                    active ? "bg-pixel-sun" : "hover:bg-pixel-cream",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center border-2 border-pixel-line bg-white text-pixel-line">
                    <MapPin size={12} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-pixel-line">
                      {region.name}
                    </span>
                    <span className="block truncate text-[10px] text-ink-600">
                      {region.level} · {region.city}
                    </span>
                  </span>
                  {active ? (
                    <Check size={13} className="shrink-0 text-pixel-line" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
