"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoveHorizontal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRegion } from "@/components/providers/region-provider";
import { getBudgetItems, getProject } from "@/lib/data";
import type { BudgetItem, ProjectCategory } from "@/types";
import {
  cn,
  formatCompactIDR,
  formatIDR,
  formatNumber,
} from "@/lib/utils";

const PAGE_SIZE = 8;

type SortKey = "item" | "unitPrice" | "total";
type SortDirection = "asc" | "desc";

const CATEGORIES: (ProjectCategory | "Semua kategori")[] = [
  "Semua kategori",
  "Infrastruktur Jalan",
  "Pendidikan",
  "Kesehatan",
  "Pemberdayaan UMKM",
  "Bantuan Sosial",
  "Infrastruktur Umum",
];

function FairnessBadge({ item }: { item: BudgetItem }) {
  const isReview = item.fairness === "Perlu Tinjauan";
  const difference = Math.round(
    ((item.unitPrice - item.benchmarkUnitPrice) / item.benchmarkUnitPrice) * 100,
  );

  return (
    <div>
      <span
        className={cn(
          "inline-flex items-center gap-1 border-2 border-pixel-line px-2 py-1 text-[9.5px] font-bold shadow-chip",
          isReview
            ? "bg-rose-50 text-rose-800"
            : "bg-emerald-50 text-emerald-800",
        )}
        title={item.note}
      >
        {isReview ? (
          <AlertTriangle size={10} aria-hidden="true" />
        ) : (
          <ShieldCheck size={10} aria-hidden="true" />
        )}
        {item.fairness}
      </span>
      <p
        className={cn(
          "mt-1 tabular font-mono text-[9.5px]",
          isReview ? "text-rose-700" : "text-pixel-ink/70",
        )}
      >
        Acuan {formatIDR(item.benchmarkUnitPrice)} · {difference > 0 ? "+" : ""}
        {difference}%
      </p>
    </div>
  );
}

export function BudgetTable() {
  const { activeRegionId, summary } = useRegion();
  const [query, setQuery] = useState("");
  const [fairness, setFairness] = useState<"Semua indikator" | "Normal" | "Perlu Tinjauan">(
    "Semua indikator",
  );
  const [category, setCategory] = useState<ProjectCategory | "Semua kategori">(
    "Semua kategori",
  );
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => getBudgetItems(activeRegionId), [activeRegionId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = allItems.filter((item) => {
      const project = getProject(item.projectId);
      const matchesQuery =
        normalized.length === 0 ||
        [item.item, item.vendor, item.category, project?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesFairness =
        fairness === "Semua indikator" || item.fairness === fairness;
      const matchesCategory =
        category === "Semua kategori" || item.category === category;
      return matchesQuery && matchesFairness && matchesCategory;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "item") comparison = a.item.localeCompare(b.item, "id");
      if (sortKey === "unitPrice") comparison = a.unitPrice - b.unitPrice;
      if (sortKey === "total") comparison = a.total - b.total;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [allItems, query, fairness, category, sortKey, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [query, fairness, category, activeRegionId, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalFilteredValue = filtered.reduce((sum, item) => sum + item.total, 0);
  const reviewCount = allItems.filter((item) => item.fairness === "Perlu Tinjauan").length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "item" ? "asc" : "desc");
    }
  };

  const resetFilters = () => {
    setQuery("");
    setFairness("Semua indikator");
    setCategory("Semua kategori");
    setSortKey("total");
    setSortDirection("desc");
  };

  const hasFilters =
    query.trim().length > 0 || fairness !== "Semua indikator" || category !== "Semua kategori";

  const exportCsv = () => {
    const headers = [
      "Item",
      "Proyek",
      "Kategori",
      "Vendor",
      "Volume",
      "Satuan",
      "Harga Satuan",
      "Benchmark",
      "Total",
      "Indikator",
    ];
    const rows = filtered.map((item) => {
      const project = getProject(item.projectId);
      return [
        item.item,
        project?.name ?? "",
        item.category,
        item.vendor,
        item.quantity,
        item.unit,
        item.unitPrice,
        item.benchmarkUnitPrice,
        item.total,
        item.fairness,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `PRAJVALA-RAB-${summary.name.replace(/\s+/g, "-")}-2026.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown size={11} className="text-pixel-line/35" aria-hidden="true" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="text-pixel-wood-cta" aria-hidden="true" />
    ) : (
      <ArrowDown size={11} className="text-pixel-wood-cta" aria-hidden="true" />
    );
  };

  return (
    <div className="overflow-hidden border-4 border-pixel-line bg-white shadow-card">
      <div className="border-b-4 border-pixel-line bg-pixel-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
              Rincian RAB &amp; LPJ
            </h2>
            <p className="mt-2 text-[11.5px] text-pixel-ink/80">
              {formatNumber(allItems.length)} item pengeluaran di{" "}
              <span className="font-semibold text-pixel-line">{summary.name}</span> ·{" "}
              {formatCompactIDR(totalFilteredValue)} dari hasil filter
            </p>
          </div>
          <div className="flex items-center gap-2">
            {reviewCount > 0 ? (
              <span className="hidden items-center gap-1 border-2 border-pixel-line bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-800 shadow-chip sm:inline-flex">
                <AlertTriangle size={11} aria-hidden="true" />
                {reviewCount} item perlu tinjauan
              </span>
            ) : null}
            <button
              type="button"
              onClick={exportCsv}
              className="btn-secondary h-10 px-3 py-0 text-[9px]"
              aria-label="Unduh data RAB sebagai CSV"
            >
              <Download size={13} aria-hidden="true" />
              Ekspor CSV
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/70"
              aria-hidden="true"
            />
            <label htmlFor="budget-search" className="sr-only">
              Cari item, vendor, atau proyek
            </label>
            <input
              id="budget-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari item, vendor, atau nama proyek…"
              className="h-10 w-full border-2 border-pixel-line bg-white pl-9 pr-3 text-[11.5px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <SlidersHorizontal
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-pixel-line/70"
                aria-hidden="true"
              />
              <label htmlFor="budget-category" className="sr-only">
                Filter kategori
              </label>
              <select
                id="budget-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProjectCategory | "Semua kategori")
                }
                className="h-10 w-full appearance-none border-2 border-pixel-line bg-white pl-7 pr-7 text-[11px] font-medium text-pixel-line outline-none focus:border-pixel-wood-cta sm:max-w-[190px]"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <label htmlFor="budget-fairness" className="sr-only">
              Filter indikator kewajaran
            </label>
            <select
              id="budget-fairness"
              value={fairness}
              onChange={(event) =>
                setFairness(
                  event.target.value as
                    | "Semua indikator"
                    | "Normal"
                    | "Perlu Tinjauan",
                )
              }
              className="h-10 min-w-0 flex-1 appearance-none border-2 border-pixel-line bg-white px-2.5 text-[11px] font-medium text-pixel-line outline-none focus:border-pixel-wood-cta sm:flex-none"
            >
              <option>Semua indikator</option>
              <option>Normal</option>
              <option>Perlu Tinjauan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative">
        <p className="flex items-center gap-1.5 px-4 pb-2 pt-3 text-[10.5px] text-pixel-ink/70 lg:hidden">
          <MoveHorizontal size={12} className="shrink-0 text-pixel-line/70" aria-hidden="true" />
          Geser tabel ke samping untuk melihat kolom lainnya.
        </p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel RAB dapat digeser">
          <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">
            Tabel rincian Rencana Anggaran Biaya dan Laporan Pertanggungjawaban
          </caption>
          <thead>
            <tr className="border-b-[3px] border-pixel-line bg-pixel-cream-deep">
              <th scope="col" className="px-4 py-2.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                <button
                  type="button"
                  onClick={() => toggleSort("item")}
                  className="inline-flex min-h-8 items-center gap-1.5 hover:text-pixel-wood-cta"
                  aria-label={`Urutkan berdasarkan nama item, saat ini ${
                    sortKey === "item" ? sortDirection : "tidak aktif"
                  }`}
                >
                  Item pekerjaan
                  <SortIcon column="item" />
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Kategori
              </th>
              <th scope="col" className="px-3 py-2.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Penyedia
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Volume
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                <button
                  type="button"
                  onClick={() => toggleSort("unitPrice")}
                  className="inline-flex min-h-8 items-center gap-1.5 hover:text-pixel-wood-cta"
                  aria-label={`Urutkan berdasarkan harga satuan, saat ini ${
                    sortKey === "unitPrice" ? sortDirection : "tidak aktif"
                  }`}
                >
                  Harga satuan
                  <SortIcon column="unitPrice" />
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                <button
                  type="button"
                  onClick={() => toggleSort("total")}
                  className="inline-flex min-h-8 items-center gap-1.5 hover:text-pixel-wood-cta"
                  aria-label={`Urutkan berdasarkan total, saat ini ${
                    sortKey === "total" ? sortDirection : "tidak aktif"
                  }`}
                >
                  Total
                  <SortIcon column="total" />
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Indikator harga
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const project = getProject(item.projectId);
              const isReview = item.fairness === "Perlu Tinjauan";
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b-2 border-pixel-line/15 transition-colors hover:bg-pixel-sun/25",
                    isReview && "bg-rose-50/40",
                  )}
                >
                  <td className="max-w-[270px] px-4 py-3.5">
                    <p className="text-[12px] font-semibold leading-snug text-pixel-line">
                      {item.item}
                    </p>
                    <p className="mt-0.5 truncate text-[9.5px] text-pixel-ink/65">
                      {project?.name}
                    </p>
                    {item.note && isReview ? (
                      <p className="mt-1 line-clamp-1 text-[9.5px] text-rose-700" title={item.note}>
                        {item.note}
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="border border-pixel-line/30 bg-pixel-panel px-1.5 py-0.5 text-[9.5px] font-medium text-pixel-ink/80">
                      {item.category}
                    </span>
                  </td>
                  <td className="max-w-[160px] px-3 py-3.5">
                    <p className="truncate text-[10.5px] text-pixel-ink/75" title={item.vendor}>
                      {item.vendor}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono text-[10.5px] tabular text-pixel-ink/80">
                    {formatNumber(item.quantity)} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono text-[10.5px] tabular text-pixel-ink/80">
                    {formatIDR(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono text-[11px] font-bold tabular text-pixel-line">
                    {formatIDR(item.total)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <FairnessBadge item={item} />
                  </td>
                </tr>
              );
            })}
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <p className="text-[13px] font-semibold text-pixel-line">
                    Tidak ada item yang cocok
                  </p>
                  <p className="mt-1 text-[11px] text-pixel-ink/70">
                    Coba ubah kata kunci atau filter indikator harga.
                  </p>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 border-2 border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[7.5px] uppercase text-pixel-line shadow-chip"
                    >
                      Reset semua filter
                    </button>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t-[3px] border-pixel-line bg-pixel-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10.5px] text-pixel-ink/75">
          Menampilkan{" "}
          <span className="font-semibold text-pixel-line">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          dari {filtered.length} item
          {hasFilters ? " (terfilter)" : ""}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
            disabled={safePage === 1}
            className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-white text-pixel-line shadow-chip transition-transform hover:bg-pixel-sun disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            if (totalPages > 6 && Math.abs(pageNumber - safePage) > 1 && pageNumber !== 1 && pageNumber !== totalPages) {
              if (pageNumber === 2 || pageNumber === totalPages - 1) {
                return (
                  <span key={pageNumber} className="px-0.5 text-[10px] text-pixel-ink/60">
                    …
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-current={safePage === pageNumber ? "page" : undefined}
                className={cn(
                  "grid h-9 min-w-9 shrink-0 place-items-center px-2 font-pixel text-[8px] leading-none shadow-chip transition-transform",
                  safePage === pageNumber
                    ? "border-2 border-pixel-line bg-pixel-line text-pixel-sun"
                    : "border-2 border-pixel-line bg-white text-pixel-line hover:bg-pixel-sun",
                )}
                aria-label={`Halaman ${pageNumber}`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((previous) => Math.min(previous + 1, totalPages))}
            disabled={safePage === totalPages}
            className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-white text-pixel-line shadow-chip transition-transform hover:bg-pixel-sun disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
