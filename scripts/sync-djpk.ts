/**
 * Sinkronisasi APBD DJPK SIKD.
 *
 * Menjalankan scrape nyata ke portal, memverifikasi pemetaan provinsi/pemda
 * lewat endpoint dropdown resmi, lalu menulis:
 *
 * - data/djpk/raw/*.xml          : respons mentah sebelum normalisasi
 * - data/djpk/snapshots-2026-11.json : snapshot periode terbaru (fallback UI)
 * - data/djpk/history-2026.json  : tren periode dari sumber
 * - data/djpk/firestore-docs.json: dokumen siap unggah ke Firestore
 *
 * Jalankan: npm run sync:djpk
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  DjpkRegionId,
  RegionalBudgetAccount,
  RegionalBudgetHistoryFile,
  RegionalBudgetPeriodPoint,
  RegionalBudgetSnapshot,
  RegionalBudgetSnapshotFile,
} from "@/types";
import {
  DJPK_ATTRIBUTION,
  DJPK_FISCAL_YEAR,
  DJPK_LATEST_PERIOD,
  DJPK_PORTAL_BASE,
  DJPK_REGIONS,
  DJPK_SOURCE_NAME,
  DJPK_SOURCE_PORTAL,
  type DjpkRegionConfig,
} from "@/lib/djpk/config";
import { fetchApbdSource } from "@/lib/djpk/fetch";
import {
  buildRegionalBudgetSnapshot,
  snapshotToPeriodPoint,
  withChangeSummary,
} from "@/lib/djpk/parse";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "djpk");
const RAW_DIR = path.join(DATA_DIR, "raw");

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function versionSlug(version: string): string {
  return version
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function checksum(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "PRAJVALA/1.0 (+https://prajvala.vercel.app; pemantauan APBD publik)",
    },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return (await response.json()) as T;
}

/**
 * Verifikasi pemetaan persis seperti dropdown portal: provinsi lalu pemda.
 * Kode pemda tidak global, jadi langkah ini wajib sebelum scrape.
 */
async function verifyMapping(region: DjpkRegionConfig, year: number): Promise<void> {
  const provinces = await fetchJson<Record<string, string>>(
    `${DJPK_PORTAL_BASE}/provinsi/${year}`,
  );
  const province = provinces[region.provinceCode];
  if (!province) {
    throw new Error(`Kode provinsi ${region.provinceCode} tidak ada untuk ${year}.`);
  }

  const pemdas = await fetchJson<Record<string, string>>(
    `${DJPK_PORTAL_BASE}/pemda/${region.provinceCode}/${year}`,
  );
  const pemda = pemdas[region.pemdaCode];
  if (!pemda) {
    throw new Error(
      `Kode pemda ${region.pemdaCode} tidak ada di ${province} untuk ${year}.`,
    );
  }
  if (pemda.trim().toLowerCase() !== region.pemdaLabel.toLowerCase()) {
    throw new Error(
      `Pemetaan berubah: ${region.provinceCode}/${region.pemdaCode} sekarang "${pemda}", konfigurasi mengharapkan "${region.pemdaLabel}".`,
    );
  }
  console.log(
    `[map] ${region.id}: ${region.provinceCode}/${region.pemdaCode} -> ${pemda} (${province})`,
  );
}

interface FlatSnapshotDoc {
  id: string;
  fields: {
    region_id: DjpkRegionId;
    fiscal_year: number;
    period_month: number;
    account_code: string;
    account_name: string;
    account_level: number;
    parent_code: string | null;
    budget_amount: number | null;
    realization_amount: number | null;
    realization_percentage: number | null;
    source_percentage: number | null;
    source_url: string;
    source_name: string;
    reported_at: string | null;
    fetched_at: string;
    data_quality_status: string;
    quality_notes: string[];
    budget_version: string;
    raw_budget: string;
    raw_realization: string;
    raw_percentage: string;
    snapshot_id: string;
  };
}

function snapshotDoc(
  snapshot: RegionalBudgetSnapshot,
  account: RegionalBudgetAccount,
): FlatSnapshotDoc {
  return {
    id: [
      snapshot.region_id,
      snapshot.fiscal_year,
      pad(snapshot.period_month),
      versionSlug(snapshot.budget_version),
      account.account_code,
    ].join("__"),
    fields: {
      region_id: snapshot.region_id,
      fiscal_year: snapshot.fiscal_year,
      period_month: snapshot.period_month,
      account_code: account.account_code,
      account_name: account.account_name,
      account_level: account.account_level,
      parent_code: account.parent_code,
      budget_amount: account.budget_amount,
      realization_amount: account.realization_amount,
      realization_percentage: account.realization_percentage,
      source_percentage: account.source_percentage,
      source_url: snapshot.source_url,
      source_name: snapshot.source_name,
      reported_at: snapshot.reported_at,
      fetched_at: snapshot.fetched_at,
      data_quality_status: account.data_quality_status,
      quality_notes: account.quality_notes,
      budget_version: snapshot.budget_version,
      raw_budget: account.raw.budget,
      raw_realization: account.raw.realization,
      raw_percentage: account.raw.percentage,
      snapshot_id: snapshot.id,
    },
  };
}

interface RawDoc {
  id: string;
  fields: Record<string, unknown>;
}

async function main() {
  const year = Number(argValue("--year") ?? DJPK_FISCAL_YEAR);
  const latestPeriod = Number(argValue("--period") ?? DJPK_LATEST_PERIOD);

  if (!Number.isInteger(year) || year < 2011 || year > 2100) {
    throw new Error(`Tahun tidak valid: ${year}`);
  }
  if (!Number.isInteger(latestPeriod) || latestPeriod < 1 || latestPeriod > 12) {
    throw new Error(`Periode tidak valid: ${latestPeriod}`);
  }

  await mkdir(RAW_DIR, { recursive: true });

  const snapshotsFile = path.join(DATA_DIR, `snapshots-${year}-${pad(latestPeriod)}.json`);
  const historyFile = path.join(DATA_DIR, `history-${year}.json`);
  const previous = await readJson<RegionalBudgetSnapshotFile>(snapshotsFile);

  const currentSnapshots: Partial<Record<DjpkRegionId, RegionalBudgetSnapshot>> = {};
  const allPoints: Partial<Record<DjpkRegionId, RegionalBudgetPeriodPoint[]>> = {};
  const allSnapshots: Partial<Record<DjpkRegionId, RegionalBudgetSnapshot[]>> = {};
  const rawDocs: RawDoc[] = [];
  const syncRuns: RawDoc[] = [];
  const failures: string[] = [];

  for (const region of DJPK_REGIONS) {
    await verifyMapping(region, year);
    allPoints[region.id] = [];
    allSnapshots[region.id] = [];

    for (let period = 1; period <= latestPeriod; period += 1) {
      try {
        const source = await fetchApbdSource(region, year, period, { fresh: true });
        const fetchedAt = new Date().toISOString();
        const snapshot = buildRegionalBudgetSnapshot({
          region,
          fiscalYear: year,
          periodMonth: period,
          html: source.html,
          xml: source.xml,
          fetchedAt,
          sourceUrl: source.htmlUrl,
        });

        await writeFile(
          path.join(RAW_DIR, `${region.id}-${year}-${pad(period)}.xml`),
          source.xml,
          "utf8",
        );
        if (period === latestPeriod) {
          await writeFile(
            path.join(RAW_DIR, `${region.id}-${year}-${pad(period)}.html`),
            source.html,
            "utf8",
          );
        }

        allSnapshots[region.id]!.push(snapshot);
        allPoints[region.id]!.push(snapshotToPeriodPoint(snapshot));

        if (period === latestPeriod) {
          currentSnapshots[region.id] = withChangeSummary(
            snapshot,
            previous?.regions[region.id],
          );
          rawDocs.push({
            id: `${region.id}__${year}__${pad(period)}__${versionSlug(
              snapshot.budget_version,
            )}`,
            fields: {
              region_id: region.id,
              fiscal_year: year,
              period_month: period,
              budget_version: snapshot.budget_version,
              source_url: snapshot.source_url,
              source_name: snapshot.source_name,
              reported_at: snapshot.reported_at,
              fetched_at: snapshot.fetched_at,
              content_type: "application/xml",
              checksum_sha256: checksum(source.xml),
              payload: source.xml,
            },
          });
          syncRuns.push({
            id: `${region.id}__${year}__${pad(period)}__${fetchedAt.replace(
              /[^0-9]/g,
              "",
            )}`,
            fields: {
              region_id: region.id,
              fiscal_year: year,
              period_month: period,
              budget_version: snapshot.budget_version,
              source_url: snapshot.source_url,
              reported_at: snapshot.reported_at,
              fetched_at: snapshot.fetched_at,
              row_count: snapshot.accounts.length,
              changed_accounts: snapshot.changes?.changed_accounts ?? [],
              quality_status: snapshot.quality.status,
              checksum_sha256: checksum(source.xml),
              source_name: snapshot.source_name,
            },
          });
        }

        console.log(
          `[ok] ${region.id} ${year}-${pad(period)} ${snapshot.budget_version} ` +
            `akun=${snapshot.accounts.length} kualitas=${snapshot.quality.status}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${region.id} ${year}-${pad(period)}: ${message}`);
        console.error(`[fail] ${region.id} ${year}-${pad(period)}: ${message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  for (const region of DJPK_REGIONS) {
    if (!currentSnapshots[region.id]) {
      throw new Error(
        `Snapshot periode ${latestPeriod}/${year} untuk ${region.id} gagal; sinkronisasi dibatalkan agar snapshot lama tidak tertimpa data kosong.`,
      );
    }
  }

  const generatedAt = new Date().toISOString();

  const snapshotFilePayload: RegionalBudgetSnapshotFile = {
    generated_at: generatedAt,
    fiscal_year: year,
    period_month: latestPeriod,
    source_name: DJPK_SOURCE_NAME,
    source_portal: DJPK_SOURCE_PORTAL,
    attribution: DJPK_ATTRIBUTION,
    regions: currentSnapshots as Record<DjpkRegionId, RegionalBudgetSnapshot>,
  };

  const historyPayload: RegionalBudgetHistoryFile = {
    generated_at: generatedAt,
    fiscal_year: year,
    source_name: DJPK_SOURCE_NAME,
    source_portal: DJPK_SOURCE_PORTAL,
    attribution: DJPK_ATTRIBUTION,
    regions: Object.fromEntries(
      DJPK_REGIONS.map((region) => [
        region.id,
        {
          label: region.label,
          entity: region.apbdEntity,
          coverage: region.coverage,
          points: (allPoints[region.id] ?? []).sort(
            (a, b) => a.period_month - b.period_month,
          ),
        },
      ]),
    ) as RegionalBudgetHistoryFile["regions"],
  };

  const snapshotDocs: FlatSnapshotDoc[] = [];
  for (const region of DJPK_REGIONS) {
    /* Detail penuh untuk periode terbaru. */
    for (const account of currentSnapshots[region.id]!.accounts) {
      snapshotDocs.push(snapshotDoc(currentSnapshots[region.id]!, account));
    }

    /* Riwayat periode sebelumnya: baris total tingkat 1, skema sama. */
    for (const snapshot of allSnapshots[region.id] ?? []) {
      if (snapshot.period_month === latestPeriod) continue;
      for (const account of snapshot.accounts) {
        if (account.account_level !== 1) continue;
        snapshotDocs.push(snapshotDoc(snapshot, account));
      }
    }
  }

  const firestorePayload = {
    generated_at: generatedAt,
    project: "prajvala",
    collection: "regional_budget_snapshots",
    snapshots: snapshotDocs,
    raw: rawDocs,
    runs: syncRuns,
  };

  await writeFile(snapshotsFile, `${JSON.stringify(snapshotFilePayload, null, 2)}\n`, "utf8");
  await writeFile(historyFile, `${JSON.stringify(historyPayload, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(DATA_DIR, "firestore-docs.json"),
    `${JSON.stringify(firestorePayload, null, 2)}\n`,
    "utf8",
  );

  const summary = DJPK_REGIONS.map((region) => {
    const snapshot = currentSnapshots[region.id]!;
    return {
      region: region.id,
      label: snapshot.region_label,
      entity: snapshot.apbd_entity,
      rows: snapshot.accounts.length,
      quality: snapshot.quality,
      reported_at: snapshot.reported_at,
      changed: snapshot.changes?.changed ?? false,
      revenue: snapshot.totals.revenue,
      spending: snapshot.totals.spending,
    };
  });

  console.log("\nSelesai.");
  console.log(JSON.stringify({ generatedAt, snapshots: snapshotDocs.length, summary, failures }, null, 2));
  if (failures.length > 0) {
    console.warn(
      `\n${failures.length} periode gagal diambil; periode lain tetap tersimpan.`,
    );
  }
}

main().catch((error) => {
  console.error("FATAL", error);
  process.exit(1);
});