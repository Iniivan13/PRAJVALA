import type { CitizenReport, NewReportInput, Suitability } from "@/types";
import { clamp, initialsFor, maskName } from "@/lib/utils";

const REPORTS_KEY = "prajvala:reports:v1";
const UPVOTES_KEY = "prajvala:upvotes:v1";

export const SCORE_EFFECT: Record<Suitability, number> = {
  "Sesuai Target": 3,
  Terlambat: -4,
  "Indikasi Kejanggalan": -9,
};

export function computeValidationScore(
  baseScore: number,
  reports: { suitability: Suitability; isUserSubmitted?: boolean }[],
): number {
  const adjustment = reports
    .filter((report) => report.isUserSubmitted)
    .reduce((sum, report) => sum + SCORE_EFFECT[report.suitability], 0);
  return clamp(Math.round(baseScore + adjustment), 12, 99);
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

type StoredReport = NewReportInput & {
  id: string;
  createdAt: string;
  upvotes: number;
};

function readStoredReports(): StoredReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredReport =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredReport).id === "string" &&
        typeof (item as StoredReport).projectId === "string",
    );
  } catch {
    return [];
  }
}

function writeStoredReports(reports: StoredReport[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch {
    // Bila penyimpanan penuh (mis. foto terlalu besar), simpan tanpa foto.
    try {
      const sanitized = reports.map(({ photoUrl: _photo, ...rest }) => rest);
      window.localStorage.setItem(REPORTS_KEY, JSON.stringify(sanitized));
    } catch {
      // Abaikan kegagalan penyimpanan lokal agar alur tetap berjalan.
    }
  }
}

function readUpvotes(): Record<string, number> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(UPVOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeUpvotes(value: Record<string, number>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(UPVOTES_KEY, JSON.stringify(value));
  } catch {
    // Abaikan kegagalan penyimpanan.
  }
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const prajvalaApi = {
  async getReports(projectId: string) {
    await delay(250);
    return readStoredReports().filter((report) => report.projectId === projectId);
  },

  async submitReport(input: NewReportInput) {
    await delay(750);
    const id = `warga-${Date.now().toString(36)}`;
    const stored: StoredReport = {
      ...input,
      author: input.author?.trim() || "Warga Anonim",
      id,
      createdAt: new Date().toISOString(),
      upvotes: 1,
    };
    const reports = [stored, ...readStoredReports()];
    writeStoredReports(reports);
    return stored;
  },

  async toggleUpvote(reportId: string): Promise<boolean> {
    await delay(180);
    const upvotes = readUpvotes();
    const next = upvotes[reportId] === 1 ? 0 : 1;
    upvotes[reportId] = next;
    writeUpvotes(upvotes);
    return next === 1;
  },

  async deleteReport(reportId: string): Promise<boolean> {
    await delay(220);
    const reports = readStoredReports();
    const next = reports.filter((report) => report.id !== reportId);
    writeStoredReports(next);
    const upvotes = readUpvotes();
    if (reportId in upvotes) {
      delete upvotes[reportId];
      writeUpvotes(upvotes);
    }
    return next.length !== reports.length;
  },

  readUpvoted(reportId: string): boolean {
    return readUpvotes()[reportId] === 1;
  },

  toFeedItem(stored: StoredReport): CitizenReport {
    return {
      id: stored.id,
      projectId: stored.projectId,
      author: maskName(stored.author ?? "Warga Anonim"),
      initials: initialsFor(stored.author ?? "Warga Anonim"),
      verified: true,
      suitability: stored.suitability,
      rating: stored.rating,
      comment: stored.comment,
      createdAt: stored.createdAt,
      upvotes: stored.upvotes,
      photoUrl: stored.photoUrl,
      isUserSubmitted: true,
    };
  },
};

export function resetLocalData(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(REPORTS_KEY);
  window.localStorage.removeItem(UPVOTES_KEY);
}

export interface DeviceActivity {
  reportCount: number;
  upvoteCount: number;
  reportsBySuitability: Record<Suitability, number>;
  latestReportAt: string | null;
  projectIds: string[];
}

export function getDeviceReports(): CitizenReport[] {
  return readStoredReports()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((stored) => prajvalaApi.toFeedItem(stored));
}

export function getDeviceActivity(): DeviceActivity {
  const reports = readStoredReports();
  const upvotes = readUpvotes();

  const reportsBySuitability: Record<Suitability, number> = {
    "Sesuai Target": 0,
    Terlambat: 0,
    "Indikasi Kejanggalan": 0,
  };

  reports.forEach((report) => {
    if (report.suitability in reportsBySuitability) {
      reportsBySuitability[report.suitability] += 1;
    }
  });

  const latestReportAt = reports.reduce<string | null>((latest, report) => {
    if (!latest) return report.createdAt;
    return new Date(report.createdAt).getTime() > new Date(latest).getTime()
      ? report.createdAt
      : latest;
  }, null);

  return {
    reportCount: reports.length,
    upvoteCount: Object.values(upvotes).filter((value) => value === 1).length,
    reportsBySuitability,
    latestReportAt,
    projectIds: Array.from(new Set(reports.map((report) => report.projectId))),
  };
}
