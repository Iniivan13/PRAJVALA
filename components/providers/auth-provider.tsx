"use client";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getIdTokenResult,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { REGIONS } from "@/lib/data";
import type { AuthResult, RegisterInput, UserProfile } from "@/types";
import { createFirebaseClient, isFirebaseConfigured } from "@/utils/firebase/client";

interface AuthContextValue {
  user: UserProfile | null;
  isHydrated: boolean;
  isFirebaseMode: boolean;
  /** Akun memiliki custom claim `admin` yang valid. */
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function validateRegistration(input: RegisterInput): string | null {
  if (normalizeName(input.name).length < 3) {
    return "Nama minimal 3 karakter agar laporan mudah dikenali.";
  }
  if (!EMAIL_PATTERN.test(normalizeEmail(input.email))) {
    return "Alamat email belum valid. Contoh: nama@email.com.";
  }
  if (input.password.length < 8) {
    return "Kata sandi minimal 8 karakter.";
  }
  if (!/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    return "Kata sandi perlu mengandung huruf dan angka.";
  }
  return null;
}

function resolveRegionId(regionId?: string): string {
  return REGIONS.some((region) => region.id === regionId) ? (regionId as string) : "all";
}

/**
 * Pesan error Firebase Auth dipetakan lewat `code` resmi agar pengguna
 * mendapat penjelasan yang jelas, bukan pesan generik.
 */
function mapAuthError(
  error: { code?: string; message?: string } | string,
  fallback = "Terjadi kendala. Silakan coba lagi.",
): string {
  const code = typeof error === "string" ? undefined : error.code;
  const message = typeof error === "string" ? error : (error.message ?? "");
  const value = message.toLowerCase();

  switch (code) {
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
    case "auth/invalid-email":
      return "Alamat email belum valid. Contoh: nama@email.com.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter berisi huruf dan angka.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau kata sandi belum cocok. Periksa kembali lalu coba lagi.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.";
    case "auth/network-request-failed":
      return "Server Firebase belum dapat dijangkau. Periksa koneksi internet lalu coba lagi.";
    case "auth/requires-recent-login":
      return "Demi keamanan, silakan masuk ulang sebelum menghapus akun.";
    case "auth/operation-not-allowed":
      return "Metode masuk email/kata sandi belum diaktifkan. Hubungi pengelola PRAJVALA.";
    case "auth/configuration-not-found":
      return "Layanan autentikasi Firebase belum diaktifkan untuk proyek ini. Hubungi pengelola PRAJVALA.";
    case "auth/user-disabled":
      return "Akun ini dinonaktifkan. Hubungi pengelola PRAJVALA.";
    case "permission-denied":
      return "Akses data ditolak. Pastikan aturan Firestore sudah dipasang.";
    default:
      break;
  }

  if (value.includes("network") || value.includes("offline")) {
    return "Server Firebase belum dapat dijangkau. Periksa koneksi internet lalu coba lagi.";
  }
  if (value.includes("configuration-not-found") || value.includes("configuration_not_found")) {
    return "Layanan autentikasi Firebase belum diaktifkan untuk proyek ini. Hubungi pengelola PRAJVALA.";
  }
  if (value.includes("permission")) {
    return "Akses data ditolak. Pastikan aturan Firestore sudah dipasang.";
  }
  return fallback;
}

function metadataName(user: FirebaseUser): string {
  const displayName = user.displayName?.trim();
  if (displayName && displayName.length >= 3) return normalizeName(displayName);
  const email = user.email ?? "";
  return email.split("@")[0] || "Warga PRAJVALA";
}

async function profileFromFirebase(user: FirebaseUser): Promise<UserProfile> {
  const fallback: UserProfile = {
    id: user.uid,
    name: metadataName(user),
    email: user.email ?? "",
    regionId: "all",
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    source: "firebase",
    role: "warga",
  };

  // Custom claim adalah sumber kebenaran peran. Nilai ini tidak bisa diubah
  // dari klien; hanya Admin SDK / Firebase CLI yang dapat memasangnya.
  let role: UserProfile["role"] = "warga";
  try {
    const token = await getIdTokenResult(user, true);
    if (token.claims.admin === true) role = "admin";
  } catch {
    // Token gagal dibaca (offline). Peran admin tidak diberikan secara default.
  }

  const client = createFirebaseClient();
  if (!client) return { ...fallback, role };

  try {
    const snapshot = await getDoc(doc(client.db, "profiles", user.uid));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        ...fallback,
        role,
        name:
          typeof data.fullName === "string" && data.fullName.trim().length >= 3
            ? data.fullName.trim()
            : fallback.name,
        regionId: resolveRegionId(
          typeof data.regionId === "string" ? data.regionId : undefined,
        ),
      };
    }
  } catch {
    // Dokumen profil belum tersedia; metadata auth tetap dapat dipakai.
  }

  return { ...fallback, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const client = createFirebaseClient();

    if (!client) {
      setUser(null);
      setIsHydrated(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(client.auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsHydrated(true);
        return;
      }

      void profileFromFirebase(firebaseUser).then((profile) => {
        setUser(profile);
        setIsHydrated(true);
      });
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = normalizeEmail(email);
      if (!EMAIL_PATTERN.test(normalized)) {
        return { ok: false, error: "Masukkan alamat email yang valid." };
      }
      if (password.length === 0) {
        return { ok: false, error: "Masukkan kata sandi akun Anda." };
      }

      const client = createFirebaseClient();
      if (!client) {
        return {
          ok: false,
          error: "Firebase belum dikonfigurasi. Hubungi pengelola PRAJVALA.",
        };
      }

      try {
        const credential = await signInWithEmailAndPassword(
          client.auth,
          normalized,
          password,
        );
        const profile = await profileFromFirebase(credential.user);
        setUser(profile);
        return { ok: true, message: "Berhasil masuk." };
      } catch (error) {
        return { ok: false, error: mapAuthError(error as { code?: string }) };
      }
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    const validationError = validateRegistration(input);
    if (validationError) return { ok: false, error: validationError };

    const client = createFirebaseClient();
    if (!client) {
      return {
        ok: false,
        error: "Firebase belum dikonfigurasi. Hubungi pengelola PRAJVALA.",
      };
    }

    const normalized = normalizeEmail(input.email);
    const displayName = normalizeName(input.name);

    try {
      const credential = await createUserWithEmailAndPassword(
        client.auth,
        normalized,
        input.password,
      );

      await updateProfile(credential.user, { displayName });

      const profile: UserProfile = {
        id: credential.user.uid,
        name: displayName,
        email: normalized,
        regionId: resolveRegionId(input.regionId),
        createdAt: new Date().toISOString(),
        source: "firebase",
        role: "warga",
      };

      try {
        await setDoc(doc(client.db, "profiles", credential.user.uid), {
          fullName: profile.name,
          regionId: profile.regionId,
          email: profile.email,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        // Akun Auth sudah jadi; profil dapat dilengkapi saat login berikutnya.
        console.error("Gagal menyimpan profil Firebase:", error);
      }

      setUser(profile);
      return { ok: true, message: "Akun berhasil dibuat dan Anda sudah masuk." };
    } catch (error) {
      return { ok: false, error: mapAuthError(error as { code?: string }) };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const client = createFirebaseClient();
    if (client) {
      try {
        await signOut(client.auth);
      } catch {
        // Sesi di memori tetap dibersihkan meski server tidak terjangkau.
      }
    }
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    const client = createFirebaseClient();
    const current = client?.auth.currentUser;

    if (!client || !current) {
      return { ok: false, error: "Tidak ada akun yang sedang aktif." };
    }

    try {
      try {
        await deleteDoc(doc(client.db, "profiles", current.uid));
      } catch {
        // Profil mungkin sudah tidak ada; lanjutkan penghapusan akun.
      }

      await deleteUser(current);
      setUser(null);
      return { ok: true, message: "Akun berhasil dihapus." };
    } catch (error) {
      return { ok: false, error: mapAuthError(error as { code?: string }) };
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string): Promise<AuthResult> => {
      const client = createFirebaseClient();
      const current = client?.auth.currentUser;

      if (!client || !current || !current.email) {
        return { ok: false, error: "Masuk ke akun Anda terlebih dahulu." };
      }
      if (nextPassword.length < 8) {
        return { ok: false, error: "Kata sandi baru minimal 8 karakter." };
      }
      if (!/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword)) {
        return { ok: false, error: "Kata sandi baru perlu mengandung huruf dan angka." };
      }
      if (currentPassword === nextPassword) {
        return { ok: false, error: "Kata sandi baru harus berbeda dari yang sekarang." };
      }

      try {
        const credential = EmailAuthProvider.credential(current.email, currentPassword);
        await reauthenticateWithCredential(current, credential);
        await updatePassword(current, nextPassword);
        return { ok: true, message: "Kata sandi berhasil diperbarui." };
      } catch (error) {
        return { ok: false, error: mapAuthError(error as { code?: string }) };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      isFirebaseMode: isFirebaseConfigured,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      deleteAccount,
      changePassword,
    }),
    [user, isHydrated, login, register, logout, deleteAccount, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }
  return context;
}
