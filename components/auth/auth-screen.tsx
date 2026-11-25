"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  Fingerprint,
  HardDrive,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import {
  DEMO_ACCOUNT,
  useAuth,
} from "@/components/providers/auth-provider";
import { useRegion } from "@/components/providers/region-provider";
import { PROJECTS, REGIONS, TOTAL_CITIZEN_REPORTS } from "@/lib/data";
import { cn, formatNumber, initialsFor } from "@/lib/utils";

interface AuthScreenProps {
  mode: "login" | "register";
  redirectTo?: string;
}

function safeRedirect(value?: string): string {
  if (!value) return "/akun";
  if (!value.startsWith("/") || value.startsWith("//")) return "/akun";
  return value;
}

const COPY = {
  login: {
    eyebrow: "Selamat datang kembali",
    title: "Lanjutkan pengawasan yang Anda mulai.",
    description:
      "Masuk untuk menyimpan identitas laporan, mengatur wilayah pantau, dan menelusuri kontribusi Anda di perangkat ini.",
    panelBadge: "Akun warga PRAJVALA",
    panelTitle: "Satu akun, satu jejak kontribusi yang jelas.",
    switchText: "Belum punya akun?",
    switchAction: "Daftar gratis",
    switchHref: "/daftar",
  },
  register: {
    eyebrow: "Daftar akun warga",
    title: "Mulai dari satu laporan yang Anda jaga.",
    description:
      "Cukup nama, email, dan kata sandi. Tanpa nomor telepon, tanpa verifikasi berbelit — selesai dalam 30 detik.",
    panelBadge: "Bergabung dengan warga lain",
    panelTitle: "Nama Anda tetap terlindungi, suara Anda tetap tercatat.",
    switchText: "Sudah punya akun?",
    switchAction: "Masuk di sini",
    switchHref: "/masuk",
  },
} as const;

const BENEFITS = [
  {
    icon: Fingerprint,
    title: "Laporan tersimpan rapi",
    body: "Semua laporan yang Anda kirim dari perangkat ini mudah ditemukan kembali.",
  },
  {
    icon: MapPin,
    title: "Wilayah pantau personal",
    body: "Tentukan wilayah utama agar data yang tampil lebih relevan dengan lingkungan Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Privasi sejak awal",
    body: "Nama disamarkan otomatis dan metadata foto dibersihkan sebelum ditampilkan.",
  },
];

export function AuthScreen({ mode, redirectTo }: AuthScreenProps) {
  const copy = COPY[mode];
  const target = safeRedirect(redirectTo);
  const router = useRouter();
  const { user, login, register, loginDemo, logout, isSupabaseMode } = useAuth();
  const { setActiveRegionId } = useRegion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState("all");
  const [consent, setConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const passwordChecks = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /\d/.test(password),
  ];
  const strength = passwordChecks.filter(Boolean).length;
  const strengthLabel = strength >= 3 ? "Kuat" : strength === 2 ? "Cukup" : "Lemah";
  const strengthColor =
    strength >= 3 ? "bg-emerald-500" : strength === 2 ? "bg-amber-500" : "bg-rose-500";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await login(email, password);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Belum dapat masuk. Coba lagi.");
      return;
    }
    router.push(target);
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!consent) {
      setError("Centang persetujuan agar kami dapat menyimpan akun Anda.");
      return;
    }
    setPending(true);
    const result = await register({ name, email, password, regionId });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Akun belum dapat dibuat. Coba lagi.");
      return;
    }
    if (result.needsConfirmation) {
      setConfirmationEmail(email.trim().toLowerCase());
      setPassword("");
      return;
    }
    setActiveRegionId(regionId);
    router.push(target);
  }

  async function handleDemo() {
    setError("");
    setPending(true);
    const result = await loginDemo();
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Akun demo belum dapat dibuka.");
      return;
    }
    setActiveRegionId("tanjung-barat");
    router.push(target);
  }

  return (
    <section className="relative overflow-hidden border-b border-ink-200/70 bg-ink-50">
      <div
        className="surface-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-400/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="container-page relative py-8 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-10">
          <aside className="relative hidden overflow-hidden rounded-3xl bg-ink-900 p-8 text-white shadow-lifted lg:flex lg:flex-col">
            <div
              className="surface-grid-dark pointer-events-none absolute inset-0 opacity-50"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/15 blur-[80px]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-navy-light/25 blur-[80px]"
              aria-hidden="true"
            />

            <div className="relative flex flex-1 flex-col">
              <Logo theme="dark" showTagline />

              <span className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-300">
                <Sparkles size={11} aria-hidden="true" />
                {copy.panelBadge}
              </span>
              <h2 className="mt-4 max-w-md font-display text-[30px] font-extrabold leading-[1.15] tracking-tight text-white text-balance">
                {copy.panelTitle}
              </h2>

              <ul className="mt-8 space-y-4">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={benefit.title} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-amber-400">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-white">
                          {benefit.title}
                        </p>
                        <p className="mt-0.5 max-w-[19rem] text-[10.5px] leading-relaxed text-ink-400">
                          {benefit.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto pt-10">
                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">
                      {formatNumber(TOTAL_CITIZEN_REPORTS)}
                    </p>
                    <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.08em] text-ink-400">
                      Laporan warga
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">
                      {PROJECTS.length}
                    </p>
                    <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.08em] text-ink-400">
                      Proyek terpantau
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">
                      {REGIONS.length}
                    </p>
                    <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.08em] text-ink-400">
                      Wilayah
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-start gap-1.5 text-[9px] leading-relaxed text-ink-500">
                  <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  {isSupabaseMode
                    ? "Akun dan kontribusi tersinkron aman lewat Supabase, dengan fallback lokal bila server tidak tersedia."
                    : "Mode lokal: akun disimpan di perangkat Anda dan tidak dikirim ke server mana pun."}
                </p>
              </div>
            </div>
          </aside>

          <div className="motion-reduce:animate-none">
            <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="eyebrow">
                    <span className="h-px w-5 bg-amber-500" aria-hidden="true" />
                    {copy.eyebrow}
                  </span>
                  <h1 className="mt-2.5 font-display text-[24px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[27px]">
                    {mode === "login" ? "Masuk ke akun Anda" : "Buat akun warga"}
                  </h1>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
                    {copy.description}
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  {mode === "login" ? (
                    <KeyRound size={18} aria-hidden="true" />
                  ) : (
                    <UserRound size={18} aria-hidden="true" />
                  )}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em]",
                    isSupabaseMode
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-ink-200 bg-ink-50 text-ink-500",
                  )}
                >
                  {isSupabaseMode ? (
                    <Cloud size={9} aria-hidden="true" />
                  ) : (
                    <HardDrive size={9} aria-hidden="true" />
                  )}
                  {isSupabaseMode ? "Tersinkron Supabase" : "Mode lokal peramban"}
                </span>
                <span className="text-[8.5px] text-ink-400">
                  {isSupabaseMode
                    ? "Laporan & dukungan tersimpan di server"
                    : "Tanpa server — cocok untuk demo offline"}
                </span>
              </div>

              {user ? (
                <AlreadySignedIn
                  name={user.name}
                  email={user.email}
                  isSupabaseMode={user.source === "supabase"}
                  onLogout={() => {
                    void logout();
                    setError("");
                  }}
                />
              ) : (
                <>
                  {error ? (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-rose-700"
                    >
                      {error}
                    </div>
                  ) : null}

                  {confirmationEmail ? (
                    <ConfirmationNotice
                      email={confirmationEmail}
                      onBack={() => {
                        setConfirmationEmail("");
                        setError("");
                      }}
                    />
                  ) : mode === "register" ? (
                    <form onSubmit={handleRegister} className="mt-5 space-y-4">
                      <AuthField
                        id="auth-name"
                        label="Nama lengkap atau inisial"
                        icon={UserRound}
                        hint="Ditampilkan sebagai “Rina K.” pada laporan publik."
                      >
                        <input
                          id="auth-name"
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Contoh: Rina Kusuma"
                          autoComplete="name"
                          required
                          className="input-base h-11 py-0 pl-10 text-[12.5px]"
                        />
                      </AuthField>

                      <AuthField id="auth-email" label="Alamat email" icon={Mail}>
                        <input
                          id="auth-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="nama@email.com"
                          autoComplete="email"
                          required
                          className="input-base h-11 py-0 pl-10 text-[12.5px]"
                        />
                      </AuthField>

                      <AuthField id="auth-password" label="Kata sandi" icon={LockKeyhole}>
                        <input
                          id="auth-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Minimal 8 karakter, huruf & angka"
                          autoComplete="new-password"
                          required
                          minLength={8}
                          className="input-base h-11 py-0 pl-10 pr-11 text-[12.5px]"
                        />
                        <PasswordToggle
                          visible={showPassword}
                          onToggle={() => setShowPassword((value) => !value)}
                        />
                      </AuthField>

                      {password.length > 0 ? (
                        <div className="-mt-1">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-ink-400">Kekuatan kata sandi</span>
                            <span
                              className={cn(
                                "font-semibold",
                                strength >= 3
                                  ? "text-emerald-600"
                                  : strength === 2
                                    ? "text-amber-600"
                                    : "text-rose-600",
                              )}
                            >
                              {strengthLabel}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-3 gap-1" aria-hidden="true">
                            {[0, 1, 2].map((index) => (
                              <span
                                key={index}
                                className={cn(
                                  "h-1 rounded-full",
                                  index < strength ? strengthColor : "bg-ink-100",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <label
                          htmlFor="auth-region"
                          className="text-[10.5px] font-semibold text-ink-700"
                        >
                          Wilayah pantau utama
                        </label>
                        <div className="relative mt-1.5">
                          <MapPin
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                            aria-hidden="true"
                          />
                          <select
                            id="auth-region"
                            value={regionId}
                            onChange={(event) => setRegionId(event.target.value)}
                            className="input-base h-11 appearance-none py-0 pl-10 text-[12.5px]"
                          >
                            <option value="all">Semua wilayah (agregat)</option>
                            {REGIONS.map((region) => (
                              <option key={region.id} value={region.id}>
                                {region.name} — {region.level}, {region.city}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-1 text-[9px] text-ink-400">
                          Data di beranda dan dashboard akan mengikuti pilihan ini.
                        </p>
                      </div>

                      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-200 bg-ink-50/50 p-3">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(event) => setConsent(event.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                        />
                        <span className="text-[9.5px] leading-relaxed text-ink-600">
                          {isSupabaseMode
                            ? "Saya memahami ini akun simulasi PRAJVALA. Nama, email, dan kontribusi saya disimpan di Supabase dan dapat dihapus kapan saja."
                            : "Saya memahami ini akun simulasi PRAJVALA. Data akun disimpan hanya di perangkat ini dan tidak dikirim ke server."}
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={pending}
                        className="btn-primary h-11 w-full px-4 py-0 text-[12.5px]"
                      >
                        {pending ? (
                          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <UserRound size={15} aria-hidden="true" />
                        )}
                        {pending ? "Membuat akun…" : "Buat akun warga"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="mt-5 space-y-4">
                      <AuthField id="login-email" label="Alamat email" icon={Mail}>
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="nama@email.com"
                          autoComplete="email"
                          required
                          className="input-base h-11 py-0 pl-10 text-[12.5px]"
                        />
                      </AuthField>

                      <AuthField id="login-password" label="Kata sandi" icon={LockKeyhole}>
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Masukkan kata sandi"
                          autoComplete="current-password"
                          required
                          className="input-base h-11 py-0 pl-10 pr-11 text-[12.5px]"
                        />
                        <PasswordToggle
                          visible={showPassword}
                          onToggle={() => setShowPassword((value) => !value)}
                        />
                      </AuthField>

                      <button
                        type="submit"
                        disabled={pending}
                        className="btn-primary h-11 w-full px-4 py-0 text-[12.5px]"
                      >
                        {pending ? (
                          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <KeyRound size={15} aria-hidden="true" />
                        )}
                        {pending ? "Memeriksa akun…" : "Masuk ke akun"}
                      </button>

                      <div className="relative py-1 text-center">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-ink-100" aria-hidden="true" />
                        <span className="relative bg-white px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                          atau coba dulu
                        </span>
                      </div>

                      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5">
                        <div className="flex items-start gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-amber-600 shadow-sm">
                            <Sparkles size={14} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-amber-900">
                              Ingin langsung melihat isi akun?
                            </p>
                            <p className="mt-0.5 text-[9.5px] leading-relaxed text-amber-800">
                              Gunakan akun demo warga Tanjung Barat tanpa perlu mendaftar.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleDemo}
                          disabled={pending}
                          className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
                        >
                          <Sparkles size={13} className="text-amber-400" aria-hidden="true" />
                          Masuk dengan akun demo
                        </button>
                        <p className="mt-1.5 text-center font-mono text-[8.5px] text-amber-700/80">
                          {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
                        </p>
                      </div>
                    </form>
                  )}

                  <p className="mt-5 text-center text-[11px] text-ink-500">
                    {copy.switchText}{" "}
                    <Link
                      href={`${copy.switchHref}${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                      className="font-semibold text-navy underline-offset-4 hover:text-amber-600 hover:underline"
                    >
                      {copy.switchAction}
                    </Link>
                  </p>
                </>
              )}
            </div>

            <p className="mt-3 flex items-start justify-center gap-1.5 px-4 text-center text-[9px] leading-relaxed text-ink-400">
              <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {isSupabaseMode
                ? "Kata sandi dikelola Supabase Auth. Kami tidak pernah menyimpan kata sandi Anda. Jangan gunakan kata sandi akun penting."
                : "Akun lokal memakai kata sandi yang di-hash di peramban. Jangan gunakan kata sandi akun penting Anda."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthField({
  id,
  label,
  icon: Icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[10.5px] font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        {children}
      </div>
      {hint ? <p className="mt-1 text-[9px] text-ink-400">{hint}</p> : null}
    </div>
  );
}

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
    >
      {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
    </button>
  );
}

function AlreadySignedIn({
  name,
  email,
  isSupabaseMode,
  onLogout,
}: {
  name: string;
  email: string;
  isSupabaseMode: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-[13px] font-bold text-white">
            {initialsFor(name)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-900">
              <BadgeCheck size={13} aria-hidden="true" />
              Anda sudah masuk
            </p>
            <p className="truncate text-[10.5px] text-emerald-800">
              {name} · {email}
            </p>
          </div>
        </div>
      </div>

      <Link href="/akun" className="btn-primary mt-4 h-11 w-full px-4 py-0 text-[12.5px]">
        <UsersRound size={15} aria-hidden="true" />
        Buka akun saya
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="btn-secondary mt-2 h-10 w-full px-4 py-0 text-[11.5px]"
      >
        Keluar dari akun
      </button>
      <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-ink-400">
        <CheckCircle2 size={10} className="text-emerald-500" aria-hidden="true" />
        {isSupabaseMode
          ? "Sesi tersinkron lewat Supabase Auth"
          : "Sesi akun tersimpan di peramban ini"}
      </p>
    </div>
  );
}

function ConfirmationNotice({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            <Mail size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-emerald-900">Cek email Anda</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-emerald-800">
              Tautan konfirmasi sudah dikirim ke{" "}
              <span className="font-semibold">{email}</span>. Buka email tersebut lalu
              konfirmasi akun sebelum masuk.
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 text-[9.5px] leading-relaxed text-ink-500">
        <li className="flex items-start gap-1.5">
          <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
          Tidak menemukan email? Periksa folder spam atau promosi.
        </li>
        <li className="flex items-start gap-1.5">
          <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
          Setelah dikonfirmasi, masuk lewat halaman ini dengan email dan kata sandi Anda.
        </li>
      </ul>

      <Link href="/masuk" className="btn-primary mt-4 h-11 w-full px-4 py-0 text-[12.5px]">
        <KeyRound size={15} aria-hidden="true" />
        Lanjut ke halaman masuk
      </Link>
      <button
        type="button"
        onClick={onBack}
        className="btn-secondary mt-2 h-10 w-full px-4 py-0 text-[11.5px]"
      >
        Daftar dengan email lain
      </button>
    </div>
  );
}
