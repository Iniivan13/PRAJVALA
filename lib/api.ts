import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CitizenReport,
  NewReportInput,
  Suitability,
  UserProfile,
} from "@/types";
import { clamp, initialsFor, maskName } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";

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

type StoredReport = NewReportInput & {
  id: string;
  createdAt: string;
  upvotes: number;
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

const NOT_CONFIGURED =
  "Supabase belum dikonfigurasi. Hubungi pengelola PRAJVALA.";

function requireClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED);
  }
  const client = createClient();
  if (!client) {
    throw new Error(NOT_CONFIGURED);
  }
  return client;
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
  };
}

function toRemoteRow(value: unknown): RemoteReportRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.project_id !== "string") return null;
  if (typeof row.comment !== "string" || typeof row.author_name !== "string") return null;
  return row as unknown as RemoteReportRow;
}

export const prajvalaApi = {
  async getReports(projectId: string): Promise<StoredReport[]> {
    const client = createClient();
    if (!client) return [];

    const { data, error } = await client
      .from("reports")
      .select(REPORT_COLUMNS)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) return [];

    return data
      .map(toRemoteRow)
      .filter((row): row is RemoteReportRow => row !== null)
      .map(mapRemoteReport);
  },

  async submitReport(input: NewReportInput): Promise<StoredReport> {
    const client = requireClient();
    const rawAuthor = input.author?.trim() || "Warga Anonim";
    const maskedAuthor = maskName(rawAuthor);
    const safeAuthorName = maskedAuthor.length >= 3 ? maskedAuthor : "Warga Anonim";

    const { data: userData } = await client.auth.getUser();
    const { data, error } = await client
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

    if (error) {
      throw new Error(
        "Laporan gagal disimpan. Periksa koneksi Anda lalu coba lagi.",
      );
    }

    const row = toRemoteRow(data);
    if (!row) {
      throw new Error("Laporan tersimpan, tetapi respons server tidak dikenali.");
    }
    return mapRemoteReport(row);
  },

  async toggleUpvote(reportId: string): Promise<boolean> {
    const client = requireClient();
    const { data: userData } = await client.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      throw new Error("Masuk ke akun Anda terlebih dahulu untuk mendukung laporan.");
    }

    const { data: existing, error: readError } = await client
      .from("report_votes")
      .select("report_id")
      .eq("report_id", reportId)
      .eq("voter_id", userId)
      .maybeSingle();

    if (readError) {
      throw new Error("Dukungan belum dapat diperiksa. Coba lagi.");
    }

    if (existing) {
      const { error } = await client
        .from("report_votes")
        .delete()
        .eq("report_id", reportId)
        .eq("voter_id", userId);
      if (error) {
        throw new Error("Dukungan belum dapat dibatalkan. Coba lagi.");
      }
      return false;
    }

    const { error } = await client
      .from("report_votes")
      .insert({ report_id: reportId, voter_id: userId });
    if (error) {
      throw new Error("Dukungan belum dapat disimpan. Coba lagi.");
    }
    return true;
  },

  async getVoteSummary(reportIds: string[]): Promise<{
    counts: Record<string, number>;
    voted: string[];
  }> {
    const counts: Record<string, number> = {};
    const voted: string[] = [];
    if (reportIds.length === 0) return { counts, voted };

    const client = createClient();
    if (!client) return { counts, voted };

    const { data: countData } = await client
      .from("report_vote_counts")
      .select("report_id, votes")
      .in("report_id", reportIds);

    if (Array.isArray(countData)) {
      (countData as VoteRow[]).forEach((row) => {
        counts[row.report_id] = row.votes;
      });
    }

    const { data: userData } = await client.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      const { data: mine } = await client
        .from("report_votes")
        .select("report_id")
        .eq("voter_id", userId)
        .in("report_id", reportIds);

      if (Array.isArray(mine)) {
        (mine as { report_id: string }[]).forEach((row) => voted.push(row.report_id));
      }
    }

    return { counts, voted };
  },

  async deleteReport(reportId: string): Promise<boolean> {
    const client = requireClient();
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) {
      throw new Error("Masuk ke akun Anda terlebih dahulu untuk menghapus laporan.");
    }

    const { error } = await client
      .from("reports")
      .delete()
      .eq("id", reportId)
      .eq("author_id", userData.user.id);

    if (error) {
      throw new Error("Laporan belum dapat dihapus. Coba lagi.");
    }
    return true;
  },

  toFeedItem(stored: StoredReport, currentUserId?: string): CitizenReport {
    const isOwn = Boolean(currentUserId && stored.authorId === currentUserId);

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
      source: "supabase",
    };
  },
};

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

export interface AccountSnapshot {
  reports: CitizenReport[];
  activity: DeviceActivity;
}

/**
 * Riwayat kontribusi akun, dibaca langsung dari Supabase.
 */
export async function getAccountData(
  user: Pick<UserProfile, "id" | "source">,
): Promise<AccountSnapshot> {
  const client = createClient();
  let remoteReports: StoredReport[] = [];
  let remoteVotes = 0;

  if (client && user.source === "supabase") {
    const { data } = await client
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

    const { data: votes } = await client
      .from("report_votes")
      .select("report_id")
      .eq("voter_id", user.id);

    if (Array.isArray(votes)) remoteVotes = votes.length;
  }

  const sorted = remoteReports
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    reports: sorted.map((stored) => prajvalaApi.toFeedItem(stored, user.id)),
    activity: buildActivity(sorted, remoteVotes),
  };
}
