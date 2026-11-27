"use client";

import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  ShieldCheck,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useId, useState } from "react";
import { logAdminAction } from "@/lib/admin";
import { prajvalaApi } from "@/lib/api";
import { PROJECTS, getProject } from "@/lib/data";
import {
  compressPhoto,
  formatFileSize,
  ImageCompressionError,
  MAX_SOURCE_BYTES,
  type CompressedPhoto,
} from "@/lib/image";
import type { CitizenReport, Suitability } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

const SUITABILITY_OPTIONS: { value: Suitability; label: string }[] = [
  { value: "Sesuai Target", label: "Sesuai target" },
  { value: "Terlambat", label: "Terlambat" },
  { value: "Indikasi Kejanggalan", label: "Indikasi kejanggalan" },
];

const RATING_LABELS: Record<number, string> = {
  1: "Tidak sesuai",
  2: "Kurang sesuai",
  3: "Cukup sesuai",
  4: "Sesuai",
  5: "Sangat sesuai",
};

interface EvidencePublisherProps {
  actor: { id: string; name: string };
  onPublished: (report: CitizenReport) => void;
}

/**
 * Penerbitan bukti resmi pengelola.
 *
 * Bukti resmi disimpan pada koleksi laporan yang sama agar tampil di halaman
 * proyek bersama laporan warga, tetapi ditandai `official` dan `verified`.
 * Foto wajib, karena inti fitur ini adalah bukti visual.
 */
export function EvidencePublisher({ actor, onPublished }: EvidencePublisherProps) {
  const fileInputId = useId();
  const [projectId, setProjectId] = useState(PROJECTS[0]?.id ?? "");
  const [suitability, setSuitability] = useState<Suitability>("Sesuai Target");
  const [rating, setRating] = useState(4);
  const [caption, setCaption] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<CompressedPhoto | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const project = getProject(projectId);

  const handleFile = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError(`Ukuran foto maksimal ${formatFileSize(MAX_SOURCE_BYTES)} sebelum dikompres.`);
      return;
    }

    setProcessing(true);
    try {
      const compressed = await compressPhoto(file);
      setPhoto(compressed.dataUrl);
      setPhotoMeta(compressed);
      setPhotoName(file.name);
    } catch (caught) {
      setError(
        caught instanceof ImageCompressionError
          ? caught.message
          : "Foto gagal diproses. Coba gambar lain.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const resetPhoto = () => {
    setPhoto(null);
    setPhotoMeta(null);
    setPhotoName("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!project) {
      setError("Pilih proyek terlebih dahulu.");
      return;
    }
    if (!photo) {
      setError("Bukti resmi wajib menyertakan satu foto.");
      return;
    }
    if (caption.trim().length < 20) {
      setError("Tuliskan keterangan minimal 20 karakter agar bukti dapat dipahami warga.");
      return;
    }

    setSubmitting(true);
    try {
      const stored = await prajvalaApi.publishOfficialEvidence({
        projectId: project.id,
        suitability,
        rating,
        comment: caption.trim(),
        photoUrl: photo,
      });
      onPublished(prajvalaApi.toFeedItem(stored, actor.id));
      await logAdminAction({
        action: "publish",
        targetId: stored.id,
        projectId: project.id,
        detail: `Bukti resmi untuk ${project.name}.`,
        actorId: actor.id,
        actorName: actor.name,
      }).catch(() => undefined);

      setSuccess(`Bukti resmi untuk ${project.name} berhasil diterbitkan.`);
      setCaption("");
      setRating(4);
      setSuitability("Sesuai Target");
      resetPhoto();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Bukti resmi gagal diterbitkan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form
        onSubmit={handleSubmit}
        className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5"
      >
        <div className="flex items-start justify-between gap-3 border-b-[3px] border-pixel-line/20 pb-3">
          <div>
            <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
              Terbitkan bukti resmi
            </h2>
            <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
              Tampil di halaman proyek dengan label “Bukti resmi” dan langsung
              terverifikasi.
            </p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
            <Camera size={15} aria-hidden="true" />
          </span>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 border-2 border-rose-700 bg-rose-50 p-2.5 text-[10.5px] leading-relaxed text-rose-900"
          >
            <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 border-2 border-emerald-800 bg-emerald-50 p-2.5 text-[10.5px] leading-relaxed text-emerald-900"
          >
            <CheckCircle2 size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {success}
          </div>
        ) : null}

        <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="evidence-project"
              className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
            >
              Proyek
            </label>
            <select
              id="evidence-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 text-[11.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
            >
              {PROJECTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.location.district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="evidence-suitability"
              className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
            >
              Status kesesuaian
            </label>
            <select
              id="evidence-suitability"
              value={suitability}
              onChange={(event) => setSuitability(event.target.value as Suitability)}
              className="mt-1.5 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 text-[11.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
            >
              {SUITABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-3">
          <legend className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line">
            Kesesuaian dengan RAB
          </legend>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating bukti resmi">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} dari 5 — ${RATING_LABELS[value]}`}
                  onClick={() => setRating(value)}
                  className={cn(
                    "grid h-8 w-8 place-items-center border-2 border-pixel-line font-pixel text-[8px] shadow-chip transition-transform hover:-translate-y-0.5",
                    value <= rating
                      ? "bg-pixel-sun text-pixel-line"
                      : "bg-white text-pixel-line/50",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pixel-ink/75">
              <Star size={10} className="text-amber-600" aria-hidden="true" />
              {RATING_LABELS[rating]}
            </span>
          </div>
        </fieldset>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="evidence-caption"
              className="font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line"
            >
              Keterangan bukti <span className="text-rose-700">*</span>
            </label>
            <span className="tabular text-[9.5px] text-pixel-ink/60">
              {formatNumber(caption.length)}/600
            </span>
          </div>
          <textarea
            id="evidence-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value.slice(0, 600))}
            rows={3}
            placeholder="Contoh: Dokumentasi hasil pengecoran jalan tanggal 24 November 2026, panjang 620 meter sesuai RAB."
            className="mt-1.5 w-full resize-y border-2 border-pixel-line bg-white px-3 py-2.5 text-[12px] leading-relaxed text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
          />
        </div>

        <div className="mt-3">
          <label
            htmlFor={fileInputId}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-4 text-center transition-colors",
              photo
                ? "border-emerald-700 bg-emerald-50/40"
                : "border-pixel-line/50 bg-pixel-cream hover:border-pixel-line hover:bg-pixel-panel",
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
                    alt="Pratinjau bukti resmi"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[9.5px] text-pixel-ink/75">
                  <ImageIcon size={11} aria-hidden="true" />
                  {photoName} · {formatFileSize(photoMeta?.bytes ?? 0)}
                  {photoMeta ? ` · ${photoMeta.width}×${photoMeta.height}` : ""}
                  <span className="inline-flex items-center gap-1 border border-pixel-line bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-900">
                    <ShieldCheck size={9} aria-hidden="true" />
                    EXIF dibersihkan
                  </span>
                </span>
              </>
            ) : processing ? (
              <>
                <Loader2 size={17} className="animate-spin text-pixel-line" aria-hidden="true" />
                <span className="mt-2 text-[11px] font-bold text-pixel-line">
                  Mengompres foto…
                </span>
              </>
            ) : (
              <>
                <span className="grid h-9 w-9 place-items-center border-2 border-pixel-line bg-pixel-sun text-pixel-line">
                  <UploadCloud size={16} aria-hidden="true" />
                </span>
                <span className="mt-2 text-[11px] font-bold text-pixel-line">
                  Unggah foto bukti resmi <span className="text-rose-700">*</span>
                </span>
                <span className="mt-0.5 text-[9.5px] text-pixel-ink/70">
                  JPG, PNG, atau WebP · maksimal 12 MB, dikompres otomatis
                </span>
              </>
            )}
          </label>
          {photo ? (
            <button
              type="button"
              onClick={resetPhoto}
              className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-rose-700 hover:underline"
            >
              <Trash2 size={10} aria-hidden="true" />
              Hapus foto
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || processing}
          className="btn-primary mt-4 w-full sm:w-auto"
        >
          {submitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <Camera size={13} aria-hidden="true" />
          )}
          {submitting ? "Menerbitkan…" : "Terbitkan bukti resmi"}
        </button>
      </form>

      <aside className="space-y-3">
        <div className="border-4 border-pixel-line bg-pixel-wood-darker p-3 shadow-panel">
          <p className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-sun">
            <ShieldCheck size={11} aria-hidden="true" />
            Aturan bukti resmi
          </p>
          <ul className="mt-2.5 space-y-2 text-[10px] leading-relaxed text-pixel-cream/80">
            <li className="flex gap-1.5">
              <span aria-hidden="true">▪</span>
              Wajib menyertakan foto asli, bukan tangkapan layar dokumen.
            </li>
            <li className="flex gap-1.5">
              <span aria-hidden="true">▪</span>
              Keterangan harus menyebut tanggal atau volume pekerjaan.
            </li>
            <li className="flex gap-1.5">
              <span aria-hidden="true">▪</span>
              Bukti resmi tidak menggantikan audit independen.
            </li>
          </ul>
        </div>

        <div className="border-4 border-pixel-line bg-white p-3 shadow-card">
          <p className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
            Proyek terpilih
          </p>
          <p className="mt-1 text-[11.5px] font-bold leading-snug text-pixel-line">
            {project ? project.name : "Belum dipilih"}
          </p>
          {project ? (
            <p className="mt-1 text-[9.5px] leading-relaxed text-pixel-ink/70">
              {project.location.district} · {project.location.city}
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
