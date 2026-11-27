"use client";

import { Download, ImageIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { PixelCloseButton } from "@/components/layout/navbar";
import { trapFocus } from "@/lib/focus-trap";

interface PhotoLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

/**
 * Penampil foto bukti ukuran penuh untuk moderator.
 *
 * Fokus dikunci di dalam dialog, Escape menutup, dan latar gulir dibekukan —
 * sama seperti dialog lain di aplikasi.
 */
export function PhotoLightbox({ src, alt, caption, onClose }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      trapFocus(dialogRef.current, event);
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[95]">
      <div
        className="fixed inset-0 bg-pixel-line/85 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Foto bukti laporan"
          tabIndex={-1}
          className="w-full max-w-4xl border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel"
        >
          <div className="flex items-center justify-between gap-3 border-b-4 border-pixel-line bg-pixel-panel px-3 py-2.5">
            <p className="flex min-w-0 items-center gap-2 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
              <ImageIcon size={12} aria-hidden="true" />
              <span className="truncate">Foto bukti</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={src}
                download="bukti-laporan.jpg"
                className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 py-0.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
              >
                <Download size={11} aria-hidden="true" />
                Unduh
              </a>
              <PixelCloseButton onClick={onClose} label="Tutup foto bukti" />
            </div>
          </div>

          <div className="border-[3px] border-t-0 border-pixel-line bg-pixel-line p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
            />
          </div>

          {caption ? (
            <p className="border-x-[3px] border-b-[3px] border-pixel-line bg-pixel-cream px-3 py-2 text-[10.5px] leading-relaxed text-pixel-ink/80">
              {caption}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
