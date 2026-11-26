"use client";

import Image from "next/image";
import { ChevronsLeftRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { ProjectImage } from "@/types";
import { formatDateTime, toCoordinateLabel } from "@/lib/utils";

interface BeforeAfterSliderProps {
  before: ProjectImage;
  after: ProjectImage;
  projectName: string;
}

export function BeforeAfterSlider({ before, after, projectName }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div>
      <div className="group/slider relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-soft">
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover"
          priority
        />

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover brightness-[0.92] grayscale-[25%]"
          />
          <div className="absolute inset-0 bg-ink-950/15" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent p-3 pt-12">
            <span className="inline-flex flex-col gap-0.5 rounded-lg border border-white/20 bg-ink-950/85 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed text-white backdrop-blur">
              <span className="flex items-center gap-1">
                <MapPin size={9} className="text-amber-400" aria-hidden="true" />
                {toCoordinateLabel(before.coordinates.lat, before.coordinates.lng)}
              </span>
              <span className="flex items-center gap-1 text-white/90">
                <Clock3 size={9} aria-hidden="true" />
                {formatDateTime(before.takenAt)} WIB
              </span>
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <span className="rounded-full border border-white/20 bg-ink-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
            Sebelum
          </span>
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <span className="rounded-full border border-amber-300/30 bg-amber-500/90 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-950 backdrop-blur">
            Sesudah
          </span>
        </div>

        <div className="absolute bottom-0 right-0 z-10 p-3">
          <span className="inline-flex flex-col gap-0.5 rounded-lg border border-white/20 bg-ink-950/85 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed text-white backdrop-blur">
            <span className="flex items-center gap-1">
              <MapPin size={9} className="text-amber-400" aria-hidden="true" />
              {toCoordinateLabel(after.coordinates.lat, after.coordinates.lng)}
            </span>
            <span className="flex items-center gap-1 text-white/90">
              <Clock3 size={9} aria-hidden="true" />
              {formatDateTime(after.takenAt)} WIB
            </span>
          </span>
        </div>

        {!hasInteracted ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink-950/65 px-3 py-1.5 text-[10px] font-medium text-white shadow-sm backdrop-blur">
              <ChevronsLeftRight size={12} className="text-amber-400" aria-hidden="true" />
              Geser untuk membandingkan
            </span>
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(15,23,42,0.4)]"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-ink-900 text-white shadow-lg transition-transform group-hover/slider:scale-105 group-focus-within/slider:ring-4 group-focus-within/slider:ring-amber-400/60">
            <ChevronsLeftRight size={17} aria-hidden="true" />
          </span>
        </div>

        <label htmlFor="before-after-range" className="sr-only">
          Geser untuk membandingkan foto sebelum dan sesudah proyek {projectName}
        </label>
        <input
          id="before-after-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(event) => {
            setPosition(Number(event.target.value));
            setHasInteracted(true);
          }}
          onPointerDown={() => setHasInteracted(true)}
          aria-label={`Perbandingan sebelum dan sesudah ${projectName}`}
          aria-valuetext={`${position}% foto sebelum ditampilkan`}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
        />
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-ink-200/70 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} className="text-ink-500" aria-hidden="true" />
            Sebelum: <span className="font-mono">{formatDateTime(before.takenAt)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} className="text-amber-500" aria-hidden="true" />
            Sesudah: <span className="font-mono">{formatDateTime(after.takenAt)}</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
          <ShieldCheck size={11} aria-hidden="true" />
          Koordinat & waktu terverifikasi
        </span>
      </div>
    </div>
  );
}
