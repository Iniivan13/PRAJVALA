import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const PUBLIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/anggaran", changeFrequency: "monthly", priority: 0.9 },
  { path: "/proyek", changeFrequency: "weekly", priority: 0.9 },
  { path: "/laporan", changeFrequency: "daily", priority: 0.8 },
  { path: "/informasi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/write-up", changeFrequency: "monthly", priority: 0.6 },
];

/**
 * Sitemap hanya memuat rute publik. `/admin`, `/akun`, `/masuk`, dan `/daftar`
 * sengaja tidak dimasukkan dan juga diblokir di robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...PUBLIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/proyek/${project.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}