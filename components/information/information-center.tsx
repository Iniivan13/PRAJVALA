"use client";

import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentPreview } from "@/components/information/document-preview";
import { useRegion } from "@/components/providers/region-provider";
import { Reveal } from "@/components/ui/reveal";
import { getDocumentsForRegion, getRegion } from "@/lib/data";
import {
  downloadDocumentFile,
  downloadDocumentIndex,
} from "@/lib/documents";
import type { DocumentCategory, PublicDocument } from "@/types";
import {
  cn,
  formatDateLong,
  formatDateShort,
  formatNumber,
} from "@/lib/utils";

type CategoryFilter = DocumentCategory | "Semua";

const CATEGORIES: CategoryFilter[] = [
  "Semua",
  "APBD/APBDes",
  "RAB",
  "Tender",
  "LPJ",
  "Laporan Akhir",
];

const CATEGORY_STYLES: Record<DocumentCategory, string> = {
  "APBD/APBDes": "bg-navy-soft text-navy",
  RAB: "bg-amber-50 text-amber-800",
  Tender: "bg-sky-50 text-sky-800",
  LPJ: "bg-emerald-50 text-emerald-800",
  "Laporan Akhir": "bg-pixel-panel text-pixel-line",
};

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  "APBD/APBDes": FolderOpen,
  RAB: FileText,
  Tender: FileCheck2,
  LPJ: BookOpenCheck,
  "Laporan Akhir": Layers,
};

/**
 * Document repository as a trophy case: each document is a framed plate, and
 * the whole list sits on the paper band rather than a floating card grid.
 */
export function InformationCenter() {
  const { activeRegionId, activeRegion } = useRegion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Semua");
  const [previewDocument, setPreviewDocument] = useState<PublicDocument | null>(null);

  const regionName = activeRegion
    ? `${activeRegion.name} · ${activeRegion.city}`
    : "Semua wilayah percontohan";

  const documents = useMemo(
    () => getDocumentsForRegion(activeRegionId),
    [activeRegionId],
  );

  const stats = useMemo(() => {
    const categoryCount = new Set(documents.map((doc) => doc.category)).size;
    const pages = documents.reduce((total, doc) => total + doc.pageCount, 0);
    const latest = documents.reduce<string | null>((current, doc) => {
      if (!current) return doc.publishedAt;
      return new Date(doc.publishedAt) > new Date(current) ? doc.publishedAt : current;
    }, null);
    return { total: documents.length, categoryCount, pages, latest };
  }, [documents]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<CategoryFilter, number>([["Semua", documents.length]]);
    for (const doc of documents) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    }
    return counts;
  }, [documents]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents
      .filter((doc) => {
        const matchesCategory = category === "Semua" || doc.category === category;
        if (!matchesCategory) return false;
        if (normalized.length === 0) return true;

        const region = getRegion(doc.regionId);
        return [
          doc.title,
          doc.category,
          doc.highlight,
          String(doc.year),
          region?.name ?? "",
          region?.city ?? "",
          ...doc.summaryPoints,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }, [documents, query, category]);

  const hasFilters = query.trim().length > 0 || category !== "Semua";

  function resetFilters() {
    setQuery("");
    setCategory("Semua");
  }

  const previewRegionName = previewDocument
    ? getRegion(previewDocument.regionId)?.name ?? "Wilayah percontohan"
    : regionName;

  return (
    <>
      <section id="dokumen" className="scroll-mt-24 py-10 sm:py-12">
        <div className="container-page">
          <Reveal>
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              <StatCard
                icon={FolderOpen}
                tone="navy"
                label="Dokumen tersedia"
                value={`${formatNumber(stats.total)} dokumen`}
                note={
                  activeRegion
                    ? `Cakupan ${activeRegion.name}`
                    : "Agregat 3 wilayah percontohan"
                }
              />
              <StatCard
                icon={FileText}
                tone="amber"
                label="Halaman terbaca"
                value={`${formatNumber(stats.pages)} halaman`}
                note="Ringkasan disusun per dokumen"
              />
              <StatCard
                icon={Layers}
                tone="sky"
                label="Jenis dokumen"
                value={`${formatNumber(stats.categoryCount)} kategori`}
                note="APBD/APBDes, RAB, tender, LPJ, laporan akhir"
              />
              <StatCard
                icon={CalendarDays}
                tone="emerald"
                label="Pembaruan terakhir"
                value={stats.latest ? formatDateShort(stats.latest) : "Belum tersedia"}
                note="Mengikuti tanggal dokumen asli"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-4 border-pixel-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-emerald-50 text-emerald-800">
                  <ShieldCheck size={16} aria-hidden="true" />
                </span>
                <p className="text-[11.5px] leading-relaxed text-pixel-ink/80">
                  <span className="font-semibold text-pixel-line">
                    Ringkasan bahasa manusia, bukan pengganti dokumen resmi.
                  </span>{" "}
                  Setiap ringkasan mencantumkan poin utama dan tautan unduh agar warga bisa
                  memeriksa sendiri angka aslinya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadDocumentIndex(filtered, regionName)}
                disabled={filtered.length === 0}
                className="btn-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={13} aria-hidden="true" />
                Unduh indeks ({formatNumber(filtered.length)})
              </button>
            </div>
          </Reveal>

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                Repositori dokumen
              </span>
              <h2 className="mt-2 font-pixel text-[17px] uppercase leading-[1.75] text-pixel-line sm:text-[21px]">
                Cari dokumen, baca intinya, lalu unduh ringkasannya.
              </h2>
              <p className="mt-2.5 font-retro text-[17px] leading-snug text-pixel-ink/85">
                {activeRegion
                  ? `Menampilkan dokumen publik untuk ${activeRegion.fullName}.`
                  : "Menampilkan dokumen publik dari tiga wilayah percontohan."}
              </p>
            </div>

            <label className="relative block w-full lg:w-[340px]">
              <span className="sr-only">Cari dokumen publik</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/70"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul, poin ringkasan, atau tahun…"
                className="h-11 w-full border-2 border-pixel-line bg-white pl-9 pr-9 text-[12px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border border-pixel-line/40 text-pixel-line hover:bg-pixel-sun"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((item) => {
              const count = categoryCounts.get(item) ?? 0;
              const isActive = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1 font-pixel text-[7px] uppercase leading-[1.6] shadow-chip",
                    isActive
                      ? "bg-pixel-line text-pixel-sun"
                      : "bg-white text-pixel-line hover:bg-pixel-sun",
                  )}
                >
                  {item}
                  <span
                    className={cn(
                      "border px-1 text-[9px] font-bold",
                      isActive
                        ? "border-pixel-cream/40 text-pixel-cream"
                        : "border-pixel-line/30 text-pixel-line",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-9 items-center gap-1 border-2 border-transparent px-2 py-1 font-pixel text-[7px] uppercase text-pixel-ink/60 hover:border-pixel-line hover:text-pixel-line"
              >
                <RotateCcw size={10} aria-hidden="true" />
                Reset
              </button>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filtered.map((doc) => (
                <Reveal key={doc.id}>
                  <DocumentCard
                    document={doc}
                    onPreview={() => setPreviewDocument(doc)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-6 border-4 border-dashed border-pixel-line/50 bg-white px-6 py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
                <Search size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                Dokumen tidak ditemukan
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-pixel-ink/75">
                Coba kata kunci yang lebih umum, pilih kategori lain, atau ubah wilayah
                pantau pada pemilih di atas.
              </p>
              <button type="button" onClick={resetFilters} className="btn-secondary mt-5">
                <RotateCcw size={13} aria-hidden="true" />
                Tampilkan semua dokumen
              </button>
            </div>
          )}

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-pixel-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-pixel-line bg-pixel-sun"
              />
              {formatNumber(filtered.length)} dari {formatNumber(documents.length)} dokumen
              ditampilkan
            </span>
            <span aria-hidden="true">·</span>
            <span>Klik kartu untuk membaca ringkasan 30 detik</span>
          </p>
        </div>
      </section>

      {previewDocument ? (
        <DocumentPreview
          doc={previewDocument}
          regionName={previewRegionName}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  tone: "navy" | "amber" | "sky" | "emerald";
  label: string;
  value: string;
  note: string;
}

const TONE_STYLES: Record<StatCardProps["tone"], string> = {
  navy: "bg-navy-soft text-navy",
  amber: "bg-amber-50 text-amber-800",
  sky: "bg-sky-50 text-sky-800",
  emerald: "bg-emerald-50 text-emerald-800",
};

function StatCard({ icon: Icon, tone, label, value, note }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 border-4 border-pixel-line bg-white p-3.5 shadow-card">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line",
          TONE_STYLES[tone],
        )}
      >
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
          {label}
        </p>
        <p className="mt-1 font-pixel text-[10.5px] leading-[1.6] text-pixel-line">
          {value}
        </p>
        <p className="mt-1 text-[10px] leading-snug text-pixel-ink/70">{note}</p>
      </div>
    </div>
  );
}

function DocumentCard({
  document: doc,
  onPreview,
}: {
  document: PublicDocument;
  onPreview: () => void;
}) {
  const Icon = CATEGORY_ICONS[doc.category];
  const region = getRegion(doc.regionId);

  return (
    <article className="group flex h-full flex-col border-4 border-pixel-line bg-white p-4 shadow-card transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b-[3px] border-pixel-line/20 pb-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 border-2 border-pixel-line px-1.5 py-0.5 font-pixel text-[7px] uppercase leading-[1.6]",
            CATEGORY_STYLES[doc.category],
          )}
        >
          <Icon size={10} aria-hidden="true" />
          {doc.category}
        </span>
        <span className="truncate font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
          {region ? region.name : "Wilayah percontohan"} · {doc.year}
        </span>
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="mt-3 text-left outline-offset-4"
        aria-label={`Baca ringkasan ${doc.title}`}
      >
        <h3 className="font-pixel text-[9.5px] uppercase leading-[1.85] text-pixel-line transition-colors group-hover:text-pixel-wood-cta">
          {doc.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-pixel-ink/80">
          {doc.highlight}
        </p>
      </button>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-pixel-line/20 pt-2.5 text-[9.5px] text-pixel-ink/65">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={10} aria-hidden="true" />
          {formatDateLong(doc.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers size={10} aria-hidden="true" />
          {formatNumber(doc.pageCount)} halaman
        </span>
        <span>{doc.fileSize}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex min-h-9 items-center gap-1.5 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
        >
          Baca ringkasan
          <ArrowUpRight
            size={11}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
        <button
          type="button"
          onClick={() => downloadDocumentFile(doc, region?.name ?? "Wilayah percontohan")}
          aria-label={`Unduh ringkasan ${doc.title}`}
          className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-white text-pixel-line shadow-chip hover:bg-pixel-sun"
        >
          <Download size={12} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
