import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary";

export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setEnabled(query.matches);
    const onChange = (event: MediaQueryListEvent) => setEnabled(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const active = enabled && !reduceMotion;

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Centering lives in the GSAP transform, not a Tailwind translate class,
    // so the two don't write competing values to the same property.
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // quickTo keeps this off the React render path entirely.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let visible = false;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
      }
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);

      const overInteractive = Boolean((event.target as HTMLElement | null)?.closest?.(INTERACTIVE));
      gsap.to(ring, { scale: overInteractive ? 1.8 : 1, duration: 0.3, ease: "power3.out" });
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([dot, ring]);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden="true">
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-8 rounded-full border border-primary/70 opacity-0 md:block"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-1.5 rounded-full bg-primary opacity-0 md:block"
      />
    </div>
  );
}
