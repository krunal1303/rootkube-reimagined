import { useRef, type CSSProperties } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import { useGsap } from "@/motion/use-gsap";

/**
 * Resolves mono text out of a character scramble when scrolled into view.
 *
 * Reads as a terminal resolving a value, which suits the site's mono eyebrow
 * labels better than a fade. Deliberately limited to short uppercase strings —
 * scrambling a sentence is unreadable noise, not texture.
 *
 * The real text is always in the server HTML; the scramble only replaces it
 * once the client confirms motion is on, so this degrades to plain text under
 * reduced motion and with JS off.
 */
export function ScrambleText({
  children,
  className,
  chars = "upperCase",
  duration = 0.9,
  delay = 0,
}: {
  children: string;
  className?: string;
  /** Glyph pool: a ScrambleText keyword or a literal character set. */
  chars?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGsap(
    ref,
    ({ gsap: g, scope }) => {
      g.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

      g.to(scope, {
        duration,
        delay,
        ease: "none",
        scrambleText: { text: children, chars, speed: 0.45, revealDelay: duration * 0.35 },
        scrollTrigger: { trigger: scope, start: "top 92%", once: true },
      });
    },
    [children, chars, duration, delay],
  );

  // Reserving the resolved width in `ch` keeps surrounding layout still while
  // glyphs cycle. It is a min-width, so a container narrower than the text can
  // still wrap rather than overflow.
  return (
    <span
      ref={ref}
      className={`scramble-lock ${className ?? ""}`}
      style={{ "--scramble-w": `${children.length}ch` } as CSSProperties}
    >
      {children}
    </span>
  );
}
