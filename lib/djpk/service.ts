import type {
  DjpkRegionId,
  RegionalBudgetHistoryFile,
  RegionalBudgetPeriodPoint,
  RegionalBudgetSnapshot,
  RegionalBudgetSnapshotFile,
  RegionalFiscalData,
} from "@/types";
import snapshotsJson from "@/data/djpk/snapshots-2026-11.json";
import historyJson from "@/data/djpk/history-2026.json";
import {
  DJPK_ATTRIBUTION,
  DJPK_REGIONS,
  DJPK_SOURCE_NAME,
  DJPK_SOURCE_PORTAL,
} from "@/lib/djpk/config";
import { fetchRegionalBudgetSnapshot } from "@/lib/djpk/fetch";
import {
  snapshotToPeriodPoint,
  withChangeSummary,
} from "@/lib/djpk/parse";

const FALLBACK_SNAPSHOTS = snapshotsJson as unknown as RegionalBudgetSnapshotFile;
const HISTORY = historyJson as unknown as RegionalBudgetHistoryFile;

/**
 * Menggabungkan pembacaan langsung portal DJPK dengan snapshot tersimpan.
 *
 * Setiap wilayah diambil ulang dari portal (dengan cache 15 menit). Bila satu
 * wilayah gagal diambil, snapshot tersimpan dipakai dan ditandai `live: false`
 * agar UI tidak pernah menyamakan data cache dengan data realtime.
 */
export async function getRegionalFiscalData(
  options: { fresh?: boolean } = {},
): Promise<RegionalFiscalData> {
  const fiscalYear = FALLBACK_SNAPSHOTS.fiscal_year;
  const periodMonth = FALLBACK_SNAPSHOTS.period_month;
  const fallbackByRegion = FALLBACK_SNAPSHOTS.regions;

  // Diambil berurutan: portal DJPK membatasi laju permintaan, dan menembak
  // enam permintaan serentak membuat wilayah terakhir jatuh ke cache. Data
  // yang gagal tetap ditandai `live: false`, tidak pernah dipalsukan.
  const regions = [];
  for (const config of DJPK_REGIONS) {
    const fallbackSnapshot = fallbackByRegion[config.id];
    let snapshot: RegionalBudgetSnapshot = fallbackSnapshot;
    let live = false;

    try {
      const result = await fetchRegionalBudgetSnapshot(
        config,
        fiscalYear,
        periodMonth,
        { fresh: options.fresh },
      );
      snapshot = withChangeSummary(result.snapshot, fallbackSnapshot);
      live = true;
    } catch (error) {
      // Snapshot tersimpan adalah data nyata yang pernah diambil, lengkap
      // dengan fetched_at-nya sendiri. Jangan pernah mengaku sebagai live.
      console.warn(
        `[djpk] ${config.id} memakai snapshot tersimpan:`,
        error instanceof Error ? error.message : error,
      );
      live = false;
    }

    const savedPoints =
      HISTORY.regions[config.id]?.points.filter(
        (point) => point.budget_version === snapshot.budget_version,
      ) ?? [];

    const currentPoint = snapshotToPeriodPoint(snapshot);
    const points = mergePeriodPoints(savedPoints, currentPoint);

    regions.push({ snapshot, history: points, live });
  }

  return {
    generated_at: new Date().toISOString(),
    source_name: DJPK_SOURCE_NAME,
    source_portal: DJPK_SOURCE_PORTAL,
    attribution: DJPK_ATTRIBUTION,
    regions,
  };
}

function mergePeriodPoints(
  saved: RegionalBudgetPeriodPoint[],
  current: RegionalBudgetPeriodPoint,
): RegionalBudgetPeriodPoint[] {
  const byMonth = new Map<number, RegionalBudgetPeriodPoint>();
  for (const point of saved) byMonth.set(point.period_month, point);
  byMonth.set(current.period_month, current);
  return [...byMonth.values()].sort((a, b) => a.period_month - b.period_month);
}

export function fallbackSnapshotFor(
  regionId: DjpkRegionId,
): RegionalBudgetSnapshot {
  return FALLBACK_SNAPSHOTS.regions[regionId];
}