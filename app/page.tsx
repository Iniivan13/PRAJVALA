import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Database,
  FileText,
  MapPin,
  MapPinned,
  MessageSquare,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  Wallet,
} from "lucide-react";
import { HeroSearch } from "@/components/landing/hero-search";
import { HeroPreview } from "@/components/landing/hero-preview";
import { LandingKpis } from "@/components/landing/landing-kpis";
import { LandingSnapshot } from "@/components/landing/landing-snapshot";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  CITIZEN_REPORTS,
  PROJECTS,
  TOTAL_CITIZEN_REPORTS,
  getProject,
} from "@/lib/data";
import { formatDateShort, formatNumber } from "@/lib/utils";

const FEATURED_IDS = [
  "revitalisasi-jalan-h-saidi",
  "jembatan-dusun-krajan",
  "jalan-tembalang-rowosari",
];

const STEP_ITEMS = [
  {
    number: "01",
    icon: MapPin,
    title: "Pilih wilayah Anda",
    description:
      "Telusuri kelurahan, desa, atau kecamatan. Setiap wilayah memiliki ringkasan anggaran, serapan, dan skor akuntabilitasnya sendiri.",
    note: "3 wilayah percontohan · 9 proyek",
  },
  {
    number: "02",
    icon: Database,
    title: "Bandingkan angka dengan bukti",
    description:
      "Lihat pagu, realisasi, harga satuan, dan progres fisik. Indikator kewajaran harga membantu Anda menemukan hal yang perlu ditanyakan.",
    note: "RAB · LPJ · Dokumen tender",
  },
  {
    number: "03",
    icon: Camera,
    title: "Verifikasi dari lapangan",
    description:
      "Kirim foto, koordinat, dan temuan Anda. Laporan warga memperkuat pengawasan dan membantu memprioritaskan audit.",
    note: "782 laporan warga telah masuk",
  },
];

const TRUST_ITEMS = [
  {
    icon: FileText,
    title: "Dokumen terbuka",
    subtitle: "APBD, APBDes, RAB & LPJ",
  },
  {
    icon: MapPinned,
    title: "Peta geospasial",
    subtitle: "Koordinat & bukti fisik",
  },
  {
    icon: Users,
    title: "Verifikasi warga",
    subtitle: "Laporan komunitas",
  },
  {
    icon: ShieldCheck,
    title: "Privasi terjaga",
    subtitle: "Metadata foto dibersihkan",
  },
];

const QUOTE_IDS = ["rep-01", "rep-19", "rep-09"];

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`Penilaian ${rating} dari 5 bintang`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= rating ? "text-amber-500" : "text-ink-200"}
          fill={star <= rating ? "#F59E0B" : "transparent"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function HomePage() {
  const featured = FEATURED_IDS.map((id) => PROJECTS.find((project) => project.id === id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project),
  );

  const quotes = QUOTE_IDS.map((id) => CITIZEN_REPORTS.find((report) => report.id === id)).filter(
    (report): report is NonNullable<typeof report> => Boolean(report),
  );

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black_20%,transparent_92%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-navy/[0.05] blur-[110px]"
          aria-hidden="true"
        />

        <div className="container-page relative grid items-center gap-10 pb-10 pt-10 sm:pt-14 lg:grid-cols-[1.06fr_0.94fr] lg:gap-6 lg:pb-8 lg:pt-16">
          <div className="relative z-10">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                <Sparkles size={12} aria-hidden="true" />
                Smart Governance · SDG 16
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Data anggaran 2026
              </span>
            </div>

            <h1 className="mt-5 max-w-[640px] font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink-900 text-balance sm:text-[54px] lg:text-[58px]">
              Menyinari Setiap{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">Rupiah</span>
                <span
                  className="absolute inset-x-0 bottom-[0.08em] h-[0.26em] -rotate-[1.2deg] rounded-sm bg-amber-300/80"
                  aria-hidden="true"
                />
              </span>{" "}
              Anggaran Publik.
            </h1>

            <p className="mt-5 max-w-[560px] text-pretty text-[15px] leading-relaxed text-ink-500 sm:text-[16px]">
              PRAJVALA membuka jalur langsung antara warga dan anggaran publik.
              Pantau Dana Desa dan APBD, telusuri bukti proyek, lalu verifikasi
              sendiri kondisi di lapangan.
            </p>

            <HeroSearch />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {CITIZEN_REPORTS.slice(0, 4).map((report, index) => (
                    <span
                      key={report.id}
                      className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[9.5px] font-bold text-white shadow-sm"
                      style={{
                        backgroundColor: ["#1E3A8A", "#B45309", "#047857", "#6D28D9"][index],
                      }}
                      aria-hidden="true"
                    >
                      {report.initials}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink-800">
                    {formatNumber(TOTAL_CITIZEN_REPORTS)} laporan warga
                  </p>
                  <p className="text-[9.5px] text-ink-400">di 3 wilayah percontohan</p>
                </div>
              </div>

              <span className="hidden h-8 w-px bg-ink-200 sm:block" aria-hidden="true" />

              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-ink-500">
                <ShieldCheck size={14} className="text-emerald-600" aria-hidden="true" />
                Terbuka, dapat diaudit, dan dikoreksi bersama
              </div>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <HeroPreview />
          </div>
        </div>

        <div className="container-page relative pb-12 lg:pb-14">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Ringkasan langsung · Mengikuti wilayah terpilih
            </p>
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-ink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              Diperbarui November 2026
            </p>
          </div>
          <LandingKpis />
        </div>
      </section>

      <section className="border-y border-ink-200/70 bg-ink-50/70">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-5 sm:grid-cols-4">
          {TRUST_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-center gap-3 ${
                index > 0 ? "sm:border-l sm:border-ink-200/80 sm:pl-5" : ""
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-ink-200/80 bg-white text-ink-600 shadow-sm">
                <item.icon size={15} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11.5px] font-semibold text-ink-800">{item.title}</p>
                <p className="text-[9.5px] text-ink-400">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <LandingSnapshot />

      <section id="cara-kerja" className="border-y border-ink-200/70 bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Cara kerja"
              title="Dari angka anggaran menjadi bukti nyata."
              description="Tiga langkah sederhana untuk memahami dan mengawasi penggunaan uang publik — tanpa perlu latar belakang akuntansi."
              align="center"
            />
          </Reveal>

          <div className="relative mt-10 grid gap-4 md:grid-cols-3">
            <div
              className="pointer-events-none absolute left-[16%] right-[16%] top-[3.1rem] hidden border-t border-dashed border-ink-200 md:block"
              aria-hidden="true"
            />
            {STEP_ITEMS.map((step, index) => (
              <Reveal key={step.number} delay={index * 90}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-ink-200/80 bg-ink-50/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink-300 hover:bg-white hover:shadow-lifted">
                  <span
                    className="pointer-events-none absolute right-4 top-2 font-display text-[54px] font-extrabold leading-none text-ink-900/[0.045] transition-colors group-hover:text-amber-500/15"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <div className="relative flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-ink-200 bg-white text-navy shadow-sm">
                      <step.icon size={19} aria-hidden="true" />
                    </span>
                    {index < STEP_ITEMS.length - 1 ? (
                      <ArrowRight
                        size={15}
                        className="text-ink-300 md:hidden"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="relative mt-4 font-display text-[17px] font-bold tracking-tight text-ink-900">
                    {step.title}
                  </h3>
                  <p className="relative mt-2 text-[12.5px] leading-relaxed text-ink-500">
                    {step.description}
                  </p>
                  <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[9.5px] font-semibold text-ink-500">
                    <span className="h-1 w-1 rounded-full bg-amber-500" aria-hidden="true" />
                    {step.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Proyek sorotan"
              title="Bukti yang bisa dilihat, bukan janji."
              description="Setiap proyek memiliki peta lokasi, perbandingan kondisi sebelum-sesudah, rincian anggaran, dan catatan warga."
              action={
                <Link href="/proyek" className="btn-secondary h-10 px-4 py-0 text-[12.5px]">
                  Lihat semua proyek
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              }
            />
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((project, index) => (
              <Reveal key={project.id} delay={index * 80}>
                <ProjectCard project={project} className="h-full" />
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-ink-200 bg-white/60 px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] text-ink-500">
              <Wallet size={14} className="text-amber-500" aria-hidden="true" />
              Total pagu tiga proyek sorotan:{" "}
              <span className="font-mono font-semibold text-ink-800">
                Rp5.600.000.000
              </span>
            </p>
            <Link
              href="/anggaran"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy hover:text-amber-600"
            >
              Bandingkan dengan realisasi
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-ink-200/70 bg-white py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-amber-400/[0.08] blur-[90px]"
          aria-hidden="true"
        />
        <div className="container-page relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">
                <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
                Suara warga
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 text-balance sm:text-[38px]">
                Yang melihat langsung, tahu lebih banyak.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
                Laporan warga kami tampilkan apa adanya: lengkap dengan foto,
                waktu, koordinat, dan dukungan komunitas. Bukan untuk menghakimi,
                tetapi untuk memastikan pertanyaan yang tepat sampai ke meja yang tepat.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 px-3 py-2.5">
                  <p className="font-display text-lg font-extrabold text-ink-900">
                    {formatNumber(TOTAL_CITIZEN_REPORTS)}
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-ink-400">
                    Laporan
                  </p>
                </div>
                <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 px-3 py-2.5">
                  <p className="font-display text-lg font-extrabold text-ink-900">
                    {PROJECTS.filter((project) => project.validationScore >= 85).length}
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-ink-400">
                    Terverifikasi
                  </p>
                </div>
                <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 px-3 py-2.5">
                  <p className="font-display text-lg font-extrabold text-ink-900">3</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-ink-400">
                    Wilayah
                  </p>
                </div>
              </div>

              <Link
                href="/proyek"
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy transition-colors hover:text-amber-600"
              >
                Baca laporan lapangan lainnya
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div className="space-y-4">
            {quotes.map((report, index) => {
              const project = getProject(report.projectId);
              return (
                <Reveal key={report.id} delay={index * 90}>
                  <figure className="group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:border-ink-300 hover:shadow-lifted sm:p-6">
                    <Quote
                      size={40}
                      className="absolute right-5 top-4 text-ink-900/[0.04]"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <StarRating rating={report.rating} />
                      <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[9px] font-medium text-ink-500">
                        {report.suitability}
                      </span>
                    </div>
                    <blockquote className="relative mt-3 text-[13px] leading-relaxed text-ink-700">
                      “{report.comment}”
                    </blockquote>
                    <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-navy to-ink-800 text-[10px] font-bold text-white">
                          {report.initials}
                        </span>
                        <div>
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-ink-900">
                            {report.author}
                            {report.verified ? (
                              <BadgeCheck
                                size={12}
                                className="text-emerald-500"
                                aria-label="Warga terverifikasi"
                              />
                            ) : null}
                          </p>
                          <p className="text-[9px] text-ink-400">
                            {formatDateShort(report.createdAt)} · {project?.name}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-1 text-[9px] font-semibold text-ink-500">
                        <ThumbsUp size={10} aria-hidden="true" />
                        {report.upvotes}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
            <p className="flex items-center gap-2 px-2 text-[9.5px] text-ink-400">
              <MessageSquare size={11} aria-hidden="true" />
              Nama pelapor telah disamarkan untuk melindungi privasi.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-ink-900 px-6 py-10 text-white shadow-lifted sm:px-10 lg:px-12 lg:py-14">
              <div className="surface-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-[90px]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-navy/50 blur-[100px]"
                aria-hidden="true"
              />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                    <Sparkles size={13} aria-hidden="true" />
                    Mulai hari ini
                  </span>
                  <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-balance sm:text-[40px]">
                    Transparansi dimulai dari satu pertanyaan.
                  </h2>
                  <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-ink-300">
                    Tanyakan anggaran di sekitar Anda. Cocokkan dengan bukti di
                    lapangan. Bagikan temuan agar publik dapat menilai bersama.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <Link href="/anggaran" className="btn-amber">
                      Jelajahi Anggaran
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <Link
                      href="/proyek"
                      className="btn border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                    >
                      Buka Peta Proyek
                      <MapPinned size={16} aria-hidden="true" />
                    </Link>
                  </div>
                  <p className="mt-5 text-[10px] text-ink-500">
                    100% data percontohan · Tidak memerlukan akun untuk menjelajah
                  </p>
                </div>

                <div className="relative">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">
                      Komitmen PRAJVALA
                    </p>
                    <ul className="mt-3 space-y-3">
                      {[
                        "Menyajikan sumber angka dan waktu pembaruan",
                        "Menyamarkan identitas serta metadata pelapor",
                        "Menandai temuan tanpa menyimpulkan bersalah",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-ink-300">
                          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-400">
                            <CheckCircle2 size={11} aria-hidden="true" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
                        <ShieldCheck size={15} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-white">
                          Dikembangkan untuk publik
                        </p>
                        <p className="text-[8.5px] text-ink-500">
                          Tim Aetherion Vanakei · Cyber University
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
