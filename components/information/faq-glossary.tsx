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

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 border-y border-ink-200/70 bg-white">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">
              <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
              Pertanyaan umum
            </span>
            <h2 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-900 sm:text-[36px]">
              Hal yang paling sering ditanyakan warga.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-500">
              Jawaban singkat dan jujur tentang sumber data, arti status, serta batas
              tanggung jawab platform ini.
            </p>

            <div className="mt-7 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-soft">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;
                const panelId = `${baseId}-panel-${index}`;
                const buttonId = `${baseId}-button-${index}`;
                return (
                  <div key={faq.question}>
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-ink-50/70 sm:px-5"
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold transition-colors",
                            isOpen
                              ? "bg-ink-900 text-amber-400"
                              : "bg-ink-100 text-ink-500",
                          )}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-[13px] font-semibold leading-relaxed text-ink-900">
                          {faq.question}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                            isOpen
                              ? "border-amber-500 bg-amber-500 text-ink-900"
                              : "border-ink-200 text-ink-500",
                          )}
                          aria-hidden="true"
                        >
                          {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                        </span>
                      </button>
                    </h3>
                    {isOpen ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="animate-fade-in px-4 pb-5 pl-[3.25rem] pr-10 sm:px-5 sm:pl-[3.75rem]"
                      >
                        <p className="text-[12px] leading-relaxed text-ink-500">
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
              <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-ink-50 shadow-soft">
                <div className="border-b border-ink-200/70 bg-white px-5 py-4">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                    <Sparkles size={12} className="text-amber-500" aria-hidden="true" />
                    Cara membaca data
                  </p>
                  <p className="mt-1.5 font-display text-[16px] font-bold text-ink-900">
                    Tiga langkah sebelum menyimpulkan.
                  </p>
                </div>
                <ol className="space-y-4 p-5">
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
                      <li key={step.title} className="flex gap-3">
                        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-navy shadow-sm">
                          <Icon size={15} aria-hidden="true" />
                          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[9.5px] font-bold text-ink-900">
                            {index + 1}
                          </span>
                        </span>
                        <div>
                          <p className="text-[12px] font-semibold text-ink-900">
                            {step.title}
                          </p>
                          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div className="border-t border-ink-200/70 bg-white p-4">
                  <Link
                    href="/proyek"
                    className="group flex items-center justify-between gap-3 rounded-xl bg-ink-900 px-4 py-3 text-white transition-colors hover:bg-ink-800"
                  >
                    <span>
                      <span className="block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-amber-400">
                        Mulai dari lapangan
                      </span>
                      <span className="mt-0.5 block text-[12px] font-semibold">
                        Telusuri proyek di sekitar warga
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-amber-400 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
                <Bot size={15} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-[10px] leading-relaxed text-amber-800">
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
      className="relative scroll-mt-24 overflow-hidden bg-ink-900 text-white"
    >
      <div
        className="surface-grid-dark pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(75%_75%_at_50%_35%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-navy-light/30 blur-[90px]"
        aria-hidden="true"
      />

      <div className="container-page relative py-12 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
              <span className="h-px w-6 bg-amber-400" aria-hidden="true" />
              Glosarium anggaran
            </span>
            <h2 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-white sm:text-[36px]">
              Istilah teknis, dijelaskan dengan bahasa sehari-hari.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
              Pagu, termin, LPJ, sampai EXIF — pahami kata-katanya sebelum menilai
              angkanya.
            </p>
          </div>

          <label className="relative block w-full lg:w-[320px]">
            <span className="sr-only">Cari istilah anggaran</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari istilah, mis. “termin”…"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-9 text-[12.5px] text-white placeholder:text-ink-500 transition-colors focus:border-amber-400/60 focus:outline-none focus:ring-4 focus:ring-amber-400/10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian istilah"
                className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.term}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-colors hover:border-amber-400/30 hover:bg-white/[0.07]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-[13.5px] font-bold leading-snug text-amber-300">
                    {item.term}
                  </h3>
                  <BookMarked
                    size={13}
                    className="mt-0.5 shrink-0 text-ink-500 transition-colors group-hover:text-amber-400/70"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-300">
                  {item.definition}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-[13px] font-semibold text-white">
              Istilah “{query.trim()}” belum ada di glosarium.
            </p>
            <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-relaxed text-ink-500">
              Coba kata kunci lain, atau buka pertanyaan umum untuk penjelasan yang lebih
              luas.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="btn-amber mt-5 h-9 px-4 py-0 text-[11.5px]"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Tampilkan semua istilah
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <p className="inline-flex items-center gap-2 text-[10.5px] text-ink-300">
            <CheckCircle2 size={13} className="text-emerald-400" aria-hidden="true" />
            {formatNumber(filtered.length)} dari {formatNumber(GLOSSARY.length)} istilah
            ditampilkan
          </p>
          <Link
            href="/informasi#faq"
            className="inline-flex min-h-8 items-center gap-1.5 text-[11.5px] font-semibold text-amber-400 transition-colors hover:text-amber-300"
          >
            Masih bingung? Baca pertanyaan umum
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
