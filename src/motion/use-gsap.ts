import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "./use-reduced-motion";

type Scope = RefObject<HTMLElement | null>;

/**
 * Runs GSAP work inside a scoped context so every tween and ScrollTrigger it
 * creates is reverted on cleanup — required under StrictMode double-mounting.
 * The callback is skipped entirely when reduced motion is on, so elements keep
 * their natural CSS state.
 */
export function useGsap(
  scope: Scope,
  effect: (context: {
    scope: HTMLElement;
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }) => void,
  deps: DependencyList = [],
) {
  const reduceMotion = useReducedMotion();
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    if (reduceMotion) return;
    const element = scope.current;
    if (!element) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      effectRef.current({ scope: element, gsap, ScrollTrigger });
    }, element);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, scope, ...deps]);
}
