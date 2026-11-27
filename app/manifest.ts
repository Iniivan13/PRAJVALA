import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";

/**
 * Web app manifest: ikon dan warna tema yang sama dengan favicon baru,
 * sehingga PWA/“Tambahkan ke layar utama” memakai logo PRAJVALA.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FDF6E0",
    theme_color: "#2B2B2B",
    lang: "id-ID",
    dir: "ltr",
    categories: ["government", "education", "productivity"],
    icons: [
      {
        src: "/brand/prajvala-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/prajvala-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/prajvala-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}