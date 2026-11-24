import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RegionProvider } from "@/components/providers/region-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "PRAJVALA — Menyinari Setiap Rupiah Anggaran Publik",
    template: "%s | PRAJVALA",
  },
  description:
    "Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas. Pantau anggaran desa, kelurahan, dan APBD, serta verifikasi proyek publik di sekitar Anda.",
  keywords: [
    "transparansi anggaran",
    "dana desa",
    "APBD",
    "verifikasi warga",
    "smart governance",
    "PRAJVALA",
  ],
  authors: [{ name: "Tim Aetherion Vanakei — Cyber University" }],
  creator: "Tim Aetherion Vanakei",
  applicationName: "PRAJVALA",
  openGraph: {
    title: "PRAJVALA — Menyinari Setiap Rupiah Anggaran Publik",
    description:
      "Pantau anggaran publik, telusuri proyek, dan kirim laporan lapangan. Transparansi yang bisa dilihat semua orang.",
    locale: "id_ID",
    type: "website",
    siteName: "PRAJVALA",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRAJVALA — Menyinari Setiap Rupiah Anggaran Publik",
    description:
      "Platform partisipasi warga untuk memantau dan memverifikasi anggaran publik Indonesia.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-ink-50 font-sans text-ink-900 antialiased">
        <RegionProvider>
          <AuthProvider>
            <a
              href="#konten-utama"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
            >
              Lewati ke konten utama
            </a>
            <Navbar />
            <main id="konten-utama" className="min-h-[60vh]">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
