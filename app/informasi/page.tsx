import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, HelpCircle, Library } from "lucide-react";
import { InformationCenter } from "@/components/information/information-center";
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
            <RegionPicker className="w-[270px]" label="Wilayah dokumen" />
            <Link
              href="/anggaran"
              className="btn-primary h-[54px] px-4 py-0 text-[12.5px]"
            >
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
                className="group inline-flex items-center gap-2.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-left transition-colors hover:border-ink-300 hover:bg-ink-50"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-100 text-ink-600 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
                  <Icon size={13} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold text-ink-800">
                    {anchor.label}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wide text-ink-400">
                    {anchor.note}
                  </span>
                </span>
                <ArrowRight
                  size={12}
                  className="ml-1 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </PageHero>

      <InformationCenter />
      <FaqSection />
      <GlossarySection />
    </>
  );
}
