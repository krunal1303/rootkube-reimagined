import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { useReducedMotion } from "./use-reduced-motion";

type Mode = "words" | "chars";

/**
 * Per-word (or per-character) headline reveal using SplitText.
 *
 * `autoSplit` is the reason this is worth the plugin: it re-splits on resize
 * and once webfonts finish loading, so a headline that reflows from three lines
 * to five on a phone still masks per-line correctly. Doing that by hand means
 * reimplementing line detection, which is exactly what goes wrong at odd
 * viewport widths.
 *
 * `mask: "lines"` wraps each line in its own overflow-hidden clip, so words
 * rise out of the line box rather than from an arbitrary offset — the same
 * effect MaskedLines produced, but per word.
 *
 * `aria: "auto"` keeps the original text exposed to assistive tech; without it,
 * splitting leaves a pile of single-character spans that screen readers spell
 * out letter by letter.
 */
export function useSplitReveal(
  ref: RefObject<HTMLElement | null>,
  {
    mode = "words",
    stagger = 0.028,
    duration = 0.9,
    start = "top 85%",
    delay = 0,
    /** Hold off until some external gate (e.g. the preloader) finishes. */
    enabled = true,
  }: {
    mode?: Mode;
    stagger?: number;
    duration?: number;
    start?: string;
    delay?: number;
    enabled?: boolean;
  } = {},
) {
  const reduceMotion = useReducedMotion();
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduceMotion || !enabled) return;
    const element = ref.current;
    if (!element) return;
    // A headline only reveals once; re-running after an autoSplit resize would
    // animate it from scratch while the visitor is reading it.
    if (doneRef.current) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    let tween: gsap.core.Tween | undefined;

    const split = SplitText.create(element, {
      type: mode === "chars" ? "lines,words,chars" : "lines,words",
      mask: "lines",
      aria: "auto",
      autoSplit: true,
      linesClass: "split-line",
      onSplit: (self) => {
        const targets = mode === "chars" ? self.chars : self.words;

        tween = gsap.from(targets, {
          yPercent: 115,
          // A slight rotation reads as physical weight rather than a slide.
          rotate: mode === "chars" ? 0 : 3,
          duration,
          delay,
          ease: "expo.out",
          stagger: { each: stagger, from: "start" },
          scrollTrigger: {
            trigger: element,
            start,
            once: true,
            onLeave: () => {
              doneRef.current = true;
            },
          },
          onComplete: () => {
            doneRef.current = true;
          },
        });

        return tween;
      },
    });

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, enabled, mode, stagger, duration, start, delay]);
}
