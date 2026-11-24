import type { Metadata } from "next";
import { BudgetDashboard } from "@/components/budget/budget-dashboard";

export const metadata: Metadata = {
  title: "Dashboard Anggaran",
  description:
    "Visualisasi realisasi APBD, APBDes, dan Dana Desa: pagu vs realisasi, komposisi sektor, serta rincian RAB dan LPJ dengan indikator kewajaran harga.",
};

export default function AnggaranPage() {
  return <BudgetDashboard />;
}
