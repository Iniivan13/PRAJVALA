import Link from "next/link";
import { BadgeCheck, Quote, ThumbsUp } from "lucide-react";
import { HeroSearch } from "@/components/landing/hero-search";
import { HeroPreview } from "@/components/landing/hero-preview";
import { LandingKpis } from "@/components/landing/landing-kpis";
import { LandingSnapshot } from "@/components/landing/landing-snapshot";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  PixelClouds,
  PixelTerrain,
} from "@/components/ui/pixel-landscape";
import {
  SpriteBudget,
  SpriteChest,
  SpriteDocument,
  SpriteQuest,
  SpriteReport,
  SpriteSun,
} from "@/components/ui/pixel-sprites";
import {
  CITIZEN_REPORTS,
  PROJECTS,
  TOTAL_CITIZEN_REPORTS,
  getProject,
} from "@/lib/data";
import { formatDateShort, formatIDR, formatNumber } from "@/lib/utils";

const FEATURED_IDS = [
  "revitalisasi-jalan-h-saidi",
  "jembatan-dusun-krajan",
  "jalan-tembalang-rowosari",
];

const STEP_ITEMS = [
  {
    number: "01",
    Sprite: SpriteQuest,
    title: "Pilih wilayah Anda",
    description:
      "Telusuri kelurahan, desa, atau kecamatan. Setiap wilayah memiliki ringkasan anggaran, serapan, dan skor akuntabilitasnya sendiri.",
    note: "3 wilayah percontohan · 9 proyek",
  },
  {
    number: "02",
    Sprite: SpriteBudget,
    title: "Bandingkan angka dengan bukti",
    description:
      "Lihat pagu, realisasi, harga satuan, dan progres fisik. Indikator kewajaran harga membantu Anda menemukan hal yang perlu ditanyakan.",
    note: "RAB · LPJ · Dokumen tender",
  },
  {
    number: "03",
    Sprite: SpriteReport,
    title: "Verifikasi dari lapangan",
    description:
      "Kirim foto, koordinat, dan temuan Anda. Laporan warga memperkuat pengawasan dan membantu memprioritaskan audit.",
    note: `${TOTAL_CITIZEN_REPORTS} laporan warga telah masuk`,
  },
];

const TRUST_ITEMS = [
  {
    Sprite: SpriteDocument,
    title: "Dokumen terbuka",
    subtitle: "APBD, APBDes, RAB & LPJ",
  },
  {
    Sprite: SpriteQuest,
    title: "Peta geospasial",
    subtitle: "Koordinat & bukti fisik",
  },
  {
    Sprite: SpriteReport,
    title: "Verifikasi warga",
    subtitle: "Laporan komunitas",
  },
  {
    Sprite: SpriteChest,
    title: "Privasi terjaga",
    subtitle: "Metadata foto dibersihkan",
  },
];

const QUOTE_IDS = ["rep-01", "rep-19", "rep-09"];

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-1"
      aria-label={`Penilaian ${rating} dari 5 bintang`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={
            star <= rating
              ? "h-2.5 w-2.5 border border-pixel-line bg-pixel-sun"
              : "h-2.5 w-2.5 border border-pixel-line bg-pixel-panel"
          }
        />
      ))}
    </span>
  );
}

export default function HomePage() {
  const featured = FEATURED_IDS.map((id) =>
    PROJECTS.find((project) => project.id === id),
  ).filter((project): project is NonNullable<typeof project> => Boolean(project));

  const quotes = QUOTE_IDS.map((id) =>
    CITIZEN_REPORTS.find((report) => report.id === id),
  ).filter((report): report is NonNullable<typeof report> => Boolean(report));

  return (
    <>
      {/* ================= HERO — pixel sky world ================= */}
      <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
        <PixelClouds />

        <div className="container-page relative grid items-center gap-10 pb-8 pt-9 sm:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-6 lg:pt-14">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 border-[3px] border-pixel-line bg-pixel-sun px-2.5 py-1.5 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
                <SpriteSun size={12} className="text-pixel-line" />
                Smart Governance · SDG 16
              </span>
              <span className="inline-flex items-center gap-1.5 border-[3px] border-pixel-line bg-white px-2.5 py-1.5 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 border border-pixel-line bg-emerald-600"
                />
                Data anggaran 2026
              </span>
            </div>

            <h1 className="mt-5 max-w-[640px] font-pixel text-[23px] uppercase leading-[1.75] text-pixel-line text-shadow-pixel-light sm:text-[30px] lg:text-[33px]">
              Menyinari Setiap{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">Rupiah</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-[0.06em] h-[0.34em] bg-pixel-sun"
                />
              </span>{" "}
              Anggaran Publik.
            </h1>

            <p className="mt-5 max-w-[540px] font-retro text-[19px] leading-snug text-pixel-ink sm:text-[20px]">
              PRAJVALA membuka jalur langsung antara warga dan anggaran publik.
              Pantau Dana Desa dan APBD, telusuri bukti proyek, lalu verifikasi
              sendiri kondisi di lapangan.
            </p>

            <HeroSearch />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex">
                  {CITIZEN_REPORTS.slice(0, 4).map((report, index) => (
                    <span
                      key={report.id}
                      aria-hidden="true"
                      className={cnIndex(index)}
                    >
                      {report.initials}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="font-pixel text-[8px] uppercase leading-[1.6] text-pixel-line">
                    {formatNumber(TOTAL_CITIZEN_REPORTS)} laporan warga
                  </p>
                  <p className="mt-1 text-[11.5px] text-pixel-ink/80">
                    di 3 wilayah percontohan
                  </p>
                </div>
              </div>

              <span
                aria-hidden="true"
                className="hidden h-9 w-1 bg-pixel-line/30 sm:block"
              />

              <p className="flex items-center gap-2 text-[11.5px] font-medium text-pixel-ink/85">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 border border-pixel-line bg-emerald-600"
                />
                Terbuka, dapat diaudit, dan dikoreksi bersama
              </p>
            </div>
          </div>

          <div className="relative lg:pl-2">
            <HeroPreview />
          </div>
        </div>

        <PixelTerrain />
      </section>

      {/* ================= KPI BAND — inventory slots ================= */}
      <section className="bg-pixel-cream">
        <div className="container-page py-10 sm:py-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 border-2 border-pixel-line bg-white px-2.5 py-1 font-pixel text-[8px] uppercase tracking-[0.04em] text-pixel-line shadow-chip">
              <SpriteChest size={11} />
              Ringkasan langsung · Wilayah terpilih
            </p>
            <p className="flex items-center gap-2 text-[11px] font-medium text-pixel-ink/75">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-pixel-line bg-pixel-sun"
              />
              Diperbarui November 2026
            </p>
          </div>
          <LandingKpis />
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-y-4 border-pixel-line bg-pixel-panel">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 sm:grid-cols-4">
          {TRUST_ITEMS.map((item, index) => {
            const Sprite = item.Sprite;
            return (
              <div
                key={item.title}
                className={
                  index > 0
                    ? "flex items-center gap-3 sm:border-l-[3px] sm:border-pixel-line/25 sm:pl-5"
                    : "flex items-center gap-3"
                }
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line shadow-chip">
                  <Sprite size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-pixel-ink/80">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <LandingSnapshot />

      {/* ================= CARA KERJA — quest plaques ================= */}
      <section
        id="cara-kerja"
        className="relative border-y-4 border-pixel-line bg-pixel-cream py-16 sm:py-20"
      >
        <div
          className="surface-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />
        <div className="container-page relative">
          <Reveal>
            <SectionHeading
              eyebrow="Cara kerja"
              title="Dari angka anggaran menjadi bukti nyata."
              description="Tiga langkah sederhana untuk memahami dan mengawasi penggunaan uang publik — tanpa perlu latar belakang akuntansi."
              align="center"
              plaqueTone="panel"
            />
          </Reveal>

          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            {STEP_ITEMS.map((step, index) => {
              const Sprite = step.Sprite;
              return (
                <Reveal key={step.number}>
                  <div className="group relative flex h-full flex-col border-4 border-pixel-line bg-white p-5 shadow-card transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line shadow-chip">
                        <Sprite size={20} />
                      </span>
                      <span className="border-[3px] border-pixel-line bg-pixel-panel px-2 py-1 font-pixel text-[13px] leading-none text-pixel-line shadow-chip">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-4 font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed text-pixel-ink/85">
                      {step.description}
                    </p>

                    <p className="mt-4 inline-flex w-fit items-center gap-2 border-2 border-pixel-line bg-pixel-cream px-2 py-1 text-[10.5px] font-semibold text-pixel-line">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 border border-pixel-line bg-pixel-wood-cta"
                      />
                      {step.note}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/laporan" className="btn-ghost">
              Lihat papan laporan warga
              <SpriteReport size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PROJECTS ================= */}
      <section className="bg-pixel-cream-deep py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Proyek sorotan"
              title="Bukti yang bisa dilihat, bukan janji."
              description="Setiap proyek memiliki peta lokasi, perbandingan kondisi sebelum-sesudah, rincian anggaran, dan catatan warga."
              plaqueTone="paper"
              action={
                <Link href="/proyek" className="btn-secondary">
                  Lihat semua proyek
                  <SpriteQuest size={13} />
                </Link>
              }
            />
          </Reveal>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((project) => (
              <Reveal key={project.id}>
                <ProjectCard project={project} className="h-full" />
              </Reveal>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 border-4 border-pixel-line bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center gap-2 text-[11.5px] text-pixel-ink/85">
              <SpriteBudget size={14} className="text-pixel-wood-cta" />
              Total pagu tiga proyek sorotan:{" "}
              <span className="tabular font-mono text-[12.5px] font-semibold text-pixel-line">
                {formatIDR(featured.reduce((sum, project) => sum + project.budget, 0))}
              </span>
            </p>
            <Link
              href="/anggaran"
              className="inline-flex min-h-9 w-fit items-center gap-1.5 border-[3px] border-pixel-line bg-pixel-sun px-2.5 font-pixel text-[8px] uppercase text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5"
            >
              Bandingkan realisasi
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CITIZEN REPORTS — message board on dirt ================= */}
      <section className="relative overflow-hidden border-y-4 border-pixel-line bg-pixel-dirt py-16 text-pixel-cream sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 surface-tiles"
          aria-hidden="true"
        />

        <div className="container-page relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex border-[3px] border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
                Suara warga
              </span>
              <h2 className="mt-4 font-pixel text-[18px] uppercase leading-[1.75] text-pixel-cream sm:text-[22px]">
                Yang melihat langsung, tahu lebih banyak.
              </h2>
              <p className="mt-4 font-retro text-[18px] leading-snug text-pixel-cream/90">
                Laporan warga kami tampilkan apa adanya: lengkap dengan foto,
                waktu, koordinat, dan dukungan komunitas. Bukan untuk menghakimi,
                tetapi untuk memastikan pertanyaan yang tepat sampai ke meja yang
                tepat.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: formatNumber(TOTAL_CITIZEN_REPORTS), label: "Laporan" },
                  {
                    value: PROJECTS.filter((project) => project.validationScore >= 85).length,
                    label: "Terverifikasi",
                  },
                  { value: 3, label: "Wilayah" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border-[3px] border-pixel-line bg-pixel-cream px-2.5 py-2.5 text-pixel-line shadow-chip"
                  >
                    <p className="font-pixel text-[12px] leading-none">{stat.value}</p>
                    <p className="mt-1.5 font-pixel text-[6.5px] uppercase leading-[1.6] tracking-[0.04em]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/laporan"
                className="mt-6 inline-flex min-h-11 items-center gap-2 border-4 border-pixel-line bg-pixel-sun px-3.5 font-pixel text-[9px] uppercase text-pixel-line shadow-btn-sun transition-transform hover:-translate-y-0.5"
              >
                Baca laporan lapangan lainnya
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>

          <div className="space-y-4">
            {quotes.map((report) => {
              const project = getProject(report.projectId);
              return (
                <Reveal key={report.id}>
                  <figure className="relative border-4 border-pixel-line bg-pixel-cream p-5 text-pixel-line shadow-card transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 sm:p-6">
                    <Quote
                      size={36}
                      className="absolute right-4 top-3 text-pixel-line/10"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating rating={report.rating} />
                      <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2 py-0.5 text-[10px] font-semibold text-pixel-line">
                        {report.suitability}
                      </span>
                    </div>

                    <blockquote className="mt-3 text-[13px] leading-relaxed text-pixel-ink">
                      “{report.comment}”
                    </blockquote>

                    <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-pixel-line/20 pt-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-pixel-wood-cta font-pixel text-[8px] text-pixel-cream">
                          {report.initials}
                        </span>
                        <div>
                          <p className="flex items-center gap-1 text-[11.5px] font-semibold text-pixel-line">
                            {report.author}
                            {report.verified ? (
                              <BadgeCheck
                                size={12}
                                className="text-emerald-700"
                                aria-label="Warga terverifikasi"
                              />
                            ) : null}
                          </p>
                          <p className="text-[10px] text-pixel-ink/70">
                            {formatDateShort(report.createdAt)} · {project?.name}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 border-2 border-pixel-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-pixel-line">
                        <ThumbsUp size={10} aria-hidden="true" />
                        {report.upvotes}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
            <p className="flex items-center gap-2 px-1 text-[10px] text-pixel-cream/80">
              <SpriteReport size={12} className="text-pixel-sun" />
              Nama pelapor telah disamarkan untuk melindungi privasi.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA — wooden board ================= */}
      <section className="bg-pixel-cream py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <div className="relative border-4 border-pixel-line bg-pixel-wood-darker p-6 text-pixel-cream shadow-panel sm:p-10 lg:p-12">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14] surface-tiles"
                aria-hidden="true"
              />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <span className="inline-flex items-center gap-2 border-[3px] border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
                    <SpriteSun size={11} />
                    Mulai hari ini
                  </span>
                  <h2 className="mt-4 max-w-xl font-pixel text-[20px] uppercase leading-[1.75] sm:text-[24px]">
                    Transparansi dimulai dari satu pertanyaan.
                  </h2>
                  <p className="mt-4 max-w-lg font-retro text-[18px] leading-snug text-pixel-cream/90">
                    Tanyakan anggaran di sekitar Anda. Cocokkan dengan bukti di
                    lapangan. Bagikan temuan agar publik dapat menilai bersama.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <Link href="/anggaran" className="btn-amber">
                      Jelajahi Anggaran
                      <span aria-hidden="true">→</span>
                    </Link>
                    <Link href="/proyek" className="btn-ghost">
                      Buka Peta Proyek
                      <SpriteQuest size={13} />
                    </Link>
                  </div>
                  <p className="mt-5 text-[11px] text-pixel-cream/75">
                    100% data percontohan · Tidak memerlukan akun untuk menjelajah
                  </p>
                </div>

                <div className="border-4 border-pixel-line bg-pixel-cream p-5 text-pixel-line shadow-card">
                  <p className="font-pixel text-[8px] uppercase tracking-[0.04em]">
                    Komitmen PRAJVALA
                  </p>
                  <ul className="mt-3.5 space-y-3">
                    {[
                      "Menyajikan sumber angka dan waktu pembaruan",
                      "Menyamarkan identitas serta metadata pelapor",
                      "Menandai temuan tanpa menyimpulkan bersalah",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[12px] leading-relaxed text-pixel-ink"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center border-2 border-pixel-line bg-emerald-100 text-[9px] font-bold text-emerald-800"
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-2.5 border-t-[3px] border-pixel-line/20 pt-3.5">
                    <span className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                      <SpriteChest size={15} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-pixel-line">
                        Dikembangkan untuk publik
                      </p>
                      <p className="text-[10px] text-pixel-ink/70">
                        Tim Aetherion Vanakei · Cyber University
                      </p>
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

/** Square pixel avatar stacked in the hero proof row. */
function cnIndex(index: number) {
  const tones = [
    "bg-pixel-blue text-white",
    "bg-pixel-wood-cta text-pixel-cream",
    "bg-pixel-grass-deep text-white",
    "bg-pixel-line text-pixel-sun",
  ];
  return `grid h-8 w-8 place-items-center border-2 border-pixel-line font-pixel text-[7px] ${tones[index % tones.length]} ${
    index > 0 ? "-ml-1.5" : ""
  }`;
}