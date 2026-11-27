import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Panel Pengelola",
  description:
    "Ruang kendali pengelola PRAJVALA untuk meninjau laporan warga, menerbitkan bukti resmi berfoto, dan membaca jejak audit.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
