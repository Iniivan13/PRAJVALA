"use client";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Presentation,
  Search,
  ShieldCheck,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { REGIONS, getRegion } from "@/lib/data";
import { logAdminAction } from "@/lib/admin";
import {
  PUBLIC_QUERY_GROUPS,
  PUBLIC_SOURCE_CATEGORY_LABEL,
  addPublicSource,
  buildGoogleSearchUrl,
  deletePublicSource,
  getPublicSources,
  isSafePublicQuery,
  validatePublicSourceUrl,
} from "@/lib/public-sources";
import type { PublicSourceCategory, PublicSourceLink } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

const CATEGORY_ICON: Record<PublicSourceCategory, LucideIcon> = {
  drive: FolderOpen,
  docs: FileText,
  sheets: FileSpreadsheet,
  slides: Presentation,
  forms: ClipboardList,
};

const CATEGORY_STYLE: Record<PublicSourceCategory, string> = {
  drive: "bg-emerald-50 text-emerald-900",
  docs: "bg-sky-50 text-sky-900",
  sheets: "bg-amber-50 text-amber-900",
  slides: "bg-rose-50 text-rose-900",
  forms: "bg-pixel-sun text-pixel-line",
};

interface PublicSourceFinderProps {
  actor: { id: string; name: string };
}

/**
 * Pencarian sumber anggaran publik untuk administrator.
 *
 * Kueri sepenuhnya berasal dari templat tetap dan tidak dapat diedit bebas.
 * Hanya dokumen anggaran publik di `site:go.id` dengan host Google
 * Drive/Docs/Sheets/Slides/Forms yang tersedia. Kategori sensitif seperti file
 * sensitif, login/admin, config/error, dan data leak tidak dibuat di sini.
 */
export function PublicSourceFinder({ actor }: PublicSourceFinderProps) {
  const [activeCategory, setActiveCategory] =
    useState<PublicSourceCategory>("drive");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sources, setSources] = useState<PublicSourceLink[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadSeq = useRef(0);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<PublicSourceCategory>("drive");
  const [regionId, setRegionId] = useState("all");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [note, setNote] = useState("");

  const loadSources = useCallback(async () => {
    const seq = ++loadSeq.current;
    setLoadingSources(true);
    try {
      const items = await getPublicSources();
      // Abaikan hasil permintaan lama agar tidak mengembalikan sumber yang
      // baru saja dihapus.
      if (seq === loadSeq.current) setSources(items);
    } catch {
      if (seq === loadSeq.current) {
        setError(
          "Daftar sumber publik belum dapat dimuat. Pastikan aturan Firestore sudah dipasang.",
        );
      }
    } finally {
      if (seq === loadSeq.current) setLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const activeGroup =
    PUBLIC_QUERY_GROUPS.find((group) => group.category === activeCategory) ??
    PUBLIC_QUERY_GROUPS[0];

  const safeTemplates = useMemo(
    () => activeGroup.templates.filter((template) => isSafePublicQuery(template.query)),
    [activeGroup],
  );

  const allTemplates = useMemo(
    () =>
      PUBLIC_QUERY_GROUPS.flatMap((group) =>
        group.templates.filter((template) => isSafePublicQuery(template.query)),
      ),
    [],
  );

  const counts = useMemo(() => {
    const base: Record<PublicSourceCategory, number> = {
      drive: 0,
      docs: 0,
      sheets: 0,
      slides: 0,
      forms: 0,
    };
    PUBLIC_QUERY_GROUPS.forEach((group) => {
      base[group.category] = group.templates.filter((template) =>
        isSafePublicQuery(template.query),
      ).length;
    });
    return base;
  }, []);

  const flashCopied = (id: string) => {
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1600);
  };

  const copyText = async (text: string, id: string) => {
    setError("");
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(id);
    } catch {
      setError("Gagal menyalin. Izinkan akses papan klip lalu coba lagi.");
    }
  };

  const downloadTemplates = (
    templates: { label: string; query: string }[],
    filename: string,
  ) => {
    if (templates.length === 0) return;
    const body = templates
      .map((template, index) => `${index + 1}. ${template.label}\n${template.query}`)
      .join("\n\n");
    const header =
      "PRAJVALA — Pencarian dokumen anggaran publik\n" +
      "Batasan: hanya site:go.id dan Google Drive/Docs resmi. Tidak ada data sensitif.\n\n";
    const blob = new Blob([header + body + "\n"], {
      type: "text/plain;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const validation = validatePublicSourceUrl(value);
    if (validation.ok && validation.category) {
      setCategory(validation.category);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const validation = validatePublicSourceUrl(url);
    if (!validation.ok) {
      setError(validation.error ?? "Tautan sumber publik tidak valid.");
      return;
    }
    const yearValue = Number(year);
    if (!Number.isInteger(yearValue)) {
      setError("Tahun sumber tidak valid.");
      return;
    }

    setSaving(true);
    loadSeq.current += 1;
    try {
      const id = await addPublicSource({
        title,
        url: validation.url ?? url,
        category: validation.category ?? category,
        regionId,
        year: yearValue,
        note,
        actorId: actor.id,
      });
      await logAdminAction({
        action: "source",
        targetId: id,
        detail: `Menambahkan sumber publik: ${title.trim()}.`,
        actorId: actor.id,
        actorName: actor.name,
      }).catch(() => undefined);
      setTitle("");
      setUrl("");
      setCategory("drive");
      setRegionId("all");
      setNote("");
      setNotice("Sumber publik tersimpan dan akan tampil di halaman informasi.");
      await loadSources();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Sumber publik gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (source: PublicSourceLink) => {
    if (
      !window.confirm(
        `Hapus sumber “${source.title}” dari pustaka publik? Tautan aslinya tidak terhapus.`,
      )
    ) {
      return;
    }
    setError("");
    setNotice("");
    setDeletingId(source.id);
    // Batalkan muat ulang yang masih berjalan agar daftar lama tidak
    // mengembalikan sumber yang sedang dihapus, lalu lepas status muat.
    loadSeq.current += 1;
    setLoadingSources(false);
    try {
      await deletePublicSource(source.id);
      await logAdminAction({
        action: "source",
        targetId: source.id,
        detail: `Menghapus sumber publik: ${source.title}.`,
        actorId: actor.id,
        actorName: actor.name,
      }).catch(() => undefined);
      setSources((previous) => previous.filter((item) => item.id !== source.id));
      setNotice("Sumber publik dihapus dari pustaka.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Sumber publik gagal dihapus.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-4 border-pixel-line bg-emerald-50 p-3.5 shadow-card">
        <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-pixel-line bg-emerald-100 text-emerald-900">
          <ShieldCheck size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
            Hanya dokumen anggaran publik
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-pixel-ink/75">
            Pencarian dibatasi ke <code className="border border-pixel-line/25 bg-white px-1">site:go.id</code>{" "}
            dan host Google Drive/Docs resmi. Kategori file sensitif, login/admin,
            config/error, dan data leak tidak tersedia dan tidak dijalankan. Templat
            bersifat tetap, tanpa input kueri bebas.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 border-4 border-pixel-line bg-rose-50 px-3 py-2.5"
        >
          <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-rose-900">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Tutup pesan kesalahan"
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {notice ? (
        <div className="flex items-start justify-between gap-3 border-4 border-pixel-line bg-emerald-50 px-3 py-2.5">
          <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-emerald-900">
            <Check size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {notice}
          </p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Tutup pesan"
            className="shrink-0 border-2 border-pixel-line bg-white p-1 text-pixel-line hover:bg-pixel-sun"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* ---------- Generator ---------- */}
      <div className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 border-b-[3px] border-pixel-line/20 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
              <Search size={12} aria-hidden="true" />
              Pencarian sumber publik
            </h2>
            <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
              Pilih jenis dokumen, salin kueri, lalu buka hasil pencarian Google.
              Semua kueri memakai kata kunci “anggaran”.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                void copyText(
                  allTemplates.map((template) => template.query).join("\n"),
                  "all-templates",
                )
              }
              className="inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun/80"
            >
              {copiedId === "all-templates" ? (
                <Check size={11} aria-hidden="true" />
              ) : (
                <Copy size={11} aria-hidden="true" />
              )}
              {copiedId === "all-templates" ? "Tersalin" : "Salin semua"}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTemplates(
                  allTemplates,
                  "prajvala-sumber-publik.txt",
                )
              }
              className="inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
            >
              <Download size={11} aria-hidden="true" />
              Unduh .txt
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PUBLIC_QUERY_GROUPS.map((group) => {
            const Icon = CATEGORY_ICON[group.category];
            const active = activeCategory === group.category;
            return (
              <button
                key={group.category}
                type="button"
                onClick={() => setActiveCategory(group.category)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 border-2 border-pixel-line px-2.5 py-1 font-pixel text-[7px] uppercase leading-[1.6] shadow-chip",
                  active
                    ? "bg-pixel-line text-pixel-sun"
                    : "bg-white text-pixel-line hover:bg-pixel-sun",
                )}
              >
                <Icon size={11} aria-hidden="true" />
                {group.label}
                <span
                  className={cn(
                    "border px-1 text-[9px] font-bold",
                    active
                      ? "border-pixel-cream/40 text-pixel-cream"
                      : "border-pixel-line/30 text-pixel-line",
                  )}
                >
                  {counts[group.category]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2.5 text-[10px] leading-relaxed text-pixel-ink/65">
          {activeGroup.description}
        </p>

        <div className="mt-3 space-y-2">
          {safeTemplates.map((template) => (
            <article
              key={template.id}
              className="border-2 border-pixel-line bg-pixel-cream px-3 py-2.5 shadow-chip"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-[11px] font-bold leading-snug text-pixel-line">
                  {template.label}
                </p>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => void copyText(template.query, template.id)}
                    className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 font-pixel text-[6.5px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
                  >
                    {copiedId === template.id ? (
                      <Check size={10} aria-hidden="true" />
                    ) : (
                      <Copy size={10} aria-hidden="true" />
                    )}
                    {copiedId === template.id ? "Tersalin" : "Salin"}
                  </button>
                  <a
                    href={buildGoogleSearchUrl(template.query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1 border-2 border-pixel-line bg-white px-2 font-pixel text-[6.5px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
                  >
                    <ExternalLink size={10} aria-hidden="true" />
                    Buka
                  </a>
                </div>
              </div>
              <code className="mt-1.5 block overflow-x-auto border border-pixel-line/25 bg-white px-2 py-1 text-[10px] leading-relaxed text-pixel-ink/80">
                {template.query}
              </code>
            </article>
          ))}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-pixel-ink/60">
          <Link2 size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
          Hasil pencarian dibuka di Google. PRAJVALA tidak mengunduh atau menyimpan
          berkas secara otomatis; administrator meninjau lalu menyimpan tautan yang
          benar-benar publik.
        </p>
      </div>

      {/* ---------- Simpan sumber ---------- */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <form
          onSubmit={handleSubmit}
          className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5"
        >
          <h2 className="flex items-center gap-1.5 border-b-[3px] border-pixel-line/20 pb-3 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            <Plus size={12} aria-hidden="true" />
            Simpan sumber terverifikasi
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Judul sumber
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Contoh: RAB Drainase Kelurahan Tanjung Barat 2026"
                className="mt-1 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 text-[11px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
                required
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Tautan Google Drive/Docs
              </span>
              <input
                type="url"
                value={url}
                onChange={(event) => handleUrlChange(event.target.value)}
                placeholder="https://drive.google.com/file/d/…"
                className="mt-1 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 text-[11px] text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
                required
              />
              {url.trim() ? (
                <span className="mt-1 block text-[9px] leading-relaxed text-pixel-ink/60">
                  {validatePublicSourceUrl(url).ok
                    ? `Terdeteksi: ${PUBLIC_SOURCE_CATEGORY_LABEL[
                        validatePublicSourceUrl(url).category ?? category
                      ]}`
                    : validatePublicSourceUrl(url).error}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Jenis dokumen
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as PublicSourceCategory)
                }
                className="mt-1 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2 text-[10.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
              >
                {PUBLIC_QUERY_GROUPS.map((group) => (
                  <option key={group.category} value={group.category}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Tahun anggaran
              </span>
              <input
                type="number"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                min={2000}
                max={2100}
                className="mt-1 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 text-[11px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
                required
              />
            </label>

            <label className="block">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Wilayah
              </span>
              <select
                value={regionId}
                onChange={(event) => setRegionId(event.target.value)}
                className="mt-1 h-10 w-full border-2 border-pixel-line bg-pixel-cream px-2 text-[10.5px] text-pixel-line shadow-inset-field outline-none focus:border-pixel-wood-cta"
              >
                <option value="all">Semua wilayah</option>
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="font-pixel text-[6.5px] uppercase leading-[1.7] text-ink-600">
                Catatan singkat (opsional)
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                maxLength={280}
                placeholder="Contoh: Halaman 4 memuat rekap belanja modal."
                className="mt-1 w-full border-2 border-pixel-line bg-pixel-cream px-2.5 py-2 text-[11px] leading-relaxed text-pixel-line shadow-inset-field outline-none placeholder:text-ink-500 focus:border-pixel-wood-cta"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 border-[3px] border-pixel-line bg-pixel-sun px-3 font-pixel text-[8px] uppercase text-pixel-line shadow-chip transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus size={12} aria-hidden="true" />
            )}
            {saving ? "Menyimpan…" : "Simpan sumber"}
          </button>
        </form>

        {/* ---------- Pustaka tersimpan ---------- */}
        <div className="border-4 border-pixel-line bg-white p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between gap-3 border-b-[3px] border-pixel-line/20 pb-3">
            <h2 className="flex items-center gap-1.5 font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
              <Link2 size={12} aria-hidden="true" />
              Pustaka tersimpan
            </h2>
            <span className="inline-flex border-2 border-pixel-line bg-pixel-panel px-1.5 py-0.5 text-[9px] font-bold text-pixel-line">
              {formatNumber(sources.length)}
            </span>
          </div>

          {loadingSources ? (
            <div className="mt-3 space-y-2" aria-live="polite">
              <div className="h-16 animate-pulse border-2 border-pixel-line bg-pixel-cream" />
              <div className="h-16 animate-pulse border-2 border-pixel-line bg-pixel-cream" />
              <p className="sr-only">Memuat sumber publik…</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="mt-3 border-2 border-dashed border-pixel-line/45 bg-pixel-cream px-4 py-8 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center border-[3px] border-pixel-line bg-white text-pixel-line">
                <Link2 size={16} aria-hidden="true" />
              </span>
              <p className="mt-2.5 font-pixel text-[8px] uppercase leading-[1.8] text-pixel-line">
                Belum ada sumber tersimpan
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/65">
                Tautan yang disimpan akan tampil di halaman Informasi Publik.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {sources.map((source) => {
                const Icon = CATEGORY_ICON[source.category];
                const region =
                  source.regionId === "all" ? undefined : getRegion(source.regionId);
                return (
                  <li
                    key={source.id}
                    className="border-2 border-pixel-line bg-pixel-cream p-2.5 shadow-chip"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-pixel-line">
                          {source.title}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-pixel-ink/65">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 border border-pixel-line px-1 py-0.5 font-semibold",
                              CATEGORY_STYLE[source.category],
                            )}
                          >
                            <Icon size={9} aria-hidden="true" />
                            {PUBLIC_SOURCE_CATEGORY_LABEL[source.category]}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={9} aria-hidden="true" />
                            {region ? region.name : "Semua wilayah"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={9} aria-hidden="true" />
                            {source.year}
                          </span>
                        </p>
                        {source.note ? (
                          <p className="mt-1 text-[9.5px] leading-relaxed text-pixel-ink/70">
                            {source.note}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka ${source.title}`}
                          className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-white text-pixel-line shadow-chip hover:bg-pixel-sun"
                        >
                          <ExternalLink size={11} aria-hidden="true" />
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleDelete(source)}
                          disabled={deletingId === source.id}
                          aria-label={`Hapus ${source.title}`}
                          className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-white text-rose-700 shadow-chip hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === source.id ? (
                            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={11} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-3 text-[9px] leading-relaxed text-pixel-ink/55">
            Hanya tautan yang benar-benar dapat dibuka publik. Jangan menyimpan
            dokumen berisi kredensial, data pribadi, atau berkas internal.
          </p>
        </div>
      </div>
    </div>
  );
}