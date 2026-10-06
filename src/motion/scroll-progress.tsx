import { useRef } from "react";

import { useGsap } from "./use-gsap";

/**
 * Hairline scroll-progress bar pinned under the header.
 *
 * Scrubbed off the document scroll rather than a scroll event listener, so it
 * rides the same Lenis-driven ticker as everything else and never fights it.
 * Scales a transform instead of animating width to keep it off the layout path.
 */
export function ScrollProgress() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useGsap(wrapRef, ({ gsap }) => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      },
    );
  });

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-primary/70"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
