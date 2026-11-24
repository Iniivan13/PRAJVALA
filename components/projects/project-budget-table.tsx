import Link from "next/link";
import { AlertTriangle, ArrowUpRight, ShieldCheck } from "lucide-react";
import type { BudgetItem } from "@/types";
import { cn, formatIDR, formatNumber } from "@/lib/utils";

export function ProjectBudgetTable({ items }: { items: BudgetItem[] }) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const reviewCount = items.filter((item) => item.fairness === "Perlu Tinjauan").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
            Rincian anggaran proyek
          </h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            {items.length} item pekerjaan · {reviewCount} item perlu tinjauan
          </p>
        </div>
        <Link
          href="/anggaran#tabel-rab"
          className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-navy hover:text-amber-600"
        >
          Bandingkan di dashboard
          <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <caption className="sr-only">Rincian RAB proyek</caption>
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/80">
              <th scope="col" className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
                Item pekerjaan
              </th>
              <th scope="col" className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
                Volume
              </th>
              <th scope="col" className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
                Harga satuan
              </th>
              <th scope="col" className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
                Total
              </th>
              <th scope="col" className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
                Harga
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {items.map((item) => {
              const isReview = item.fairness === "Perlu Tinjauan";
              return (
                <tr key={item.id} className={cn("transition-colors hover:bg-ink-50/50", isReview && "bg-rose-50/25")}>
                  <td className="px-3 py-2.5 text-[10.5px] leading-snug text-ink-700">
                    {item.item}
                    {isReview && item.note ? (
                      <span className="mt-0.5 block text-[8.5px] text-rose-500">{item.note}</span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[9.5px] tabular text-ink-500">
                    {formatNumber(item.quantity)} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[9.5px] tabular text-ink-500">
                    {formatIDR(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-semibold tabular text-ink-900">
                    {formatIDR(item.total)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold",
                        isReview
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700",
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
            <tr className="border-t border-ink-200 bg-ink-50/70">
              <td colSpan={3} className="px-3 py-2.5 text-[10px] font-semibold text-ink-600">
                Total nilai RAB
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10.5px] font-bold tabular text-ink-900">
                {formatIDR(total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-[9px] leading-relaxed text-ink-400">
        Harga satuan dibandingkan dengan harga acuan regional. Penanda “Perlu Tinjauan”
        memerlukan klarifikasi, bukan bukti pelanggaran.
      </p>
    </div>
  );
}
