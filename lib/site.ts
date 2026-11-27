/**
 * Identitas situs untuk metadata SEO, Open Graph, sitemap, dan robots.
 *
 * `NEXT_PUBLIC_SITE_URL` dapat diisi di lingkungan produksi (misalnya domain
 * kustom). Nilai bawaan adalah domain Vercel proyek ini agar URL absolut pada
 * gambar Open Graph dan sitemap tetap valid tanpa konfigurasi tambahan.
 */
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prajvala.vercel.app";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE_NAME = "PRAJVALA";

export const SITE_TITLE =
  "PRAJVALA — Menyinari Setiap Rupiah Anggaran Publik";

export const SITE_DESCRIPTION =
  "PRAJVALA adalah platform partisipasi warga untuk memantau anggaran desa, kelurahan, dan APBD, menelusuri proyek pembangunan, serta memverifikasi kondisi lapangan secara terbuka.";

export const SITE_TAGLINE = "Search · Discover · Empower";

export const SITE_AUTHOR = "Tim Aetherion Vanakei — Cyber University";

export const OG_IMAGE = {
  url: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: "PRAJVALA — logo kaca pembesar dan bohlam dengan kata PRAJVALA",
  type: "image/png",
} as const;

export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE.url}`;