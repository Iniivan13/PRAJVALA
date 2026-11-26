"use client";

import {
  CalendarDays,
  Download,
  FileText,
  Layers,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { PublicDocument } from "@/types";
import { downloadDocumentFile } from "@/lib/documents";
import { trapFocus } from "@/lib/focus-trap";
import { formatDateLong, formatNumber } from "@/lib/utils";

interface DocumentPreviewProps {
  doc: PublicDocument;
  regionName: string;
  onClose: () => void;
}

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
        className="fixed inset-0 bg-ink-950/65 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-preview-title"
          tabIndex={-1}
          className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-ink-200 bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-soft text-navy">
                <FileText size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-amber-600">
                  Pratinjau ringkasan
                </p>
                <h2
                  id="document-preview-title"
                  className="mt-0.5 font-display text-[15px] font-bold leading-snug text-ink-900"
                >
                  {doc.title}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-ink-500">
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
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
              aria-label="Tutup pratinjau dokumen"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Kategori
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold text-ink-800">
                  {doc.category}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Wilayah
                </p>
                <p className="mt-0.5 truncate text-[10.5px] font-semibold text-ink-800">
                  {regionName}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Tahun anggaran
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold text-ink-800">{doc.year}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-amber-700">
                Inti dokumen dalam 30 detik
              </p>
              <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-amber-900">
                {doc.highlight}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-[11px] font-bold text-ink-900">Ringkasan poin utama</h3>
              <ol className="mt-2 space-y-2.5">
                {doc.summaryPoints.map((point, index) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-soft text-[9.5px] font-bold text-navy">
                      {index + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed text-ink-600">{point}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/50 p-3.5">
              <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-500">
                <ShieldCheck size={10} className="text-emerald-600" aria-hidden="true" />
                Catatan keterbukaan
              </p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-ink-500">
                Ini adalah ringkasan percontohan untuk membantu warga memahami dokumen
                panjang. Pada implementasi penuh, tombol unduh akan mengarah ke dokumen
                resmi dengan tanda tangan digital dan jejak versi.
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary h-10 px-4 py-0 text-[11.5px]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => downloadDocumentFile(doc, regionName)}
                className="btn-primary h-10 px-4 py-0 text-[11.5px]"
              >
                <Download size={14} aria-hidden="true" />
                Unduh ringkasan (.txt)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
