import type { DjpkRegionId } from "@/types";

/**
 * Sumber data APBD DJPK SIKD.
 *
 * Endpoint pemetaan diverifikasi langsung dari portal:
 * - `GET /portal/provinsi/{tahun}` mengembalikan peta kode provinsi.
 * - `GET /portal/pemda/{provinsi}/{tahun}` mengembalikan peta kode pemda.
 *
 * Kode pemda bersifat lokal per provinsi. Karena itu `pemda=03` di Jawa Barat
 * berarti Kabupaten Bogor, sedangkan `pemda=03` di Aceh berarti pemda lain.
 * Jangan pernah menebak pasangan provinsi/pemda.
 */
export const DJPK_PORTAL_BASE = "https://djpk.kemenkeu.go.id/portal";

export const DJPK_SOURCE_NAME =
  "DJPK SIKD — Portal Data APBD, Kementerian Keuangan RI";

export const DJPK_ATTRIBUTION =
  "Sumber: Direktorat Jenderal Perimbangan Keuangan, Kementerian Keuangan RI — Portal Data SIKD.";

export const DJPK_SOURCE_PORTAL = `${DJPK_PORTAL_BASE}/data/apbd`;

export const DJPK_FISCAL_YEAR = 2026;

/** Periode terbaru yang tersedia saat integrasi ini dibuat. */
export const DJPK_LATEST_PERIOD = 11;

export interface DjpkRegionConfig {
  id: DjpkRegionId;
  /** Nama wilayah PRAJVALA. */
  label: string;
  /** Entitas APBD yang benar-benar menjadi sumber angka. */
  apbdEntity: string;
  /** Label wilayah seperti yang dicetak portal DJPK — dipakai untuk sanity check. */
  portalLabel: string;
  /** Label pada dropdown pemda portal; untuk provinsi biasanya berawalan "Provinsi". */
  pemdaLabel: string;
  provinceCode: string;
  pemdaCode: string;
  /** Batas cakupan: apa yang diwakili dan apa yang tidak. */
  coverage: string;
  /** Catatan pemetaan khusus yang harus tampil di UI. */
  mappingNote: string;
}

export const DJPK_REGIONS: DjpkRegionConfig[] = [
  {
    id: "kota-depok",
    label: "Kota Depok",
    apbdEntity: "Pemerintah Kota Depok",
    portalLabel: "Kota Depok",
    pemdaLabel: "Kota Depok",
    provinceCode: "10",
    pemdaCode: "21",
    coverage: "APBD Pemerintah Kota Depok",
    mappingNote:
      "Nilai yang ditampilkan adalah APBD Kota Depok sebagai satu entitas pemerintahan, bukan anggaran per kelurahan.",
  },
  {
    id: "kabupaten-bogor",
    label: "Kabupaten Bogor · cakupan Cibinong",
    apbdEntity: "Pemerintah Kabupaten Bogor",
    portalLabel: "Kab. Bogor",
    pemdaLabel: "Kab. Bogor",
    provinceCode: "10",
    pemdaCode: "03",
    coverage: "APBD Kabupaten Bogor untuk cakupan Kecamatan Cibinong",
    mappingNote:
      "Cibinong adalah cakupan lokasi PRAJVALA, bukan entitas anggaran. Angka berasal dari APBD Kabupaten Bogor dan tidak didistribusikan ke Kecamatan Cibinong tanpa data pendukung.",
  },
  {
    id: "provinsi-dki-jakarta",
    label: "DKI Jakarta · koridor TB Simatupang",
    apbdEntity: "Pemerintah Provinsi DKI Jakarta",
    portalLabel: "DKI Jakarta",
    pemdaLabel: "Provinsi DKI Jakarta",
    provinceCode: "09",
    pemdaCode: "00",
    coverage: "APBD Provinsi DKI Jakarta untuk koridor TB Simatupang",
    mappingNote:
      "TB Simatupang adalah koridor lokasi PRAJVALA, bukan entitas anggaran. Angka berasal dari APBD Provinsi DKI Jakarta, bukan anggaran khusus koridor.",
  },
];

export function getDjpkRegion(id: DjpkRegionId): DjpkRegionConfig {
  const region = DJPK_REGIONS.find((item) => item.id === id);
  if (!region) throw new Error(`Wilayah DJPK tidak dikenal: ${id}`);
  return region;
}

export function buildApbdHtmlUrl(
  region: DjpkRegionConfig,
  fiscalYear: number,
  periodMonth: number,
): string {
  const params = new URLSearchParams({
    periode: String(periodMonth),
    tahun: String(fiscalYear),
    provinsi: region.provinceCode,
    pemda: region.pemdaCode,
  });
  return `${DJPK_PORTAL_BASE}/data/apbd?${params.toString()}`;
}

export function buildApbdCsvUrl(
  region: DjpkRegionConfig,
  fiscalYear: number,
  periodMonth: number,
): string {
  const params = new URLSearchParams({
    type: "apbd",
    periode: String(periodMonth),
    tahun: String(fiscalYear),
    provinsi: region.provinceCode,
    pemda: region.pemdaCode,
  });
  return `${DJPK_PORTAL_BASE}/csv_apbd?${params.toString()}`;
}

export const DJPK_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;