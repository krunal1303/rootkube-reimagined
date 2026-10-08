import { useEffect, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { useReducedMotion } from "./use-reduced-motion";

/**
 * Traces the hero diagram's edges once `start` flips true (the preloader
 * handing off), and reports when the trace is finished.
 *
 * The paths ship fully drawn, so the collapse to 0% happens here on the client
 * only. That keeps the server HTML and the reduced-motion path showing a
 * complete diagram, matching how the rest of this hero handles the constraint.
 *
 * Returns `traced`, which the network simulation waits on. The two cannot
 * overlap: DrawSVG works by setting `stroke-dasharray`/`dashoffset` against a
 * path's measured length, and the simulation rewrites `d` every frame — doing
 * both at once would leave the dash values describing a path that no longer
 * exists, and the edges would flicker mid-trace.
 */
export function useHeroPathDraw(ref: RefObject<SVGSVGElement | null>, start: boolean) {
  const reduceMotion = useReducedMotion();
  const [traced, setTraced] = useState(false);

  useEffect(() => {
    // With reduced motion the diagram is simply present, so the simulation's
    // gate opens immediately — it has its own reduced-motion guard anyway.
    if (reduceMotion) {
      setTraced(true);
      return;
    }
    if (!start) return;
    const svg = ref.current;
    if (!svg) return;

    gsap.registerPlugin(DrawSVGPlugin);

    // querySelectorAll, not querySelector: the diagram has several edges of
    // each kind and every one of them needs stroking.
    const main = Array.from(svg.querySelectorAll(".hero-draw"));
    const dim = Array.from(svg.querySelectorAll(".hero-draw-dim"));
    // Nothing to trace — open the gate rather than leaving the simulation
    // waiting on a trace that will never run.
    if (!main.length && !dim.length) {
      setTraced(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Hand clean paths to the simulation: a leftover dasharray is measured
        // against the path length at trace time, so it would clip the edges the
        // moment `d` starts changing.
        gsap.set([...main, ...dim], { clearProps: "strokeDasharray,strokeDashoffset" });
        setTraced(true);
      },
    });

    // The dim scaffold resolves first and faster — it reads as context being
    // laid down before the active signal routes are traced over it.
    if (dim.length) {
      tl.fromTo(
        dim,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.8, ease: "power2.inOut", stagger: 0.08 },
      );
    }
    if (main.length) {
      tl.fromTo(
        main,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.15, ease: "power2.inOut", stagger: 0.12 },
        0.18,
      );
    }

    return () => {
      tl.kill();
      // Leave the diagram complete if this unmounts mid-trace, and clear the
      // dash properties so the simulation inherits clean, fully-stroked paths.
      gsap.set([...main, ...dim], {
        drawSVG: "100%",
        clearProps: "strokeDasharray,strokeDashoffset",
      });
      // Killing the timeline means `onComplete` never fires. Without this the
      // gate would stay shut for good on any re-run of this effect (StrictMode's
      // double-mount, or `start` toggling), and the simulation would never
      // start — the diagram would sit frozen after its trace. The paths are
      // fully drawn and dash-free by the line above, so the gate is honestly
      // satisfied here.
      setTraced(true);
    };
  }, [ref, start, reduceMotion]);

  return traced;
}
