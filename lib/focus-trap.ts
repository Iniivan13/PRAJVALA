const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

/**
 * Menjaga fokus keyboard tetap berada di dalam dialog selama modal terbuka.
 * Mengembalikan true bila event Tab sudah ditangani.
 */
export function trapFocus(container: HTMLElement | null, event: KeyboardEvent): boolean {
  if (!container || event.key !== "Tab") return false;

  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter((element) => {
    if (element.hasAttribute("disabled")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    return element.getClientRects().length > 0;
  });

  if (candidates.length === 0) {
    event.preventDefault();
    container.focus();
    return true;
  }

  const first = candidates[0];
  const last = candidates[candidates.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
      return true;
    }
  } else if (active === last || !container.contains(active)) {
    event.preventDefault();
    first.focus();
    return true;
  }

  return false;
}
