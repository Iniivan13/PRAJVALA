import type { RegionalBudgetSnapshot } from "@/types";
import {
  buildApbdCsvUrl,
  buildApbdHtmlUrl,
  type DjpkRegionConfig,
} from "@/lib/djpk/config";
import { buildRegionalBudgetSnapshot } from "@/lib/djpk/parse";

/**
 * Pengambilan sumber APBD dari portal DJPK.
 *
 * Server-side only. Portal tidak menyediakan API JSON resmi untuk tabel APBD;
 * yang tersedia adalah HTML postur APBD dan ekspor SpreadsheetML (CSV).
 */

const REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_REVALIDATE_SECONDS = 900;

export interface ApbdSourcePayload {
  html: string;
  xml: string;
  htmlUrl: string;
  csvUrl: string;
}

async function fetchText(url: string, fresh: boolean): Promise<string> {
  let lastError: unknown;

  // Portal membatasi laju permintaan; dua percobaan singkat menghindari
  // snapshot jatuh ke cache hanya karena satu respons 429/5xx.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "text/html,application/xml,text/xml;q=0.9,*/*;q=0.8",
          "User-Agent":
            "PRAJVALA/1.0 (+https://prajvala.vercel.app; pemantauan APBD publik)",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        ...(fresh
          ? { cache: "no-store" as const }
          : { next: { revalidate: DEFAULT_REVALIDATE_SECONDS } }),
      });

      if (response.ok) return response.text();

      lastError = new Error(
        `DJPK menolak permintaan (${response.status}) untuk ${url}`,
      );
      if (response.status !== 429 && response.status < 500) throw lastError;
    } catch (error) {
      lastError = error;
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Gagal mengambil ${url}`);
}

export async function fetchApbdSource(
  region: DjpkRegionConfig,
  fiscalYear: number,
  periodMonth: number,
  options: { fresh?: boolean } = {},
): Promise<ApbdSourcePayload> {
  const htmlUrl = buildApbdHtmlUrl(region, fiscalYear, periodMonth);
  const csvUrl = buildApbdCsvUrl(region, fiscalYear, periodMonth);
  const fresh = options.fresh ?? false;

  const [html, xml] = await Promise.all([
    fetchText(htmlUrl, fresh),
    fetchText(csvUrl, fresh),
  ]);

  return { html, xml, htmlUrl, csvUrl };
}

export async function fetchRegionalBudgetSnapshot(
  region: DjpkRegionConfig,
  fiscalYear: number,
  periodMonth: number,
  options: { fresh?: boolean } = {},
): Promise<{ snapshot: RegionalBudgetSnapshot; source: ApbdSourcePayload }> {
  const source = await fetchApbdSource(region, fiscalYear, periodMonth, options);
  const snapshot = buildRegionalBudgetSnapshot({
    region,
    fiscalYear,
    periodMonth,
    html: source.html,
    xml: source.xml,
    fetchedAt: new Date().toISOString(),
    sourceUrl: source.htmlUrl,
  });
  return { snapshot, source };
}