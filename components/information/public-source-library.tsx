"use client";

import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Link2,
  MapPin,
  Presentation,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRegion } from "@/components/providers/region-provider";
import { Reveal } from "@/components/ui/reveal";
import { getRegion } from "@/lib/data";
import {
  PUBLIC_SOURCE_CATEGORY_LABEL,
  getPublicSources,
} from "@/lib/public-sources";
import type { PublicSourceCategory, PublicSourceLink } from "@/types";
import { formatNumber } from "@/lib/utils";

const CATEGORY_ICON: Record<PublicSourceCategory, LucideIcon> = {
  drive: FolderOpen,
  docs: FileText,
  sheets: FileSpreadsheet,
  slides: Presentation,
  forms: ClipboardList,
};

/**
 * Pustaka tautan anggaran publik yang disimpan administrator.
 *
 * Hanya tautan Google Drive/Docs publik yang lolos validasi yang ditampilkan.
 * Bagian ini disembunyikan saat pustaka kosong atau gagal dimuat, sehingga
 * halaman informasi tetap bersih.
 */
export function PublicSourceLibrary() {
  const { activeRegionId, activeRegion } = useRegion();
  const [sources, setSources] = useState<PublicSourceLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPublicSources()
      .then((items) => {
        if (!cancelled) setSources(items);
      })
      .catch(() => {
        if (!cancelled) setSources([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (activeRegionId === "all") return sources;
    return sources.filter(
      (source) => source.regionId === "all" || source.regionId === activeRegionId,
    );
  }, [sources, activeRegionId]);

  if (!loaded || visible.length === 0) return null;

  return (
    <section id="sumber" className="scroll-mt-24 pb-10 sm:pb-12">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-3 border-t-4 border-pixel-line/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2 py-0.5 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                <Link2 size={10} aria-hidden="true" />
                Pustaka sumber publik
              </span>
              <h2 className="mt-2 font-pixel text-[17px] uppercase leading-[1.75] text-pixel-line sm:text-[21px]">
                Tautan anggaran dari domain resmi.
              </h2>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-pixel-ink/75">
                {activeRegion
                  ? `Dokumen publik yang relevan untuk ${activeRegion.name} dan cakupan nasional.`
                  : "Dokumen publik yang telah ditinjau administrator PRAJVALA."}{" "}
                Setiap tautan membuka sumber aslinya di Google Drive atau Google Docs.
              </p>
            </div>
            <p className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 py-1 text-[9.5px] text-pixel-ink/70 shadow-chip">
              <ShieldCheck size={11} className="text-emerald-700" aria-hidden="true" />
              {formatNumber(visible.length)} tautan ditinjau
            </p>
          </div>

          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {visible.map((source) => {
              const Icon = CATEGORY_ICON[source.category];
              const region =
                source.regionId === "all" ? undefined : getRegion(source.regionId);
              return (
                <li
                  key={source.id}
                  className="flex flex-col justify-between border-4 border-pixel-line bg-white p-3.5 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-snug text-pixel-line">
                        {source.title}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-pixel-ink/65">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={9} aria-hidden="true" />
                          {region ? region.name : "Semua wilayah"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={9} aria-hidden="true" />
                          {source.year}
                        </span>
                        <span className="border border-pixel-line/30 bg-pixel-cream px-1 py-0.5 font-semibold">
                          {PUBLIC_SOURCE_CATEGORY_LABEL[source.category]}
                        </span>
                      </p>
                      {source.note ? (
                        <p className="mt-1.5 text-[10px] leading-relaxed text-pixel-ink/70">
                          {source.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-pixel-line bg-pixel-cream px-2.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun"
                  >
                    <ExternalLink size={11} aria-hidden="true" />
                    Buka dokumen asli
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-pixel-ink/55">
            <ShieldCheck size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
            PRAJVALA hanya menautkan dokumen yang dipublikasikan terbuka. Tidak ada
            berkas sensitif, kredensial, atau data pribadi yang disimpan di sini.
          </p>
        </Reveal>
      </div>
    </section>
  );
}