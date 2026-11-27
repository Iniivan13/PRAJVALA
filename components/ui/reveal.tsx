"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

/**
 * Entrance transition for content below the fold.
 *
 * Content is rendered visible by default so it stays readable when JavaScript is
 * unavailable or fails. Only elements that start below the viewport are hidden
 * and then revealed on intersection. Users who request reduced motion skip the
 * transition entirely.
 */
export function Reveal({ children, className, delay = 0, threshold = 0.01 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setHidden(false);
      return;
    }

    // Content already on screen should never flash hidden.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        // Only transform while hidden. A permanent `translate-y-0` still creates
        // a stacking context, which previously let later siblings paint over
        // absolutely positioned dropdowns inside the revealed content.
        hidden ? "translate-y-5 opacity-0" : "opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
