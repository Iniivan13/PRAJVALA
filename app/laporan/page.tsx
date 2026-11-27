import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ReportsBoard } from "@/components/reports/reports-board";
import { RegionPicker } from "@/components/ui/region-picker";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Papan Laporan Warga",
  description:
    "Kumpulan laporan lapangan warga PRAJVALA: kesesuaian hasil dengan RAB, catatan keterlambatan, dan indikasi kejanggalan yang perlu ditindaklanjuti.",
  path: "/laporan",
});

export default function LaporanPage() {
  return (
    <>
      <PageHero
        eyebrow="Papan laporan warga"
        title="Catatan dari lapangan, dibaca apa adanya."
        description="Laporan warga memperlihatkan kondisi nyata proyek yang mungkin tidak tertangkap dokumen resmi. Semua laporan di sini adalah bukti pendukung, bukan pernyataan bersalah."
        breadcrumb={[{ label: "Laporan Warga" }]}
        tone="paper"
        actions={
          <>
            <RegionPicker className="w-full sm:w-[270px]" label="Wilayah laporan" />
            <Link href="/proyek" className="btn-primary">
              <MessageSquare size={14} aria-hidden="true" />
              Telusuri proyek
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-pixel-ink/80">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" />
            Lokasi laporan dicocokkan dengan proyek
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 border border-pixel-line bg-pixel-sun" />
            Nama pelapor disamarkan otomatis
          </span>
          <Link
            href="/informasi#faq"
            className="inline-flex min-h-7 items-center gap-1 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
          >
            Cara membaca laporan
            <ArrowRight size={10} aria-hidden="true" />
          </Link>
        </div>
      </PageHero>

      <div className="bg-pixel-cream">
        <ReportsBoard />
      </div>
    </>
  );
}
