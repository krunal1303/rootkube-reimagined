import { useState, type RefObject } from "react";

import { useGsap } from "./use-gsap";

/**
 * Subtle scroll parallax on the hero panel, plus reporting when the hero
 * scrolls out of view so callers can pause infinite loops (Motion's node
 * float, the SMIL signal dot) that would otherwise burn main-thread budget
 * behind other sections.
 */
export function useHeroParallax(
  sectionRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  const [inView, setInView] = useState(true);

  useGsap(
    sectionRef,
    ({ gsap, ScrollTrigger, scope }) => {
      const panel = panelRef.current;
      if (panel) {
        gsap.to(panel, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      ScrollTrigger.create({
        trigger: scope,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => setInView(isActive),
      });
    },
    [panelRef],
  );

  return inView;
}
