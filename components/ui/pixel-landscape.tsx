"use client";

import { cn } from "@/lib/utils";

/**
 * Pixel landscape backdrop.
 *
 * The reference opens on a flat sky with blocky clouds and a stepped ground
 * strip, which is what makes the page read as a world rather than a canvas.
 * Everything here is CSS blocks on a strict grid — no gradients, no blur.
 */
export function PixelClouds({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Clouds are pinned to the top edge of the sky band so they never sit
          behind body copy — they frame the world, they don't cross it. */}
      <div className="absolute left-[4%] top-2 opacity-90">
        <div className="flex items-end">
          <span className="h-2.5 w-7 bg-white" />
          <span className="-ml-2 h-5 w-12 bg-white" />
          <span className="-ml-2 h-3.5 w-9 bg-white" />
        </div>
        <div className="h-2.5 w-[5.5rem] bg-white/80" />
      </div>

      <div className="absolute right-[8%] top-1 hidden opacity-80 sm:block">
        <div className="flex items-end">
          <span className="h-2 w-6 bg-white" />
          <span className="-ml-1.5 h-4 w-10 bg-white" />
          <span className="-ml-1.5 h-3 w-7 bg-white" />
        </div>
        <div className="h-2 w-20 bg-white/80" />
      </div>

      <div className="absolute left-[52%] top-0 hidden opacity-70 lg:block">
        <div className="flex items-end">
          <span className="h-2 w-5 bg-white" />
          <span className="-ml-1 h-3.5 w-9 bg-white" />
          <span className="-ml-1 h-2.5 w-7 bg-white" />
        </div>
        <div className="h-2 w-16 bg-white/80" />
      </div>
    </div>
  );
}

/**
 * Stepped terrain edge. Rendered as a stack of flat bands so the transition
 * between the sky and the paper section below reads as ground, not a divider.
 */
export function PixelTerrain({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className="h-2 w-full bg-pixel-grass-deep" />
      <div className="h-2 w-full bg-pixel-grass" />
      <div className="flex h-3 w-full">
        <span className="h-full flex-1 bg-pixel-grass-deep" />
        <span className="h-full w-16 bg-pixel-grass" />
        <span className="h-full flex-1 bg-pixel-grass-deep" />
        <span className="h-full w-10 bg-pixel-grass" />
        <span className="h-full flex-1 bg-pixel-grass-deep" />
      </div>
      <div className="h-3 w-full border-y-[3px] border-pixel-line bg-pixel-dirt-dark" />
    </div>
  );
}

/** Small pixel sun disc, drawn from blocks. */
export function PixelSun({ size = 56 }: { size?: number }) {
  const unit = size / 8;
  return (
    <div
      aria-hidden="true"
      className="relative"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute border-[3px] border-pixel-line bg-pixel-sun"
        style={{ left: unit, top: unit, width: unit * 6, height: unit * 6 }}
      />
      <span
        className="absolute bg-pixel-sun"
        style={{ left: unit * 2.5, top: 0, width: unit * 3, height: unit }}
      />
      <span
        className="absolute bg-pixel-sun"
        style={{ left: unit * 2.5, top: unit * 7, width: unit * 3, height: unit }}
      />
      <span
        className="absolute bg-pixel-sun"
        style={{ left: 0, top: unit * 2.5, width: unit, height: unit * 3 }}
      />
      <span
        className="absolute bg-pixel-sun"
        style={{ left: unit * 7, top: unit * 2.5, width: unit, height: unit * 3 }}
      />
    </div>
  );
}
