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
import {
  compressPhoto,
  formatFileSize,
  ImageCompressionError,
  MAX_SOURCE_BYTES,
  type CompressedPhoto,
} from "@/lib/image";
import { trapFocus } from "@/lib/focus-trap";
import { PixelCloseButton } from "@/components/layout/navbar";
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
    tone: "text-emerald-700",
    activeTone: "bg-emerald-50",
  },
  {
    value: "Terlambat",
    label: "Terlambat",
    description: "Progres tidak sesuai jadwal",
    icon: Clock3,
    tone: "text-amber-700",
    activeTone: "bg-pixel-sun/45",
  },
  {
    value: "Indikasi Kejanggalan",
    label: "Indikasi kejanggalan",
    description: "Kualitas/volume dicurigai berbeda",
    icon: AlertTriangle,
    tone: "text-rose-700",
    activeTone: "bg-rose-50",
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
  const [photoMeta, setPhotoMeta] = useState<CompressedPhoto | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
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

  const handleFile = async (file: File | undefined) => {
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Berkas harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setPhotoError(
        `Ukuran foto maksimal ${formatFileSize(MAX_SOURCE_BYTES)} sebelum dikompres.`,
      );
      return;
    }

    setProcessing(true);
    try {
      const compressed = await compressPhoto(file);
      setPhoto(compressed.dataUrl);
      setPhotoName(file.name);
      setPhotoSize(compressed.bytes);
      setPhotoMeta(compressed);
    } catch (error) {
      setPhotoError(
        error instanceof ImageCompressionError
          ? error.message
          : "Foto gagal diproses. Coba gambar lain.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName("");
    setPhotoSize(0);
    setPhotoMeta(null);
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
        className="fixed inset-0 bg-pixel-line/75 animate-fade-in"
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
          className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto border-4 border-pixel-line bg-pixel-cream shadow-panel sm:max-h-[90vh]"
        >
          <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b-4 border-pixel-line bg-pixel-panel px-4 py-3 sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                  <Camera size={15} aria-hidden="true" />
                </span>
                <h2
                  id="report-form-title"
                  className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line"
                >
                  Kirim laporan lapangan
                </h2>
              </div>
              <p
                id="report-form-description"
                className="mt-1 text-[10.5px] leading-relaxed text-pixel-ink/75"
              >
                {project.name} · {project.location.district}
              </p>
            </div>
            <PixelCloseButton onClick={onClose} label="Tutup formulir laporan" />
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-5">
            <div className="flex items-start gap-2.5 border-2 border-pixel-line bg-white p-2.5">
              <Info size={14} className="mt-0.5 shrink-0 text-pixel-line" aria-hidden="true" />
              <p className="text-[10.5px] leading-relaxed text-pixel-ink/85">
                Laporan akan tampil publik dengan nama yang disamarkan. Koordinat yang
                dibagikan adalah lokasi proyek, bukan lokasi persis tempat tinggal Anda.
              </p>
            </div>

            {errors.form ? (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 border-2 border-pixel-line bg-rose-50 p-2.5 text-[11px] text-rose-900"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                {errors.form}
              </div>
            ) : null}

            <fieldset className="mt-4">
              <legend className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Status kesesuaian lapangan <span className="text-rose-700">*</span>
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {SUITABILITY_OPTIONS.map((option) => {
                  const active = suitability === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-2 border-2 p-2.5 transition-colors",
                        active
                          ? cn("border-pixel-line shadow-chip", option.activeTone)
                          : "border-pixel-line/35 bg-white hover:border-pixel-line hover:bg-pixel-panel",
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
                        size={15}
                        className={cn("mt-0.5 shrink-0", option.tone)}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-pixel-line">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[9.5px] leading-relaxed text-pixel-ink/75">
                          {option.description}
                        </span>
                      </span>
                      {active ? (
                        <Check size={13} className="mt-0.5 shrink-0 text-pixel-line" aria-hidden="true" />
                      ) : null}
                    </label>
                  );
                })}
              </div>
              {errors.suitability ? (
                <p className="mt-1.5 text-[10px] font-medium text-rose-700" role="alert">
                  {errors.suitability}
                </p>
              ) : null}
            </fieldset>

            <fieldset className="mt-4">
              <legend className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
                Kesesuaian hasil dengan RAB <span className="text-rose-700">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Rating kesesuaian hasil dengan RAB"
                >
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
                      className="border border-transparent p-0.5 transition-transform hover:scale-110 hover:border-pixel-line focus-visible:border-pixel-line"
                    >
                      <Star
                        size={23}
                        className={
                          value <= rating
                            ? "text-amber-600"
                            : "text-pixel-line/25 hover:text-amber-500"
                        }
                        fill={value <= rating ? "#F59E0B" : "transparent"}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10.5px] font-medium text-pixel-ink/75">
                  {rating > 0 ? RATING_LABELS[rating] : "Belum dipilih"}
                </span>
              </div>
              {errors.rating ? (
                <p className="mt-1 text-[10px] font-medium text-rose-700" role="alert">
                  {errors.rating}
                </p>
              ) : null}
            </fieldset>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="report-comment"
                  className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                >
                  Uraian temuan lapangan <span className="text-rose-700">*</span>
                </label>
                <span className="tabular text-[9.5px] text-pixel-ink/60">{comment.length}/600</span>
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
                  "mt-1.5 w-full resize-y border-2 bg-white px-3 py-2.5 text-[12px] leading-relaxed text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500",
                  errors.comment
                    ? "border-rose-700"
                    : "border-pixel-line focus:border-pixel-wood-cta",
                )}
              />
              {errors.comment ? (
                <p id="report-comment-error" className="mt-1 text-[10px] font-medium text-rose-700" role="alert">
                  {errors.comment}
                </p>
              ) : null}
            </div>

            {isHydrated ? (
              user ? (
                <div className="mt-4 flex flex-wrap items-center gap-2.5 border-2 border-pixel-line bg-emerald-50 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-emerald-700 font-pixel text-[8px] text-white">
                    {user.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-950">
                      <BadgeCheck size={12} aria-hidden="true" />
                      Masuk sebagai {user.name}
                    </p>
                    <p className="truncate text-[9.5px] text-emerald-900/75">
                      Laporan ditautkan ke akun Firebase Anda · {user.email}
                    </p>
                  </div>
                  <Link
                    href="/akun"
                    className="shrink-0 border-2 border-pixel-line bg-white px-1.5 py-0.5 text-[9.5px] font-semibold text-pixel-line hover:bg-pixel-sun"
                  >
                    Kelola akun
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-2.5 border-2 border-pixel-line bg-white px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                    <LogIn size={13} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold text-pixel-line">
                      Ingin laporan tersimpan di akun Anda?
                    </p>
                    <p className="text-[9.5px] leading-relaxed text-pixel-ink/75">
                      Masuk agar nama terisi otomatis dan kontribusi mudah ditelusuri.
                      Anda tetap bisa mengirim sebagai tamu.
                    </p>
                  </div>
                  <Link
                    href={`/masuk?redirect=${encodeURIComponent(`/proyek/${project.id}#validasi`)}`}
                    className="shrink-0 border-2 border-pixel-line bg-pixel-sun px-2 py-1 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:-translate-y-0.5"
                  >
                    Masuk
                  </Link>
                </div>
              )
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label
                  htmlFor="report-author"
                  className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
                >
                  Nama atau inisial{" "}
                  <span className="font-sans text-[9.5px] font-normal normal-case text-pixel-ink/60">
                    (opsional)
                  </span>
                </label>
                <input
                  id="report-author"
                  type="text"
                  value={author}
                  maxLength={60}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Contoh: Rina Kusuma"
                  className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-white px-3 text-[12px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
                />
                <p className="mt-1 text-[9.5px] leading-relaxed text-pixel-ink/70">
                  {user
                    ? `Terisi dari akun Anda dan tetap bisa diubah. Akan tampil sebagai “${maskName(
                        author.trim() || user.name,
                      )}”.`
                    : "Akan ditampilkan sebagai “Rina K.” untuk melindungi privasi."}
                </p>
              </div>

              <div className="border-2 border-pixel-line bg-emerald-50 p-2.5">
                <p className="flex items-center gap-1.5 font-pixel text-[6.5px] uppercase leading-[1.7] text-emerald-900">
                  <MapPin size={9} aria-hidden="true" />
                  Lokasi &amp; waktu terdeteksi
                </p>
                <p className="mt-1.5 font-mono text-[10px] text-emerald-950">
                  {project.location.coordinates.lat.toFixed(5)},{" "}
                  {project.location.coordinates.lng.toFixed(5)}
                </p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-emerald-900/80">
                  ± 8 m ·{" "}
                  {detectedAt.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  ,{" "}
                  {detectedAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={fileInputId}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-4 text-center transition-colors",
                  photo
                    ? "border-emerald-700 bg-emerald-50/40"
                    : "border-pixel-line/50 bg-white hover:border-pixel-line hover:bg-pixel-panel",
                )}
              >
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={processing}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    // Reset agar berkas yang sama dapat dipilih ulang setelah dihapus.
                    event.target.value = "";
                    void handleFile(file);
                  }}
                />
                {photo ? (
                  <>
                    <span className="relative block h-28 w-full max-w-[280px] overflow-hidden border-2 border-pixel-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt="Pratinjau foto bukti lapangan"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[9.5px] text-pixel-ink/75">
                      <ImageIcon size={11} aria-hidden="true" />
                      {photoName} · {formatFileSize(photoSize)}
                      {photoMeta ? ` · ${photoMeta.width}×${photoMeta.height}` : ""}
                      <span className="inline-flex items-center gap-1 border border-pixel-line bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-900">
                        <ShieldCheck size={9} aria-hidden="true" />
                        EXIF dibersihkan
                      </span>
                    </span>
                  </>
                ) : processing ? (
                  <>
                    <span className="grid h-9 w-9 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-[11px] font-bold text-pixel-line">
                      Mengompres foto…
                    </span>
                    <span className="mt-0.5 text-[9.5px] text-pixel-ink/70">
                      Foto diperkecil dan metadata dibersihkan.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="grid h-9 w-9 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                      <UploadCloud size={16} aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-[11px] font-bold text-pixel-line">
                      Unggah foto bukti (opsional)
                    </span>
                    <span className="mt-0.5 text-[9.5px] text-pixel-ink/70">
                      JPG, PNG, atau WebP · maksimal 12 MB, dikompres otomatis
                    </span>
                  </>
                )}
              </label>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1 text-[9.5px] leading-relaxed text-emerald-900">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Metadata GPS dan identitas perangkat dihapus otomatis sebelum publikasi.
                </p>
                {photo ? (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-rose-700 hover:underline"
                  >
                    <Trash2 size={10} aria-hidden="true" />
                    Hapus foto
                  </button>
                ) : null}
              </div>
              {photoError ? (
                <p className="mt-1 text-[10px] font-medium text-rose-700" role="alert">
                  {photoError}
                </p>
              ) : null}
            </div>

            <div className="mt-4 border-2 border-pixel-line bg-white p-3">
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
                <span className="text-[10px] leading-relaxed text-pixel-ink/85">
                  Saya menyatakan laporan ini berdasarkan pengamatan langsung dan
                  disampaikan dengan itikad baik. Saya memahami laporan dapat dikoreksi
                  warga lain atau ditindaklanjuti oleh pihak berwenang.
                </span>
              </label>
              {errors.consent ? (
                <p className="mt-1.5 text-[10px] font-medium text-rose-700" role="alert">
                  {errors.consent}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 border-t-2 border-pixel-line/25 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[9.5px] text-pixel-ink/65">
                <ShieldCheck size={10} aria-hidden="true" />
                Laporan tersimpan aman di Firebase.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 sm:flex-none">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || processing}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {submitting ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <UploadCloud size={13} aria-hidden="true" />
                  )}
                  {processing
                    ? "Menyiapkan foto…"
                    : submitting
                      ? "Mengirim…"
                      : "Kirim laporan"}
                </button>
              </div>
            </div>

            <p className="mt-3 pb-2 text-center text-[9.5px] text-pixel-ink/60">
              Total karakter uraian: {formatNumber(comment.length)} · Laporan akan tampil
              segera setelah dikirim.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
