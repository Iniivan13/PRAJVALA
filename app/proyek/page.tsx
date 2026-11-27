import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPinned, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { RegionPicker } from "@/components/ui/region-picker";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Peta & Proyek Publik",
  description:
    "Jelajahi peta geotagging proyek publik: progres fisik, anggaran, bukti sebelum-sesudah, dan laporan verifikasi warga.",
  path: "/proyek",
});

interface ProyekPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ProyekPage({ searchParams }: ProyekPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Peta proyek publik"
        title="Lihat proyeknya, bukan hanya anggarannya."
        description="Setiap titik di peta adalah proyek publik dengan anggaran, progres, bukti fisik, dan catatan warga. Pilih wilayah lalu bandingkan kondisi lapangan."
        breadcrumb={[{ label: "Peta Proyek" }]}
        actions={
          <>
            <RegionPicker className="w-full sm:w-[270px]" label="Wilayah proyek" />
            <Link href="/anggaran" className="btn-secondary">
              Lihat anggaran
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-pixel-ink/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPinned size={12} aria-hidden="true" />
            Peta OpenStreetMap
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 border border-pixel-line bg-amber-600"
            />
            Koordinat langsung dari lokasi proyek
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" />
            Laporan warga terverifikasi
          </span>
        </div>
      </PageHero>

      <div className="bg-pixel-cream">
        <ProjectsExplorer initialQuery={params.q ?? ""} initialCategory={params.category} />
      </div>
    </>
  );
}
