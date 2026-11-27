import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Panel Administrator",
  description:
    "Ruang kendali pengelola PRAJVALA untuk meninjau laporan warga, menerbitkan bukti resmi berfoto, dan membaca jejak audit.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
