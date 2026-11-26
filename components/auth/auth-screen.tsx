"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  Fingerprint,
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
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { useRegion } from "@/components/providers/region-provider";
import { PROJECTS, REGIONS, TOTAL_CITIZEN_REPORTS } from "@/lib/data";
import { cn, formatNumber, initialsFor } from "@/lib/utils";
import {
  checkFirebaseReady,
  type FirebaseReadyStatus,
} from "@/utils/firebase/client";

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

/**
 * Auth gate.
 *
 * The panel keeps the account "quest board" metaphor: a wood-framed ledgers side
 * on desktop and a single framed form on mobile. All Firebase calls, strength
 * checks, and redirect handling are untouched.
 */
export function AuthScreen({ mode, redirectTo }: AuthScreenProps) {
  const copy = COPY[mode];
  const target = safeRedirect(redirectTo);
  const router = useRouter();
  const { user, login, register, logout, isFirebaseMode } = useAuth();
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
  const [schemaStatus, setSchemaStatus] = useState<FirebaseReadyStatus>("disabled");

  useEffect(() => {
    let cancelled = false;
    void checkFirebaseReady().then((status) => {
      if (!cancelled) setSchemaStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const passwordChecks = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /\d/.test(password),
  ];
  const strength = passwordChecks.filter(Boolean).length;
  const strengthLabel = strength >= 3 ? "Kuat" : strength === 2 ? "Cukup" : "Lemah";

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

  return (
    <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 surface-grid"
        aria-hidden="true"
      />

      <div className="container-page relative py-7 sm:py-10 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-8">
          <aside className="relative hidden overflow-hidden border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel lg:flex lg:flex-col">
            <div className="flex flex-1 flex-col border-[3px] border-pixel-line bg-pixel-wood-dark p-6 text-pixel-cream">
              <Logo theme="dark" showTagline />

              <span className="mt-8 inline-flex w-fit items-center gap-1.5 border-2 border-pixel-cream/40 bg-pixel-wood-darker px-2 py-1 font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-sun">
                <Sparkles size={10} aria-hidden="true" />
                {copy.panelBadge}
              </span>
              <h2 className="mt-3.5 max-w-md font-pixel text-[16px] uppercase leading-[1.75] text-pixel-cream">
                {copy.panelTitle}
              </h2>

              <ul className="mt-7 space-y-4">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={benefit.title} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[11.5px] font-semibold text-pixel-cream">
                          {benefit.title}
                        </p>
                        <p className="mt-1 max-w-[19rem] text-[10.5px] leading-relaxed text-pixel-cream/75">
                          {benefit.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto pt-8">
                <div className="grid grid-cols-3 gap-2 border-2 border-pixel-cream/25 bg-pixel-wood-darker p-3">
                  {[
                    { value: formatNumber(TOTAL_CITIZEN_REPORTS), label: "Laporan warga" },
                    { value: PROJECTS.length, label: "Proyek terpantau" },
                    { value: REGIONS.length, label: "Wilayah" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-pixel text-[12px] leading-[1.5] text-pixel-sun">
                        {stat.value}
                      </p>
                      <p className="mt-1 font-pixel text-[5.5px] uppercase leading-[1.6] text-pixel-cream/70">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3.5 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-pixel-cream/70">
                  <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  Akun dan kontribusi tersinkron aman lewat Firebase.
                </p>
              </div>
            </div>
          </aside>

          <div className="motion-reduce:animate-none">
            <div className="border-4 border-pixel-line bg-pixel-wood-darker p-1.5 shadow-panel">
              <div className="border-[3px] border-pixel-line bg-pixel-cream p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex border-2 border-pixel-line bg-pixel-sun px-1.5 py-0.5 font-pixel text-[6.5px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                      {copy.eyebrow}
                    </span>
                    <h1 className="mt-2.5 font-pixel text-[14px] uppercase leading-[1.8] text-pixel-line sm:text-[16px]">
                      {mode === "login" ? "Masuk ke akun Anda" : "Buat akun warga"}
                    </h1>
                    <p className="mt-2 text-[11px] leading-relaxed text-pixel-ink/80">
                      {copy.description}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
                    {mode === "login" ? (
                      <KeyRound size={17} aria-hidden="true" />
                    ) : (
                      <UserRound size={17} aria-hidden="true" />
                    )}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 border-2 border-pixel-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] shadow-chip",
                      isFirebaseMode
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-white text-pixel-ink/70",
                    )}
                  >
                    {isFirebaseMode ? (
                      <Cloud size={9} aria-hidden="true" />
                    ) : (
                      <AlertTriangle size={9} aria-hidden="true" />
                    )}
                    {isFirebaseMode ? "Tersinkron Firebase" : "Firebase belum aktif"}
                  </span>
                  <span className="text-[9.5px] text-pixel-ink/65">
                    {isFirebaseMode
                      ? "Laporan & dukungan tersimpan di server"
                      : "Konfigurasi Firebase diperlukan"}
                  </span>
                </div>

                {schemaStatus === "offline" ? (
                  <div
                    role="status"
                    className="mt-3 flex items-start gap-2 border-2 border-rose-700 bg-rose-50 px-2.5 py-2 text-[10px] leading-relaxed text-rose-900"
                  >
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="font-bold">Server Firebase belum dapat dijangkau.</span>{" "}
                      Aplikasi akan mencoba lagi saat koneksi tersedia. Pastikan konfigurasi
                      Firebase sudah benar.
                    </span>
                  </div>
                ) : null}

                {user ? (
                  <AlreadySignedIn
                    name={user.name}
                    email={user.email}
                    isFirebaseMode={user.source === "firebase"}
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
                        className="mt-4 border-2 border-rose-700 bg-rose-50 px-3 py-2.5 text-[11px] leading-relaxed text-rose-900"
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
                      <form onSubmit={handleRegister} className="mt-4 space-y-3.5">
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
                            <div className="flex items-center justify-between text-[9.5px]">
                              <span className="text-pixel-ink/65">Kekuatan kata sandi</span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  strength >= 3
                                    ? "text-emerald-700"
                                    : strength === 2
                                      ? "text-amber-700"
                                      : "text-rose-700",
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
                                    "h-2 border border-pixel-line",
                                    index < strength
                                      ? strength >= 3
                                        ? "bg-emerald-600"
                                        : strength === 2
                                          ? "bg-amber-500"
                                          : "bg-rose-600"
                                      : "bg-pixel-panel",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <label
                            htmlFor="auth-region"
                            className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                          >
                            Wilayah pantau utama
                          </label>
                          <div className="relative mt-1.5">
                            <MapPin
                              size={15}
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-line/60"
                              aria-hidden="true"
                            />
                            <select
                              id="auth-region"
                              value={regionId}
                              onChange={(event) => setRegionId(event.target.value)}
                              className="input-base h-11 appearance-none py-0 pl-10 text-[12px]"
                            >
                              <option value="all">Semua wilayah (agregat)</option>
                              {REGIONS.map((region) => (
                                <option key={region.id} value={region.id}>
                                  {region.name} — {region.level}, {region.city}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="mt-1 text-[9.5px] text-pixel-ink/60">
                            Data di beranda dan dashboard akan mengikuti pilihan ini.
                          </p>
                        </div>

                        <label className="flex cursor-pointer items-start gap-2.5 border-2 border-pixel-line bg-white p-2.5">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(event) => setConsent(event.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                          />
                          <span className="text-[9.5px] leading-relaxed text-pixel-ink/80">
                            Saya memahami nama, email, dan kontribusi saya disimpan di Firebase
                            dan dapat dihapus kapan saja.
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={pending}
                          className="btn-primary h-11 w-full px-4 py-0 text-[12px]"
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
                      <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
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
                          className="btn-primary h-11 w-full px-4 py-0 text-[12px]"
                        >
                          {pending ? (
                            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <KeyRound size={15} aria-hidden="true" />
                          )}
                          {pending ? "Memeriksa akun…" : "Masuk ke akun"}
                        </button>
                      </form>
                    )}

                    <p className="mt-4 text-center text-[11px] text-pixel-ink/70">
                      {copy.switchText}{" "}
                      <Link
                        href={`${copy.switchHref}${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                        className="inline-flex min-h-8 items-center font-semibold text-pixel-wood-cta underline decoration-2 underline-offset-4 hover:text-pixel-line"
                      >
                        {copy.switchAction}
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className="mt-3 flex items-start justify-center gap-1.5 px-4 text-center text-[9.5px] leading-relaxed text-pixel-ink/70">
              <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              Kata sandi dikelola Firebase Authentication. Kami tidak pernah menyimpan kata sandi Anda.
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
      <label htmlFor={id} className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-pixel-line/60"
          aria-hidden="true"
        />
        {children}
      </div>
      {hint ? <p className="mt-1 text-[9.5px] text-pixel-ink/60">{hint}</p> : null}
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
      className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center border border-transparent text-pixel-ink/60 transition-colors hover:border-pixel-line hover:bg-pixel-sun hover:text-pixel-line"
    >
      {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
    </button>
  );
}

function AlreadySignedIn({
  name,
  email,
  isFirebaseMode,
  onLogout,
}: {
  name: string;
  email: string;
  isFirebaseMode: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="mt-4">
      <div className="border-2 border-emerald-800 bg-emerald-50 p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-pixel-line bg-emerald-700 font-pixel text-[10px] text-white">
            {initialsFor(name)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-950">
              <BadgeCheck size={13} aria-hidden="true" />
              Anda sudah masuk
            </p>
            <p className="truncate text-[10.5px] text-emerald-900/80">
              {name} · {email}
            </p>
          </div>
        </div>
      </div>

      <Link href="/akun" className="btn-primary mt-3 h-11 w-full px-4 py-0 text-[12px]">
        <UsersRound size={15} aria-hidden="true" />
        Buka akun saya
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="btn-secondary mt-2 h-10 w-full px-4 py-0 text-[11px]"
      >
        Keluar dari akun
      </button>
      <p className="mt-3 flex items-center justify-center gap-1 text-[9.5px] text-pixel-ink/65">
        <CheckCircle2 size={10} className="text-emerald-700" aria-hidden="true" />
        {isFirebaseMode
          ? "Sesi tersinkron lewat Firebase Authentication"
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
    <div className="mt-4">
      <div className="border-2 border-emerald-800 bg-emerald-50 p-3">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-emerald-700 text-white">
            <Mail size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-emerald-950">Cek email Anda</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-emerald-900/85">
              Tautan konfirmasi sudah dikirim ke{" "}
              <span className="font-semibold">{email}</span>. Buka email tersebut lalu
              konfirmasi akun sebelum masuk.
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 text-[9.5px] leading-relaxed text-pixel-ink/70">
        <li className="flex items-start gap-1.5">
          <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
          Tidak menemukan email? Periksa folder spam atau promosi.
        </li>
        <li className="flex items-start gap-1.5">
          <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
          Setelah dikonfirmasi, masuk lewat halaman ini dengan email dan kata sandi Anda.
        </li>
      </ul>

      <Link href="/masuk" className="btn-primary mt-3.5 h-11 w-full px-4 py-0 text-[12px]">
        <KeyRound size={15} aria-hidden="true" />
        Lanjut ke halaman masuk
      </Link>

      <button
        type="button"
        onClick={onBack}
        className="btn-secondary mt-2 h-10 w-full px-4 py-0 text-[11px]"
      >
        Daftar dengan email lain
      </button>
    </div>
  );
}
