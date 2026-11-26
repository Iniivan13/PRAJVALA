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
  RAB: "bg-amber-50 text-amber-700",
  Tender: "bg-sky-50 text-sky-700",
  LPJ: "bg-emerald-50 text-emerald-700",
  "Laporan Akhir": "bg-ink-100 text-ink-700",
};

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  "APBD/APBDes": FolderOpen,
  RAB: FileText,
  Tender: FileCheck2,
  LPJ: BookOpenCheck,
  "Laporan Akhir": Layers,
};

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
      <section id="dokumen" className="scroll-mt-24 bg-ink-50">
        <div className="container-page py-10 sm:py-12">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={17} aria-hidden="true" />
                </span>
                <p className="text-[11.5px] leading-relaxed text-ink-500">
                  <span className="font-semibold text-ink-800">
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
                className="btn-secondary h-9 shrink-0 px-3 py-0 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={13} aria-hidden="true" />
                Unduh indeks ({formatNumber(filtered.length)})
              </button>
            </div>
          </Reveal>

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
                Repositori dokumen
              </span>
              <h2 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-900 sm:text-[34px]">
                Cari dokumen, baca intinya, lalu unduh ringkasannya.
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                {activeRegion
                  ? `Menampilkan dokumen publik untuk ${activeRegion.fullName}.`
                  : "Menampilkan dokumen publik dari tiga wilayah percontohan."}
              </p>
            </div>

            <label className="relative block w-full lg:w-[340px]">
              <span className="sr-only">Cari dokumen publik</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul, poin ringkasan, atau tahun…"
                className="input-base h-11 py-0 pl-10 pr-9 text-[12.5px]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
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
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    isActive
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
                  )}
                >
                  {item}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9.5px] font-bold",
                      isActive ? "bg-white/15 text-white" : "bg-ink-100 text-ink-500",
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
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 transition-colors hover:text-ink-900"
              >
                <RotateCcw size={11} aria-hidden="true" />
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
            <div className="mt-6 rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-500">
                <Search size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
                Dokumen tidak ditemukan
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-ink-500">
                Coba kata kunci yang lebih umum, pilih kategori lain, atau ubah wilayah
                pantau pada pemilih di atas.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="btn-secondary mt-5 h-9 px-4 py-0 text-[11.5px]"
              >
                <RotateCcw size={13} aria-hidden="true" />
                Tampilkan semua dokumen
              </button>
            </div>
          )}

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
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
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-600",
};

function StatCard({ icon: Icon, tone, label, value, note }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TONE_STYLES[tone])}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-500">
          {label}
        </p>
        <p className="mt-0.5 font-display text-[17px] font-bold leading-tight text-ink-900">
          {value}
        </p>
        <p className="mt-1 truncate text-[10px] text-ink-500">{note}</p>
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
    <article className="group flex h-full flex-col rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lifted">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold",
            CATEGORY_STYLES[doc.category],
          )}
        >
          <Icon size={11} aria-hidden="true" />
          {doc.category}
        </span>
        <span className="truncate text-[9.5px] font-medium text-ink-500">
          {region ? region.name : "Wilayah percontohan"} · {doc.year}
        </span>
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="mt-3 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        aria-label={`Baca ringkasan ${doc.title}`}
      >
        <h3 className="font-display text-[15.5px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-navy">
          {doc.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-500">
          {doc.highlight}
        </p>
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-100 pt-3 text-[9.5px] text-ink-500">
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
          className="inline-flex min-h-8 items-center gap-1.5 text-[11.5px] font-semibold text-navy transition-colors hover:text-navy-light"
        >
          Baca ringkasan
          <ArrowUpRight
            size={12}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
        <button
          type="button"
          onClick={() => downloadDocumentFile(doc, region?.name ?? "Wilayah percontohan")}
          aria-label={`Unduh ringkasan ${doc.title}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-800"
        >
          <Download size={13} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
