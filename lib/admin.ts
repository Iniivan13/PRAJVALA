import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { createFirebaseClient } from "@/utils/firebase/client";

/**
 * Jejak audit tindakan administrator.
 *
 * Disimpan di koleksi `adminLogs` yang hanya dapat dibaca dan ditulis oleh
 * akun dengan custom claim `admin`. Log tidak dapat diubah atau dihapus dari
 * klien, sehingga tindakan moderasi tetap dapat ditelusuri.
 */

export type AdminAction = "moderate" | "delete" | "publish" | "role" | "source";

export const ADMIN_ACTION_LABEL: Record<AdminAction, string> = {
  moderate: "Meninjau laporan",
  delete: "Menghapus laporan",
  publish: "Menerbitkan bukti resmi",
  role: "Mengubah peran",
  source: "Mengelola sumber publik",
};

export interface AdminLogEntry {
  id: string;
  action: AdminAction;
  targetId: string;
  projectId?: string;
  detail?: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

function mapLog(id: string, data: DocumentData): AdminLogEntry {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString();

  return {
    id,
    action: (data.action as AdminAction) ?? "moderate",
    targetId: typeof data.targetId === "string" ? data.targetId : "",
    projectId: typeof data.projectId === "string" ? data.projectId : undefined,
    detail: typeof data.detail === "string" ? data.detail : undefined,
    actorId: typeof data.actorId === "string" ? data.actorId : "",
    actorName: typeof data.actorName === "string" ? data.actorName : "Administrator",
    createdAt,
  };
}

export async function logAdminAction(entry: {
  action: AdminAction;
  targetId: string;
  projectId?: string;
  detail?: string;
  actorId: string;
  actorName: string;
}): Promise<void> {
  const client = createFirebaseClient();
  if (!client) return;

  await addDoc(collection(client.db, "adminLogs"), {
    action: entry.action,
    targetId: entry.targetId,
    projectId: entry.projectId ?? null,
    detail: entry.detail?.trim() ? entry.detail.trim() : null,
    actorId: entry.actorId,
    actorName: entry.actorName,
    createdAt: Timestamp.now(),
  });
}

export async function getAdminLogs(limitCount = 60): Promise<AdminLogEntry[]> {
  const client = createFirebaseClient();
  if (!client) return [];

  const snapshot = await getDocs(
    query(
      collection(client.db, "adminLogs"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    ),
  );

  return snapshot.docs.map((item) => mapLog(item.id, item.data()));
}
