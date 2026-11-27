import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Halaman publik boleh diindeks. Halaman utilitas akun dan panel pengelola
 * tidak diindeks karena memuat alur autentikasi atau data pribadi.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/akun", "/masuk", "/daftar"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}