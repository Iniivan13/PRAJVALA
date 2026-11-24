"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  MapPin,
  Wallet,
} from "lucide-react";
import { useRegion } from "@/components/providers/region-provider";
import { SectorDonut } from "@/components/charts/sector-donut";
import { RegionPicker } from "@/components/ui/region-picker";
import { SectionHeading } from "@/components/ui/section-heading";
import { STATUS_STYLES } from "@/components/ui/status-badge";
import { Reveal } from "@/components/ui/reveal";
import { getProjectsForRegion } from "@/lib/data";
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

export function LandingSnapshot() {
  const { summary, activeRegionId, activeRegion } = useRegion();
  const projects = [...getProjectsForRegion(activeRegionId)]
    .sort((a, b) => b.validationScore - a.validationScore)
    .slice(0, 3);

  return (
    <section className="relative py-16 sm:py-20" id="ringkasan">
      <div className="container-page">
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
          <Reveal delay={80} className="h-full">
            <div className="card-base relative h-full overflow-hidden p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">
                    <span className="h-px w-5 bg-amber-500" aria-hidden="true" />
                    Komposisi anggaran
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink-900">
                    Ke mana dana mengalir?
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-500">
                  <Building2 size={11} aria-hidden="true" />
                  {summary.level} · {summary.name}
                </span>
              </div>

              <div className="mt-6">
                <SectorDonut sectors={summary.sectors} total={summary.totalBudget} />
              </div>

              <div className="mt-6 grid grid-cols-3 divide-x divide-ink-100 rounded-xl border border-ink-100 bg-ink-50/60 py-3">
                <div className="px-4">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                    Serapan
                  </p>
                  <p className="mt-1 font-display text-base font-extrabold text-ink-900">
                    {formatPercent(summary.absorptionRate)}
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                    Penduduk
                  </p>
                  <p className="mt-1 font-display text-base font-extrabold text-ink-900">
                    {formatNumber(summary.population)}
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                    Akuntabilitas
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 font-display text-base font-extrabold text-ink-900">
                    {formatNumber(summary.accountabilityScore, 1)}
                    <span className="text-[9px] font-medium text-ink-400">/100</span>
                  </p>
                </div>
              </div>

              <Link
                href="/anggaran"
                className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-navy transition-colors hover:text-amber-600"
              >
                Lihat rincian realisasi anggaran
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={160} className="h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-ink-900 p-5 text-white shadow-lifted sm:p-7">
              <div className="surface-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-[80px]"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-300">
                    <MapPin size={10} className="text-amber-400" aria-hidden="true" />
                    {activeRegion ? `${activeRegion.level} · ${activeRegion.province}` : "Nasional"}
                  </span>
                  <span className="text-[9px] font-semibold text-ink-500">TA 2026</span>
                </div>
                <h3 className="mt-4 font-display text-[22px] font-extrabold leading-tight tracking-tight">
                  {activeRegion ? activeRegion.headline : "Transparansi anggaran dari Sabang sampai Merauke."}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-400">
                  {activeRegion
                    ? activeRegion.description
                    : "Tiga wilayah percontohan memperlihatkan bagaimana anggaran publik dapat dipantau dan diverifikasi bersama warga."}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
                    <Wallet size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                      Pagu wilayah
                    </p>
                    <p className="mt-0.5 font-mono text-[15px] font-bold text-white">
                      {formatCompactIDR(summary.totalBudget)}
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                    <BadgeCheck size={10} aria-hidden="true" />
                    {summary.verifiedProjects} tervalidasi
                  </span>
                </div>
              </div>

              <div className="relative mt-5 space-y-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  Proyek dengan validasi tertinggi
                </p>
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/proyek/${project.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-amber-400/30 hover:bg-white/[0.07]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 font-mono text-[11px] font-bold text-amber-400">
                      {project.validationScore}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-semibold text-white">
                        {project.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-ink-500">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[project.status].dot}`}
                          aria-hidden="true"
                        />
                        <span>{project.status}</span>
                        <span>·</span>
                        <span className="font-mono">{formatCompactIDR(project.budget)}</span>
                      </span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-ink-600 transition-colors group-hover:text-amber-400"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>

              <Link
                href="/proyek"
                className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-[11.5px] font-semibold text-amber-400 transition-colors hover:text-amber-300"
              >
                Jelajahi semua proyek di peta
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
