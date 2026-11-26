"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { SectorDonut } from "@/components/charts/sector-donut";
import { RegionPicker } from "@/components/ui/region-picker";
import { SectionHeading } from "@/components/ui/section-heading";
import { STATUS_STYLES } from "@/components/ui/status-badge";
import { Reveal } from "@/components/ui/reveal";
import { SpriteBudget, SpriteQuest } from "@/components/ui/pixel-sprites";
import { getProjectsForRegion } from "@/lib/data";
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

/**
 * Region snapshot: composition board on the left, project ledger on the right.
 * Both panels are framed pixel windows rather than floating rounded cards.
 */
export function LandingSnapshot() {
  const { summary, activeRegionId, activeRegion } = useRegion();
  const projects = [...getProjectsForRegion(activeRegionId)]
    .sort((a, b) => b.validationScore - a.validationScore)
    .slice(0, 3);

  return (
    <section
      className="relative border-b-4 border-pixel-line bg-pixel-sky py-16 sm:py-20"
      id="ringkasan"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 surface-grid"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Ringkasan wilayah"
              title="Anggaran Anda, dalam satu pandangan."
              description="Pilih wilayah untuk melihat ke mana anggaran mengalir, seberapa cepat terserap, dan proyek mana yang paling dipercaya warga."
            />
            <div className="w-full shrink-0 lg:w-[290px]">
              <RegionPicker label="Pilih wilayah pantau" align="left" />
            </div>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ---------------- Composition board ---------------- */}
          <Reveal delay={80} className="h-full min-w-0">
            <div className="flex h-full flex-col border-4 border-pixel-line bg-pixel-cream p-5 shadow-card sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 font-pixel text-[7.5px] uppercase leading-[1.7] tracking-[0.04em] text-ink-600">
                    <SpriteBudget size={11} />
                    Komposisi anggaran
                  </p>
                  <h3 className="mt-2 font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
                    Ke mana dana mengalir?
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2 py-1 text-[10px] font-semibold text-pixel-line shadow-chip">
                  <MapPin size={10} aria-hidden="true" />
                  {summary.level} · {summary.name}
                </span>
              </div>

              <div className="mt-5">
                <SectorDonut sectors={summary.sectors} total={summary.totalBudget} />
              </div>

              <div className="mt-5 grid grid-cols-3 border-[3px] border-pixel-line bg-white">
                {[
                  { label: "Serapan", value: formatPercent(summary.absorptionRate) },
                  { label: "Penduduk", value: formatNumber(summary.population) },
                  {
                    label: "Akuntabilitas",
                    value: `${formatNumber(summary.accountabilityScore, 1)}/100`,
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={
                      index > 0
                        ? "border-l-[3px] border-pixel-line px-3 py-2.5"
                        : "px-3 py-2.5"
                    }
                  >
                    <p className="font-pixel text-[6.5px] uppercase leading-[1.6] tracking-[0.03em] text-ink-600">
                      {item.label}
                    </p>
                    <p className="mt-1.5 font-pixel text-[10px] leading-[1.5] tabular">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/anggaran"
                className="mt-4 inline-flex min-h-9 w-fit items-center gap-1.5 border-[3px] border-pixel-line bg-pixel-sun px-2.5 font-pixel text-[7.5px] uppercase text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5"
              >
                Lihat rincian realisasi
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>

          {/* ---------------- Project ledger ---------------- */}
          <Reveal delay={160} className="h-full min-w-0">
            <div className="flex h-full flex-col border-4 border-pixel-line bg-pixel-wood-darker p-2 shadow-panel">
              <div className="flex h-full flex-col border-[3px] border-pixel-line bg-pixel-cream p-4 text-pixel-line sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase text-pixel-line">
                    <MapPin size={9} aria-hidden="true" />
                    {activeRegion
                      ? `${activeRegion.level} · ${activeRegion.province}`
                      : "Nasional"}
                  </span>
                  <span className="font-pixel text-[7px] uppercase text-ink-600">TA 2026</span>
                </div>

                <h3 className="mt-3.5 font-pixel text-[10px] uppercase leading-[1.8]">
                  {activeRegion
                    ? activeRegion.headline
                    : "Transparansi anggaran dari Sabang sampai Merauke."}
                </h3>
                <p className="mt-2.5 text-[11.5px] leading-relaxed text-pixel-ink/85">
                  {activeRegion
                    ? activeRegion.description
                    : "Tiga wilayah percontohan memperlihatkan bagaimana anggaran publik dapat dipantau dan diverifikasi bersama warga."}
                </p>

                <div className="mt-4 flex items-center gap-2.5 border-[3px] border-pixel-line bg-white px-2.5 py-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                    <SpriteBudget size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-pixel text-[6.5px] uppercase leading-[1.6] text-ink-600">
                      Pagu wilayah
                    </p>
                    <p className="mt-0.5 tabular font-mono text-[12.5px] font-bold">
                      {formatCompactIDR(summary.totalBudget)}
                    </p>
                  </div>
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1 border-2 border-pixel-line bg-emerald-100 px-1.5 py-0.5 font-pixel text-[6.5px] uppercase text-emerald-900">
                    {summary.verifiedProjects} valid
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="font-pixel text-[7px] uppercase leading-[1.7] tracking-[0.03em] text-ink-600">
                    Validasi tertinggi
                  </p>
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/proyek/${project.id}`}
                      className="group flex items-center gap-2.5 border-2 border-pixel-line bg-white px-2 py-2 transition-colors hover:bg-pixel-sun/35"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-panel font-pixel text-[8px] leading-none tabular">
                        {project.validationScore}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-semibold">
                          {project.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-pixel-ink/70">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 border border-pixel-line ${STATUS_STYLES[project.status].dot}`}
                          />
                          <span>{project.status}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular font-mono">
                            {formatCompactIDR(project.budget)}
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-pixel text-[9px] text-pixel-line/50 transition-colors group-hover:text-pixel-line"
                      >
                        &gt;
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/proyek"
                  className="mt-auto inline-flex min-h-9 items-center gap-1.5 pt-4 font-pixel text-[7.5px] uppercase text-pixel-wood-cta hover:underline hover:decoration-2 hover:underline-offset-4"
                >
                  <SpriteQuest size={12} />
                  Jelajahi semua proyek di peta
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
