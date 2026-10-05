import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";

const POINTER_FINE_QUERY = "(pointer: fine)";

/**
 * Two thin lines that pivot toward the pointer over the hero diagram. Each
 * line is a 1px-tall div stretched to the panel's diagonal and rotated with
 * `transform`, so the only animated properties are transform/opacity —
 * nothing here triggers layout.
 */
export function HeroCursorLines({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion();
  const lineARef = useRef<HTMLDivElement | null>(null);
  const lineBRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia(POINTER_FINE_QUERY).matches) return;
    const panel = targetRef.current;
    const lineA = lineARef.current;
    const lineB = lineBRef.current;
    if (!panel || !lineA || !lineB) return;

    const rotateA = gsap.quickTo(lineA, "rotation", { duration: 0.5, ease: "power3.out" });
    const rotateB = gsap.quickTo(lineB, "rotation", { duration: 0.7, ease: "power3.out" });
    const opacity = gsap.quickTo([lineA, lineB], "opacity", { duration: 0.4, ease: "power1.out" });

    gsap.set([lineA, lineB], { opacity: 0 });

    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const angleA = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
      rotateA(angleA);
      rotateB(angleA + 90);
      opacity(1);
    };

    const onLeave = () => opacity(0);

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerleave", onLeave);
    return () => {
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, targetRef]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={lineARef}
        className="absolute left-1/2 top-1/2 h-px w-[150%] origin-center bg-primary/40 opacity-0"
      />
      <div
        ref={lineBRef}
        className="absolute left-1/2 top-1/2 h-px w-[150%] origin-center bg-primary/20 opacity-0"
      />
    </div>
  );
}
