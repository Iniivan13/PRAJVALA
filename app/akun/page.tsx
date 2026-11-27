import type { Metadata } from "next";
import { AccountDashboard } from "@/components/auth/account-dashboard";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Akun Saya",
  description:
    "Ringkasan akun warga PRAJVALA: identitas, wilayah pantau, laporan lapangan, dan dukungan yang Anda berikan di perangkat ini.",
  path: "/akun",
  noIndex: true,
});

export default function AkunPage() {
  return <AccountDashboard />;
}
