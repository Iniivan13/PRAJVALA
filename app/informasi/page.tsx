import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, HelpCircle, Library } from "lucide-react";
import { InformationCenter } from "@/components/information/information-center";
import { PublicSourceLibrary } from "@/components/information/public-source-library";
import { FaqSection, GlossarySection } from "@/components/information/faq-glossary";
import { PageHero } from "@/components/layout/page-hero";
import { RegionPicker } from "@/components/ui/region-picker";

export const metadata: Metadata = {
  title: "Informasi Publik",
  description:
    "Repositori dokumen APBD/APBDes, RAB, tender, dan LPJ dengan ringkasan bahasa sederhana, pertanyaan umum, serta glosarium istilah anggaran.",
};

const ANCHORS = [
  { href: "#dokumen", label: "Dokumen publik", icon: FileText, note: "11 dokumen" },
  { href: "#faq", label: "Pertanyaan umum", icon: HelpCircle, note: "6 jawaban" },
  { href: "#glosarium", label: "Glosarium", icon: BookOpen, note: "12 istilah" },
];

export default function InformasiPage() {
  return (
    <>
      <PageHero
        eyebrow="Pusat informasi publik"
        title="Dokumen anggaran, diterjemahkan agar bisa dibaca siapa saja."
        description="Kami merangkum dokumen panjang menjadi poin-poin yang jujur dan mudah dicerna — lengkap dengan sumber, tanggal, dan tautan unduh agar warga bisa memeriksa sendiri."
        breadcrumb={[{ label: "Informasi Publik" }]}
        actions={
          <>
            <RegionPicker className="w-full sm:w-[270px]" label="Wilayah dokumen" />
            <Link href="/anggaran" className="btn-primary">
              <Library size={15} aria-hidden="true" />
              Lihat anggaran
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {ANCHORS.map((anchor) => {
            const Icon = anchor.icon;
            return (
              <Link
                key={anchor.href}
                href={anchor.href}
                className="group inline-flex min-h-11 items-center gap-2.5 border-2 border-pixel-line bg-white px-2.5 py-1.5 shadow-chip transition-transform hover:-translate-y-0.5 hover:bg-pixel-sun"
              >
                <span className="grid h-7 w-7 place-items-center border-2 border-pixel-line bg-pixel-panel text-pixel-line">
                  <Icon size={13} aria-hidden="true" />
                </span>
                <span className="text-left">
                  <span className="block font-pixel text-[7.5px] uppercase leading-[1.7] text-pixel-line">
                    {anchor.label}
                  </span>
                  <span className="block text-[9.5px] text-pixel-ink/65">{anchor.note}</span>
                </span>
                <ArrowRight
                  size={12}
                  className="ml-0.5 text-pixel-line/40 transition-transform group-hover:translate-x-0.5 group-hover:text-pixel-line"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </PageHero>

      <div className="bg-pixel-cream">
        <InformationCenter />
        <PublicSourceLibrary />
        <FaqSection />
        <GlossarySection />
      </div>
    </>
  );
}
