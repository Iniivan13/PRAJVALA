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
import {
  OG_IMAGE,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | PRAJVALA",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "transparansi anggaran",
    "anggaran publik",
    "APBD",
    "APBDes",
    "dana desa",
    "realisasi anggaran",
    "proyek pembangunan",
    "verifikasi warga",
    "partisipasi masyarakat",
    "open government",
    "smart governance",
    "akuntabilitas publik",
    "PRAJVALA",
  ],
  authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
  creator: SITE_AUTHOR,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "government",
  classification: "Civic technology, public budget transparency",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/brand/prajvala-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/brand/prajvala-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/brand/prajvala-icon-192.png",
    apple: [
      {
        url: "/brand/prajvala-apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ ...OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#2B2B2B",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Required so the fixed bottom bar can respect the iOS home indicator.
  viewportFit: "cover",
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/prajvala-icon-512.png`,
        width: 512,
        height: 512,
      },
      description: SITE_DESCRIPTION,
      founder: {
        "@type": "Organization",
        name: SITE_AUTHOR,
      },
      knowsAbout: [
        "Transparansi anggaran publik",
        "APBD dan APBDes",
        "Verifikasi proyek pembangunan",
      ],
      slogan: SITE_TAGLINE,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-pixel-cream font-sans text-pixel-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
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