import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  actions,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-ink-200/70 bg-white",
        className,
      )}
    >
      <div
        className="surface-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-400/10 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-navy/[0.06] blur-[80px]"
        aria-hidden="true"
      />

      <div className="container-page relative py-9 sm:py-12">
        {breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
              <li>
                <Link href="/" className="inline-flex min-h-8 items-center transition-colors hover:text-ink-700">
                  Beranda
                </Link>
              </li>
              {breadcrumb.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                  <ChevronRight size={11} aria-hidden="true" />
                  {item.href ? (
                    <Link href={item.href} className="inline-flex min-h-8 items-center transition-colors hover:text-ink-700">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-600" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">
              <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
              {eyebrow}
            </span>
            <h1 className="mt-3 font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink-900 text-balance sm:text-[42px]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-[14px] leading-relaxed text-ink-500 sm:text-[15px]">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}
