import type { Metadata } from "next";
import { AccountDashboard } from "@/components/auth/account-dashboard";

export const metadata: Metadata = {
  title: "Akun Saya",
  description:
    "Ringkasan akun warga PRAJVALA: identitas, wilayah pantau, laporan lapangan, dan dukungan yang Anda berikan di perangkat ini.",
};

export default function AkunPage() {
  return <AccountDashboard />;
}
