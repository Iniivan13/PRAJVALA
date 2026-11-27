import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import type { PublicSourceCategory, PublicSourceLink } from "@/types";
import { createFirebaseClient } from "@/utils/firebase/client";

/**
 * Pencarian sumber anggaran publik yang aman.
 *
 * Fitur ini sengaja TIDAK menyediakan kategori File Sensitif, Login & Admin,
 * Config & Error, atau Data Leak. Kueri tidak dapat diedit bebas: pengguna
 * hanya memilih templat dokumen anggaran publik yang sudah ditinjau, semuanya
 * dibatasi ke `site:go.id` dan host Google Drive/Docs resmi.
 */

export interface PublicQueryTemplate {
  id: string;
  label: string;
  query: string;
  category: PublicSourceCategory;
}

export interface PublicQueryGroup {
  category: PublicSourceCategory;
  label: string;
  description: string;
  templates: PublicQueryTemplate[];
}

export const PUBLIC_SOURCE_CATEGORY_LABEL: Record<PublicSourceCategory, string> = {
  drive: "Google Drive",
  docs: "Google Docs",
  sheets: "Google Sheets",
  slides: "Google Slides",
  forms: "Google Forms",
};

export const PUBLIC_QUERY_GROUPS: PublicQueryGroup[] = [
  {
    category: "drive",
    label: "Google Drive",
    description: "Berkas dan folder anggaran yang dibagikan publik lewat Drive.",
    templates: [
      {
        id: "drive-all",
        label: "Semua tautan Google Drive",
        query: 'site:go.id "drive.google.com" "anggaran"',
        category: "drive",
      },
      {
        id: "drive-file",
        label: "File Google Drive spesifik",
        query: 'site:go.id "drive.google.com/file/d" "anggaran"',
        category: "drive",
      },
      {
        id: "drive-folder",
        label: "Folder Google Drive",
        query: 'site:go.id "drive.google.com/drive/folders" "anggaran"',
        category: "drive",
      },
      {
        id: "drive-open",
        label: "Tautan dengan ID Drive (Open)",
        query: 'site:go.id "drive.google.com/open?id" "anggaran"',
        category: "drive",
      },
    ],
  },
  {
    category: "docs",
    label: "Google Docs",
    description: "Dokumen Word/Docs berisi RAB, DPA, atau laporan anggaran.",
    templates: [
      {
        id: "docs-all",
        label: "Semua tautan Google Docs",
        query: 'site:go.id "docs.google.com" "anggaran"',
        category: "docs",
      },
      {
        id: "docs-document",
        label: "Dokumen (Word/Docs)",
        query: 'site:go.id "docs.google.com/document/d" "anggaran"',
        category: "docs",
      },
    ],
  },
  {
    category: "sheets",
    label: "Google Sheets",
    description: "Spreadsheet rekap anggaran dan realisasi yang terbuka untuk publik.",
    templates: [
      {
        id: "sheets-all",
        label: "Spreadsheet (Excel/Sheets)",
        query: 'site:go.id "docs.google.com/spreadsheets" "anggaran"',
        category: "sheets",
      },
    ],
  },
  {
    category: "slides",
    label: "Google Slides",
    description: "Paparan anggaran atau musrenbang yang dipublikasikan sebagai Slides.",
    templates: [
      {
        id: "slides-all",
        label: "Presentasi (PowerPoint/Slides)",
        query: 'site:go.id "docs.google.com/presentation" "anggaran"',
        category: "slides",
      },
    ],
  },
  {
    category: "forms",
    label: "Google Forms",
    description: "Formulir aspirasi atau pengaduan yang resmi dipublikasikan.",
    templates: [
      {
        id: "forms-all",
        label: "Formulir (Forms)",
        query: 'site:go.id "docs.google.com/forms" "anggaran"',
        category: "forms",
      },
    ],
  },
];

export const PUBLIC_QUERY_TEMPLATES: PublicQueryTemplate[] =
  PUBLIC_QUERY_GROUPS.flatMap((group) => group.templates);

const ALLOWED_HOST_TOKENS = [
  "drive.google.com",
  "docs.google.com",
  "docs.google.com/document",
  "docs.google.com/spreadsheets",
  "docs.google.com/presentation",
  "docs.google.com/forms",
];

/**
 * Pola yang tidak boleh muncul pada kueri. Ini adalah lapisan pertahanan
 * tambahan; UI hanya menampilkan templat tetap sehingga pengguna tidak dapat
 * mengetik kueri berbahaya.
 */
const FORBIDDEN_QUERY_PATTERNS: RegExp[] = [
  /\b(password|passwd|pwd|kredensial|credential|kata\s+sandi)\b/i,
  /\b(api[_-]?key|secret|token|private[_-]?key|access[_-]?key)\b/i,
  /(^|\s)filetype:(sql|env|bak|log|ini|conf|config|php|json|xml)(\s|$)/i,
  /(^|\s)ext:(sql|env|bak|log)(\s|$)/i,
  /inurl:(login|admin|wp-admin|wp-login|phpmyadmin|cpanel)/i,
  /intitle:("index of"|login|admin|dashboard)/i,
  /"index of"/i,
  /(\.env|wp-config|web\.config|config\.php|database\.yml)/i,
  /(data\s+leak|bocor|dump|sql\s+dump|db\s+dump|database\s+dump)/i,
  /(shell|backdoor|exploit)/i,
];

/**
 * Memastikan kueri hanya menyasar dokumen anggaran publik di `go.id`.
 * Dipakai oleh unit test dan sebagai penjaga terakhir sebelum tautan dibuat.
 */
export function isSafePublicQuery(query: string): boolean {
  const normalized = query.toLowerCase();
  if (!/\bsite:go\.id\b/.test(normalized)) return false;
  if (!ALLOWED_HOST_TOKENS.some((token) => normalized.includes(token))) {
    return false;
  }
  if (FORBIDDEN_QUERY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }
  // Hanya satu domain yang boleh disasar.
  const sites = normalized.match(/\bsite:[^\s"]+/g) ?? [];
  return sites.every((site) => site === "site:go.id");
}

export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export interface SourceUrlResult {
  ok: boolean;
  url?: string;
  category?: PublicSourceCategory;
  error?: string;
}

/**
 * Memvalidasi tautan sumber publik. Hanya host Google Drive/Docs yang
 * diizinkan, dengan jalur dokumen yang dikenal. Tautan lain ditolak.
 */
export function validatePublicSourceUrl(raw: string): SourceUrlResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Tempelkan tautan dokumen publik terlebih dahulu." };
  }

  const candidate = /^http:\/\//i.test(trimmed)
    ? trimmed.replace(/^http:\/\//i, "https://")
    : trimmed;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "Tautan tidak valid. Periksa kembali alamatnya." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Tautan harus memakai HTTPS." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "Tautan tidak boleh memuat kredensial." };
  }
  if (/[\s"'<>]/.test(candidate)) {
    return { ok: false, error: "Tautan tidak boleh memuat spasi atau tanda kutip." };
  }

  const category = detectSourceCategory(parsed);
  if (!category) {
    return {
      ok: false,
      error:
        "Hanya tautan Google Drive, Docs, Sheets, Slides, atau Forms publik yang didukung.",
    };
  }

  return { ok: true, url: parsed.toString(), category };
}

export function detectSourceCategory(
  url: URL | string,
): PublicSourceCategory | null {
  let parsed: URL;
  try {
    parsed = typeof url === "string" ? new URL(url) : url;
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;

  const path = parsed.pathname;
  const host = parsed.hostname.toLowerCase();

  if (host === "drive.google.com") {
    if (
      path.startsWith("/file/d/") ||
      path.startsWith("/drive/folders/") ||
      /^\/drive\/u\/\d+\/folders\//.test(path) ||
      (path === "/open" && parsed.searchParams.has("id"))
    ) {
      return "drive";
    }
    return null;
  }

  if (host === "docs.google.com") {
    if (path.startsWith("/document/d/")) return "docs";
    if (path.startsWith("/spreadsheets/d/")) return "sheets";
    if (path.startsWith("/presentation/d/")) return "slides";
    if (path.startsWith("/forms/d/") || path.startsWith("/forms/")) return "forms";
    return null;
  }

  return null;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  return "";
}

function mapSource(id: string, data: DocumentData): PublicSourceLink {
  const category: PublicSourceCategory =
    data.category === "docs" ||
    data.category === "sheets" ||
    data.category === "slides" ||
    data.category === "forms"
      ? data.category
      : "drive";

  return {
    id,
    title:
      typeof data.title === "string" && data.title.trim().length > 0
        ? data.title.trim()
        : "Dokumen anggaran publik",
    url: typeof data.url === "string" ? data.url : "",
    category,
    regionId: typeof data.regionId === "string" ? data.regionId : "all",
    year:
      typeof data.year === "number" && Number.isFinite(data.year)
        ? data.year
        : new Date().getFullYear(),
    note: typeof data.note === "string" && data.note.trim() ? data.note.trim() : undefined,
    addedBy: typeof data.addedBy === "string" ? data.addedBy : undefined,
    createdAt: toIso(data.createdAt),
  };
}

export async function getPublicSources(): Promise<PublicSourceLink[]> {
  const client = createFirebaseClient();
  if (!client) return [];

  const snapshot = await getDocs(collection(client.db, "publicSources"));
  return snapshot.docs
    .map((item) => mapSource(item.id, item.data()))
    .filter((item) => item.url.length > 0)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function addPublicSource(input: {
  title: string;
  url: string;
  category: PublicSourceCategory;
  regionId: string;
  year: number;
  note?: string;
  actorId: string;
}): Promise<string> {
  const client = createFirebaseClient();
  if (!client || !client.auth.currentUser) {
    throw new Error("Masuk sebagai administrator untuk menyimpan sumber publik.");
  }

  const validation = validatePublicSourceUrl(input.url);
  if (!validation.ok || !validation.url) {
    throw new Error(validation.error ?? "Tautan sumber publik tidak valid.");
  }

  const title = input.title.trim();
  if (title.length < 4) {
    throw new Error("Judul sumber minimal 4 karakter.");
  }
  if (title.length > 120) {
    throw new Error("Judul sumber maksimal 120 karakter.");
  }
  if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) {
    throw new Error("Tahun sumber tidak valid.");
  }

  try {
    const created = await addDoc(collection(client.db, "publicSources"), {
      title,
      url: validation.url,
      category: validation.category ?? input.category,
      regionId: input.regionId,
      year: input.year,
      note: input.note?.trim() ? input.note.trim() : null,
      addedBy: input.actorId,
      createdAt: Timestamp.now(),
    });
    return created.id;
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.includes("permission")
        ? "Sumber gagal disimpan. Pastikan akun Anda masih administrator."
        : "Sumber gagal disimpan. Coba lagi.",
    );
  }
}

export async function deletePublicSource(id: string): Promise<void> {
  const client = createFirebaseClient();
  if (!client || !client.auth.currentUser) {
    throw new Error("Masuk sebagai administrator untuk menghapus sumber publik.");
  }

  try {
    await deleteDoc(doc(client.db, "publicSources", id));
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.includes("permission")
        ? "Sumber gagal dihapus. Pastikan akun Anda masih administrator."
        : "Sumber gagal dihapus. Coba lagi.",
    );
  }
}
