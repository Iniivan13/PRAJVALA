import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPinned, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { RegionPicker } from "@/components/ui/region-picker";

export const metadata: Metadata = {
  title: "Peta & Proyek Publik",
  description:
    "Jelajahi peta geotagging proyek publik: progres fisik, anggaran, bukti sebelum-sesudah, dan laporan verifikasi warga.",
};

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
            <RegionPicker className="w-[270px]" label="Wilayah proyek" />
            <Link href="/anggaran" className="btn-secondary h-[54px] px-4 py-0 text-[12.5px]">
              Lihat anggaran
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPinned size={12} className="text-ink-500" aria-hidden="true" />
            Peta OpenStreetMap
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Koordinat langsung dari lokasi proyek
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-ink-500" aria-hidden="true" />
            Laporan warga terverifikasi
          </span>
        </div>
      </PageHero>

      <ProjectsExplorer initialQuery={params.q ?? ""} initialCategory={params.category} />
    </>
  );
}
