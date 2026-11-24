import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <span className="eyebrow">
            <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={cn(
            "mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-[38px] sm:leading-[1.12]",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
