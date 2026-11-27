import type { Metadata } from "next";
import { BudgetDashboard } from "@/components/budget/budget-dashboard";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard Anggaran",
  description:
    "Visualisasi realisasi APBD, APBDes, dan Dana Desa: pagu vs realisasi, komposisi sektor, serta rincian RAB dan LPJ dengan indikator kewajaran harga.",
  path: "/anggaran",
});

export default function AnggaranPage() {
  return <BudgetDashboard />;
}
