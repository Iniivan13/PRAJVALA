import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  markClassName?: string;
}

export function Logo({
  theme = "light",
  showTagline = false,
  className,
  markClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-900 shadow-sm",
          markClassName,
        )}
      >
        <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
          <path
            d="M32 10c1.6 8.1 10.2 11.6 10.2 21.2 0 8.2-5.5 14.8-12.7 14.8-7.8 0-13.3-6.1-13.3-14 0-5.4 2.9-9.1 6.1-12.3.4 3.9 1.9 6.4 4.2 7.6C27.9 20 30.3 14.6 32 10z"
            fill="#F59E0B"
          />
          <path
            d="M32 25.8c1 3.7 4.5 5.6 4.5 9.7 0 3.8-2.4 6.8-5.6 6.8-3.4 0-5.8-2.9-5.8-6.5 0-2.4 1.3-4.2 2.8-5.7.2 1.7.8 2.8 1.8 3.3.7-2.6 1.6-5.2 2.3-7.6z"
            fill="#FFF7ED"
          />
          <circle cx="50" cy="15" r="2.4" fill="#FCD34D" />
          <circle cx="14" cy="50" r="1.7" fill="#F59E0B" opacity="0.7" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[19px] font-extrabold tracking-[0.14em]",
            theme === "light" ? "text-ink-900" : "text-white",
          )}
        >
          PRAJVALA
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 text-[9.5px] font-medium uppercase tracking-[0.16em]",
              theme === "light" ? "text-ink-500" : "text-ink-300",
            )}
          >
            Cahaya Anggaran Publik
          </span>
        ) : null}
      </span>
    </span>
  );
}
