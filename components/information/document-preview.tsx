"use client";

import {
  CalendarDays,
  Download,
  FileText,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { PublicDocument } from "@/types";
import { downloadDocumentFile } from "@/lib/documents";
import { trapFocus } from "@/lib/focus-trap";
import { PixelCloseButton } from "@/components/layout/navbar";
import { formatDateLong, formatNumber } from "@/lib/utils";

interface DocumentPreviewProps {
  doc: PublicDocument;
  regionName: string;
  onClose: () => void;
}

/**
 * Document summary dialog as a pixel window: wood chassis, cream interior, and
 * numbered plates for the summary points. Focus trap and Escape handling are
 * unchanged from the original behaviour.
 */
export function DocumentPreview({ doc, regionName, onClose }: DocumentPreviewProps) {
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
    <div className="fixed inset-0 z-[90]">
      <div
        className="fixed inset-0 bg-pixel-line/75 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <div className="w-full max-w-2xl border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-preview-title"
            tabIndex={-1}
            className="relative max-h-[90vh] overflow-y-auto border-[3px] border-pixel-line bg-pixel-cream"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b-4 border-pixel-line bg-pixel-panel px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                  <FileText size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                    Pratinjau ringkasan
                  </p>
                  <h2
                    id="document-preview-title"
                    className="mt-1 font-pixel text-[8.5px] uppercase leading-[1.8] text-pixel-line"
                  >
                    {doc.title}
                  </h2>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-pixel-ink/65">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={9} aria-hidden="true" />
                      {formatDateLong(doc.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers size={9} aria-hidden="true" />
                      {formatNumber(doc.pageCount)} halaman
                    </span>
                    <span>{doc.fileSize}</span>
                  </p>
                </div>
              </div>
              <PixelCloseButton onClick={onClose} label="Tutup pratinjau dokumen" />
            </div>

            <div className="px-3.5 py-4 sm:px-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Kategori", value: doc.category, mono: false },
                  { label: "Wilayah", value: regionName, mono: false },
                  { label: "Tahun anggaran", value: String(doc.year), mono: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="border-2 border-pixel-line/40 bg-white px-2.5 py-1.5"
                  >
                    <p className="font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                      {row.label}
                    </p>
                    <p
                      className={`mt-1 truncate text-[10.5px] font-semibold text-pixel-line ${
                        row.mono ? "font-mono" : ""
                      }`}
                    >
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-2 border-pixel-line bg-pixel-sun/45 p-3">
                <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-line">
                  Inti dokumen dalam 30 detik
                </p>
                <p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-pixel-line">
                  {doc.highlight}
                </p>
              </div>

              <div className="mt-3">
                <h3 className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                  Ringkasan poin utama
                </h3>
                <ol className="mt-2 space-y-2">
                  {doc.summaryPoints.map((point, index) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-line font-pixel text-[6.5px] leading-none text-pixel-sun">
                        {index + 1}
                      </span>
                      <p className="text-[10.5px] leading-relaxed text-pixel-ink/85">
                        {point}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-3 border-2 border-pixel-line/40 bg-white p-2.5">
                <p className="flex items-center gap-1.5 font-pixel text-[6px] uppercase leading-[1.7] text-ink-600">
                  <ShieldCheck size={10} className="text-emerald-700" aria-hidden="true" />
                  Catatan keterbukaan
                </p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-pixel-ink/75">
                  Ini adalah ringkasan percontohan untuk membantu warga memahami dokumen
                  panjang. Pada implementasi penuh, tombol unduh akan mengarah ke dokumen
                  resmi dengan tanda tangan digital dan jejak versi.
                </p>
              </div>

              <div className="mt-4 flex flex-col-reverse gap-2 border-t-2 border-pixel-line/25 pt-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => downloadDocumentFile(doc, regionName)}
                  className="btn-primary"
                >
                  <Download size={13} aria-hidden="true" />
                  Unduh ringkasan (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
