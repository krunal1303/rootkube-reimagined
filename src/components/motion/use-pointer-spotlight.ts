import { useEffect, type RefObject } from "react";

import { useReducedMotion } from "@/motion/use-reduced-motion";

/**
 * Writes the pointer's position within each matching child as CSS custom
 * properties, letting a gradient follow the cursor.
 *
 * One listener is delegated on the container rather than one per card, and the
 * write is batched into a rAF so a fast sweep across six cards can't trigger
 * more than one style write per frame. Values are set as unitless percentages
 * so the consuming CSS decides how to use them.
 */
export function usePointerSpotlight(ref: RefObject<HTMLElement | null>, childSelector: string) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const container = ref.current;
    if (!container) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      card.style.setProperty("--spot-x", `${x}%`);
      card.style.setProperty("--spot-y", `${y}%`);
      pending = null;
    };

    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(childSelector);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      pending = {
        card,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    container.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      container.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, childSelector, reduceMotion]);
}
