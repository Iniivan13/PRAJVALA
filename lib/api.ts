import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CitizenReport,
  NewReportInput,
  StorageSource,
  Suitability,
  UserProfile,
} from "@/types";
import { clamp, initialsFor, maskName } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

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
  source: StorageSource;
  authorId?: string;
};

interface RemoteReportRow {
  id: string;
  project_id: string;
  author_id: string | null;
  author_name: string;
  suitability: Suitability;
  rating: number;
  comment: string;
  photo_url: string | null;
  created_at: string;
}

interface VoteRow {
  report_id: string;
  votes: number;
}

const REPORT_COLUMNS =
  "id, project_id, author_id, author_name, suitability, rating, comment, photo_url, created_at";

function readStoredReports(): StoredReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is StoredReport =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as StoredReport).id === "string" &&
          typeof (item as StoredReport).projectId === "string",
      )
      .map((item) => ({ ...item, source: item.source ?? "local" }));
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

function mapRemoteReport(row: RemoteReportRow): StoredReport {
  return {
    id: row.id,
    projectId: row.project_id,
    author: row.author_name,
    authorId: row.author_id ?? undefined,
    suitability: row.suitability,
    rating: row.rating,
    comment: row.comment,
    photoUrl: row.photo_url ?? undefined,
    createdAt: row.created_at,
    upvotes: 0,
    source: "supabase",
  };
}

function toRemoteRow(value: unknown): RemoteReportRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.project_id !== "string") return null;
  if (typeof row.comment !== "string" || typeof row.author_name !== "string") return null;
  return row as unknown as RemoteReportRow;
}

function withRemote<T>(client: SupabaseClient | null, task: (client: SupabaseClient) => Promise<T>): Promise<T | null> {
  if (!client) return Promise.resolve(null);
  return task(client).catch(() => null);
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const prajvalaApi = {
  async getReports(projectId: string): Promise<StoredReport[]> {
    const local = readStoredReports().filter((report) => report.projectId === projectId);
    const client = createClient();

    const remote = await withRemote(client, async (supabase) => {
      const { data, error } = await supabase
        .from("reports")
        .select(REPORT_COLUMNS)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error || !Array.isArray(data)) return [] as StoredReport[];
      return data
        .map(toRemoteRow)
        .filter((row): row is RemoteReportRow => row !== null)
        .map(mapRemoteReport);
    });

    if (!remote) return local;

    const remoteIds = new Set(remote.map((report) => report.id));
    return [...remote, ...local.filter((report) => !remoteIds.has(report.id))];
  },

  async submitReport(input: NewReportInput): Promise<StoredReport> {
    const rawAuthor = input.author?.trim() || "Warga Anonim";
    const maskedAuthor = maskName(rawAuthor);
    const safeAuthorName = maskedAuthor.length >= 3 ? maskedAuthor : "Warga Anonim";
    const client = createClient();

    const remote = await withRemote(client, async (supabase) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reports")
        .insert({
          project_id: input.projectId,
          author_id: userData.user?.id ?? null,
          author_name: safeAuthorName,
          suitability: input.suitability,
          rating: input.rating,
          comment: input.comment.trim(),
          photo_url: input.photoUrl ?? null,
        })
        .select(REPORT_COLUMNS)
        .single();

      if (error) return null;
      const row = toRemoteRow(data);
      return row ? mapRemoteReport(row) : null;
    });

    if (remote) return remote;

    await delay(650);
    const stored: StoredReport = {
      ...input,
      author: rawAuthor,
      id: `warga-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      source: "local",
    };
    writeStoredReports([stored, ...readStoredReports()]);
    return stored;
  },

  async toggleUpvote(reportId: string, syncToServer = false): Promise<boolean> {
    if (syncToServer) {
      const client = createClient();
      const result = await withRemote(client, async (supabase) => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return null;

        const { data: existing, error: readError } = await supabase
          .from("report_votes")
          .select("report_id")
          .eq("report_id", reportId)
          .eq("voter_id", userId)
          .maybeSingle();

        if (readError) return null;

        if (existing) {
          const { error } = await supabase
            .from("report_votes")
            .delete()
            .eq("report_id", reportId)
            .eq("voter_id", userId);
          return error ? null : false;
        }

        const { error } = await supabase
          .from("report_votes")
          .insert({ report_id: reportId, voter_id: userId });
        return error ? null : true;
      });

      if (result !== null && result !== undefined) return result;
    }

    await delay(140);
    const upvotes = readUpvotes();
    const next = upvotes[reportId] === 1 ? 0 : 1;
    upvotes[reportId] = next;
    writeUpvotes(upvotes);
    return next === 1;
  },

  async getVoteSummary(reportIds: string[]): Promise<{
    counts: Record<string, number>;
    voted: string[];
  }> {
    const counts: Record<string, number> = {};
    const voted: string[] = [];
    if (reportIds.length === 0) return { counts, voted };

    const client = createClient();
    const result = await withRemote(client, async (supabase) => {
      const { data: countData } = await supabase
        .from("report_vote_counts")
        .select("report_id, votes")
        .in("report_id", reportIds);

      if (Array.isArray(countData)) {
        (countData as VoteRow[]).forEach((row) => {
          counts[row.report_id] = row.votes;
        });
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: mine } = await supabase
          .from("report_votes")
          .select("report_id")
          .eq("voter_id", userId)
          .in("report_id", reportIds);

        if (Array.isArray(mine)) {
          (mine as { report_id: string }[]).forEach((row) => voted.push(row.report_id));
        }
      }

      return true;
    });

    return result ? { counts, voted } : { counts, voted };
  },

  async deleteReport(reportId: string, syncToServer = false): Promise<boolean> {
    let removedRemote = false;

    if (syncToServer) {
      const client = createClient();
      const result = await withRemote(client, async (supabase) => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return false;

        const { error } = await supabase
          .from("reports")
          .delete()
          .eq("id", reportId)
          .eq("author_id", userData.user.id);

        return !error;
      });
      removedRemote = result === true;
    }

    await delay(180);
    const reports = readStoredReports();
    const next = reports.filter((report) => report.id !== reportId);
    writeStoredReports(next);

    const upvotes = readUpvotes();
    if (reportId in upvotes) {
      delete upvotes[reportId];
      writeUpvotes(upvotes);
    }

    return removedRemote || next.length !== reports.length;
  },

  readUpvoted(reportId: string): boolean {
    return readUpvotes()[reportId] === 1;
  },

  toFeedItem(stored: StoredReport, currentUserId?: string): CitizenReport {
    const isRemote = stored.source === "supabase";
    const isOwn = isRemote
      ? Boolean(currentUserId && stored.authorId === currentUserId)
      : true;

    return {
      id: stored.id,
      projectId: stored.projectId,
      author: maskName(stored.author ?? "Warga Anonim"),
      authorId: stored.authorId,
      initials: initialsFor(stored.author ?? "Warga Anonim"),
      verified: true,
      suitability: stored.suitability,
      rating: stored.rating,
      comment: stored.comment,
      createdAt: stored.createdAt,
      upvotes: stored.upvotes,
      photoUrl: stored.photoUrl,
      isUserSubmitted: isOwn,
      source: stored.source,
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

function buildActivity(reports: StoredReport[], upvoteCount: number): DeviceActivity {
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
    upvoteCount,
    reportsBySuitability,
    latestReportAt,
    projectIds: Array.from(new Set(reports.map((report) => report.projectId))),
  };
}

export function getDeviceReports(): CitizenReport[] {
  return readStoredReports()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((stored) => prajvalaApi.toFeedItem(stored));
}

export function getDeviceActivity(): DeviceActivity {
  return buildActivity(
    readStoredReports(),
    Object.values(readUpvotes()).filter((value) => value === 1).length,
  );
}

export interface AccountSnapshot {
  reports: CitizenReport[];
  activity: DeviceActivity;
}

/**
 * Riwayat kontribusi akun. Bila akun berasal dari Supabase, laporan dan
 * dukungan diambil dari server lalu digabung dengan laporan lokal di
 * perangkat agar demo tetap menampilkan keduanya.
 */
export async function getAccountData(
  user: Pick<UserProfile, "id" | "source">,
): Promise<AccountSnapshot> {
  const localReports = readStoredReports();
  let remoteReports: StoredReport[] = [];
  let remoteVotes = 0;

  if (user.source === "supabase") {
    const client = createClient();
    await withRemote(client, async (supabase) => {
      const { data } = await supabase
        .from("reports")
        .select(REPORT_COLUMNS)
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (Array.isArray(data)) {
        remoteReports = data
          .map(toRemoteRow)
          .filter((row): row is RemoteReportRow => row !== null)
          .map(mapRemoteReport);
      }

      const { data: votes } = await supabase
        .from("report_votes")
        .select("report_id")
        .eq("voter_id", user.id);

      if (Array.isArray(votes)) remoteVotes = votes.length;
      return true;
    });
  }

  const remoteIds = new Set(remoteReports.map((report) => report.id));
  const merged = [...remoteReports, ...localReports.filter((report) => !remoteIds.has(report.id))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const localVotes = Object.values(readUpvotes()).filter((value) => value === 1).length;

  return {
    reports: merged.map((stored) => prajvalaApi.toFeedItem(stored, user.id)),
    activity: buildActivity(merged, localVotes + remoteVotes),
  };
}
