import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view so the header nav can indicate
 * position. IntersectionObserver rather than a scroll handler: no work happens
 * between boundary crossings.
 *
 * Picks the entry closest to the top of the viewport when several are visible,
 * which matches what a reader considers "the current section" better than
 * largest-area does on a long page.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }

        if (!visible.size) return;
        const [closest] = [...visible.entries()].sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
        setActive(closest?.[0] ?? null);
      },
      // Band across the upper-middle of the viewport: a section becomes
      // "active" once it's genuinely being read, not when it first peeks in.
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
