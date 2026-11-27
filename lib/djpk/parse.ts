import type {
  BudgetQualityStatus,
  DjpkRegionId,
  FiscalTotal,
  RegionalBudgetAccount,
  RegionalBudgetCheck,
  RegionalBudgetPeriodPoint,
  RegionalBudgetSnapshot,
} from "@/types";
import {
  DJPK_MONTHS,
  DJPK_SOURCE_NAME,
  type DjpkRegionConfig,
} from "@/lib/djpk/config";

/**
 * Parser dan validator APBD DJPK SIKD.
 *
 * Portal menampilkan tabel HTML (untuk hierarki/indentasi akun) dan CSV yang
 * sebenarnya berupa SpreadsheetML berisi nominal rupiah penuh. Kita memakai
 * keduanya: HTML untuk level akun dan metadata periode/versi, XML untuk angka.
 * Kedua sumber dicocokkan baris demi baris; bila jumlah/nama tidak sama,
 * parser menolak data alih-alih menebak.
 */

const MONTH_INDEX: Record<string, number> = Object.fromEntries(
  DJPK_MONTHS.flatMap((name, index) => [
    [name.toLowerCase(), index + 1],
    [name.slice(0, 3).toLowerCase(), index + 1],
  ]),
);

const AMOUNT_TOLERANCE_RUPIAH = 2;
const PERCENTAGE_TOLERANCE = 0.02;

/* -------------------------------------------------------------------------- */
/*  HTML helpers                                                              */
/* -------------------------------------------------------------------------- */

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Source parsing                                                            */
/* -------------------------------------------------------------------------- */

export interface ParsedApbdHtmlRow {
  account_name: string;
  level: 1 | 2 | 3;
}

export interface ParsedApbdHtml {
  wilayah: string;
  disclaimer: string;
  /** Teks periode realisasi, mis. "November 2026" dari "realisasi APBD s.d ...". */
  period_text: string | null;
  /** Bulan periode realisasi (1–12), bukan bulan tanggal terima SIKD. */
  period_month: number | null;
  period_year: number | null;
  /** Tanggal data diterima SIKD — metadata, bukan periode laporan. */
  reported_at_text: string | null;
  reported_at: string | null;
  budget_version: string;
  csv_url: string | null;
  rows: ParsedApbdHtmlRow[];
}

export interface ParsedApbdXmlRow {
  account_name: string;
  budget: string;
  realization: string;
  percentage: string;
}

function parseIndonesianDate(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTH_INDEX[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : iso;
}

export function parseApbdHtml(html: string): ParsedApbdHtml {
  const wilayah = stripTags(html.match(/id="wilayah">([\s\S]*?)<\/label>/)?.[1] ?? "");
  const disclaimer = stripTags(
    html.match(/id="disclaimer">([\s\S]*?)<\/label>/)?.[1] ?? "",
  );
  const keterangan = stripTags(
    html.match(/id="keterangan"[^>]*>([\s\S]*?)<\/label>/)?.[1] ?? "",
  );
  const csvUrl = html.match(/id=link_csv href="([^"]*)"/)?.[1] ?? null;

  const versionMatch = keterangan.match(/Data APBD\s+([A-Za-z]+)/i);
  const budgetVersion = versionMatch
    ? versionMatch[1].charAt(0).toUpperCase() + versionMatch[1].slice(1).toLowerCase()
    : "Tidak diketahui";

  const reportedTextMatch = keterangan.match(
    /data diterima SIKD per\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  );
  const reportedAtText = reportedTextMatch ? reportedTextMatch[1] : null;

  // Periode laporan ada pada frasa "realisasi APBD s.d November 2026".
  // Tanggal "data diterima SIKD per ..." adalah waktu terima, bukan periode.
  const periodTextMatch = keterangan.match(
    /realisasi APBD\s+s\.?\s*d\.?\s*([A-Za-z]+)\s+(\d{4})/i,
  );
  const periodMonth = periodTextMatch
    ? MONTH_INDEX[periodTextMatch[1].toLowerCase()] ?? null
    : null;
  const periodYear = periodTextMatch ? Number(periodTextMatch[2]) : null;
  const periodText = periodTextMatch
    ? `${periodTextMatch[1]} ${periodTextMatch[2]}`
    : null;

  const tableStart = html.indexOf('<div id="tbl_data">');
  if (tableStart < 0) {
    throw new Error("Tabel APBD tidak ditemukan pada respons DJPK.");
  }

  // The portal emits malformed `<tr/>` row closers, so split on `<tr` and keep
  // chunks that actually carry table cells.
  const chunks = html.slice(tableStart).split(/<tr/i).slice(1);
  const rows: ParsedApbdHtmlRow[] = [];

  for (const chunk of chunks) {
    const cells = [...chunk.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
    if (cells.length < 5) continue;

    const name = stripTags(cells[1][1]);
    if (!name) continue;

    const indent = chunk.match(/text-indent:\s*([\d.]+)em/i)?.[1];
    const background = chunk.match(/background-color:\s*(#[0-9a-fA-F]{6})/i)?.[1];
    const indentValue = indent ? Number(indent) : null;

    let level: 1 | 2 | 3;
    if (indentValue !== null) {
      level = indentValue <= 0 ? 1 : indentValue <= 2 ? 2 : 3;
    } else if (background?.toLowerCase() === "#d9edf7") {
      level = 1;
    } else if (background?.toLowerCase() === "#faf2cc") {
      level = 2;
    } else {
      level = 3;
    }

    rows.push({ account_name: name, level });
  }

  if (rows.length === 0) {
    throw new Error("Tidak ada baris akun pada tabel APBD DJPK.");
  }

  return {
    wilayah,
    disclaimer,
    period_text: periodText,
    period_month: periodMonth,
    period_year: periodYear,
    reported_at_text: reportedAtText,
    reported_at: parseIndonesianDate(reportedAtText),
    budget_version: budgetVersion,
    csv_url: csvUrl ? decodeEntities(csvUrl) : null,
    rows,
  };
}

export function parseApbdXml(xml: string): ParsedApbdXmlRow[] {
  const rowChunks = [...xml.matchAll(/<Row>([\s\S]*?)<\/Row>/gi)];
  if (rowChunks.length === 0) {
    throw new Error("Spreadsheet APBD kosong atau tidak dikenali.");
  }

  const rows = rowChunks.slice(1).map((match) => {
    const cells = [...match[1].matchAll(/<Data[^>]*>([\s\S]*?)<\/Data>/gi)].map(
      (cell) => decodeEntities(cell[1]).trim(),
    );
    if (cells.length < 4) {
      throw new Error("Baris Spreadsheet APBD tidak memiliki empat kolom.");
    }
    return {
      account_name: cells[0].replace(/\s+/g, " ").trim(),
      budget: cells[1],
      realization: cells[2],
      percentage: cells[3],
    };
  });

  if (!rows.some((row) => row.account_name)) {
    throw new Error("Nama akun pada Spreadsheet APBD kosong.");
  }

  return rows;
}

/* -------------------------------------------------------------------------- */
/*  Normalisation                                                             */
/* -------------------------------------------------------------------------- */

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function slugifyAccount(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return `akun-${hashString(name)}`;
  if (slug.length <= 64) return slug;
  return `${slug.slice(0, 55)}-${hashString(name)}`;
}

function parseAmount(raw: string): {
  value: number | null;
  fractional: boolean;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, fractional: false };
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return { value: null, fractional: false };
  return {
    value: Math.round(numeric),
    fractional: Math.abs(numeric - Math.round(numeric)) > 1e-9,
  };
}

function parsePercentage(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentageFor(budget: number | null, realization: number | null): number | null {
  if (budget === null || realization === null || budget <= 0) return null;
  return roundPercentage((realization / budget) * 100);
}

function toTotal(account: RegionalBudgetAccount | undefined): FiscalTotal {
  if (!account) {
    return {
      budget_amount: null,
      realization_amount: null,
      realization_percentage: null,
    };
  }
  return {
    budget_amount: account.budget_amount,
    realization_amount: account.realization_amount,
    realization_percentage: account.realization_percentage,
  };
}

const QUALITY_RANK: Record<BudgetQualityStatus, number> = {
  valid: 0,
  warning: 1,
  invalid: 2,
};

function worstQuality(statuses: BudgetQualityStatus[]): BudgetQualityStatus {
  return statuses.reduce<BudgetQualityStatus>(
    (worst, status) =>
      QUALITY_RANK[status] > QUALITY_RANK[worst] ? status : worst,
    "valid",
  );
}

export interface BuildSnapshotInput {
  region: DjpkRegionConfig;
  fiscalYear: number;
  periodMonth: number;
  html: string;
  xml: string;
  fetchedAt: string;
  sourceUrl: string;
}

export function buildRegionalBudgetSnapshot({
  region,
  fiscalYear,
  periodMonth,
  html,
  xml,
  fetchedAt,
  sourceUrl,
}: BuildSnapshotInput): RegionalBudgetSnapshot {
  const parsedHtml = parseApbdHtml(html);
  const parsedXml = parseApbdXml(xml);

  /* --- Guard rails: never mix wrong region, period, or row alignment. --- */
  if (normalizeName(parsedHtml.wilayah) !== normalizeName(region.portalLabel)) {
    throw new Error(
      `Wilayah portal tidak cocok: mengharapkan "${region.portalLabel}", menerima "${parsedHtml.wilayah}".`,
    );
  }

  const expectedMonth = DJPK_MONTHS[periodMonth - 1];
  if (parsedHtml.period_month !== null && parsedHtml.period_month !== periodMonth) {
    throw new Error(
      `Periode portal tidak cocok: mengharapkan ${expectedMonth} ${fiscalYear}, menerima "${parsedHtml.period_text}".`,
    );
  }
  if (parsedHtml.period_year !== null && parsedHtml.period_year !== fiscalYear) {
    throw new Error(
      `Tahun portal tidak cocok: mengharapkan ${fiscalYear}, menerima "${parsedHtml.period_text}".`,
    );
  }

  if (parsedHtml.rows.length !== parsedXml.length) {
    throw new Error(
      `Jumlah baris HTML (${parsedHtml.rows.length}) berbeda dari Spreadsheet (${parsedXml.length}); data tidak dicampur.`,
    );
  }

  const accounts: RegionalBudgetAccount[] = [];
  const usedCodes = new Set<string>();
  const lastByLevel: Record<number, string | null> = { 1: null, 2: null, 3: null };
  let fractionalCount = 0;
  let nullCount = 0;
  let percentageMismatchCount = 0;
  let zeroBudgetWithRealization = 0;
  let negativeCount = 0;
  let nameMismatchCount = 0;

  for (let index = 0; index < parsedHtml.rows.length; index += 1) {
    const htmlRow = parsedHtml.rows[index];
    const xmlRow = parsedXml[index];

    if (normalizeName(htmlRow.account_name) !== normalizeName(xmlRow.account_name)) {
      nameMismatchCount += 1;
      throw new Error(
        `Nama akun baris ${index + 1} tidak cocok: HTML "${htmlRow.account_name}" vs Spreadsheet "${xmlRow.account_name}".`,
      );
    }

    const budget = parseAmount(xmlRow.budget);
    const realization = parseAmount(xmlRow.realization);
    const sourcePercentage = parsePercentage(xmlRow.percentage);

    let accountCode = slugifyAccount(htmlRow.account_name);
    if (usedCodes.has(accountCode)) {
      accountCode = `${accountCode}-l${htmlRow.level}`;
    }
    let duplicateIndex = 2;
    const baseCode = accountCode;
    while (usedCodes.has(accountCode)) {
      accountCode = `${baseCode}-${duplicateIndex}`;
      duplicateIndex += 1;
    }
    usedCodes.add(accountCode);

    const parentCode =
      htmlRow.level === 1 ? null : lastByLevel[htmlRow.level - 1] ?? null;
    lastByLevel[htmlRow.level] = accountCode;
    if (htmlRow.level === 1) {
      lastByLevel[2] = null;
      lastByLevel[3] = null;
    }
    if (htmlRow.level === 2) {
      lastByLevel[3] = null;
    }

    const notes: string[] = [];
    let status: BudgetQualityStatus = "valid";

    if (budget.value === null) {
      nullCount += 1;
      status = "invalid";
      notes.push("Nominal pagu tidak tersedia pada sumber.");
    }
    if (realization.value === null) {
      nullCount += 1;
      status = "invalid";
      notes.push("Nominal realisasi tidak tersedia pada sumber.");
    }
    if (budget.fractional || realization.fractional) {
      fractionalCount += 1;
      if (status === "valid") status = "warning";
      notes.push(
        "Sumber memuat pecahan rupiah; nominal dibulatkan ke rupiah terdekat tanpa mengubah nilai mentah.",
      );
    }

    if (budget.value !== null && budget.value < 0) {
      negativeCount += 1;
      if (status === "valid") status = "warning";
      notes.push("Pagu bernilai negatif pada sumber.");
    }
    if (realization.value !== null && realization.value < 0) {
      negativeCount += 1;
      if (status === "valid") status = "warning";
      notes.push("Realisasi bernilai negatif pada sumber.");
    }

    const computedPercentage = percentageFor(budget.value, realization.value);

    if (budget.value === 0) {
      notes.push("Pagu nol; persentase tidak dapat dihitung dan disimpan sebagai null.");
      if ((realization.value ?? 0) > 0) {
        zeroBudgetWithRealization += 1;
        if (status === "valid") status = "warning";
        notes.push(
          "Realisasi tercatat meskipun pagu nol; bukan angka nol yang setara dengan 0%.",
        );
      }
    }

    if (
      computedPercentage !== null &&
      sourcePercentage !== null &&
      Math.abs(computedPercentage - sourcePercentage) > PERCENTAGE_TOLERANCE
    ) {
      percentageMismatchCount += 1;
      if (status === "valid") status = "warning";
      notes.push(
        `Persentase sumber ${sourcePercentage} berbeda dari hitungan pagu/realisasi ${computedPercentage}.`,
      );
    }
    if (computedPercentage !== null && sourcePercentage === null) {
      if (status === "valid") status = "warning";
      notes.push("Persentase sumber kosong; dihitung ulang dari nominal rupiah.");
    }

    accounts.push({
      account_code: accountCode,
      account_name: htmlRow.account_name,
      account_level: htmlRow.level,
      parent_code: parentCode,
      budget_amount: budget.value,
      realization_amount: realization.value,
      realization_percentage: computedPercentage,
      source_percentage: sourcePercentage,
      data_quality_status: status,
      quality_notes: notes,
      raw: {
        account_name: xmlRow.account_name,
        budget: xmlRow.budget,
        realization: xmlRow.realization,
        percentage: xmlRow.percentage,
      },
    });
  }

  /* --- Hierarchy consistency checks. ---------------------------------- */
  const checks: RegionalBudgetCheck[] = [];

  checks.push({
    id: "row-alignment",
    label: "Keselarasan baris HTML dan Spreadsheet",
    status: nameMismatchCount === 0 ? "valid" : "invalid",
    detail:
      nameMismatchCount === 0
        ? `${accounts.length} akun cocok antara tabel HTML dan CSV SpreadsheetML.`
        : `${nameMismatchCount} baris tidak cocok; data ditolak.`,
  });

  checks.push({
    id: "period-lock",
    label: "Kunci periode dan versi anggaran",
    status: parsedHtml.period_month !== null && parsedHtml.period_year !== null ? "valid" : "warning",
    detail: `${parsedHtml.period_text ?? `${DJPK_MONTHS[periodMonth - 1]} ${fiscalYear}`} · APBD ${
      parsedHtml.budget_version
    } · data diterima SIKD ${parsedHtml.reported_at_text ?? "tidak terbaca"}.`,
  });

  checks.push({
    id: "value-completeness",
    label: "Kelengkapan nominal",
    status: nullCount === 0 ? "valid" : "invalid",
    detail:
      nullCount === 0
        ? "Semua pagu dan realisasi terbaca; null tidak pernah diperlakukan sebagai nol."
        : `${nullCount} nominal tidak tersedia dan disimpan sebagai null.`,
  });

  checks.push({
    id: "integral-rupiah",
    label: "Satuan rupiah bulat",
    status: fractionalCount === 0 ? "valid" : "warning",
    detail:
      fractionalCount === 0
        ? "Seluruh nominal sudah berupa rupiah bulat."
        : `${fractionalCount} nominal pecahan dibulatkan; nilai mentah tetap disimpan.`,
  });

  checks.push({
    id: "percentage-consistency",
    label: "Konsistensi persentase",
    status: percentageMismatchCount === 0 ? "valid" : "warning",
    detail:
      percentageMismatchCount === 0
        ? "Persentase portal cocok dengan hitungan pagu/realisasi (toleransi 0,02 poin)."
        : `${percentageMismatchCount} persentase berbeda dari hitungan pagu/realisasi.`,
  });

  if (zeroBudgetWithRealization > 0) {
    checks.push({
      id: "zero-budget",
      label: "Pagu nol dengan realisasi",
      status: "warning",
      detail: `${zeroBudgetWithRealization} akun memiliki pagu nol tetapi realisasi positif; persentasenya null, bukan 0%.`,
    });
  }
  if (negativeCount > 0) {
    checks.push({
      id: "negative-values",
      label: "Nilai negatif",
      status: "warning",
      detail: `${negativeCount} nominal negatif berasal dari sumber (mis. pembiayaan neto).`,
    });
  }

  for (const parent of accounts) {
    if (parent.account_level === 3) continue;
    const children = accounts.filter(
      (account) => account.parent_code === parent.account_code,
    );
    if (children.length === 0) continue;

    const missingChild = children.some(
      (child) =>
        child.budget_amount === null || child.realization_amount === null,
    );
    if (missingChild) {
      checks.push({
        id: `aggregate-${parent.account_code}`,
        label: `Konsistensi ${parent.account_name}`,
        status: "invalid",
        detail: "Sub-akun memiliki nominal tidak tersedia; total tidak dapat diverifikasi.",
      });
      continue;
    }

    let expectedBudget: number;
    let expectedRealization: number;

    const income = children.find(
      (child) => child.account_name === "Penerimaan Pembiayaan Daerah",
    );
    const expense = children.find(
      (child) => child.account_name === "Pengeluaran Pembiayaan Daerah",
    );

    if (
      parent.account_name === "Pembiayaan Daerah" &&
      income &&
      expense &&
      income.budget_amount !== null &&
      income.realization_amount !== null &&
      expense.budget_amount !== null &&
      expense.realization_amount !== null
    ) {
      expectedBudget = income.budget_amount - expense.budget_amount;
      expectedRealization = income.realization_amount - expense.realization_amount;
    } else {
      expectedBudget = children.reduce(
        (sum, child) => sum + (child.budget_amount ?? 0),
        0,
      );
      expectedRealization = children.reduce(
        (sum, child) => sum + (child.realization_amount ?? 0),
        0,
      );
    }

    const budgetDiff = Math.abs((parent.budget_amount ?? 0) - expectedBudget);
    const realizationDiff = Math.abs(
      (parent.realization_amount ?? 0) - expectedRealization,
    );
    const consistent =
      budgetDiff <= AMOUNT_TOLERANCE_RUPIAH &&
      realizationDiff <= AMOUNT_TOLERANCE_RUPIAH;

    checks.push({
      id: `aggregate-${parent.account_code}`,
      label: `Konsistensi ${parent.account_name}`,
      status: consistent ? "valid" : "warning",
      detail: consistent
        ? `${children.length} sub-akun menjumlah tepat ke total.`
        : `Selisih pagu ${budgetDiff} dan realisasi ${realizationDiff} terhadap jumlah sub-akun.`,
    });

    if (!consistent) {
      parent.data_quality_status =
        parent.data_quality_status === "invalid" ? "invalid" : "warning";
      parent.quality_notes.push(
        `Jumlah sub-akun tidak sama dengan total (selisih pagu ${budgetDiff}, realisasi ${realizationDiff}).`,
      );
    }
  }

  const revenue = accounts.find(
    (account) => account.account_level === 1 && account.account_name === "Pendapatan Daerah",
  );
  const spending = accounts.find(
    (account) => account.account_level === 1 && account.account_name === "Belanja Daerah",
  );
  const financing = accounts.find(
    (account) => account.account_level === 1 && account.account_name === "Pembiayaan Daerah",
  );

  const qualityStatuses = accounts.map((account) => account.data_quality_status);
  const quality = {
    status: worstQuality([
      ...qualityStatuses,
      ...checks.map((check) => check.status),
    ]),
    valid: qualityStatuses.filter((status) => status === "valid").length,
    warning: qualityStatuses.filter((status) => status === "warning").length,
    invalid: qualityStatuses.filter((status) => status === "invalid").length,
  };

  return {
    id: `${region.id}__${fiscalYear}__${String(periodMonth).padStart(2, "0")}__${slugifyAccount(
      parsedHtml.budget_version,
    )}`,
    region_id: region.id,
    region_label: region.label,
    apbd_entity: region.apbdEntity,
    coverage: region.coverage,
    fiscal_year: fiscalYear,
    period_month: periodMonth,
    budget_version: parsedHtml.budget_version,
    reported_at: parsedHtml.reported_at,
    fetched_at: fetchedAt,
    source_url: sourceUrl,
    source_name: DJPK_SOURCE_NAME,
    accounts,
    totals: {
      revenue: toTotal(revenue),
      spending: toTotal(spending),
      financing: toTotal(financing),
    },
    checks,
    quality,
  };
}

/* -------------------------------------------------------------------------- */
/*  Derived period point                                                      */
/* -------------------------------------------------------------------------- */

function findAccount(
  snapshot: RegionalBudgetSnapshot,
  name: string,
  level?: 1 | 2 | 3,
): RegionalBudgetAccount | undefined {
  return snapshot.accounts.find(
    (account) =>
      account.account_name === name &&
      (level === undefined || account.account_level === level),
  );
}

export function snapshotToPeriodPoint(
  snapshot: RegionalBudgetSnapshot,
): RegionalBudgetPeriodPoint {
  return {
    fiscal_year: snapshot.fiscal_year,
    period_month: snapshot.period_month,
    budget_version: snapshot.budget_version,
    reported_at: snapshot.reported_at,
    revenue: snapshot.totals.revenue,
    spending: snapshot.totals.spending,
    financing: snapshot.totals.financing,
    pad: toTotal(findAccount(snapshot, "PAD", 2)),
    spending_pegawai: toTotal(findAccount(snapshot, "Belanja Pegawai", 2)),
    spending_barang_jasa: toTotal(
      findAccount(snapshot, "Belanja Barang dan Jasa", 2),
    ),
    spending_modal: toTotal(findAccount(snapshot, "Belanja Modal", 2)),
  };
}

/* -------------------------------------------------------------------------- */
/*  Change detection                                                          */
/* -------------------------------------------------------------------------- */

export function withChangeSummary(
  snapshot: RegionalBudgetSnapshot,
  previous: RegionalBudgetSnapshot | undefined,
): RegionalBudgetSnapshot {
  if (!previous) {
    return {
      ...snapshot,
      changes: {
        compared_to: null,
        changed: false,
        changed_accounts: [],
        note: "Sinkronisasi pertama; belum ada snapshot pembanding.",
      },
    };
  }

  const previousByCode = new Map(
    previous.accounts.map((account) => [account.account_code, account]),
  );
  const changedAccounts: string[] = [];

  for (const account of snapshot.accounts) {
    const previousAccount = previousByCode.get(account.account_code);
    if (!previousAccount) {
      changedAccounts.push(account.account_code);
      continue;
    }
    const budgetChanged =
      Math.abs(
        (account.budget_amount ?? 0) - (previousAccount.budget_amount ?? 0),
      ) > 0.5;
    const realizationChanged =
      Math.abs(
        (account.realization_amount ?? 0) -
          (previousAccount.realization_amount ?? 0),
      ) > 0.5;
    if (budgetChanged || realizationChanged) changedAccounts.push(account.account_code);
  }

  return {
    ...snapshot,
    changes: {
      compared_to: previous.id,
      changed: changedAccounts.length > 0,
      changed_accounts: changedAccounts,
      note:
        changedAccounts.length > 0
          ? `${changedAccounts.length} akun berubah dibanding snapshot ${previous.id}.`
          : `Tidak ada perubahan nominal dibanding snapshot ${previous.id}.`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Region id helper                                                          */
/* -------------------------------------------------------------------------- */

export function isDjpkRegionId(value: string): value is DjpkRegionId {
  return (
    value === "kota-depok" ||
    value === "kabupaten-bogor" ||
    value === "provinsi-dki-jakarta"
  );
}