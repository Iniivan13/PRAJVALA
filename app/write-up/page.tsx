import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  FileText,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SpriteJournal } from "@/components/ui/pixel-sprites";
import { FAQS, GLOSSARY } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Write Up",
  description:
    "Jurnal keterbukaan PRAJVALA: penjelasan sumber data, cara membaca status proyek, keamanan data pelapor, dan glosarium istilah anggaran.",
  path: "/write-up",
});

/**
 * Write Up.
 *
 * This page is deliberately assembled only from existing `FAQS` and `GLOSSARY`
 * entries — no invented editorial claims. The FAQ items become chapters, and the
 * glossary becomes the appendix.
 */
export default function WriteUpPage() {
  return (
    <>
      <PageHero
        eyebrow="Jurnal keterbukaan"
        title="Cara membaca angka, sebelum menyimpulkan."
        description="Halaman ini merangkum penjelasan yang sudah tersedia di pusat informasi: asal data, arti status proyek, keamanan data pelapor, dan istilah anggaran yang sering membingungkan."
        breadcrumb={[{ label: "Write Up" }]}
        tone="paper"
        actions={
          <>
            <Link href="/informasi" className="btn-secondary">
              <BookOpen size={14} aria-hidden="true" />
              Pusat informasi
            </Link>
            <Link href="/laporan" className="btn-primary">
              <FileText size={14} aria-hidden="true" />
              Papan laporan
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-pixel-ink/80">
          <span className="inline-flex items-center gap-1.5">
            <SpriteJournal size={12} />
            {formatNumber(FAQS.length)} bab penjelasan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookMarked size={12} aria-hidden="true" />
            {formatNumber(GLOSSARY.length)} istilah lampiran
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" />
            Data percontohan Techcomfest 2027
          </span>
        </div>
      </PageHero>

      <div className="bg-pixel-cream">
        <div className="container-page py-8 sm:py-10">
          <div className="grid gap-7 lg:grid-cols-[268px_minmax(0,1fr)] lg:items-start">
            {/* ---------- Table of contents ---------- */}
            <aside className="lg:sticky lg:top-24">
              <div className="border-4 border-pixel-line bg-white shadow-card">
                <div className="border-b-[3px] border-pixel-line bg-pixel-panel px-3 py-2.5">
                  <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                    <HelpCircle size={11} aria-hidden="true" />
                    Daftar isi
                  </p>
                </div>
                <nav aria-label="Daftar isi write up">
                  <ol className="divide-y-2 divide-pixel-line/10">
                    {FAQS.map((faq, index) => (
                      <li key={faq.question}>
                        <a
                          href={`#bab-${index + 1}`}
                          className="group flex min-h-9 items-start gap-2 px-3 py-2 text-[10.5px] leading-snug text-pixel-ink/80 hover:bg-pixel-sun/30 hover:text-pixel-line"
                        >
                          <span className="mt-0.5 shrink-0 font-pixel text-[6.5px] leading-[1.7] text-pixel-wood-cta">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1">{faq.question}</span>
                          <ArrowRight
                            size={10}
                            className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href="#lampiran"
                        className="group flex min-h-9 items-start gap-2 px-3 py-2 text-[10.5px] leading-snug text-pixel-ink/80 hover:bg-pixel-sun/30 hover:text-pixel-line"
                      >
                        <span className="mt-0.5 shrink-0 font-pixel text-[6.5px] leading-[1.7] text-pixel-wood-cta">
                          +
                        </span>
                        <span className="flex-1">Lampiran: glosarium anggaran</span>
                        <ArrowRight
                          size={10}
                          className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  </ol>
                </nav>
                <div className="border-t-[3px] border-pixel-line bg-pixel-cream-deep px-3 py-2.5">
                  <p className="text-[9.5px] leading-relaxed text-pixel-ink/70">
                    Seluruh isi halaman ini diambil dari pertanyaan umum dan glosarium
                    resmi PRAJVALA.
                  </p>
                </div>
              </div>
            </aside>

            {/* ---------- Chapters ---------- */}
            <article className="min-w-0">
              <header className="border-4 border-pixel-line bg-pixel-panel p-4 shadow-card">
                <span className="inline-flex border-2 border-pixel-line bg-white px-2 py-0.5 font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-line">
                  Pendahuluan
                </span>
                <h2 className="mt-2.5 font-pixel text-[15px] uppercase leading-[1.8] text-pixel-line sm:text-[18px]">
                  Transparansi bukan sekadar membuka angka.
                </h2>
                <p className="mt-2.5 font-retro text-[18px] leading-snug text-pixel-ink/85">
                  Angka anggaran hanya berguna ketika warga tahu dari mana asalnya, apa
                  artinya, dan sejauh mana angka itu bisa dipercaya. Enam bab berikut
                  menjelaskan hal-hal itu dengan bahasa sehari-hari.
                </p>
              </header>

              <div className="mt-6 space-y-5">
                {FAQS.map((faq, index) => (
                  <section
                    key={faq.question}
                    id={`bab-${index + 1}`}
                    className="scroll-mt-28 border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-line font-pixel text-[10px] leading-none text-pixel-sun">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                          Bab {index + 1} dari {FAQS.length}
                        </p>
                        <h3 className="mt-1.5 font-pixel text-[10px] uppercase leading-[1.85] text-pixel-line">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-3 border-l-4 border-pixel-sun pl-3.5">
                      <p className="text-[12px] leading-[1.85] text-pixel-ink/90">
                        {faq.answer}
                      </p>
                    </div>
                  </section>
                ))}
              </div>

              {/* ---------- Glossary appendix ---------- */}
              <section
                id="lampiran"
                className="mt-7 scroll-mt-28 border-4 border-pixel-line bg-white shadow-card"
              >
                <div className="border-b-4 border-pixel-line bg-pixel-wood-dark px-4 py-3">
                  <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-sun">
                    <BookMarked size={11} aria-hidden="true" />
                    Lampiran
                  </p>
                  <h2 className="mt-1.5 font-pixel text-[12px] uppercase leading-[1.8] text-pixel-cream">
                    Glosarium istilah anggaran
                  </h2>
                  <p className="mt-1.5 text-[10.5px] leading-relaxed text-pixel-cream/75">
                    {formatNumber(GLOSSARY.length)} istilah yang paling sering muncul di
                    dokumen APBD, APBDes, RAB, dan LPJ.
                  </p>
                </div>
                <dl className="divide-y-2 divide-pixel-line/10">
                  {GLOSSARY.map((item) => (
                    <div key={item.term} className="px-4 py-3">
                      <dt className="font-pixel text-[8.5px] uppercase leading-[1.8] text-pixel-wood-cta">
                        {item.term}
                      </dt>
                      <dd className="mt-1.5 text-[11.5px] leading-relaxed text-pixel-ink/85">
                        {item.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t-4 border-pixel-line bg-pixel-cream-deep px-4 py-3">
                  <Link
                    href="/informasi#glosarium"
                    className="inline-flex min-h-8 items-center gap-1.5 font-pixel text-[7px] uppercase text-pixel-line underline decoration-2 underline-offset-4 hover:text-pixel-wood-cta"
                  >
                    Cari istilah di pusat informasi
                    <ArrowRight size={11} aria-hidden="true" />
                  </Link>
                </div>
              </section>

              <div className="mt-6 flex flex-col gap-3 border-4 border-pixel-line bg-pixel-sun/35 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-pixel-line">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Sudah paham cara membacanya? Mulai dari proyek di sekitar Anda.
                </p>
                <Link href="/proyek" className="btn-primary shrink-0">
                  <FileText size={13} aria-hidden="true" />
                  Telusuri proyek
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
