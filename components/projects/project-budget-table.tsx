import Link from "next/link";
import { AlertTriangle, ArrowUpRight, MoveHorizontal, ShieldCheck } from "lucide-react";
import type { BudgetItem } from "@/types";
import { cn, formatIDR, formatNumber } from "@/lib/utils";

export function ProjectBudgetTable({ items }: { items: BudgetItem[] }) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const reviewCount = items.filter((item) => item.fairness === "Perlu Tinjauan").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
            Rincian anggaran proyek
          </h2>
          <p className="mt-1.5 text-[11px] text-pixel-ink/75">
            {items.length} item pekerjaan · {reviewCount} item perlu tinjauan
          </p>
        </div>
        <Link
          href="/anggaran#tabel-rab"
          className="inline-flex min-h-8 items-center gap-1 font-pixel text-[7px] uppercase text-pixel-wood-cta underline decoration-2 underline-offset-4 hover:text-pixel-line"
        >
          Bandingkan di dashboard
          <ArrowUpRight size={11} aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-pixel-ink/70 sm:hidden">
        <MoveHorizontal size={12} className="shrink-0 text-pixel-line/70" aria-hidden="true" />
        Geser tabel ke samping untuk melihat semua kolom.
      </p>
      <div
        className="mt-3 overflow-x-auto border-[3px] border-pixel-line"
        tabIndex={0}
        role="region"
        aria-label="Tabel rincian RAB dapat digeser"
      >
        <table className="w-full min-w-[600px] border-collapse text-left">
          <caption className="sr-only">Rincian RAB proyek</caption>
          <thead>
            <tr className="border-b-[3px] border-pixel-line bg-pixel-cream-deep">
              <th scope="col" className="px-3 py-2 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Item pekerjaan
              </th>
              <th scope="col" className="px-3 py-2 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Volume
              </th>
              <th scope="col" className="px-3 py-2 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Harga satuan
              </th>
              <th scope="col" className="px-3 py-2 text-right font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Total
              </th>
              <th scope="col" className="px-3 py-2 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Harga
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item) => {
              const isReview = item.fairness === "Perlu Tinjauan";
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b-2 border-pixel-line/15 transition-colors hover:bg-pixel-sun/25",
                    isReview && "bg-rose-50/40",
                  )}
                >
                  <td className="px-3 py-2.5 text-[10.5px] leading-snug text-pixel-line">
                    {item.item}
                    {isReview && item.note ? (
                      <span className="mt-0.5 block text-[9.5px] text-rose-700">{item.note}</span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[9.5px] tabular text-pixel-ink/75">
                    {formatNumber(item.quantity)} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[9.5px] tabular text-pixel-ink/75">
                    {formatIDR(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-bold tabular text-pixel-line">
                    {formatIDR(item.total)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 border-2 border-pixel-line px-1.5 py-0.5 text-[9px] font-bold shadow-chip",
                        isReview
                          ? "bg-rose-50 text-rose-800"
                          : "bg-emerald-50 text-emerald-800",
                      )}
                      title={item.note}
                    >
                      {isReview ? (
                        <AlertTriangle size={8} aria-hidden="true" />
                      ) : (
                        <ShieldCheck size={8} aria-hidden="true" />
                      )}
                      {isReview ? "Tinjau" : "Normal"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-[3px] border-pixel-line bg-pixel-panel">
              <td colSpan={3} className="px-3 py-2.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Total nilai RAB
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10.5px] font-bold tabular text-pixel-line">
                {formatIDR(total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-[9.5px] leading-relaxed text-pixel-ink/70">
        Harga satuan dibandingkan dengan harga acuan regional. Penanda “Perlu Tinjauan”
        memerlukan klarifikasi, bukan bukti pelanggaran.
      </p>
    </div>
  );
}
