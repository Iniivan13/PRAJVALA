import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
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
  themeColor: "#2B2B2B",
  width: "device-width",
  initialScale: 1,
  // Required so the fixed bottom bar can respect the iOS home indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-pixel-cream font-sans text-pixel-ink antialiased">
        <RegionProvider>
          <AuthProvider>
            <a
              href="#konten-utama"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border-4 focus:border-pixel-line focus:bg-pixel-sun focus:px-4 focus:py-3 focus:font-pixel focus:text-[10px] focus:uppercase focus:text-pixel-line"
            >
              Lewati ke konten utama
            </a>
            <Navbar />
            {/* Offset for the fixed mobile bar; no-op at lg and above. */}
            <div className="pb-mobile-nav">
              <main id="konten-utama" className="min-h-[60vh]">
                {children}
              </main>
              <Footer />
            </div>
            <MobileBottomNav />
          </AuthProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
