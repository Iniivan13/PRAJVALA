import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Daftar Akun Warga",
  description:
    "Buat akun warga PRAJVALA dalam 30 detik. Cukup nama, email, dan kata sandi — tanpa nomor telepon dan tanpa verifikasi berbelit.",
  path: "/daftar",
  noIndex: true,
});

interface DaftarPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function DaftarPage({ searchParams }: DaftarPageProps) {
  const params = await searchParams;
  return <AuthScreen mode="register" redirectTo={params.redirect} />;
}
