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

/**
 * Before/after comparison in a pixel photo frame.
 *
 * The divider handle is square, the stamps are solid plaques, and the photo
 * metadata is a hard-edged plate instead of a blurred glass card.
 */
export function BeforeAfterSlider({ before, after, projectName }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div>
      <div className="border-4 border-pixel-line bg-pixel-panel p-1.5 shadow-card">
        <div className="group/slider relative aspect-[16/10] w-full select-none overflow-hidden border-[3px] border-pixel-line bg-pixel-panel">
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="pixelated object-cover"
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
              className="pixelated object-cover brightness-[0.92] grayscale-[25%]"
            />
            <div className="absolute inset-0 bg-pixel-line/15" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <span className="inline-flex flex-col gap-0.5 border-2 border-pixel-line bg-pixel-line/90 px-2 py-1 font-mono text-[10px] leading-relaxed text-pixel-cream">
                <span className="flex items-center gap-1">
                  <MapPin size={9} className="text-pixel-sun" aria-hidden="true" />
                  {toCoordinateLabel(before.coordinates.lat, before.coordinates.lng)}
                </span>
                <span className="flex items-center gap-1 text-pixel-cream/90">
                  <Clock3 size={9} aria-hidden="true" />
                  {formatDateTime(before.takenAt)} WIB
                </span>
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10">
            <span className="border-2 border-pixel-line bg-pixel-line px-2 py-1 font-pixel text-[7.5px] uppercase leading-none text-pixel-cream">
              Sebelum
            </span>
          </div>
          <div className="pointer-events-none absolute right-2.5 top-2.5 z-10">
            <span className="border-2 border-pixel-line bg-pixel-sun px-2 py-1 font-pixel text-[7.5px] uppercase leading-none text-pixel-line shadow-chip">
              Sesudah
            </span>
          </div>

          <div className="absolute bottom-0 right-0 z-10 p-2.5">
            <span className="inline-flex flex-col gap-0.5 border-2 border-pixel-line bg-pixel-line/90 px-2 py-1 font-mono text-[10px] leading-relaxed text-pixel-cream">
              <span className="flex items-center gap-1">
                <MapPin size={9} className="text-pixel-sun" aria-hidden="true" />
                {toCoordinateLabel(after.coordinates.lat, after.coordinates.lng)}
              </span>
              <span className="flex items-center gap-1 text-pixel-cream/90">
                <Clock3 size={9} aria-hidden="true" />
                {formatDateTime(after.takenAt)} WIB
              </span>
            </span>
          </div>

          {!hasInteracted ? (
            <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-cream px-2.5 py-1 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
                <ChevronsLeftRight size={11} aria-hidden="true" />
                Geser untuk membandingkan
              </span>
            </div>
          ) : null}

          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-[3px] bg-pixel-sun"
            style={{ left: `${position}%` }}
            aria-hidden="true"
          >
            <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center border-[3px] border-pixel-line bg-pixel-sun text-pixel-line shadow-btn-sun transition-transform group-hover/slider:scale-105 group-focus-within/slider:outline group-focus-within/slider:outline-[3px] group-focus-within/slider:outline-offset-2 group-focus-within/slider:outline-pixel-sun">
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
      </div>

      <div className="mt-3 flex flex-col gap-2 border-4 border-pixel-line bg-white px-3 py-2.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-pixel-ink/80">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} aria-hidden="true" />
            Sebelum: <span className="font-mono">{formatDateTime(before.takenAt)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} className="text-pixel-wood-cta" aria-hidden="true" />
            Sesudah: <span className="font-mono">{formatDateTime(after.takenAt)}</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-emerald-50 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-900">
          <ShieldCheck size={10} aria-hidden="true" />
          Koordinat &amp; waktu terverifikasi
        </span>
      </div>
    </div>
  );
}
