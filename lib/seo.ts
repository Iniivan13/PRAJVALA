import type { Metadata } from "next";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Rute absolut dari root, mis. `/anggaran`. */
  path: string;
  /** Gambar khusus halaman; bawaan adalah kartu brand 1200×630. */
  image?: string | { url: string; width?: number; height?: number; alt?: string };
  /** Halaman utilitas seperti akun, masuk, dan panel admin. */
  noIndex?: boolean;
}

/**
 * Metadata konsisten untuk setiap halaman: judul, deskripsi, canonical,
 * Open Graph, dan kartu Twitter. Judul dokumen tetap memakai template
 * `%s | PRAJVALA` dari root layout, sedangkan judul bagikan memakai
 * `— PRAJVALA` agar tidak dobel.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const shareTitle = `${title} — ${SITE_NAME}`;
  const shareImage =
    image === undefined
      ? [{ ...OG_IMAGE }]
      : [
          typeof image === "string"
            ? { url: image, alt: `${title} — ${SITE_NAME}` }
            : image,
        ];

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: true }
      : {
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
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title: shareTitle,
      description,
      images: shareImage,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: shareImage.map((item) => item.url),
    },
  };
}