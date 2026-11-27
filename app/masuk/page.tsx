import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Masuk ke Akun",
  description:
    "Masuk ke akun warga PRAJVALA untuk menyimpan identitas laporan, mengatur wilayah pantau, dan menelusuri kontribusi Anda di perangkat ini.",
  path: "/masuk",
  noIndex: true,
});

interface MasukPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const params = await searchParams;
  return <AuthScreen mode="login" redirectTo={params.redirect} />;
}
