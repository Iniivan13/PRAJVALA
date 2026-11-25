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

interface AuthContextValue {
  user: UserProfile | null;
  isHydrated: boolean;
  isSupabaseMode: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBrowser(): boolean {
  return typeof window !== "undefined";
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

function resolveRegionId(regionId?: string): string {
  return REGIONS.some((region) => region.id === regionId) ? (regionId as string) : "all";
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
    return "Pendaftaran akun baru sedang ditutup. Hubungi pengelola PRAJVALA.";
  }
  if (value.includes("rate limit") || value.includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }
  if (value.includes("email address is invalid") || value.includes("invalid email")) {
    return "Alamat email belum valid. Contoh: nama@email.com.";
  }
  if (isTransientSupabaseError(value)) {
    return "Server Supabase belum dapat dijangkau. Periksa koneksi internet lalu coba lagi.";
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
    // Tabel profil belum tersedia; metadata auth tetap dapat dipakai.
  }

  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const client = createClient();

    async function hydrate() {
      if (!client) {
        if (!cancelled) {
          setUser(null);
          setIsHydrated(true);
        }
        return;
      }

      try {
        const { data } = await client.auth.getUser();
        if (data.user) {
          const profile = await profileFromSupabase(client, data.user);
          if (!cancelled) {
            setUser(profile);
            setIsHydrated(true);
          }
          return;
        }
      } catch {
        // Biarkan pengguna null; sesi akan dipulihkan saat koneksi tersedia.
      }

      if (!cancelled) {
        setUser(null);
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
        setUser(null);
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
      if (!client) {
        return {
          ok: false,
          error: "Supabase belum dikonfigurasi. Hubungi pengelola PRAJVALA.",
        };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: normalized,
          password,
        });

        if (!error && data.user) {
          const profile = await profileFromSupabase(client, data.user);
          setUser(profile);
          return { ok: true, message: "Berhasil masuk." };
        }

        const message = error?.message ?? "Gagal masuk.";
        return { ok: false, error: mapAuthError(message) };
      } catch {
        return {
          ok: false,
          error:
            "Server Supabase belum dapat dijangkau. Periksa koneksi internet lalu coba lagi.",
        };
      }
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    const validationError = validateRegistration(input);
    if (validationError) return { ok: false, error: validationError };

    const client = createClient();
    if (!client) {
      return {
        ok: false,
        error: "Supabase belum dikonfigurasi. Hubungi pengelola PRAJVALA.",
      };
    }

    const normalized = normalizeEmail(input.email);

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
        return { ok: false, error: mapAuthError(message) };
      }

      if (!data.user) {
        return {
          ok: false,
          error: "Pendaftaran belum dapat diproses. Coba lagi beberapa saat.",
        };
      }

      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          ok: false,
          error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.",
        };
      }

      if (data.session) {
        const profile = await profileFromSupabase(client, data.user);
        setUser(profile);
        return { ok: true, message: "Akun berhasil dibuat dan Anda sudah masuk." };
      }

      return {
        ok: true,
        needsConfirmation: true,
        message: `Kami mengirim tautan konfirmasi ke ${normalized}. Buka email tersebut, konfirmasi akun, lalu masuk kembali.`,
      };
    } catch {
      return {
        ok: false,
        error:
          "Server Supabase belum dapat dijangkau. Periksa koneksi internet lalu coba lagi.",
      };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const client = createClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Sesi di memori tetap dibersihkan meski server tidak terjangkau.
      }
    }
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    if (!user) return { ok: false, error: "Tidak ada akun yang sedang aktif." };

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
        // Abaikan; state pengguna tetap dibersihkan di bawah.
      }
      setUser(null);
      return { ok: true, message: "Akun berhasil dihapus." };
    } catch {
      return {
        ok: false,
        error:
          "Akun belum dapat dihapus. Pastikan fungsi delete_user sudah dijalankan di Supabase.",
      };
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      isSupabaseMode: isSupabaseConfigured,
      login,
      register,
      logout,
      deleteAccount,
    }),
    [user, isHydrated, login, register, logout, deleteAccount],
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
