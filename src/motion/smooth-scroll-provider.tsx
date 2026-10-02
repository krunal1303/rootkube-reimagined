import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "./use-reduced-motion";
import { SmoothScrollContext, type ScrollTo } from "./smooth-scroll-context";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const instance = new Lenis({
      duration: 1.1,
      // Exponential falloff: fast response at the start, long settle.
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Native momentum on touch is better than anything we'd simulate.
      syncTouch: false,
      touchMultiplier: 1,
    });

    lenisRef.current = instance;
    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lenis owns the frame loop; GSAP's lag correction would fight it.
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      instance.off("scroll", ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [reduceMotion]);

  const scrollTo = useCallback<ScrollTo>((target, options) => {
    const instance = lenisRef.current;
    if (instance) {
      instance.scrollTo(target, {
        offset: options?.offset ?? 0,
        immediate: options?.immediate ?? false,
      });
      return;
    }

    const element =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : typeof target === "number"
          ? null
          : target;

    if (typeof target === "number") {
      window.scrollTo({ top: target });
    } else if (element) {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0),
      });
    }
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
