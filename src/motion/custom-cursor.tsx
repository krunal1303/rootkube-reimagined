import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary";

/**
 * Cursor states are declared in the markup via `data-cursor`, so a section can
 * opt into a label or a different shape without this file knowing about it.
 *   data-cursor="view"    -> ring grows and shows its label
 *   data-cursor="invert"  -> blend-mode flip for light-on-dark sections
 *   data-cursor-label="…" -> text rendered inside the ring
 */
const STATES = {
  default: { scale: 1, borderWidth: 1 },
  interactive: { scale: 1.8, borderWidth: 1 },
  view: { scale: 3.4, borderWidth: 0.6 },
} as const;

export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

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
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    // Centering lives in the GSAP transform, not a Tailwind translate class,
    // so the two don't write competing values to the same property.
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // quickTo keeps this off the React render path entirely.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let visible = false;
    let currentState = "";
    let currentLabel = "";

    const applyState = (name: keyof typeof STATES, text: string, invert: boolean) => {
      if (name !== currentState) {
        currentState = name;
        const next = STATES[name];
        gsap.to(ring, { ...next, duration: 0.34, ease: "power3.out" });
        // The label lives inside the ring, so it inherits the ring's scale.
        // Counter-scaling keeps the text at its true size rather than forcing a
        // sub-pixel base font-size that renders inconsistently.
        gsap.to(label, { scale: 1 / next.scale, duration: 0.34, ease: "power3.out" });
      }
      if (text !== currentLabel) {
        currentLabel = text;
        label.textContent = text;
        gsap.to(label, { autoAlpha: text ? 1 : 0, duration: 0.2 });
      }
      // Difference blending makes one cursor work on both the dark page and the
      // light About panel without tracking section boundaries in JS.
      const blend = invert ? "difference" : "normal";
      if (ring.style.mixBlendMode !== blend) {
        ring.style.mixBlendMode = blend;
        dot.style.mixBlendMode = blend;
      }
    };

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

      const target = event.target as HTMLElement | null;
      const zone = target?.closest?.<HTMLElement>("[data-cursor]");
      const kind = zone?.dataset["cursor"];
      const invert = Boolean(target?.closest?.("[data-cursor-invert]"));

      if (kind === "view") {
        applyState("view", zone?.dataset["cursorLabel"] ?? "", invert);
      } else if (target?.closest?.(INTERACTIVE)) {
        applyState("interactive", "", invert);
      } else {
        applyState("default", "", invert);
      }
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
      gsap.killTweensOf([dot, ring, label]);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden="true">
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-8 items-center justify-center rounded-full border border-primary/70 opacity-0 md:flex"
      >
        <span
          ref={labelRef}
          className="select-none whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] text-primary opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-1.5 rounded-full bg-primary opacity-0 md:block"
      />
    </div>
  );
}
