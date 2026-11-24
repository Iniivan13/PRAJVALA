"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { REGIONS } from "@/lib/data";
import type { RegisterInput, UserProfile } from "@/types";

const USERS_KEY = "prajvala:users:v1";
const SESSION_KEY = "prajvala:session:v1";

export const DEMO_ACCOUNT = {
  email: "warga@demo.prajvala.id",
  password: "prajvala2026",
} as const;

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  loginDemo: () => Promise<AuthResult>;
  logout: () => void;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredUser =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredUser).id === "string" &&
        typeof (item as StoredUser).email === "string" &&
        typeof (item as StoredUser).passwordHash === "string" &&
        typeof (item as StoredUser).salt === "string",
    );
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

function writeSession(userId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SESSION_KEY, userId);
  } catch {
    // Sesi tetap berjalan di memori bila penyimpanan tidak tersedia.
  }
}

function clearSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Abaikan kegagalan penyimpanan.
  }
}

function readSession(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    const id = window.localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const found = readUsers().find((item) => item.id === id);
    if (!found) return null;
    return toProfile(found);
  } catch {
    return null;
  }
}

function toProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    regionId: user.regionId,
    createdAt: user.createdAt,
  };
}

function randomToken(): string {
  if (isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function fallbackHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = `${salt}:${password}`;
  if (isBrowser() && typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const bytes = new TextEncoder().encode(payload);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      // Lanjutkan ke hash fallback untuk lingkungan tanpa Web Crypto.
    }
  }
  return fallbackHash(payload);
}

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

async function createStoredUser(
  input: RegisterInput,
): Promise<{ stored: StoredUser | null; error?: string }> {
  const salt = randomToken().slice(0, 16);
  const passwordHash = await hashPassword(input.password, salt);
  const regionId = REGIONS.some((region) => region.id === input.regionId)
    ? (input.regionId as string)
    : "all";

  return {
    stored: {
      id: `usr-${randomToken().slice(0, 12)}`,
      name: normalizeName(input.name),
      email: normalizeEmail(input.email),
      regionId,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setIsHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const normalized = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) {
      return { ok: false, error: "Masukkan alamat email yang valid." };
    }
    if (password.length === 0) {
      return { ok: false, error: "Masukkan kata sandi akun Anda." };
    }

    const users = readUsers();
    const stored = users.find((item) => item.email === normalized);
    if (!stored) {
      return {
        ok: false,
        error: "Email belum terdaftar. Periksa kembali atau buat akun baru.",
      };
    }

    const candidate = await hashPassword(password, stored.salt);
    if (candidate !== stored.passwordHash) {
      return { ok: false, error: "Kata sandi belum cocok. Silakan coba lagi." };
    }

    writeSession(stored.id);
    setUser(toProfile(stored));
    return { ok: true };
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    const validationError = validateRegistration(input);
    if (validationError) return { ok: false, error: validationError };

    const normalized = normalizeEmail(input.email);
    if (normalized === DEMO_ACCOUNT.email) {
      return {
        ok: false,
        error:
          "Email ini khusus akun demo. Gunakan email lain, atau masuk lewat tombol “Masuk dengan akun demo”.",
      };
    }

    const users = readUsers();
    if (users.some((item) => item.email === normalized)) {
      return { ok: false, error: "Email ini sudah terdaftar. Silakan masuk." };
    }

    const { stored, error } = await createStoredUser(input);
    if (!stored || error) {
      return { ok: false, error: error ?? "Akun belum dapat dibuat." };
    }

    if (!writeUsers([stored, ...users])) {
      return {
        ok: false,
        error:
          "Penyimpanan peramban tidak tersedia. Aktifkan cookie/localStorage lalu coba lagi.",
      };
    }

    writeSession(stored.id);
    setUser(toProfile(stored));
    return { ok: true };
  }, []);

  const loginDemo = useCallback(async (): Promise<AuthResult> => {
    const users = readUsers();
    const demoEmail = DEMO_ACCOUNT.email;
    const existing = users.find((item) => item.email === demoEmail);

    if (existing) {
      const candidate = await hashPassword(DEMO_ACCOUNT.password, existing.salt);
      if (candidate !== existing.passwordHash) {
        return {
          ok: false,
          error: "Akun demo di perangkat ini memakai kata sandi berbeda.",
        };
      }
      writeSession(existing.id);
      setUser(toProfile(existing));
      return { ok: true };
    }

    const { stored } = await createStoredUser({
      name: "Rina Kusuma",
      email: demoEmail,
      password: DEMO_ACCOUNT.password,
      regionId: "tanjung-barat",
    });

    if (!stored) return { ok: false, error: "Akun demo belum dapat dibuat." };
    if (!writeUsers([stored, ...users])) {
      return {
        ok: false,
        error:
          "Penyimpanan peramban tidak tersedia. Aktifkan cookie/localStorage lalu coba lagi.",
      };
    }

    writeSession(stored.id);
    setUser(toProfile(stored));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    if (!user) return { ok: false, error: "Tidak ada akun yang sedang aktif." };
    const remaining = readUsers().filter((item) => item.id !== user.id);
    if (!writeUsers(remaining)) {
      return { ok: false, error: "Akun belum dapat dihapus dari perangkat ini." };
    }
    clearSession();
    setUser(null);
    return { ok: true };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      login,
      register,
      loginDemo,
      logout,
      deleteAccount,
    }),
    [user, isHydrated, login, register, loginDemo, logout, deleteAccount],
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
