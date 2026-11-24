"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        setState("copied");
      } catch {
        setState("error");
      }
    }

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), 2400);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-secondary h-10 px-3.5 py-0 text-[12px]"
      aria-live="polite"
      aria-label="Salin tautan halaman proyek"
    >
      {state === "copied" ? (
        <Check size={14} className="text-emerald-600" aria-hidden="true" />
      ) : (
        <Share2 size={14} aria-hidden="true" />
      )}
      {state === "copied" ? "Tautan disalin" : state === "error" ? "Gagal menyalin" : "Bagikan"}
    </button>
  );
}
