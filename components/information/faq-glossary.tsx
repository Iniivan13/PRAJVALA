"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Bot,
  CheckCircle2,
  FileSearch,
  Landmark,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { FAQS, GLOSSARY } from "@/lib/data";
import { cn, formatNumber } from "@/lib/utils";

/**
 * FAQ as a pixel accordion board.
 *
 * Each question is a numbered slot; the open answer unfolds inside the same
 * frame so the row never loses its border rhythm. Anchors `#faq` and
 * `#glosarium` are part of the page contract and must stay.
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 border-y-4 border-pixel-line bg-pixel-panel">
      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-7 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
              Pertanyaan umum
            </span>
            <h2 className="mt-3 font-pixel text-[16px] uppercase leading-[1.8] text-pixel-line sm:text-[20px]">
              Hal yang paling sering ditanyakan warga.
            </h2>
            <p className="mt-2.5 max-w-xl font-retro text-[17px] leading-snug text-pixel-ink/85">
              Jawaban singkat dan jujur tentang sumber data, arti status, serta batas
              tanggung jawab platform ini.
            </p>

            <div className="mt-6 border-4 border-pixel-line bg-white shadow-card">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;
                const panelId = `${baseId}-panel-${index}`;
                const buttonId = `${baseId}-button-${index}`;
                return (
                  <div
                    key={faq.question}
                    className={cn(
                      "border-b-2 border-pixel-line/20 last:border-b-0",
                      isOpen && "bg-pixel-cream-deep/40",
                    )}
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-start gap-3 px-3.5 py-3.5 text-left transition-colors hover:bg-pixel-sun/25 sm:px-4"
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-pixel-line font-pixel text-[8px] leading-none",
                            isOpen
                              ? "bg-pixel-line text-pixel-sun"
                              : "bg-pixel-panel text-pixel-line",
                          )}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-[12px] font-semibold leading-relaxed text-pixel-line">
                          {faq.question}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-pixel-line shadow-chip",
                            isOpen
                              ? "bg-pixel-sun text-pixel-line"
                              : "bg-white text-pixel-line",
                          )}
                          aria-hidden="true"
                        >
                          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                        </span>
                      </button>
                    </h3>
                    {isOpen ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="animate-fade-in px-3.5 pb-4 pl-[3.4rem] pr-8 sm:px-4 sm:pl-[3.85rem]"
                      >
                        <p className="border-l-2 border-pixel-line/30 pl-3 text-[11.5px] leading-relaxed text-pixel-ink/80">
                          {faq.answer}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel">
                <div className="border-[3px] border-pixel-line bg-pixel-cream">
                  <div className="border-b-[3px] border-pixel-line bg-white px-3.5 py-3">
                    <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-ink-600">
                      <Sparkles size={11} className="text-pixel-wood-cta" aria-hidden="true" />
                      Cara membaca data
                    </p>
                    <p className="mt-1.5 text-[12.5px] font-bold leading-snug text-pixel-line">
                      Tiga langkah sebelum menyimpulkan.
                    </p>
                  </div>
                  <ol className="space-y-3.5 p-3.5">
                    {[
                      {
                        icon: FileSearch,
                        title: "Cek sumber dan tanggal",
                        body: "Setiap dokumen mencantumkan tahun anggaran, tanggal terbit, dan wilayah. Data lama bukan berarti salah, tetapi perlu dibaca dalam konteks waktunya.",
                      },
                      {
                        icon: Landmark,
                        title: "Bandingkan pagu dan realisasi",
                        body: "Gunakan dashboard anggaran untuk melihat selisih pagu–realisasi. Selisih bukan otomatis penyimpangan; bisa berarti pekerjaan belum selesai.",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Baca laporan warga sebagai bukti",
                        body: "Laporan warga adalah sinyal untuk diperiksa, bukan putusan. Status 'Perlu Audit' berarti perlu klarifikasi, bukan pernyataan bersalah.",
                      },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <li key={step.title} className="flex gap-2.5">
                          <span className="relative grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-white text-pixel-line shadow-chip">
                            <Icon size={14} aria-hidden="true" />
                            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center border border-pixel-line bg-pixel-sun font-pixel text-[6px] leading-none text-pixel-line">
                              {index + 1}
                            </span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold leading-snug text-pixel-line">
                              {step.title}
                            </p>
                            <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/75">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="border-t-[3px] border-pixel-line bg-white p-3">
                    <Link
                      href="/proyek"
                      className="group flex items-center justify-between gap-3 border-2 border-pixel-line bg-pixel-sun px-3 py-2.5 text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5"
                    >
                      <span>
                        <span className="block font-pixel text-[6.5px] uppercase leading-[1.6] text-pixel-line/70">
                          Mulai dari lapangan
                        </span>
                        <span className="mt-1 block text-[11.5px] font-semibold leading-snug">
                          Telusuri proyek di sekitar warga
                        </span>
                      </span>
                      <ArrowRight
                        size={14}
                        className="shrink-0 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2.5 border-4 border-pixel-line bg-amber-50 p-3 shadow-card">
                <Bot size={14} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                <p className="text-[10px] leading-relaxed text-amber-900">
                  <span className="font-bold">Catatan data:</span> seluruh angka pada
                  versi ini adalah data percontohan yang disusun menyerupai dokumen resmi
                  untuk Techcomfest 2027.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Glossary as a dark inventory board: every term is a signed plate with its own
 * frame, and the search field keeps the pixel input treatment.
 */
export function GlossarySection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) return GLOSSARY;
    return GLOSSARY.filter((item) =>
      `${item.term} ${item.definition}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <section
      id="glosarium"
      className="scroll-mt-24 border-t-4 border-pixel-line bg-pixel-wood-darker"
    >
      <div className="container-page py-10 sm:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex border-2 border-pixel-cream/35 px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-sun">
              Glosarium anggaran
            </span>
            <h2 className="mt-3 font-pixel text-[16px] uppercase leading-[1.85] text-pixel-cream sm:text-[20px]">
              Istilah teknis, dijelaskan dengan bahasa sehari-hari.
            </h2>
            <p className="mt-2.5 font-retro text-[17px] leading-snug text-pixel-cream/80">
              Pagu, termin, LPJ, sampai EXIF — pahami kata-katanya sebelum menilai
              angkanya.
            </p>
          </div>

          <label className="relative block w-full lg:w-[320px]">
            <span className="sr-only">Cari istilah anggaran</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/70"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari istilah, mis. “termin”…"
              className="h-11 w-full border-2 border-pixel-cream/40 bg-pixel-cream pl-9 pr-9 text-[12px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-sun"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian istilah"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border border-pixel-line/40 text-pixel-line hover:bg-pixel-sun"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.term}
              className="group border-[3px] border-pixel-cream/25 bg-pixel-wood-dark p-3.5 transition-colors hover:border-pixel-sun"
            >
              <div className="flex items-start justify-between gap-2 border-b-2 border-pixel-cream/15 pb-1.5">
                <h3 className="font-pixel text-[9px] uppercase leading-[1.7] text-pixel-sun">
                  {item.term}
                </h3>
                <BookMarked
                  size={12}
                  className="mt-0.5 shrink-0 text-pixel-cream/35 transition-colors group-hover:text-pixel-sun"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-pixel-cream/80">
                {item.definition}
              </p>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 border-4 border-dashed border-pixel-cream/35 bg-pixel-wood-dark px-6 py-10 text-center">
            <p className="text-[12.5px] font-semibold text-pixel-cream">
              Istilah “{query.trim()}” belum ada di glosarium.
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-relaxed text-pixel-cream/65">
              Coba kata kunci lain, atau buka pertanyaan umum untuk penjelasan yang lebih
              luas.
            </p>
            <button type="button" onClick={() => setQuery("")} className="btn-amber mt-4">
              <RotateCcw size={13} aria-hidden="true" />
              Tampilkan semua istilah
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-pixel-cream/15 pt-4">
          <p className="inline-flex items-center gap-1.5 text-[10.5px] text-pixel-cream/70">
            <CheckCircle2 size={12} className="text-emerald-400" aria-hidden="true" />
            {formatNumber(filtered.length)} dari {formatNumber(GLOSSARY.length)} istilah
            ditampilkan
          </p>
          <Link
            href="/informasi#faq"
            className="inline-flex min-h-8 items-center gap-1.5 font-pixel text-[7px] uppercase text-pixel-sun underline decoration-2 underline-offset-4 hover:text-pixel-cream"
          >
            Masih bingung? Baca pertanyaan umum
            <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
