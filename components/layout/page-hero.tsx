import Link from "next/link";
import { SpriteChevronDown } from "@/components/ui/pixel-sprites";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Which world this page opens in. */
  tone?: "sky" | "paper" | "dirt";
}

/**
 * Page opener as a pixel sky/paper band.
 *
 * Replaces the blurred radial "glow" hero with flat world colour, a stepped
 * grid, and a chunky plaque breadcrumb — the reference's section-transition
 * language applied to inner routes.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  actions,
  children,
  className,
  tone = "sky",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        // No `overflow-hidden` here: the region picker opens an absolutely
        // positioned listbox below the button, and clipping the section cut it
        // off at the bottom border on /laporan, /proyek, /informasi, /anggaran.
        "relative border-b-4 border-pixel-line",
        tone === "sky" && "bg-pixel-sky",
        tone === "paper" && "bg-pixel-cream",
        tone === "dirt" && "bg-pixel-dirt",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-40 surface-grid",
          tone === "dirt" && "opacity-20",
        )}
        aria-hidden="true"
      />

      <div className="container-page relative py-8 sm:py-10">
        {breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="inline-flex flex-wrap items-center gap-1 border-2 border-pixel-line bg-white px-2 py-1 shadow-chip">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-7 items-center px-1 font-pixel text-[8px] uppercase text-pixel-line hover:bg-pixel-sun"
                >
                  Beranda
                </Link>
              </li>
              {breadcrumb.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex items-center">
                  <SpriteChevronDown
                    size={9}
                    className="-rotate-90 text-pixel-line"
                  />
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="inline-flex min-h-7 items-center px-1 font-pixel text-[8px] uppercase text-pixel-line hover:bg-pixel-sun"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="inline-flex min-h-7 items-center bg-pixel-panel px-1 font-pixel text-[8px] uppercase text-pixel-line"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 border-2 border-pixel-line bg-pixel-sun px-2.5 py-1 font-pixel text-[8px] uppercase tracking-[0.06em] text-pixel-line shadow-chip">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-pixel text-[20px] uppercase leading-[1.55] text-pixel-line text-shadow-pixel-light sm:text-[26px] lg:text-[29px]">
              {title}
            </h1>
            <p
              className={cn(
                "mt-4 max-w-2xl font-retro text-[17px] leading-snug sm:text-[18px]",
                tone === "dirt" ? "text-pixel-cream" : "text-pixel-ink",
              )}
            >
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
          ) : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
