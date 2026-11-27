import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import type {
  CitizenReport,
  ModerationStatus,
  NewReportInput,
  Suitability,
  UserProfile,
} from "@/types";
import { clamp, initialsFor, maskName } from "@/lib/utils";
import { createFirebaseClient } from "@/utils/firebase/client";

export const SCORE_EFFECT: Record<Suitability, number> = {
  "Sesuai Target": 3,
  Terlambat: -4,
  "Indikasi Kejanggalan": -9,
};

export function computeValidationScore(
  baseScore: number,
  reports: {
    suitability: Suitability;
    isUserSubmitted?: boolean;
    verified?: boolean;
  }[],
): number {
  const adjustment = reports
    .filter((report) => report.isUserSubmitted && report.verified !== false)
    .reduce((sum, report) => sum + SCORE_EFFECT[report.suitability], 0);
  return clamp(Math.round(baseScore + adjustment), 12, 99);
}

type StoredReport = NewReportInput & {
  id: string;
  createdAt: string;
  upvotes: number;
  authorId?: string;
  verified: boolean;
  official: boolean;
  moderationStatus: ModerationStatus;
  moderationNote?: string;
  moderatedAt?: string;
  moderatedBy?: string;
};

const NOT_CONFIGURED =
  "Firebase belum dikonfigurasi. Hubungi pengelola PRAJVALA.";

function requireClient() {
  const client = createFirebaseClient();
  if (!client) {
    throw new Error(NOT_CONFIGURED);
  }
  return client;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mapReport(id: string, data: DocumentData): StoredReport {
  const verified = typeof data.verified === "boolean" ? data.verified : true;
  const moderationStatus: ModerationStatus =
    data.moderationStatus === "pending" ||
    data.moderationStatus === "verified" ||
    data.moderationStatus === "flagged"
      ? data.moderationStatus
      : verified
        ? "verified"
        : "pending";

  return {
    id,
    projectId: typeof data.projectId === "string" ? data.projectId : "",
    author: typeof data.authorName === "string" ? data.authorName : "Warga Anonim",
    authorId: typeof data.authorId === "string" ? data.authorId : undefined,
    suitability: data.suitability as Suitability,
    rating: typeof data.rating === "number" ? data.rating : 0,
    comment: typeof data.comment === "string" ? data.comment : "",
    photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : undefined,
    createdAt: toIso(data.createdAt),
    upvotes: typeof data.upvoteCount === "number" ? data.upvoteCount : 0,
    verified,
    official: data.official === true,
    moderationStatus,
    moderationNote:
      typeof data.moderationNote === "string" ? data.moderationNote : undefined,
    moderatedAt:
      typeof data.moderatedAt !== "undefined" ? toIso(data.moderatedAt) : undefined,
    moderatedBy:
      typeof data.moderatedBy === "string" ? data.moderatedBy : undefined,
  };
}

function sortNewestFirst(reports: StoredReport[]): StoredReport[] {
  return reports
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const prajvalaApi = {
  async getReports(projectId: string): Promise<StoredReport[]> {
    const client = createFirebaseClient();
    if (!client) return [];

    const snapshot = await getDocs(
      query(collection(client.db, "reports"), where("projectId", "==", projectId)),
    );

    return sortNewestFirst(
      snapshot.docs.map((item) => mapReport(item.id, item.data())),
    );
  },

  async getAllReports(): Promise<StoredReport[]> {
    const client = createFirebaseClient();
    if (!client) return [];

    const snapshot = await getDocs(collection(client.db, "reports"));
    return sortNewestFirst(snapshot.docs.map((item) => mapReport(item.id, item.data())));
  },

  async submitReport(input: NewReportInput): Promise<StoredReport> {
    const client = requireClient();
    const rawAuthor = input.author?.trim() || "Warga Anonim";
    const maskedAuthor = maskName(rawAuthor);
    const safeAuthorName = maskedAuthor.length >= 3 ? maskedAuthor : "Warga Anonim";

    const payload = {
      projectId: input.projectId,
      authorId: client.auth.currentUser?.uid ?? null,
      authorName: safeAuthorName,
      suitability: input.suitability,
      rating: input.rating,
      comment: input.comment.trim(),
      photoUrl: input.photoUrl ?? null,
      upvoteCount: 0,
      verified: false,
      moderationStatus: "pending" as ModerationStatus,
      createdAt: Timestamp.now(),
    };

    try {
      const created = await addDoc(collection(client.db, "reports"), payload);
      return mapReport(created.id, payload);
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message.includes("permission")
          ? "Laporan gagal disimpan karena akses ditolak. Masuk ulang lalu coba lagi."
          : "Laporan gagal disimpan. Periksa koneksi Anda lalu coba lagi.",
      );
    }
  },

  /**
   * Menerbitkan bukti resmi pengelola. Hanya akun dengan custom claim `admin`
   * yang lolos Firestore Rules; pemeriksaan di klien hanya untuk UX.
   */
  async publishOfficialEvidence(input: {
    projectId: string;
    suitability: Suitability;
    rating: number;
    comment: string;
    photoUrl: string;
  }): Promise<StoredReport> {
    const client = requireClient();
    const uid = client.auth.currentUser?.uid;
    if (!uid) {
      throw new Error("Masuk sebagai administrator untuk menerbitkan bukti resmi.");
    }

    const payload = {
      projectId: input.projectId,
      authorId: uid,
      authorName: "Tim PRAJVALA",
      suitability: input.suitability,
      rating: input.rating,
      comment: input.comment.trim(),
      photoUrl: input.photoUrl,
      upvoteCount: 0,
      verified: true,
      official: true,
      moderationStatus: "verified" as ModerationStatus,
      moderatedAt: Timestamp.now(),
      moderatedBy: uid,
      createdAt: Timestamp.now(),
    };

    try {
      const created = await addDoc(collection(client.db, "reports"), payload);
      return mapReport(created.id, payload);
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message.includes("permission")
          ? "Bukti resmi gagal diterbitkan. Pastikan akun Anda masih memiliki peran administrator."
          : "Bukti resmi gagal diterbitkan. Periksa koneksi lalu coba lagi.",
      );
    }
  },

  async moderateReport(
    reportId: string,
    status: ModerationStatus,
    note?: string,
  ): Promise<void> {
    const client = requireClient();
    const uid = client.auth.currentUser?.uid;
    if (!uid) {
      throw new Error("Masuk sebagai administrator untuk meninjau laporan.");
    }

    try {
      await updateDoc(doc(client.db, "reports", reportId), {
        verified: status === "verified",
        moderationStatus: status,
        moderationNote: note?.trim() ? note.trim() : null,
        moderatedAt: Timestamp.now(),
        moderatedBy: uid,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message.includes("permission")
          ? "Tinjauan gagal disimpan. Pastikan akun Anda masih memiliki peran administrator."
          : "Tinjauan gagal disimpan. Coba lagi.",
      );
    }
  },

  async toggleUpvote(reportId: string): Promise<boolean> {
    const client = requireClient();
    const userId = client.auth.currentUser?.uid;

    if (!userId) {
      throw new Error("Masuk ke akun Anda terlebih dahulu untuk mendukung laporan.");
    }

    const reportRef = doc(client.db, "reports", reportId);
    const voteRef = doc(client.db, "reports", reportId, "votes", userId);
    const userVoteRef = doc(client.db, "userVotes", userId, "reports", reportId);

    try {
      return await runTransaction(client.db, async (transaction) => {
        const voteSnapshot = await transaction.get(voteRef);
        const alreadyVoted = voteSnapshot.exists();

        if (alreadyVoted) {
          transaction.delete(voteRef);
          transaction.delete(userVoteRef);
          transaction.update(reportRef, { upvoteCount: increment(-1) });
          return false;
        }

        transaction.set(voteRef, { uid: userId, createdAt: Timestamp.now() });
        transaction.set(userVoteRef, { reportId, createdAt: Timestamp.now() });
        transaction.update(reportRef, { upvoteCount: increment(1) });
        return true;
      });
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message.includes("permission")
          ? "Dukungan belum dapat disimpan karena akses ditolak. Masuk ulang lalu coba lagi."
          : "Dukungan belum dapat disimpan. Coba lagi.",
      );
    }
  },

  async getVoteSummary(reportIds: string[]): Promise<{
    counts: Record<string, number>;
    voted: string[];
  }> {
    const counts: Record<string, number> = {};
    const voted: string[] = [];
    if (reportIds.length === 0) return { counts, voted };

    const client = createFirebaseClient();
    if (!client) return { counts, voted };

    const userId = client.auth.currentUser?.uid;

    await Promise.all(
      reportIds.map(async (reportId) => {
        const reportSnapshot = await getDoc(doc(client.db, "reports", reportId));
        if (reportSnapshot.exists()) {
          const value = reportSnapshot.data().upvoteCount;
          counts[reportId] = typeof value === "number" ? value : 0;
        }

        if (userId) {
          const voteSnapshot = await getDoc(
            doc(client.db, "userVotes", userId, "reports", reportId),
          );
          if (voteSnapshot.exists()) voted.push(reportId);
        }
      }),
    );

    return { counts, voted };
  },

  async deleteReport(reportId: string): Promise<boolean> {
    const client = requireClient();
    if (!client.auth.currentUser) {
      throw new Error("Masuk ke akun Anda terlebih dahulu untuk menghapus laporan.");
    }

    try {
      await deleteDoc(doc(client.db, "reports", reportId));
      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message.includes("permission")
          ? "Laporan belum dapat dihapus. Pastikan Anda pemilik laporan atau administrator."
          : "Laporan belum dapat dihapus. Coba lagi.",
      );
    }
  },

  toFeedItem(stored: StoredReport, currentUserId?: string): CitizenReport {
    const isOwn = Boolean(currentUserId && stored.authorId === currentUserId);
    const displayAuthor = stored.official
      ? stored.author || "Tim PRAJVALA"
      : maskName(stored.author ?? "Warga Anonim");

    return {
      id: stored.id,
      projectId: stored.projectId,
      author: displayAuthor,
      authorId: stored.authorId,
      initials: initialsFor(displayAuthor),
      verified: stored.verified,
      suitability: stored.suitability,
      rating: stored.rating,
      comment: stored.comment,
      createdAt: stored.createdAt,
      upvotes: stored.upvotes,
      photoUrl: stored.photoUrl,
      isUserSubmitted: isOwn && !stored.official,
      source: "firebase",
      official: stored.official,
      moderationStatus: stored.moderationStatus,
      moderationNote: stored.moderationNote,
      moderatedAt: stored.moderatedAt,
      moderatedBy: stored.moderatedBy,
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
 * Riwayat kontribusi akun, dibaca langsung dari Firestore.
 */
export async function getAccountData(
  user: Pick<UserProfile, "id" | "source">,
): Promise<AccountSnapshot> {
  const client = createFirebaseClient();
  let remoteReports: StoredReport[] = [];
  let remoteVotes = 0;

  if (client && user.source === "firebase") {
    const snapshot = await getDocs(
      query(collection(client.db, "reports"), where("authorId", "==", user.id)),
    );
    remoteReports = sortNewestFirst(
      snapshot.docs.map((item) => mapReport(item.id, item.data())),
    );

    const votesSnapshot = await getDocs(
      collection(client.db, "userVotes", user.id, "reports"),
    );
    remoteVotes = votesSnapshot.size;
  }

  return {
    reports: remoteReports.map((stored) => prajvalaApi.toFeedItem(stored, user.id)),
    activity: buildActivity(remoteReports, remoteVotes),
  };
}
