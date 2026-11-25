"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Info,
  Loader2,
  LogIn,
  MapPin,
  ShieldCheck,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { prajvalaApi } from "@/lib/api";
import { trapFocus } from "@/lib/focus-trap";
import type { CitizenReport, Project, Suitability } from "@/types";
import { cn, formatNumber, maskName } from "@/lib/utils";

interface ReportFormProps {
  project: Project;
  onClose: () => void;
  onSubmitted: (report: CitizenReport) => void;
}

const SUITABILITY_OPTIONS: {
  value: Suitability;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  tone: string;
  activeTone: string;
}[] = [
  {
    value: "Sesuai Target",
    label: "Sesuai target",
    description: "Hasil sesuai RAB dan bermanfaat",
    icon: CheckCircle2,
    tone: "text-emerald-600",
    activeTone: "border-emerald-400 bg-emerald-50",
  },
  {
    value: "Terlambat",
    label: "Terlambat",
    description: "Progres tidak sesuai jadwal",
    icon: Clock3,
    tone: "text-amber-600",
    activeTone: "border-amber-400 bg-amber-50",
  },
  {
    value: "Indikasi Kejanggalan",
    label: "Indikasi kejanggalan",
    description: "Kualitas/volume dicurigai berbeda",
    icon: AlertTriangle,
    tone: "text-rose-600",
    activeTone: "border-rose-400 bg-rose-50",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Tidak sesuai",
  2: "Kurang sesuai",
  3: "Cukup sesuai",
  4: "Sesuai",
  5: "Sangat sesuai",
};

export function ReportForm({ project, onClose, onSubmitted }: ReportFormProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputId = useId();
  const { user, isHydrated } = useAuth();
  const [author, setAuthor] = useState("");
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoSize, setPhotoSize] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [detectedAt] = useState(() => new Date());

  useEffect(() => {
    if (!isHydrated || !user) return;
    setAuthor((previous) => (previous.trim().length > 0 ? previous : user.name));
  }, [isHydrated, user]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      trapFocus(dialogRef.current, event);
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const handleFile = (file: File | undefined) => {
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Berkas harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("Ukuran gambar maksimal 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : null);
      setPhotoName(file.name);
      setPhotoSize(file.size);
    };
    reader.onerror = () => setPhotoError("Gagal membaca berkas. Coba gambar lain.");
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName("");
    setPhotoSize(0);
    setPhotoError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!suitability) nextErrors.suitability = "Pilih status kesesuaian lapangan.";
    if (rating < 1) nextErrors.rating = "Pilih tingkat kesesuaian dengan RAB.";
    if (comment.trim().length < 20)
      nextErrors.comment = "Tuliskan minimal 20 karakter agar laporan dapat dipahami warga lain.";
    if (!consent)
      nextErrors.consent = "Anda perlu menyatakan bahwa laporan ini berdasarkan pengamatan langsung.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const stored = await prajvalaApi.submitReport({
        projectId: project.id,
        author: author.trim() || user?.name || "Warga Anonim",
        suitability: suitability as Suitability,
        rating,
        comment: comment.trim(),
        photoUrl: photo ?? undefined,
      });
      onSubmitted(prajvalaApi.toFeedItem(stored, user?.id));
    } catch {
      setErrors({
        form: "Laporan gagal dikirim. Periksa koneksi Anda lalu coba lagi.",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="fixed inset-0 bg-ink-950/65 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-form-title"
          aria-describedby="report-form-description"
          tabIndex={-1}
          className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-ink-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
        >
          <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                  <Camera size={15} aria-hidden="true" />
                </span>
                <h2
                  id="report-form-title"
                  className="font-display text-base font-extrabold tracking-tight text-ink-900"
                >
                  Kirim laporan lapangan
                </h2>
              </div>
              <p
                id="report-form-description"
                className="mt-1 text-[10.5px] leading-relaxed text-ink-500"
              >
                {project.name} · {project.location.district}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
              aria-label="Tutup formulir laporan"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            <div className="flex items-start gap-2.5 rounded-xl border border-navy/10 bg-navy-soft/60 p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
              <p className="text-[10.5px] leading-relaxed text-ink-600">
                Laporan akan tampil publik dengan nama yang disamarkan. Koordinat yang
                dibagikan adalah lokasi proyek, bukan lokasi persis tempat tinggal Anda.
              </p>
            </div>

            {errors.form ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                {errors.form}
              </div>
            ) : null}

            <fieldset className="mt-5">
              <legend className="text-[11px] font-bold text-ink-800">
                Status kesesuaian lapangan <span className="text-rose-500">*</span>
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {SUITABILITY_OPTIONS.map((option) => {
                  const active = suitability === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all",
                        active
                          ? option.activeTone
                          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50/50",
                      )}
                    >
                      <input
                        type="radio"
                        name="suitability"
                        value={option.value}
                        checked={active}
                        onChange={() => {
                          setSuitability(option.value);
                          setErrors((previous) => ({ ...previous, suitability: "" }));
                        }}
                        className="sr-only"
                      />
                      <option.icon
                        size={16}
                        className={cn("mt-0.5 shrink-0", option.tone)}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-[11px] font-semibold text-ink-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[9px] leading-relaxed text-ink-500">
                          {option.description}
                        </span>
                      </span>
                      {active ? (
                        <Check size={13} className="ml-auto mt-0.5 shrink-0 text-ink-600" aria-hidden="true" />
                      ) : null}
                    </label>
                  );
                })}
              </div>
              {errors.suitability ? (
                <p className="mt-1.5 text-[10px] font-medium text-rose-600" role="alert">
                  {errors.suitability}
                </p>
              ) : null}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-[11px] font-bold text-ink-800">
                Kesesuaian hasil dengan RAB <span className="text-rose-500">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating kesesuaian hasil dengan RAB">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} dari 5 — ${RATING_LABELS[value]}`}
                      onClick={() => {
                        setRating(value);
                        setErrors((previous) => ({ ...previous, rating: "" }));
                      }}
                      className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-offset-2"
                    >
                      <Star
                        size={24}
                        className={
                          value <= rating ? "text-amber-500" : "text-ink-200 hover:text-amber-300"
                        }
                        fill={value <= rating ? "#F59E0B" : "transparent"}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10.5px] font-medium text-ink-500">
                  {rating > 0 ? RATING_LABELS[rating] : "Belum dipilih"}
                </span>
              </div>
              {errors.rating ? (
                <p className="mt-1 text-[10px] font-medium text-rose-600" role="alert">
                  {errors.rating}
                </p>
              ) : null}
            </fieldset>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label htmlFor="report-comment" className="text-[11px] font-bold text-ink-800">
                  Uraian temuan lapangan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[9.5px] tabular text-ink-400">{comment.length}/600</span>
              </div>
              <textarea
                id="report-comment"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value.slice(0, 600));
                  setErrors((previous) => ({ ...previous, comment: "" }));
                }}
                rows={4}
                placeholder="Contoh: Jalan sudah diaspal, tetapi saluran di depan RT 04 masih tersumbat. Mohon dicek kesesuaian volume dengan RAB."
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? "report-comment-error" : undefined}
                className={cn(
                  "mt-1.5 w-full resize-y rounded-xl border bg-ink-50/40 px-3.5 py-3 text-[12px] leading-relaxed text-ink-900 placeholder:text-ink-400 transition-colors focus:bg-white focus:outline-none focus:ring-4",
                  errors.comment
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
                    : "border-ink-200 focus:border-ink-300 focus:ring-ink-900/5",
                )}
              />
              {errors.comment ? (
                <p id="report-comment-error" className="mt-1 text-[10px] font-medium text-rose-600" role="alert">
                  {errors.comment}
                </p>
              ) : null}
            </div>

            {isHydrated ? (
              user ? (
                <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-[10.5px] font-bold text-white">
                    {user.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-900">
                      <BadgeCheck size={12} aria-hidden="true" />
                      Masuk sebagai {user.name}
                    </p>
                    <p className="truncate text-[9px] text-emerald-800/80">
                      Laporan ditautkan ke akun ini di perangkat Anda · {user.email}
                    </p>
                  </div>
                  <Link
                    href="/akun"
                    className="shrink-0 text-[9.5px] font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                  >
                    Kelola akun
                  </Link>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-navy/10 bg-navy-soft/60 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-navy shadow-sm">
                    <LogIn size={13} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold text-ink-800">
                      Ingin laporan tersimpan di akun Anda?
                    </p>
                    <p className="text-[9px] leading-relaxed text-ink-500">
                      Masuk agar nama terisi otomatis dan kontribusi mudah ditelusuri.
                      Anda tetap bisa mengirim sebagai tamu.
                    </p>
                  </div>
                  <Link
                    href={`/masuk?redirect=${encodeURIComponent(`/proyek/${project.id}#validasi`)}`}
                    className="shrink-0 rounded-lg bg-ink-900 px-2.5 py-1.5 text-[9.5px] font-semibold text-white transition-colors hover:bg-ink-800"
                  >
                    Masuk
                  </Link>
                </div>
              )
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label htmlFor="report-author" className="text-[11px] font-bold text-ink-800">
                  Nama atau inisial <span className="font-normal text-ink-400">(opsional)</span>
                </label>
                <input
                  id="report-author"
                  type="text"
                  value={author}
                  maxLength={60}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Contoh: Rina Kusuma"
                  className="mt-1.5 h-10 w-full rounded-xl border border-ink-200 bg-ink-50/40 px-3.5 text-[12px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-ink-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-ink-900/5"
                />
                <p className="mt-1 text-[9px] text-ink-400">
                  {user
                    ? `Terisi dari akun Anda dan tetap bisa diubah. Akan tampil sebagai “${maskName(
                        author.trim() || user.name,
                      )}”.`
                    : "Akan ditampilkan sebagai “Rina K.” untuk melindungi privasi."}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-800">
                  <MapPin size={10} aria-hidden="true" />
                  Lokasi & waktu terdeteksi
                </p>
                <p className="mt-1.5 font-mono text-[10px] text-emerald-900">
                  {project.location.coordinates.lat.toFixed(5)},{" "}
                  {project.location.coordinates.lng.toFixed(5)}
                </p>
                <p className="mt-0.5 text-[9px] text-emerald-700">
                  ± 8 m · {detectedAt.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  , {detectedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor={fileInputId}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
                  photo
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-ink-200 bg-ink-50/40 hover:border-amber-300 hover:bg-amber-50/30",
                )}
              >
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                {photo ? (
                  <>
                    <span className="relative block h-28 w-full max-w-[280px] overflow-hidden rounded-lg border border-ink-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt="Pratinjau foto bukti lapangan"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[9.5px] text-ink-500">
                      <ImageIcon size={11} aria-hidden="true" />
                      {photoName} · {(photoSize / 1024).toFixed(0)} KB
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700">
                        <ShieldCheck size={9} aria-hidden="true" />
                        EXIF dibersihkan
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink-500 shadow-sm">
                      <UploadCloud size={17} aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-[11px] font-semibold text-ink-700">
                      Unggah foto bukti (opsional)
                    </span>
                    <span className="mt-0.5 text-[9px] text-ink-400">
                      JPG, PNG, atau WebP · maksimal 3 MB
                    </span>
                  </>
                )}
              </label>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1 text-[9px] text-emerald-700">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Metadata GPS dan identitas perangkat dihapus otomatis sebelum publikasi.
                </p>
                {photo ? (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-rose-600 hover:underline"
                  >
                    <Trash2 size={10} aria-hidden="true" />
                    Hapus foto
                  </button>
                ) : null}
              </div>
              {photoError ? (
                <p className="mt-1 text-[10px] font-medium text-rose-600" role="alert">
                  {photoError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 rounded-xl border border-ink-200 bg-ink-50/50 p-3.5">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    setErrors((previous) => ({ ...previous, consent: "" }));
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                  aria-invalid={Boolean(errors.consent)}
                />
                <span className="text-[10px] leading-relaxed text-ink-600">
                  Saya menyatakan laporan ini berdasarkan pengamatan langsung dan
                  disampaikan dengan itikad baik. Saya memahami laporan dapat dikoreksi
                  warga lain atau ditindaklanjuti oleh pihak berwenang.
                </span>
              </label>
              {errors.consent ? (
                <p className="mt-1.5 text-[10px] font-medium text-rose-600" role="alert">
                  {errors.consent}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[9px] text-ink-400">
                <ShieldCheck size={10} aria-hidden="true" />
                Data demonstrasi disimpan di perangkat Anda.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-secondary h-10 flex-1 px-4 py-0 text-[11.5px] sm:flex-none">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary h-10 flex-1 px-4 py-0 text-[11.5px] sm:flex-none"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <UploadCloud size={14} aria-hidden="true" />
                  )}
                  {submitting ? "Mengirim…" : "Kirim laporan"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[9px] text-ink-400">
              Total karakter uraian: {formatNumber(comment.length)} · Laporan akan tampil
              segera setelah dikirim.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
