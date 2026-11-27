"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  Clock,
  Database,
  ExternalLink,
  Info,
  Landmark,
  MapPin,
  PiggyBank,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { FiscalTrendChart } from "@/components/charts/fiscal-trend-chart";
import { PageHero } from "@/components/layout/page-hero";
import {
  DJPK_ATTRIBUTION,
  DJPK_MONTHS,
  DJPK_SOURCE_PORTAL,
} from "@/lib/djpk/config";
import {
  cn,
  formatCompactIDR,
  formatDateShort,
  formatDateTime,
  formatIDR,
  formatPercent,
} from "@/lib/utils";
import type {
  BudgetQualityStatus,
  FiscalTotal,
  RegionalBudgetAccount,
  RegionalBudgetSnapshot,
  RegionalFiscalData,
  RegionalFiscalRegionData,
} from "@/types";

const TAB_LABELS: Record<string, { name: string; note: string }> = {
  "kota-depok": { name: "Kota Depok", note: "APBD Kota" },
  "kabupaten-bogor": { name: "Kab. Bogor", note: "cakupan Cibinong" },
  "provinsi-dki-jakarta": { name: "DKI Jakarta", note: "koridor TB Simatupang" },
};

const QUALITY_STYLE: Record<
  BudgetQualityStatus,
  { label: string; chip: string; Icon: typeof Check }
> = {
  valid: {
    label: "Valid",
    chip: "border-emerald-700 bg-emerald-50 text-emerald-800",
    Icon: Check,
  },
  warning: {
    label: "Perhatian",
    chip: "border-amber-700 bg-amber-50 text-amber-900",
    Icon: AlertTriangle,
  },
  invalid: {
    label: "Tidak valid",
    chip: "border-rose-700 bg-rose-50 text-rose-800",
    Icon: X,
  },
};

function money(value: number | null): string {
  return value === null ? "—" : formatIDR(value);
}

function compact(value: number | null): string {
  // Non-breaking space keeps "Rp1,61 T" on one line inside narrow slots.
  return value === null ? "—" : formatCompactIDR(value).replace(" ", "\u00a0");
}

function percent(value: number | null): string {
  return value === null ? "—" : formatPercent(value);
}

function findAccount(
  snapshot: RegionalBudgetSnapshot,
  name: string,
  level: 1 | 2 | 3,
): RegionalBudgetAccount | undefined {
  return snapshot.accounts.find(
    (account) => account.account_name === name && account.account_level === level,
  );
}

function totalFor(
  snapshot: RegionalBudgetSnapshot,
  name: string,
): FiscalTotal {
  const account = findAccount(snapshot, name, 2);
  if (!account) {
    return { budget_amount: null, realization_amount: null, realization_percentage: null };
  }
  return {
    budget_amount: account.budget_amount,
    realization_amount: account.realization_amount,
    realization_percentage: account.realization_percentage,
  };
}

function periodLabel(snapshot: RegionalBudgetSnapshot): string {
  return `${DJPK_MONTHS[snapshot.period_month - 1]} ${snapshot.fiscal_year}`;
}

function ProgressBar({
  value,
  tone,
  label,
}: {
  value: number | null;
  tone: "revenue" | "spending";
  label: string;
}) {
  const width = value === null ? 0 : Math.max(0, Math.min(100, value));
  const overBudget = value !== null && value > 100;

  return (
    <div
      className="h-3.5 w-full border-2 border-pixel-line bg-pixel-panel/70"
      role="img"
      aria-label={label}
    >
      <div
        className={cn(
          "h-full",
          overBudget
            ? "bg-amber-500"
            : tone === "revenue"
              ? "bg-pixel-blue"
              : "bg-emerald-600",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function KpiSlot({
  label,
  total,
  icon: Icon,
  tone,
  note,
}: {
  label: string;
  total: FiscalTotal;
  icon: typeof Landmark;
  tone: "navy" | "amber" | "emerald" | "sky";
  note?: string;
}) {
  const plate = {
    navy: "bg-navy-soft text-navy",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
  }[tone];

  return (
    <div className="border-4 border-pixel-line bg-white p-3.5 shadow-card sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-pixel text-[7.5px] uppercase leading-[1.7] tracking-[0.04em] text-pixel-line">
          {label}
        </p>
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center border-[3px] border-pixel-line",
            plate,
          )}
        >
          <Icon size={13} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 whitespace-nowrap font-pixel text-[11px] uppercase leading-[1.5] text-pixel-line sm:text-[13px]">
        {compact(total.realization_amount)}
      </p>
      <p className="mt-1 text-[10.5px] leading-snug text-pixel-ink/75">
        realisasi dari pagu{" "}
        <span className="tabular font-mono font-bold text-pixel-line">
          {compact(total.budget_amount)}
        </span>
      </p>

      <div className="mt-3">
        <ProgressBar
          value={total.realization_percentage}
          tone={tone === "navy" || tone === "sky" ? "revenue" : "spending"}
          label={`${label}: ${percent(total.realization_percentage)} dari pagu`}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="font-pixel text-[8px] uppercase text-pixel-line">
          {percent(total.realization_percentage)}
        </span>
        <span className="text-right text-[10px] text-pixel-ink/65">
          {total.realization_percentage === null
            ? "pagu nol / tidak tersedia"
            : note}
        </span>
      </div>
    </div>
  );
}

function PaguRow({
  label,
  total,
  tone,
  icon: Icon,
}: {
  label: string;
  total: FiscalTotal;
  tone: "revenue" | "spending";
  icon: typeof Landmark;
}) {
  return (
    <div className="border-4 border-pixel-line bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-pixel text-[8.5px] uppercase leading-[1.7] text-pixel-line">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center border-[3px] border-pixel-line",
              tone === "revenue"
                ? "bg-sky-100 text-sky-800"
                : "bg-emerald-100 text-emerald-800",
            )}
          >
            <Icon size={13} aria-hidden="true" />
          </span>
          {label}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 border-2 border-pixel-line px-2 py-0.5 font-pixel text-[9px] uppercase",
            tone === "revenue"
              ? "bg-sky-50 text-pixel-line"
              : "bg-emerald-50 text-pixel-line",
          )}
        >
          {percent(total.realization_percentage)}
        </span>
      </div>

      <div className="mt-3.5">
        <ProgressBar
          value={total.realization_percentage}
          tone={tone}
          label={`${label}: ${percent(total.realization_percentage)} dari pagu`}
        />
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-3 border-t-2 border-pixel-line/15 pt-3">
        <div>
          <dt className="font-pixel text-[7px] uppercase text-pixel-ink/60">Pagu</dt>
          <dd className="tabular mt-1 font-mono text-[11.5px] font-bold text-pixel-line">
            {money(total.budget_amount)}
          </dd>
        </div>
        <div className="border-l-2 border-pixel-line/15 pl-3">
          <dt className="font-pixel text-[7px] uppercase text-pixel-ink/60">
            Realisasi
          </dt>
          <dd className="tabular mt-1 font-mono text-[11.5px] font-bold text-pixel-line">
            {money(total.realization_amount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function CheckRow({
  status,
  label,
  detail,
}: {
  status: BudgetQualityStatus;
  label: string;
  detail: string;
}) {
  const style = QUALITY_STYLE[status];
  const Icon = style.Icon;

  return (
    <li className="flex items-start gap-2.5 py-2">
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 border-pixel-line",
          style.chip,
        )}
        aria-hidden="true"
      >
        <Icon size={11} strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold leading-tight text-pixel-line">
          {label}
          <span className="sr-only"> — status {style.label}</span>
        </p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-pixel-ink/75">{detail}</p>
      </div>
    </li>
  );
}

export function RegionalFiscalMonitor({
  initialData,
}: {
  initialData: RegionalFiscalData;
}) {
  const [data, setData] = useState(initialData);
  const [activeRegionId, setActiveRegionId] = useState<string>(
    initialData.regions[0]?.snapshot.region_id ?? "kota-depok",
  );
  const [showSubAccounts, setShowSubAccounts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const active: RegionalFiscalRegionData = useMemo(() => {
    return (
      data.regions.find((region) => region.snapshot.region_id === activeRegionId) ??
      data.regions[0]
    );
  }, [data, activeRegionId]);

  const snapshot = active.snapshot;

  const kpis = useMemo(
    () => [
      {
        key: "revenue",
        label: "Pendapatan Daerah",
        total: snapshot.totals.revenue,
        icon: Landmark,
        tone: "navy" as const,
        note: periodLabel(snapshot),
      },
      {
        key: "pad",
        label: "PAD",
        total: totalFor(snapshot, "PAD"),
        icon: Wallet,
        tone: "sky" as const,
        note: periodLabel(snapshot),
      },
      {
        key: "spending",
        label: "Belanja Daerah",
        total: snapshot.totals.spending,
        icon: TrendingUp,
        tone: "emerald" as const,
        note: periodLabel(snapshot),
      },
      {
        key: "pegawai",
        label: "Belanja Pegawai",
        total: totalFor(snapshot, "Belanja Pegawai"),
        icon: Building2,
        tone: "amber" as const,
        note: periodLabel(snapshot),
      },
      {
        key: "barang",
        label: "Belanja Barang dan Jasa",
        total: totalFor(snapshot, "Belanja Barang dan Jasa"),
        icon: ScrollText,
        tone: "sky" as const,
        note: periodLabel(snapshot),
      },
      {
        key: "modal",
        label: "Belanja Modal",
        total: totalFor(snapshot, "Belanja Modal"),
        icon: PiggyBank,
        tone: "emerald" as const,
        note: periodLabel(snapshot),
      },
    ],
    [snapshot],
  );

  const rows = useMemo(
    () =>
      snapshot.accounts.filter(
        (account) => showSubAccounts || account.account_level <= 2,
      ),
    [snapshot, showSubAccounts],
  );

  const fractionalAccounts = snapshot.accounts.filter((account) =>
    account.quality_notes.some((note) => note.includes("pecahan")),
  );
  const zeroBudgetAccounts = snapshot.accounts.filter((account) =>
    account.quality_notes.some((note) => note.includes("Pagu nol")),
  );
  const nullAccounts = snapshot.accounts.filter((account) =>
    account.quality_notes.some((note) => note.includes("tidak tersedia")),
  );

  const historical = active.history;
  const firstPoint = historical[0];
  const lastPoint = historical[historical.length - 1];

  async function refresh() {
    setRefreshing(true);
    setRefreshMessage(null);
    try {
      const response = await fetch("/api/fiskal?fresh=1", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const next = (await response.json()) as RegionalFiscalData;
      setData(next);
      const liveCount = next.regions.filter((region) => region.live).length;
      setRefreshMessage(
        liveCount === next.regions.length
          ? `Data ditarik ulang dari portal DJPK (${liveCount} wilayah).`
          : `Sebagian wilayah memakai snapshot tersimpan (${liveCount}/${next.regions.length} live).`,
      );
    } catch {
      setRefreshMessage(
        "Gagal menarik data baru dari portal DJPK. Angka yang tampil tetap snapshot tersimpan dan tidak diubah.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex < 0) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    nextTab?.focus();
    const regionId = nextTab?.dataset.regionId;
    if (regionId) setActiveRegionId(regionId);
  }

  return (
    <>
      <PageHero
        eyebrow="Regional Fiscal Monitor"
        title="Angka APBD resmi, bukan perkiraan."
        description="Pagu dan realisasi APBD dari Portal Data SIKD DJPK, disajikan per periode dengan status kualitas data yang terbuka. Setiap angka dapat ditelusuri ke sumber aslinya."
        breadcrumb={[{ label: "Fiskal" }]}
        actions={
          <>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="btn-amber w-full sm:w-auto"
            >
              <RefreshCw
                size={13}
                aria-hidden="true"
                className={refreshing ? "animate-spin" : undefined}
              />
              {refreshing ? "Menarik data…" : "Tarik data terbaru"}
            </button>
            <a
              href={snapshot.source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost w-full sm:w-auto"
            >
              Buka portal DJPK
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-cream px-2.5 py-1 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
            <Clock size={11} aria-hidden="true" />
            Periode {periodLabel(snapshot)} · APBD {snapshot.budget_version}
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 py-1 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
            <Database size={11} aria-hidden="true" />
            {active.live ? "Data langsung portal" : "Snapshot tersimpan"}
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 py-1 font-pixel text-[8px] uppercase text-pixel-line shadow-chip">
            <ShieldCheck size={11} aria-hidden="true" />
            Laporan SIKD — bukan audited
          </span>
        </div>
        {refreshMessage ? (
          <p
            role="status"
            className="mt-3 max-w-2xl border-2 border-pixel-line bg-white px-2.5 py-1.5 text-[11px] leading-snug text-pixel-ink/85 shadow-chip"
          >
            {refreshMessage}
          </p>
        ) : null}
      </PageHero>

      {/* ---- Region tabs ---- */}
      <div className="border-b-4 border-pixel-line bg-pixel-cream-deep">
        <div
          className="container-page flex gap-2 overflow-x-auto py-3"
          role="tablist"
          aria-label="Pilih entitas APBD"
          onKeyDown={onTabKeyDown}
        >
          {DJPK_REGION_ORDER.map((regionId) => {
            const region = data.regions.find(
              (item) => item.snapshot.region_id === regionId,
            );
            if (!region) return null;
            const selected = regionId === activeRegionId;
            const label = TAB_LABELS[regionId] ?? {
              name: region.snapshot.region_label,
              note: "",
            };
            return (
              <button
                key={regionId}
                type="button"
                role="tab"
                id={`tab-${regionId}`}
                aria-selected={selected}
                aria-controls={`panel-${regionId}`}
                tabIndex={selected ? 0 : -1}
                data-region-id={regionId}
                onClick={() => setActiveRegionId(regionId)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 flex-col items-start justify-center border-[3px] border-pixel-line px-3 py-1.5 text-left shadow-chip transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                  selected
                    ? "bg-pixel-sun text-pixel-line"
                    : "bg-white text-pixel-ink/80 hover:bg-pixel-panel",
                )}
              >
                <span className="font-pixel text-[9px] uppercase leading-[1.6]">
                  {label.name}
                </span>
                <span className="text-[10px] leading-tight opacity-80">{label.note}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="bg-pixel-cream"
        role="tabpanel"
        id={`panel-${activeRegionId}`}
        aria-labelledby={`tab-${activeRegionId}`}
        tabIndex={-1}
      >
        <div className="container-page py-8 sm:py-10">
          {/* ---- Mapping callout ---- */}
          <div className="mb-5 flex items-start gap-3 border-4 border-pixel-line bg-pixel-sun/35 p-4 shadow-card">
            <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
              <MapPin size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                Cakupan wilayah · {snapshot.apbd_entity}
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-pixel-ink/90">
                {mappingNoteFor(activeRegionId)}
              </p>
            </div>
          </div>

          {/* ---- KPI slots ---- */}
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <KpiSlot
                key={kpi.key}
                label={kpi.label}
                total={kpi.total}
                icon={kpi.icon}
                tone={kpi.tone}
                note={kpi.note}
              />
            ))}
          </div>

          {/* ---- Pagu vs realisasi ---- */}
          <section className="mt-6" aria-labelledby="pagu-realisasi-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-pixel-line pb-2">
              <h2
                id="pagu-realisasi-heading"
                className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line"
              >
                Pagu vs realisasi
              </h2>
              <span className="text-[11px] text-pixel-ink/70">
                Periode {periodLabel(snapshot)} · kumulatif s.d. bulan laporan
              </span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <PaguRow
                label="Pendapatan Daerah"
                total={snapshot.totals.revenue}
                tone="revenue"
                icon={Banknote}
              />
              <PaguRow
                label="Belanja Daerah"
                total={snapshot.totals.spending}
                tone="spending"
                icon={TrendingUp}
              />
            </div>
          </section>

          {/* ---- Trend + integrity ---- */}
          <div className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
            <div className="min-w-0 border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-3">
                <div className="min-w-0">
                  <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                    Tren realisasi per periode
                  </h2>
                  <p className="mt-1.5 text-[11.5px] text-pixel-ink/75">
                    Realisasi kumulatif {DJPK_MONTHS[(firstPoint?.period_month ?? 1) - 1]}–
                    {DJPK_MONTHS[(lastPoint?.period_month ?? 11) - 1]}{" "}
                    {snapshot.fiscal_year}, semua periode berstatus APBD {snapshot.budget_version}.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-medium text-pixel-ink/80">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 border border-pixel-line bg-pixel-blue"
                    />
                    Pendapatan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 border border-pixel-line bg-emerald-600"
                    />
                    Belanja
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <FiscalTrendChart points={historical} height={286} />
              </div>
              <p className="mt-3 border-t-[3px] border-pixel-line/15 pt-3 text-[10.5px] leading-relaxed text-pixel-ink/75">
                Titik diambil dari laporan SIKD setiap periode; bulan tanpa data tidak
                diinterpolasi. Realisasi pada portal bersifat kumulatif, sehingga garis
                menanjak bukan angka bulanan terpisah. {active.live ? "Angka terbaru ditarik langsung dari portal." : "Angka berasal dari snapshot tersimpan karena portal tidak dapat dihubungi saat halaman dimuat."}
              </p>
            </div>

            <div className="min-w-0 border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-pixel-line pb-3">
                <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
                  Sumber & integritas
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 border-2 border-pixel-line px-2 py-0.5 font-pixel text-[8px] uppercase",
                    active.live ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                  )}
                >
                  {active.live ? "Live" : "Snapshot"}
                </span>
              </div>

              <dl className="mt-3 space-y-2 text-[11px]">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-pixel-ink/65">Entitas APBD</dt>
                  <dd className="text-right font-semibold text-pixel-line">
                    {snapshot.apbd_entity}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-pixel-ink/65">Periode</dt>
                  <dd className="text-right font-semibold text-pixel-line">
                    {periodLabel(snapshot)} · APBD {snapshot.budget_version}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-pixel-ink/65">Data diterima SIKD</dt>
                  <dd className="text-right font-semibold text-pixel-line">
                    {snapshot.reported_at ? formatDateShort(snapshot.reported_at) : "tidak terbaca"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-pixel-ink/65">Diambil PRAJVALA</dt>
                  <dd className="text-right font-semibold text-pixel-line">
                    {formatDateTime(snapshot.fetched_at)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-pixel-ink/65">Akun</dt>
                  <dd className="text-right font-semibold text-pixel-line">
                    {snapshot.accounts.length} baris · {snapshot.quality.valid} valid ·{" "}
                    {snapshot.quality.warning} perhatian · {snapshot.quality.invalid} tidak
                    valid
                  </dd>
                </div>
              </dl>

              <p className="mt-3 border-t-2 border-pixel-line/15 pt-3 font-pixel text-[7px] uppercase text-pixel-ink/55">
                Pemeriksaan integritas
              </p>
              <ul className="mt-1 divide-y-2 divide-pixel-line/10">
                {snapshot.checks.map((check) => (
                  <CheckRow
                    key={check.id}
                    status={check.status}
                    label={check.label}
                    detail={check.detail}
                  />
                ))}
              </ul>

              <a
                href={snapshot.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex min-h-9 w-full items-center justify-between gap-2 border-[3px] border-pixel-line bg-pixel-panel px-2.5 text-[10.5px] font-semibold text-pixel-line shadow-chip"
              >
                <span className="min-w-0 truncate">{snapshot.source_url}</span>
                <ArrowUpRight size={12} aria-hidden="true" className="shrink-0" />
              </a>
            </div>
          </div>

          {/* ---- Data notes ---- */}
          <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Catatan kualitas data">
            <div className="border-4 border-pixel-line bg-white p-4 shadow-card">
              <p className="font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                Catatan kualitas data
              </p>
              <ul className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-pixel-ink/85">
                {fractionalAccounts.length > 0 ? (
                  <li className="flex gap-2">
                    <Info size={13} className="mt-0.5 shrink-0 text-pixel-line" aria-hidden="true" />
                    <span>
                      <strong>{fractionalAccounts.length} akun</strong> memuat pecahan
                      rupiah pada sumber. PRAJVALA membulatkan ke rupiah terdekat dan
                      menyimpan nilai mentahnya untuk audit.
                    </span>
                  </li>
                ) : null}
                {zeroBudgetAccounts.length > 0 ? (
                  <li className="flex gap-2">
                    <AlertTriangle
                      size={13}
                      className="mt-0.5 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <span>
                      {zeroBudgetAccounts.length} akun berpagu nol tetapi memiliki
                      realisasi. Persentasenya disimpan <strong>null</strong>, bukan 0%:{" "}
                      {zeroBudgetAccounts.map((account) => account.account_name).join(", ")}.
                    </span>
                  </li>
                ) : null}
                {nullAccounts.length > 0 ? (
                  <li className="flex gap-2">
                    <Info size={13} className="mt-0.5 shrink-0 text-pixel-line" aria-hidden="true" />
                    <span>
                      {nullAccounts.length} nominal tidak tersedia di sumber dan disimpan
                      sebagai <strong>null</strong> — tidak pernah diisi nol.
                    </span>
                  </li>
                ) : null}
                <li className="flex gap-2">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0 text-pixel-line" aria-hidden="true" />
                  <span>
                    Angka berasal dari laporan SIKD daerah, bukan laporan keuangan yang
                    telah diaudit. Selisih total dan sub-akun ditandai, bukan disembunyikan.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-4 border-pixel-line bg-pixel-panel/40 p-4 shadow-card">
              <p className="font-pixel text-[8px] uppercase leading-[1.7] text-pixel-line">
                Cara membaca periode
              </p>
              <ul className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-pixel-ink/85">
                <li>
                  <strong>Periode laporan</strong> adalah {periodLabel(snapshot)}, sedangkan{" "}
                  <strong>tanggal terima SIKD</strong>{" "}
                  {snapshot.reported_at ? formatDateShort(snapshot.reported_at) : "tidak terbaca"}{" "}
                  adalah kapan data masuk ke portal — dua hal berbeda.
                </li>
                <li>
                  Realisasi bersifat kumulatif sejak awal tahun; jangan menjumlahkan
                  angka dua bulan sebagai realisasi bulanan.
                </li>
                <li>
                  Semua periode yang ditampilkan berstatus <strong>APBD {snapshot.budget_version}</strong>.
                  Perubahan versi anggaran akan ditampilkan sebagai seri terpisah, tidak
                  dicampur.
                </li>
              </ul>
            </div>
          </section>

          {/* ---- Account table ---- */}
          <section className="mt-6" aria-labelledby="akun-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-pixel-line pb-2">
              <div>
                <h2
                  id="akun-heading"
                  className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line"
                >
                  Rincian akun APBD
                </h2>
                <p className="mt-1 text-[11px] text-pixel-ink/70">
                  {periodLabel(snapshot)} · {snapshot.accounts.length} akun · satuan rupiah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubAccounts((value) => !value)}
                aria-pressed={showSubAccounts}
                className="btn-mini"
              >
                {showSubAccounts ? "Sembunyikan sub-akun" : "Tampilkan sub-akun"}
              </button>
            </div>

            <div className="mt-4 overflow-x-auto border-4 border-pixel-line bg-white shadow-card">
              <table className="w-full min-w-[760px] border-collapse text-[11.5px]">
                <caption className="sr-only">
                  Rincian pagu dan realisasi akun APBD {snapshot.apbd_entity}, periode{" "}
                  {periodLabel(snapshot)}, APBD {snapshot.budget_version}.
                </caption>
                <thead>
                  <tr className="border-b-4 border-pixel-line bg-pixel-panel">
                    <th scope="col" className="px-3 py-2 text-left font-pixel text-[8px] uppercase text-pixel-line">
                      Akun
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-pixel text-[8px] uppercase text-pixel-line">
                      Pagu (Rp)
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-pixel text-[8px] uppercase text-pixel-line">
                      Realisasi (Rp)
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-pixel text-[8px] uppercase text-pixel-line">
                      %
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-pixel text-[8px] uppercase text-pixel-line">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => {
                    const style = QUALITY_STYLE[account.data_quality_status];
                    const StatusIcon = style.Icon;
                    const notes = account.quality_notes.join(" ");
                    const indent =
                      account.account_level === 1
                        ? "pl-3"
                        : account.account_level === 2
                          ? "pl-6"
                          : "pl-10";
                    return (
                      <tr
                        key={account.account_code}
                        className={cn(
                          "border-b-2 border-pixel-line/10",
                          account.account_level === 1 && "bg-pixel-panel/35",
                        )}
                      >
                        <th scope="row" className={cn("py-1.5 pr-3 text-left font-normal", indent)}>
                          <span
                            className={cn(
                              "text-pixel-ink",
                              account.account_level === 1 &&
                                "font-pixel text-[8px] uppercase leading-[1.8] text-pixel-line",
                              account.account_level === 2 && "font-semibold text-pixel-line",
                              account.account_level === 3 && "text-pixel-ink/85",
                            )}
                          >
                            {account.account_name}
                          </span>
                          {account.account_level === 2 ? (
                            <span className="ml-1.5 text-[9.5px] uppercase tracking-wide text-pixel-ink/45">
                              kelompok
                            </span>
                          ) : null}
                        </th>
                        <td className="tabular whitespace-nowrap px-3 py-1.5 text-right font-mono">
                          {money(account.budget_amount)}
                        </td>
                        <td className="tabular whitespace-nowrap px-3 py-1.5 text-right font-mono">
                          {money(account.realization_amount)}
                        </td>
                        <td
                          className="tabular whitespace-nowrap px-3 py-1.5 text-right font-mono"
                          title={
                            account.source_percentage === null
                              ? undefined
                              : `Persentase portal: ${formatPercent(account.source_percentage)}`
                          }
                        >
                          {percent(account.realization_percentage)}
                          {account.realization_percentage === null ? (
                            <span className="ml-1 font-sans text-[9px] text-pixel-ink/50">
                              {account.budget_amount === 0 ? "pagu nol" : "tidak tersedia"}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 border-2 px-1.5 py-0.5 text-[9.5px] font-bold",
                              style.chip,
                            )}
                            title={notes || `${style.label} tanpa catatan`}
                          >
                            <StatusIcon size={9} strokeWidth={3} aria-hidden="true" />
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-pixel-ink/70">
              Kode akun internal diturunkan dari nama akun DJPK; portal tidak menerbitkan
              kode BAS, sehingga PRAJVALA tidak mengarang kode resmi. Arahkan kursor ke
              lencana status untuk melihat catatan per akun.
            </p>
          </section>

          {/* ---- Attribution ---- */}
          <div className="mt-6 border-4 border-pixel-line bg-pixel-panel p-4 shadow-card">
            <p className="font-pixel text-[8px] uppercase leading-[1.8] text-pixel-line">
              Atribusi sumber
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-pixel-ink/90">
              {DJPK_ATTRIBUTION}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-pixel-ink/70">
              <a
                href={DJPK_SOURCE_PORTAL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 underline decoration-2 underline-offset-4 hover:text-pixel-line"
              >
                Portal Data SIKD
                <ExternalLink size={10} aria-hidden="true" />
              </a>
              <span>
                Data dibuat ulang oleh PRAJVALA dari tabel HTML dan ekspor SpreadsheetML
                DJPK; tidak ada angka yang diubah selain pembulatan rupiah dan persentase
                turunan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const DJPK_REGION_ORDER = [
  "kota-depok",
  "kabupaten-bogor",
  "provinsi-dki-jakarta",
] as const;

function mappingNoteFor(regionId: string): string {
  if (regionId === "kabupaten-bogor") {
    return "Cibinong adalah cakupan lokasi PRAJVALA, bukan entitas anggaran. Angka di halaman ini berasal dari APBD Kabupaten Bogor dan tidak didistribusikan ke Kecamatan Cibinong tanpa data pendukung.";
  }
  if (regionId === "provinsi-dki-jakarta") {
    return "TB Simatupang adalah koridor lokasi PRAJVALA, bukan entitas anggaran. Angka di halaman ini berasal dari APBD Provinsi DKI Jakarta, bukan anggaran khusus koridor TB Simatupang.";
  }
  return "Angka di halaman ini adalah APBD Kota Depok sebagai satu entitas pemerintahan, bukan anggaran per kelurahan atau per kecamatan.";
}