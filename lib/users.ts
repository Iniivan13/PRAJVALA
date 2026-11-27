import {
  collection,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import type { UserRole } from "@/types";
import { createFirebaseClient } from "@/utils/firebase/client";

/**
 * Direktori pengguna untuk panel administrator.
 *
 * Data berasal dari koleksi `profiles` yang sudah dibuat saat pendaftaran.
 * Custom claim tetap menjadi jalur bootstrap administrator pertama; setelah
 * itu peran pengelola dapat diatur dari panel ini dan ditegakkan oleh aturan
 * Firestore. Klien tidak dapat menaikkan perannya sendiri.
 */

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  warga: "Warga",
  pj_daerah: "Penanggung Jawab Daerah",
  admin: "Administrator",
};

export const USER_ROLE_HINT: Record<UserRole, string> = {
  warga: "Dapat mengirim laporan dan dukungan seperti biasa.",
  pj_daerah: "Dapat meninjau laporan di wilayah yang ditugaskan.",
  admin: "Akses penuh: moderasi, bukti resmi, pengguna, dan log audit.",
};

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  regionId: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  promotedBy?: string;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  return "";
}

function mapUser(id: string, data: DocumentData): ManagedUser {
  const role: UserRole =
    data.role === "admin" || data.role === "pj_daerah" ? data.role : "warga";

  return {
    id,
    name:
      typeof data.fullName === "string" && data.fullName.trim().length > 0
        ? data.fullName.trim()
        : "Warga PRAJVALA",
    email: typeof data.email === "string" ? data.email : "",
    regionId: typeof data.regionId === "string" ? data.regionId : "all",
    role,
    createdAt: toIso(data.createdAt),
    updatedAt:
      typeof data.updatedAt !== "undefined" ? toIso(data.updatedAt) : undefined,
    promotedBy:
      typeof data.promotedBy === "string" ? data.promotedBy : undefined,
  };
}

export async function getAllUsers(): Promise<ManagedUser[]> {
  const client = createFirebaseClient();
  if (!client) return [];

  const snapshot = await getDocs(collection(client.db, "profiles"));
  return snapshot.docs
    .map((item) => mapUser(item.id, item.data()))
    .sort((a, b) => {
      if (a.role !== b.role) {
        const order: UserRole[] = ["admin", "pj_daerah", "warga"];
        return order.indexOf(a.role) - order.indexOf(b.role);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function updateUserRole(input: {
  uid: string;
  role: UserRole;
  regionId: string;
  actorId: string;
}): Promise<void> {
  const client = createFirebaseClient();
  if (!client || !client.auth.currentUser) {
    throw new Error("Masuk sebagai administrator untuk mengubah peran pengguna.");
  }
  if (input.role === "pj_daerah" && input.regionId === "all") {
    throw new Error("Pilih wilayah tugas untuk penanggung jawab daerah.");
  }

  try {
    await updateDoc(doc(client.db, "profiles", input.uid), {
      role: input.role,
      regionId: input.regionId,
      updatedAt: Timestamp.now(),
      promotedBy: input.actorId,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.includes("permission")
        ? "Peran gagal disimpan. Pastikan akun Anda masih memiliki akses administrator."
        : "Peran gagal disimpan. Coba lagi.",
    );
  }
}
