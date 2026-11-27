import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileSignature,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/projects/before-after-slider";
import { ProjectBudgetTable } from "@/components/projects/project-budget-table";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectTimeline } from "@/components/projects/project-timeline";
import { ShareButton } from "@/components/projects/share-button";
import { ValidationSection } from "@/components/validation/validation-section";
import { CategoryBadge } from "@/components/ui/category-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  SpriteBudget,
  SpriteDocument,
  SpriteQuest,
} from "@/components/ui/pixel-sprites";
import { BUDGET_ITEMS, PROJECTS, getProject, getRegion } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import {
  formatCompactIDR,
  formatDateLong,
  formatIDR,
  formatNumber,
  toCoordinateLabel,
} from "@/lib/utils";

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) {
    return {
      title: "Proyek tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }
  return buildPageMetadata({
    title: project.name,
    description: project.summary,
    path: `/proyek/${project.id}`,
    image: {
      url: project.after.src,
      alt: `Foto kondisi proyek ${project.name}`,
    },
  });
}

/** Section wrapper: pixel card with a plaque heading slot. */
function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) notFound();

  const region = getRegion(project.regionId);
  const items = BUDGET_ITEMS.filter((item) => item.projectId === project.id);
  const remaining = project.budget - project.realized;
  const related = PROJECTS.filter(
    (candidate) => candidate.regionId === project.regionId && candidate.id !== project.id,
  ).slice(0, 2);
  const completedMilestones = project.milestones.filter(
    (milestone) => milestone.status === "selesai",
  ).length;
  const osmLink = `https://www.openstreetmap.org/?mlat=${project.location.coordinates.lat}&mlon=${project.location.coordinates.lng}#map=17/${project.location.coordinates.lat}/${project.location.coordinates.lng}`;

  return (
    <>
      {/* ================= Header band ================= */}
      <div className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 surface-grid"
          aria-hidden="true"
        />
        <div className="container-page relative py-5 sm:py-7">
          <nav aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center gap-1 border-2 border-pixel-line bg-white px-2 py-1 shadow-chip">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-7 items-center px-1 font-pixel text-[8px] uppercase text-pixel-line hover:bg-pixel-sun"
                >
                  Beranda
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={11} className="text-pixel-line" aria-hidden="true" />
                <Link
                  href="/proyek"
                  className="inline-flex min-h-7 items-center px-1 font-pixel text-[8px] uppercase text-pixel-line hover:bg-pixel-sun"
                >
                  Peta Proyek
                </Link>
              </li>
              <li className="flex min-w-0 items-center">
                <ChevronRight size={11} className="text-pixel-line" aria-hidden="true" />
                <span
                  className="inline-flex min-h-7 max-w-[220px] items-center truncate bg-pixel-panel px-1 font-pixel text-[8px] uppercase text-pixel-line sm:max-w-[320px]"
                  aria-current="page"
                >
                  {project.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                <CategoryBadge category={project.category} />
                <span className="border-2 border-pixel-line bg-white px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                  TA {project.fiscalYear}
                </span>
              </div>
              <h1 className="mt-3 max-w-3xl font-pixel text-[20px] uppercase leading-[1.6] text-pixel-line text-shadow-pixel-light sm:text-[26px]">
                {project.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-pixel-ink/80">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} aria-hidden="true" />
                  {project.location.address}, {project.location.district} · {region?.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={12} aria-hidden="true" />
                  {formatDateLong(project.startDate)} – {formatDateLong(project.endDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px]">
                  <FileSignature size={12} aria-hidden="true" />
                  {project.contractNumber}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ShareButton />
              <a href="#validasi" className="btn-amber">
                <Camera size={14} aria-hidden="true" />
                Kirim laporan
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
            {[
              { label: "Pagu anggaran", value: formatCompactIDR(project.budget) },
              { label: "Realisasi", value: formatCompactIDR(project.realized) },
              { label: "Progres fisik", value: `${project.progress}%` },
              { label: "Skor validasi", value: `${project.validationScore}/100` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-2 border-pixel-line bg-white px-2.5 py-2 shadow-chip"
              >
                <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                  {stat.label}
                </p>
                <p className="mt-1 tabular font-mono text-[12px] font-bold text-pixel-line">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-pixel-cream">
        <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_352px] lg:items-start">
          <div className="min-w-0 space-y-7">
            <section aria-labelledby="bukti-fisik-heading">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="bukti-fisik-heading"
                  className="font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line"
                >
                  Bukti fisik: sebelum &amp; sesudah
                </h2>
                <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-emerald-50 px-2 py-1 font-pixel text-[7px] uppercase leading-[1.6] text-emerald-900 shadow-chip">
                  <ShieldCheck size={10} aria-hidden="true" />
                  2 foto geotag terverifikasi
                </span>
              </div>
              <BeforeAfterSlider
                before={project.before}
                after={project.after}
                projectName={project.name}
              />
            </section>

            <Panel>
              <div className="flex items-start gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
                  <Building2 size={16} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
                    Tentang proyek
                  </h2>
                  <p className="mt-2 text-pretty text-[12.5px] leading-relaxed text-pixel-ink/85">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t-[3px] border-pixel-line/20 pt-3.5 sm:grid-cols-2">
                {project.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="border-2 border-pixel-line/40 bg-pixel-cream-deep px-3 py-2"
                  >
                    <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-[11.5px] font-semibold text-pixel-line">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-2 border-pixel-line/40 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[10px] text-pixel-ink/75">
                  <MapPin size={11} aria-hidden="true" />
                  Koordinat proyek:
                  <span className="font-mono text-pixel-line">
                    {toCoordinateLabel(
                      project.location.coordinates.lat,
                      project.location.coordinates.lng,
                    )}
                  </span>
                </span>
                <a
                  href={osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                >
                  Buka di OpenStreetMap
                  <ExternalLink size={10} aria-hidden="true" />
                </a>
              </div>
            </Panel>

            <Panel>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-pixel text-[11px] uppercase leading-[1.8] text-pixel-line">
                    Jejak pelaksanaan
                  </h2>
                  <p className="mt-1.5 text-[11px] text-pixel-ink/75">
                    Dari musyawarah warga hingga serah terima
                  </p>
                </div>
                <span className="shrink-0 border-2 border-pixel-line bg-pixel-panel px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                  {completedMilestones}/{project.milestones.length} tahap
                </span>
              </div>
              <ProjectTimeline milestones={project.milestones} />
            </Panel>

            <Panel>
              <ProjectBudgetTable items={items} />
            </Panel>

            <ValidationSection project={project} />

            {related.length > 0 ? (
              <section className="border-t-4 border-pixel-line/25 pt-7">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                      Wilayah yang sama
                    </span>
                    <h2 className="mt-2 font-pixel text-[13px] uppercase leading-[1.8] text-pixel-line">
                      Proyek lain di {region?.name}
                    </h2>
                  </div>
                  <Link
                    href="/proyek"
                    className="inline-flex min-h-8 items-center gap-1 font-pixel text-[7px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                  >
                    Semua proyek
                    <ArrowRight size={11} aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {related.map((candidate) => (
                    <ProjectCard key={candidate.id} project={candidate} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* ================= Aside: project ledger ================= */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <div className="border-4 border-pixel-line bg-pixel-wood-darker p-2 shadow-panel">
              <div className="border-[3px] border-pixel-line bg-pixel-cream text-pixel-line">
                {/* Summary head */}
                <div className="border-b-[3px] border-pixel-line bg-pixel-wood-dark px-3.5 py-3 text-pixel-cream">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7]">
                      <Wallet size={10} className="text-pixel-sun" aria-hidden="true" />
                      Ringkasan proyek
                    </p>
                    <span className="border border-pixel-cream/40 px-1.5 py-0.5 font-pixel text-[6.5px] uppercase leading-[1.6]">
                      {region?.level}
                    </span>
                  </div>
                  <p className="mt-2.5 font-pixel text-[6.5px] uppercase leading-[1.6] text-pixel-cream/70">
                    Pagu anggaran
                  </p>
                  <p className="mt-1 tabular font-mono text-[19px] font-bold leading-tight">
                    {formatIDR(project.budget)}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-pixel-cream/75">Progres fisik</span>
                      <span className="tabular font-mono font-bold text-pixel-sun">
                        {project.progress}%
                      </span>
                    </div>
                    <ProgressBar
                      value={project.progress}
                      tone={project.status === "Perlu Audit" ? "rose" : "amber"}
                      className="mt-1.5"
                      ariaLabel="Progres fisik proyek"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-pixel-cream/20 pt-2.5">
                    <div>
                      <p className="font-pixel text-[6px] uppercase leading-[1.6] text-pixel-cream/65">
                        Terealisasi
                      </p>
                      <p className="mt-1 tabular font-mono text-[11px] font-semibold">
                        {formatCompactIDR(project.realized)}
                      </p>
                    </div>
                    <div>
                      <p className="font-pixel text-[6px] uppercase leading-[1.6] text-pixel-cream/65">
                        Sisa pagu
                      </p>
                      <p className="mt-1 tabular font-mono text-[11px] font-semibold">
                        {formatCompactIDR(remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-3.5 py-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: ShieldCheck,
                        label: "Skor warga",
                        value: `${project.validationScore}/100`,
                        tone: "bg-emerald-100 text-emerald-800",
                      },
                      {
                        icon: CheckCircle2,
                        label: "Laporan",
                        value: formatNumber(project.reportCount),
                        tone: "bg-pixel-sun text-pixel-line",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2 py-1.5"
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center border border-pixel-line ${stat.tone}`}
                        >
                          <stat.icon size={11} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-pixel text-[5.5px] uppercase leading-[1.7] text-ink-600">
                            {stat.label}
                          </p>
                          <p className="tabular font-mono text-[10px] font-bold">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-b-[3px] border-pixel-line/20 pb-3">
                    <StatusBadge status={project.status} />
                    <span className="font-pixel text-[7px] uppercase text-ink-600">
                      TA {project.fiscalYear}
                    </span>
                  </div>

                  <dl className="mt-3 space-y-2 text-[10.5px]">
                    {[
                      { label: "Penyedia", value: project.vendor },
                      { label: "No. kontrak", value: project.contractNumber, mono: true },
                      {
                        label: "Pelaksanaan",
                        value: `${formatDateLong(project.startDate)} – ${formatDateLong(project.endDate)}`,
                      },
                      { label: "Wilayah", value: `${region?.name}, ${region?.city}` },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-pixel-ink/65">{row.label}</dt>
                        <dd
                          className={`text-right font-medium ${row.mono ? "font-mono text-[9.5px]" : ""}`}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-3 border-2 border-pixel-line/40 bg-pixel-cream-deep p-2.5">
                    <p className="flex items-center gap-1.5 font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                      <MapPin size={9} aria-hidden="true" />
                      Lokasi proyek
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/90">
                      {project.location.address}, {project.location.neighborhood},{" "}
                      {project.location.district}, {project.location.city}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-pixel-ink/60">
                      {toCoordinateLabel(
                        project.location.coordinates.lat,
                        project.location.coordinates.lng,
                      )}
                    </p>
                    <a
                      href={osmLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex min-h-7 items-center gap-1 font-pixel text-[6.5px] uppercase text-pixel-wood-cta hover:text-pixel-line"
                    >
                      Lihat di peta
                      <ArrowUpRight size={9} aria-hidden="true" />
                    </a>
                  </div>

                  <a href="#validasi" className="btn-amber mt-3 w-full">
                    <Camera size={13} aria-hidden="true" />
                    Verifikasi lapangan
                  </a>
                  <Link href="/anggaran" className="btn-secondary mt-2 w-full">
                    Lihat anggaran wilayah
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>

                  <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-pixel-ink/65">
                    <SpriteDocument size={12} className="mt-0.5 shrink-0 text-pixel-wood-cta" />
                    Data bersumber dari RAB, kontrak, LPJ, dan laporan warga.
                    Terakhir diperbarui November 2026.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-4 border-pixel-line bg-pixel-sun/40 p-3.5 shadow-card">
              <p className="flex items-center gap-1.5 font-pixel text-[7.5px] uppercase leading-[1.7] text-pixel-line">
                <Camera size={11} aria-hidden="true" />
                Punya bukti di lokasi?
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-pixel-ink/85">
                Foto Anda dapat membantu warga lain menilai kesesuaian hasil proyek.
                Identitas dan metadata pribadi akan disamarkan.
              </p>
              <a
                href="#validasi"
                className="mt-2 inline-flex min-h-7 items-center gap-1 font-pixel text-[7px] uppercase text-pixel-line underline decoration-2 underline-offset-4 hover:text-pixel-wood-cta"
              >
                Kirim laporan lapangan
                <ArrowRight size={10} aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center gap-2.5 border-4 border-pixel-line bg-white px-3 py-2.5 shadow-card">
              <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                <SpriteBudget size={15} />
              </span>
              <div>
                <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                  Sumber
                </p>
                <p className="flex items-center gap-1 text-[9.5px] font-semibold text-pixel-line">
                  <SpriteQuest size={10} />
                  RAB · Kontrak · LPJ · Laporan warga
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
