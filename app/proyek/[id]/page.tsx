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
import { BUDGET_ITEMS, PROJECTS, getProject, getRegion } from "@/lib/data";
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
  if (!project) return { title: "Proyek tidak ditemukan" };
  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: `${project.name} — PRAJVALA`,
      description: project.summary,
      images: [project.after.src],
    },
  };
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
      <div className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-5 sm:py-7">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-ink-500">
              <li>
                <Link href="/" className="inline-flex min-h-8 items-center transition-colors hover:text-ink-700">
                  Beranda
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight size={11} aria-hidden="true" />
                <Link href="/proyek" className="transition-colors hover:text-ink-700">
                  Peta Proyek
                </Link>
              </li>
              <li className="flex min-w-0 items-center gap-1.5">
                <ChevronRight size={11} aria-hidden="true" />
                <span className="max-w-[240px] truncate font-medium text-ink-600" aria-current="page">
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
                <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-500">
                  TA {project.fiscalYear}
                </span>
              </div>
              <h1 className="mt-3 max-w-3xl font-display text-[27px] font-extrabold leading-[1.12] tracking-tight text-ink-900 text-balance sm:text-[36px]">
                {project.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} className="text-ink-500" aria-hidden="true" />
                  {project.location.address}, {project.location.district} · {region?.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-ink-500" aria-hidden="true" />
                  {formatDateLong(project.startDate)} – {formatDateLong(project.endDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px]">
                  <FileSignature size={12} className="text-ink-500" aria-hidden="true" />
                  {project.contractNumber}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ShareButton />
              <a href="#validasi" className="btn-amber h-10 px-4 py-0 text-[12px]">
                <Camera size={14} aria-hidden="true" />
                Kirim laporan
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
            {[
              { label: "Pagu anggaran", value: formatCompactIDR(project.budget) },
              { label: "Realisasi", value: formatCompactIDR(project.realized) },
              { label: "Progres fisik", value: `${project.progress}%` },
              { label: "Skor validasi", value: `${project.validationScore}/100` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-ink-200/80 bg-ink-50/60 px-3 py-2"
              >
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-ink-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_352px] lg:items-start">
        <div className="min-w-0 space-y-7">
          <section aria-labelledby="bukti-fisik-heading">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2
                id="bukti-fisik-heading"
                className="font-display text-lg font-bold tracking-tight text-ink-900"
              >
                Bukti fisik: sebelum & sesudah
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9.5px] font-semibold text-emerald-700">
                <ShieldCheck size={11} aria-hidden="true" />
                2 foto geotag terverifikasi
              </span>
            </div>
            <BeforeAfterSlider
              before={project.before}
              after={project.after}
              projectName={project.name}
            />
          </section>

          <section className="card-base p-5 sm:p-6">
            <div className="flex items-start gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-soft text-navy">
                <Building2 size={16} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  Tentang proyek
                </h2>
                <p className="mt-2 text-pretty text-[12.5px] leading-relaxed text-ink-600">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
              {project.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-xl border border-ink-100 bg-ink-50/50 px-3.5 py-2.5"
                >
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    {spec.label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-semibold text-ink-800">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200/70 px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] text-ink-500">
                <MapPin size={11} className="text-ink-500" aria-hidden="true" />
                Koordinat proyek:
                <span className="font-mono text-ink-700">
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
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-navy hover:text-amber-600"
              >
                Buka di OpenStreetMap
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="card-base p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  Jejak pelaksanaan
                </h2>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  Dari musyawarah warga hingga serah terima
                </p>
              </div>
              <span className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[9.5px] font-semibold text-ink-500">
                {completedMilestones}/{project.milestones.length} tahap selesai
              </span>
            </div>
            <ProjectTimeline milestones={project.milestones} />
          </section>

          <section className="card-base p-5 sm:p-6">
            <ProjectBudgetTable items={items} />
          </section>

          <ValidationSection project={project} />

          {related.length > 0 ? (
            <section className="border-t border-ink-200 pt-7">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <span className="eyebrow">
                    <span className="h-px w-5 bg-amber-500" aria-hidden="true" />
                    Wilayah yang sama
                  </span>
                  <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-ink-900">
                    Proyek lain di {region?.name}
                  </h2>
                </div>
                <Link
                  href="/proyek"
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-navy hover:text-amber-600"
                >
                  Semua proyek
                  <ArrowRight size={12} aria-hidden="true" />
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

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
            <div className="relative overflow-hidden bg-ink-900 p-5 text-white">
              <div className="surface-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/15 blur-[45px]"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-300">
                    <Wallet size={11} className="text-amber-400" aria-hidden="true" />
                    Ringkasan proyek
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9.5px] font-semibold text-ink-300">
                    {region?.level}
                  </span>
                </div>
                <p className="mt-3 text-[9.5px] text-ink-300">Pagu anggaran</p>
                <p className="mt-0.5 font-display text-[26px] font-extrabold tracking-tight">
                  {formatIDR(project.budget)}
                </p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-ink-300">Progres fisik</span>
                    <span className="font-mono font-semibold text-amber-400">
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

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-300">
                      Terealisasi
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] font-semibold text-white">
                      {formatCompactIDR(project.realized)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-300">
                      Sisa pagu
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] font-semibold text-white">
                      {formatCompactIDR(remaining)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-400" aria-hidden="true" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.06em] text-ink-300">Skor warga</p>
                      <p className="font-mono text-[10.5px] font-semibold text-white">
                        {project.validationScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-amber-400" aria-hidden="true" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.06em] text-ink-300">Laporan</p>
                      <p className="font-mono text-[10.5px] font-semibold text-white">
                        {formatNumber(project.reportCount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={project.status} />
                <span className="text-[9.5px] text-ink-500">TA {project.fiscalYear}</span>
              </div>

              <dl className="space-y-2.5 text-[10.5px]">
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-ink-500">Penyedia</dt>
                  <dd className="text-right font-medium text-ink-800">{project.vendor}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-ink-500">No. kontrak</dt>
                  <dd className="text-right font-mono text-[9.5px] text-ink-700">
                    {project.contractNumber}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-ink-500">Pelaksanaan</dt>
                  <dd className="text-right text-ink-700">
                    {formatDateLong(project.startDate)} – {formatDateLong(project.endDate)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-ink-500">Wilayah</dt>
                  <dd className="text-right text-ink-700">
                    {region?.name}, {region?.city}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-500">
                  <MapPin size={10} aria-hidden="true" />
                  Lokasi proyek
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
                  {project.location.address}, {project.location.neighborhood},{" "}
                  {project.location.district}, {project.location.city}
                </p>
                <p className="mt-1 font-mono text-[9.5px] text-ink-500">
                  {toCoordinateLabel(
                    project.location.coordinates.lat,
                    project.location.coordinates.lng,
                  )}
                </p>
                <a
                  href={osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-navy hover:text-amber-600"
                >
                  Lihat di peta
                  <ArrowUpRight size={10} aria-hidden="true" />
                </a>
              </div>

              <a href="#validasi" className="btn-amber h-10 w-full px-4 py-0 text-[11.5px]">
                <Camera size={14} aria-hidden="true" />
                Verifikasi kondisi lapangan
              </a>
              <Link href="/anggaran" className="btn-secondary h-9 w-full px-4 py-0 text-[11px]">
                Lihat anggaran wilayah
                <ArrowRight size={12} aria-hidden="true" />
              </Link>

              <p className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-ink-500">
                <ShieldCheck size={10} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                Data bersumber dari RAB, kontrak, LPJ, dan laporan warga. Terakhir
                diperbarui November 2026.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900">
              <Camera size={12} aria-hidden="true" />
              Punya bukti di lokasi?
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-amber-800/80">
              Foto Anda dapat membantu warga lain menilai kesesuaian hasil proyek.
              Identitas dan metadata pribadi akan disamarkan.
            </p>
            <a
              href="#validasi"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 hover:underline"
            >
              Kirim laporan lapangan
              <ArrowRight size={10} aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
