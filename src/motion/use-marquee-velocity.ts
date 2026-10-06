import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";
import { useSmoothScroll } from "./smooth-scroll-context";

/**
 * Drives a marquee from a GSAP tween rather than a CSS animation so scroll
 * velocity can modulate it: the strip speeds up with the scroll, and reverses
 * direction when you scroll back up. That coupling is what makes the band feel
 * attached to the page instead of looping beside it.
 *
 * `xPercent: -50` relies on the caller rendering the item list twice, so the
 * halfway point is seamless.
 */
export function useMarqueeVelocity(
  ref: RefObject<HTMLElement | null>,
  { baseDuration = 25 }: { baseDuration?: number } = {},
) {
  const reduceMotion = useReducedMotion();
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (reduceMotion) return;
    const element = ref.current;
    if (!element) return;

    const tween = gsap.to(element, {
      xPercent: -50,
      duration: baseDuration,
      ease: "none",
      repeat: -1,
    });

    if (!lenis) return () => tween.kill();

    // Velocity decays back to the idle rate on its own; this just nudges the
    // timeScale toward the scroll-derived target each frame.
    let target = 1;
    const onScroll = ({ velocity }: { velocity: number }) => {
      const magnitude = Math.min(Math.abs(velocity) / 12, 5);
      target = (velocity < 0 ? -1 : 1) * (1 + magnitude);
    };

    const decay = () => {
      target += (1 - target) * 0.04;
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.1));
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(decay);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(decay);
      tween.kill();
    };
  }, [ref, lenis, reduceMotion, baseDuration]);
}
