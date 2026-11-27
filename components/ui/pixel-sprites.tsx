"use client";

/**
 * Pixel sprite set for PRAJVALA navigation and empty states.
 *
 * Drawn as inline SVG on a 16×16 grid with `shape-rendering="crispEdges"` so the
 * artwork stays sharp at any device pixel ratio. Emoji are never used as icons
 * (DESIGN.md §10); this is the single icon family for the pixel shell.
 */

interface SpriteProps {
  size?: number;
  className?: string;
  title?: string;
}

const base = {
  viewBox: "0 0 16 16",
  shapeRendering: "crispEdges" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

function Frame({
  size = 20,
  className,
  title,
  children,
}: SpriteProps & { children: React.ReactNode }) {
  return (
    <svg
      {...base}
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ---------------- Navigation sprites ---------------- */

export function SpriteHome(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 7h2V5h2V3h4v2h2v2h2v7h-4v-3H6v3H2z" fill="currentColor" />
      <path d="M7 8h2v2H7z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}

export function SpriteBudget(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M1 3h14v3H1z" fill="currentColor" />
      <path d="M1 7h14v3H1z" fill="currentColor" opacity="0.75" />
      <path d="M1 11h14v3H1z" fill="currentColor" opacity="0.5" />
      <path d="M3 4h3v1H3zM3 8h6v1H3zM3 12h4v1H3z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}

export function SpriteQuest(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 2h3v3H2zM11 2h3v3h-3zM2 11h3v3H2zM11 11h3v3h-3z" fill="currentColor" opacity="0.55" />
      <path d="M6 6h4v4H6z" fill="currentColor" />
      <path d="M7 4h2v2H7zM7 10h2v2H7zM4 7h2v2H4zM10 7h2v2h-2z" fill="currentColor" />
    </Frame>
  );
}

export function SpriteReport(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M3 1h7l3 3v11H3z" fill="currentColor" />
      <path d="M10 1v3h3z" fill="currentColor" opacity="0.55" />
      <path d="M5 7h6v1H5zM5 9.5h6v1H5zM5 12h4v1H5z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}

export function SpriteMore(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 2h3v3H2zM6.5 2h3v3h-3zM11 2h3v3h-3zM2 6.5h3v3H2zM6.5 6.5h3v3h-3zM11 6.5h3v3h-3z" fill="currentColor" />
      <path d="M2 11h3v3H2zM6.5 11h3v3h-3zM11 11h3v3h-3z" fill="currentColor" opacity="0.45" />
    </Frame>
  );
}

export function SpriteDocument(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 1h8l4 4v10H2z" fill="currentColor" />
      <path d="M10 1v4h4z" fill="currentColor" opacity="0.5" />
      <path d="M4 7h8v1H4zM4 9h8v1H4zM4 11h5v1H4z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}

export function SpriteJournal(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M3 2h10v12H3z" fill="currentColor" />
      <path d="M5 4h6v1H5zM5 6h6v1H5zM5 8h4v1H5z" fill="var(--sprite-cut, #FFF6E0)" />
      <path d="M1 2h2v12H1z" fill="currentColor" opacity="0.55" />
    </Frame>
  );
}

export function SpriteAccount(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M6 2h4v4H6z" fill="currentColor" />
      <path d="M3 7h10v3H3z" fill="currentColor" opacity="0.8" />
      <path d="M4 11h8v3H4z" fill="currentColor" opacity="0.55" />
    </Frame>
  );
}

export function SpriteHelp(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M4 2h8v2H4zM2 4h2v5H2zM12 4h2v5h-2zM7 9h2v2H7zM7 13h2v2H7z" fill="currentColor" />
    </Frame>
  );
}

export function SpriteClose(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M3 3h2v2H3zM5 5h2v2H5zM7 7h2v2H7zM9 9h2v2H9zM11 11h2v2h-2z" fill="currentColor" />
      <path d="M11 3h2v2h-2zM9 5h2v2H9zM7 7h2v2H7zM5 9h2v2H5zM3 11h2v2H3z" fill="currentColor" />
    </Frame>
  );
}

export function SpriteChevronDown(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M3 6h2v2H3zM5 8h2v2H5zM7 10h2v2H7zM9 8h2v2H9zM11 6h2v2h-2z" fill="currentColor" />
    </Frame>
  );
}

export function SpriteArrowRight(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 7h8V5h2v2h2v2h-2v2h-2v-2H2z" fill="currentColor" />
    </Frame>
  );
}

/* ---------------- World / scenery sprites ---------------- */

/** Small pixel sun used in section headers. */
export function SpriteSun(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M6 1h4v2H6zM6 13h4v2H6zM1 6h2v4H1zM13 6h2v4h-2z" fill="currentColor" opacity="0.75" />
      <path d="M5 4h6v8H5z" fill="currentColor" />
      <path d="M6 5h4v6H6z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}

/** Civic crest used by the pengelola shortcut in the mobile More sheet. */
export function SpriteCrest(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M3 2h10v7h-2v3h-2v2H7v-2H5v-3H3z" fill="currentColor" />
      <path d="M6 4h4v3H6z" fill="var(--sprite-cut, #FFD700)" />
      <path d="M7 8h2v3H7z" fill="var(--sprite-cut, #FFD700)" />
    </Frame>
  );
}

/** Chest — used in empty states for the document archive. */
export function SpriteChest(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M2 4h12v3H2z" fill="currentColor" />
      <path d="M2 8h12v6H2z" fill="currentColor" opacity="0.8" />
      <path d="M7 6h2v4H7z" fill="var(--sprite-cut, #FFD700)" />
    </Frame>
  );
}

/** Signpost — used in 404 and empty states. */
export function SpriteSignpost(props: SpriteProps) {
  return (
    <Frame {...props}>
      <path d="M7 2h2v12H7z" fill="currentColor" />
      <path d="M2 4h9v3H2zM5 9h9v3H5z" fill="currentColor" opacity="0.75" />
      <path d="M3 5h6v1H3zM6 10h6v1H6z" fill="var(--sprite-cut, #FFF6E0)" />
    </Frame>
  );
}
