"use client";

import { Check, Globe2, MapPin } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
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

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
}

const DROPDOWN_WIDTH = 304; // 19rem
const VIEWPORT_MARGIN = 8;
const ESTIMATED_HEIGHT = 300;

/**
 * Region selector styled as a pixel field with a stepped dropdown.
 *
 * The listbox is rendered in a portal on `document.body` and positioned with
 * `position: fixed`. That keeps it above sibling panels that create their own
 * stacking context (for example the `Reveal` wrappers on the homepage) and
 * prevents clipping by `overflow-hidden`/scroll containers such as the mobile
 * bottom sheet.
 */
export function RegionPicker({
  variant = "light",
  className,
  align = "right",
  label = "Wilayah pantau",
}: RegionPickerProps) {
  const { activeRegionId, setActiveRegionId, summary } = useRegion();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const updatePosition = useCallback(() => {
    const trigger = buttonRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    // Match the trigger width once it is wider than the design width (mobile
    // sheet / full-width hero actions), otherwise keep the compact 19rem board.
    const width = Math.min(
      Math.max(rect.width, DROPDOWN_WIDTH),
      window.innerWidth - VIEWPORT_MARGIN * 2,
    );
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const placement: DropdownPosition["placement"] =
      spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow ? "top" : "bottom";

    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN),
    );

    setPosition(
      placement === "bottom"
        ? { top: rect.bottom + VIEWPORT_MARGIN, left, width, placement }
        : {
            bottom: window.innerHeight - rect.top + VIEWPORT_MARGIN,
            left,
            width,
            placement,
          },
    );
  }, [align]);

  const focusSelectedOption = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const target =
      panel.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ??
      panel.querySelector<HTMLElement>('[role="option"]');
    target?.focus({ preventScroll: true });
  }, []);

  const openDropdown = useCallback(() => {
    updatePosition();
    setOpen(true);
    window.requestAnimationFrame(focusSelectedOption);
  }, [focusSelectedOption, updatePosition]);

  const closeDropdown = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown(true);
      }
    };
    const handleViewportChange = () => updatePosition();

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleViewportChange);
    // Capture scroll events from any scroll container, including the mobile sheet.
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, closeDropdown, updatePosition]);

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
        [],
    );
    if (options.length === 0) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;

    if (event.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % options.length;
    if (event.key === "ArrowUp") next = current <= 0 ? options.length - 1 : current - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;

    options[next]?.focus({ preventScroll: true });
  };

  const selectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    closeDropdown(true);
  };

  const isDark = variant === "dark";
  const activeLabel = activeRegionId === "all" ? "Semua Wilayah" : summary.name;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeDropdown(true) : openDropdown())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openDropdown();
          }
        }}
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

      {open && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              id={listboxId}
              role="listbox"
              aria-label="Pilih wilayah pantau"
              onKeyDown={handleListKeyDown}
              style={{
                position: "fixed",
                left: position.left,
                width: position.width,
                zIndex: 130,
                maxHeight: "min(60vh, 20rem)",
                ...(position.placement === "bottom"
                  ? { top: position.top }
                  : { bottom: position.bottom }),
              }}
              className="overflow-y-auto border-4 border-pixel-line bg-white shadow-card animate-pop-in"
            >
              <p className="border-b-[3px] border-pixel-line bg-pixel-panel px-3 py-2 font-pixel text-[8px] uppercase tracking-[0.08em] text-pixel-line">
                Pilih wilayah pantau
              </p>
              <div className="p-1.5">
                <button
                  type="button"
                  role="option"
                  aria-selected={activeRegionId === "all"}
                  onClick={() => selectRegion("all")}
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
                      onClick={() => selectRegion(region.id)}
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}