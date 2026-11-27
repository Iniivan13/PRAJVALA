export type RegionLevel = "Kelurahan" | "Desa" | "Kecamatan";

export type ProjectCategory =
  | "Infrastruktur Jalan"
  | "Pendidikan"
  | "Kesehatan"
  | "Pemberdayaan UMKM"
  | "Bantuan Sosial"
  | "Infrastruktur Umum";

export type ProjectStatus =
  | "Terverifikasi"
  | "Dalam Pengerjaan"
  | "Perlu Audit"
  | "Direncanakan";

export type MilestoneStatus = "selesai" | "aktif" | "menunggu";

export type FairnessStatus = "Normal" | "Perlu Tinjauan";

export type Suitability = "Sesuai Target" | "Terlambat" | "Indikasi Kejanggalan";

export type DocumentCategory =
  | "APBD/APBDes"
  | "RAB"
  | "Tender"
  | "LPJ"
  | "Laporan Akhir";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SectorAllocation {
  sector: ProjectCategory;
  pagu: number;
  realized: number;
  color: string;
}

export interface CashflowPoint {
  month: string;
  planned: number;
  realized: number;
}

export interface Region {
  id: string;
  name: string;
  fullName: string;
  level: RegionLevel;
  city: string;
  province: string;
  population: number;
  budgetYear: number;
  totalBudget: number;
  absorbed: number;
  accountabilityScore: number;
  coordinates: Coordinates;
  zoom: number;
  description: string;
  headline: string;
  sectors: SectorAllocation[];
  cashflow: CashflowPoint[];
}

export interface ProjectImage {
  src: string;
  alt: string;
  takenAt: string;
  coordinates: Coordinates;
}

export interface Milestone {
  label: string;
  date: string;
  status: MilestoneStatus;
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  regionId: string;
  category: ProjectCategory;
  status: ProjectStatus;
  summary: string;
  description: string;
  location: {
    address: string;
    neighborhood: string;
    district: string;
    city: string;
    province: string;
    coordinates: Coordinates;
  };
  budget: number;
  realized: number;
  fiscalYear: number;
  vendor: string;
  contractNumber: string;
  progress: number;
  startDate: string;
  endDate: string;
  validationScore: number;
  reportCount: number;
  upvotes: number;
  distribution: {
    sesuai: number;
    terlambat: number;
    kejanggalan: number;
  };
  before: ProjectImage;
  after: ProjectImage;
  milestones: Milestone[];
  specs: { label: string; value: string }[];
}

export interface BudgetItem {
  id: string;
  projectId: string;
  regionId: string;
  category: ProjectCategory;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  vendor: string;
  fairness: FairnessStatus;
  benchmarkUnitPrice: number;
  note?: string;
}

export type StorageSource = "firebase";

export type UserRole = "warga" | "pj_daerah" | "admin";

/**
 * Status moderasi laporan.
 *
 * `pending`  — baru dikirim warga, belum ditinjau pengelola.
 * `verified` — sudah dicocokkan dan diterima sebagai bukti pendukung.
 * `flagged`  — ditandai untuk ditinjau lebih lanjut; tetap tampil dengan label.
 */
export type ModerationStatus = "pending" | "verified" | "flagged";

export interface CitizenReport {
  id: string;
  projectId: string;
  author: string;
  authorId?: string;
  initials: string;
  verified: boolean;
  suitability: Suitability;
  rating: number;
  comment: string;
  createdAt: string;
  upvotes: number;
  photoUrl?: string;
  isUserSubmitted?: boolean;
  source?: StorageSource;
  /** Wilayah proyek saat laporan dibuat; dipakai untuk moderasi daerah. */
  regionId?: string;
  /** Laporan resmi yang diterbitkan pengelola, bukan warga. */
  official?: boolean;
  moderationStatus?: ModerationStatus;
  moderationNote?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export interface PublicDocument {
  id: string;
  title: string;
  regionId: string;
  category: DocumentCategory;
  year: number;
  publishedAt: string;
  fileSize: string;
  pageCount: number;
  summaryPoints: string[];
  highlight: string;
}

/** Jenis dokumen publik yang boleh dicari: hanya Drive/Docs resmi. */
export type PublicSourceCategory = "drive" | "docs" | "sheets" | "slides" | "forms";

/**
 * Tautan dokumen anggaran publik yang disimpan administrator.
 *
 * Hanya tautan Google Drive/Docs/Sheets/Slides/Forms pada domain `go.id`
 * yang boleh ditambahkan. Tidak ada berkas sensitif, kredensial, atau data
 * bocor yang didukung fitur ini.
 */
export interface PublicSourceLink {
  id: string;
  title: string;
  url: string;
  category: PublicSourceCategory;
  regionId: string;
  year: number;
  note?: string;
  addedBy?: string;
  createdAt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface RegionSummary {
  id: string;
  name: string;
  level: string;
  population: number;
  totalBudget: number;
  absorbed: number;
  absorptionRate: number;
  accountabilityScore: number;
  verifiedProjects: number;
  totalProjects: number;
  sectors: SectorAllocation[];
  cashflow: CashflowPoint[];
}

export interface NewReportInput {
  projectId: string;
  author?: string;
  suitability: Suitability;
  rating: number;
  comment: string;
  photoUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  regionId: string;
  createdAt: string;
  /** Asal akun: tersinkron ke Firebase. */
  source?: StorageSource;
  /** Peran akun; `admin` berasal dari custom claim Firebase Auth. */
  role?: UserRole;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  regionId?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** Pendaftaran berhasil, tetapi pengguna harus mengonfirmasi email dahulu. */
  needsConfirmation?: boolean;
  /** Pesan sukses / instruksi lanjutan untuk ditampilkan di UI. */
  message?: string;
}

