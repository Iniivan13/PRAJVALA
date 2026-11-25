"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
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
import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";

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

interface AuthContextValue {
  user: UserProfile | null;
  isHydrated: boolean;
  isSupabaseMode: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  loginDemo: () => Promise<AuthResult>;
  logout: () => Promise<void>;
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
    source: "local",
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
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

async function createStoredUser(
  input: RegisterInput,
): Promise<{ stored: StoredUser | null; error?: string }> {
  const salt = randomToken().slice(0, 16);
  const passwordHash = await hashPassword(input.password, salt);

  return {
    stored: {
      id: `usr-${randomToken().slice(0, 12)}`,
      name: normalizeName(input.name),
      email: normalizeEmail(input.email),
      regionId: resolveRegionId(input.regionId),
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    },
  };
}

function isTransientSupabaseError(message: string): boolean {
  return /failed to fetch|fetch failed|network|load failed|timeout|timed out|temporarily|service unavailable|database error/i.test(
    message,
  );
}

function mapAuthError(message: string, fallback = "Terjadi kendala. Silakan coba lagi."): string {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) {
    return "Email atau kata sandi belum cocok. Periksa kembali lalu coba lagi.";
  }
  if (value.includes("email not confirmed")) {
    return "Email Anda belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk Anda, lalu masuk kembali.";
  }
  if (value.includes("user already registered") || value.includes("already registered")) {
    return "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
  }
  if (value.includes("password should be at least")) {
    return "Kata sandi terlalu pendek. Gunakan minimal 8 karakter.";
  }
  if (value.includes("signups not allowed") || value.includes("signup is disabled")) {
    return "Pendaftaran akun baru sedang ditutup. Coba masuk dengan akun demo.";
  }
  if (value.includes("rate limit") || value.includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }
  if (value.includes("email address is invalid") || value.includes("invalid email")) {
    return "Alamat email belum valid. Contoh: nama@email.com.";
  }
  if (isTransientSupabaseError(value)) {
    return "Server Supabase belum dapat dijangkau. Kami memakai mode lokal sementara.";
  }
  return fallback;
}

function metadataName(user: Pick<User, "email" | "user_metadata">): string {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim().length >= 3) {
    return normalizeName(fullName);
  }
  const email = user.email ?? "";
  return email.split("@")[0] || "Warga PRAJVALA";
}

function metadataRegion(user: Pick<User, "user_metadata">): string {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const value = metadata?.region_id;
  return resolveRegionId(typeof value === "string" ? value : undefined);
}

async function profileFromSupabase(
  client: SupabaseClient,
  authUser: User,
): Promise<UserProfile> {
  const fallback: UserProfile = {
    id: authUser.id,
    name: metadataName(authUser),
    email: authUser.email ?? "",
    regionId: metadataRegion(authUser),
    createdAt: authUser.created_at ?? new Date().toISOString(),
    source: "supabase",
  };

  try {
    const { data } = await client
      .from("profiles")
      .select("full_name, region_id, created_at")
      .eq("id", authUser.id)
      .maybeSingle<{
        full_name: string | null;
        region_id: string | null;
        created_at: string | null;
      }>();

    if (data) {
      return {
        ...fallback,
        name:
          typeof data.full_name === "string" && data.full_name.trim().length >= 3
            ? data.full_name.trim()
            : fallback.name,
        regionId: resolveRegionId(data.region_id ?? undefined),
        createdAt: data.created_at ?? fallback.createdAt,
      };
    }
  } catch {
    // Tabel profil belum tersedia; metadata auth sudah cukup untuk demo.
  }

  return fallback;
}

async function localLogin(
  email: string,
  password: string,
): Promise<{ profile: UserProfile | null; error?: string }> {
  const users = readUsers();
  const stored = users.find((item) => item.email === email);
  if (!stored) {
    return {
      profile: null,
      error: "Email belum terdaftar. Periksa kembali atau buat akun baru.",
    };
  }

  const candidate = await hashPassword(password, stored.salt);
  if (candidate !== stored.passwordHash) {
    return { profile: null, error: "Kata sandi belum cocok. Silakan coba lagi." };
  }

  writeSession(stored.id);
  return { profile: toProfile(stored) };
}

async function localRegister(input: RegisterInput): Promise<AuthResult> {
  const normalized = normalizeEmail(input.email);
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
  return {
    ok: true,
    message: "Akun lokal berhasil dibuat. Anda langsung masuk.",
  };
}

async function localDemoLogin(): Promise<AuthResult> {
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
    return { ok: true, message: "Masuk dengan akun demo lokal." };
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
  return { ok: true, message: "Masuk dengan akun demo lokal." };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const client = createClient();

    async function hydrate() {
      if (client) {
        try {
          const { data } = await client.auth.getUser();
          if (data.user) {
            const profile = await profileFromSupabase(client, data.user);
            if (!cancelled) {
              clearSession();
              setUser(profile);
              setIsHydrated(true);
            }
            return;
          }
        } catch {
          // Jaringan bermasalah; lanjutkan ke sesi lokal.
        }
      }

      if (!cancelled) {
        setUser(readSession());
        setIsHydrated(true);
      }
    }

    void hydrate();

    if (!client) {
      return () => {
        cancelled = true;
      };
    }

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (event === "SIGNED_OUT") {
        setUser((previous) => (previous?.source === "supabase" ? null : previous));
        return;
      }

      if (!session?.user) return;
      const authUser = session.user;
      // Jalankan di luar lock auth Supabase agar pemuatan profil tidak deadlock.
      window.setTimeout(() => {
        void profileFromSupabase(client, authUser).then((profile) => {
          if (!cancelled) setUser(profile);
        });
      }, 0);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
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

      const client = createClient();
      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: normalized,
            password,
          });

          if (!error && data.user) {
            const profile = await profileFromSupabase(client, data.user);
            clearSession();
            setUser(profile);
            return { ok: true, message: "Masuk dengan akun Supabase." };
          }

          if (error) {
            const message = error.message ?? "";
            if (/email not confirmed/i.test(message)) {
              return {
                ok: false,
                error:
                  "Email Anda belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk Anda, lalu masuk kembali.",
              };
            }
            const canFallback =
              /invalid login credentials|invalid email or password/i.test(message) ||
              isTransientSupabaseError(message);
            if (!canFallback) {
              return { ok: false, error: mapAuthError(message) };
            }
          }
        } catch {
          // Jaringan bermasalah; coba akun lokal di perangkat ini.
        }
      }

      const local = await localLogin(normalized, password);
      if (!local.profile) {
        return { ok: false, error: local.error ?? "Belum dapat masuk. Coba lagi." };
      }
      setUser(local.profile);
      return { ok: true, message: "Masuk dengan akun lokal di perangkat ini." };
    },
    [],
  );

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

    const client = createClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: normalized,
          password: input.password,
          options: {
            data: {
              full_name: normalizeName(input.name),
              region_id: resolveRegionId(input.regionId),
            },
            emailRedirectTo: isBrowser()
              ? `${window.location.origin}/masuk?redirect=%2Fakun`
              : undefined,
          },
        });

        if (error) {
          const message = error.message ?? "";
          if (/already registered|already exists|user already/i.test(message)) {
            return {
              ok: false,
              error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.",
            };
          }
          if (!isTransientSupabaseError(message)) {
            return { ok: false, error: mapAuthError(message) };
          }
        } else if (data.user) {
          if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            return {
              ok: false,
              error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.",
            };
          }
          if (data.session) {
            const profile = await profileFromSupabase(client, data.user);
            clearSession();
            setUser(profile);
            return { ok: true, message: "Akun berhasil dibuat dan Anda sudah masuk." };
          }
          return {
            ok: true,
            needsConfirmation: true,
            message: `Kami mengirim tautan konfirmasi ke ${normalized}. Buka email tersebut, konfirmasi akun, lalu masuk kembali.`,
          };
        }
      } catch {
        // Jaringan bermasalah; lanjutkan pendaftaran lokal.
      }
    }

    const result = await localRegister(input);
    if (result.ok) {
      const session = readSession();
      if (session) setUser(session);
    }
    return result;
  }, []);

  const loginDemo = useCallback(async (): Promise<AuthResult> => {
    const client = createClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: DEMO_ACCOUNT.email,
          password: DEMO_ACCOUNT.password,
        });
        if (!error && data.user) {
          const profile = await profileFromSupabase(client, data.user);
          clearSession();
          setUser(profile);
          return { ok: true, message: "Masuk dengan akun demo tersinkron Supabase." };
        }
      } catch {
        // Akun demo Supabase belum tersedia; gunakan akun demo lokal.
      }
    }

    const result = await localDemoLogin();
    if (result.ok) {
      const session = readSession();
      if (session) setUser(session);
    }
    return result;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const client = createClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Sesi lokal tetap dibersihkan meski server tidak terjangkau.
      }
    }
    clearSession();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    if (!user) return { ok: false, error: "Tidak ada akun yang sedang aktif." };

    if (user.source === "supabase") {
      const client = createClient();
      if (!client) {
        return {
          ok: false,
          error: "Koneksi Supabase tidak tersedia. Coba lagi setelah jaringan pulih.",
        };
      }
      try {
        const { error } = await client.rpc("delete_user");
        if (error) {
          return {
            ok: false,
            error: `Akun belum dapat dihapus: ${mapAuthError(error.message, error.message)}`,
          };
        }
        try {
          await client.auth.signOut();
        } catch {
          // Abaikan; sesi lokal tetap dibersihkan di bawah.
        }
        clearSession();
        setUser(null);
        return { ok: true, message: "Akun Supabase berhasil dihapus." };
      } catch {
        return {
          ok: false,
          error:
            "Akun belum dapat dihapus. Pastikan fungsi delete_user sudah dijalankan di Supabase.",
        };
      }
    }

    const remaining = readUsers().filter((item) => item.id !== user.id);
    if (!writeUsers(remaining)) {
      return { ok: false, error: "Akun belum dapat dihapus dari perangkat ini." };
    }
    clearSession();
    setUser(null);
    return { ok: true, message: "Akun lokal berhasil dihapus dari perangkat ini." };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      isSupabaseMode: isSupabaseConfigured,
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
