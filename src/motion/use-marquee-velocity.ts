import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";
import { useSmoothScroll } from "./smooth-scroll-context";

/** Max degrees an item rotates as it approaches the edges of the band. */
const TURN_DEG = 62;
/** How far an item recedes at the edges, px along Z. */
const RECEDE_Z = 150;
/** Opacity at the edges; items fade as they turn away. */
const EDGE_FADE = 0.12;
/**
 * Fraction of the band's half-width over which the turn happens. Below this the
 * item is square to the viewer, so the centre stays flat and readable.
 */
const FLAT_ZONE = 0.3;

/** Per-item delay in the opening deal, seconds. */
const DEAL_STAGGER = 0.07;
/** How long one item takes to swing into place. */
const DEAL_DURATION = 0.75;

/**
 * Drives a marquee from a GSAP tween rather than a CSS animation so scroll
 * velocity can modulate it: the strip speeds up with the scroll, and reverses
 * direction when you scroll back up. That coupling is what makes the band feel
 * attached to the page instead of looping beside it.
 *
 * `xPercent: -50` relies on the caller rendering the item list twice, so the
 * halfway point is seamless.
 *
 * On top of the travel, each item is rotated about the vertical axis by its own
 * horizontal position, so the strip reads as a cylinder turning rather than a
 * flat ribbon sliding: items face you at centre and turn away toward the edges,
 * receding and fading as they go.
 *
 * Why per-item transforms instead of one `rotateY` on the track: rotating the
 * track rotates it as a single rigid plane, which just skews the whole strip.
 * The cylinder effect requires each item's angle to be a function of where *it*
 * currently is, which can only be computed per item, per frame.
 *
 * The rotation is recomputed from live positions rather than precomputed per
 * item, because the items are moving — a fixed per-item angle would travel with
 * the item instead of staying anchored to the band.
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

    // Paused until the opening deal finishes: the labels should arrive one by
    // one on a stationary strip, then the band starts travelling. Letting the
    // travel run underneath the entrance makes both read as noise.
    const tween = gsap.to(element, {
      xPercent: -50,
      duration: baseDuration,
      ease: "none",
      repeat: -1,
      paused: true,
    });

    // The band is the track's clipping parent; the turn is measured against it.
    const band = element.parentElement;
    const items = Array.from(element.querySelectorAll<HTMLElement>("[data-marquee-item]"));

    // quickSetters so the per-frame writes don't allocate a tween per item.
    const setRotY = items.map((el) => gsap.quickSetter(el, "rotationY", "deg"));
    const setZ = items.map((el) => gsap.quickSetter(el, "z", "px"));
    const setOpacity = items.map((el) => gsap.quickSetter(el, "opacity"));

    /**
     * Static layout, measured once per resize.
     *
     * Reading `getBoundingClientRect()` per item per frame would be a forced
     * synchronous reflow in the hot loop — and worse, it would read layout
     * *after* GSAP has written transforms, which is the classic layout-thrash
     * pattern. Instead the resting offsets are measured once and the live
     * position is derived arithmetically from the tween's progress, so the
     * per-frame work is pure arithmetic and touches layout not at all.
     */
    let bandWidth = 0;
    /** One loop of the list = half the duplicated track. */
    let trackWidth = 0;
    /** Full track width, for converting the tween's xPercent into px. */
    let trackPixelWidth = 0;
    let restCentres: number[] = [];

    const measure = () => {
      if (!band) return;
      bandWidth = band.offsetWidth;
      // The track holds the list twice; one loop is half its width.
      trackPixelWidth = element.offsetWidth;
      trackWidth = trackPixelWidth / 2;

      // offsetLeft/offsetWidth, NOT getBoundingClientRect: offset* report
      // untransformed layout geometry, while getBoundingClientRect returns the
      // *visual* box — which by the time a resize fires already includes the
      // rotationY and z this hook has written. Measuring the rendered box would
      // feed the items' own rotation back into their rest positions and corrupt
      // them a little more on every resize.
      restCentres = items.map((item) => item.offsetLeft + item.offsetWidth / 2);
    };

    const onResize = () => measure();
    measure();
    window.addEventListener("resize", onResize, { passive: true });

    const shape = () => {
      if (!band || bandWidth <= 0 || trackWidth <= 0) return;
      const half = bandWidth / 2;
      // Where the track currently sits, from the tween — no layout read.
      // xPercent is relative to the track's own width (offsetWidth is cached by
      // the browser between writes and does not force a reflow here).
      const pct = (gsap.getProperty(element, "xPercent") as number) || 0;
      const x = (pct / 100) * trackPixelWidth;

      items.forEach((item, i) => {
        const rest = restCentres[i];
        if (rest === undefined) return;

        // Live position of this item's centre, in band coordinates.
        //
        // The track is duplicated and translates by one loop-width, so an item
        // that has travelled off the left re-enters as its own copy. Wrapping
        // into [0, trackWidth) folds both copies onto the same logical slot;
        // the result is then shifted so the band's own span sits inside that
        // range, otherwise items far outside the band would be scored against
        // the band's centre and turn while invisible.
        let itemCentre = rest + x;
        itemCentre = ((itemCentre % trackWidth) + trackWidth) % trackWidth;
        // Items beyond one band-width past the right edge are really the copy
        // approaching from the left; score them there instead.
        if (itemCentre > bandWidth) itemCentre -= trackWidth;

        // -1 (left edge) .. 0 (centre) .. 1 (right edge)
        const offset = gsap.utils.clamp(-1, 1, (itemCentre - half) / half);

        // Hold the middle of the band flat, then ramp the turn toward the
        // edges. Without the flat zone the centre items are already angled and
        // the labels are never cleanly readable — which would make this cost
        // legibility for the sake of an effect.
        const ramp = gsap.utils.clamp(0, 1, (Math.abs(offset) - FLAT_ZONE) / (1 - FLAT_ZONE));
        const signed = Math.sign(offset) * ramp;

        // Negative so an item on the right turns its leading edge away from the
        // viewer, the way a point on a cylinder's surface does as it rotates off.
        setRotY[i]?.(-signed * TURN_DEG);
        setZ[i]?.(-ramp * RECEDE_Z);
        setOpacity[i]?.(1 - ramp * (1 - EDGE_FADE));
      });
    };

    /**
     * Opening deal: the labels arrive one after another, left to right, each
     * swinging in from a turned-away angle before the band settles into its
     * continuous travel.
     *
     * This runs *instead of* `shape` rather than alongside it — both write
     * rotationY/z/opacity on the same elements, so letting them overlap would
     * have the per-frame shaper stomping the entrance mid-flight. `shape` is
     * only added to the ticker once the deal resolves.
     */
    let dealt = false;
    const deal = gsap.timeline({
      // Paused: the band sits just under the hero, so on load it is behind the
      // preloader and usually below the fold. Playing on mount would spend the
      // entrance before anyone can see it.
      paused: true,
      onComplete: () => {
        dealt = true;
        gsap.ticker.add(shape);
        tween.play();
      },
    });

    // fromTo's default immediateRender applies the `from` state at creation even
    // though the timeline is paused, so the items are hidden from mount rather
    // than flashing at full opacity until the deal is triggered. Relied on
    // deliberately — a plain `to` here would show the strip first and then pop.
    deal.fromTo(
      items,
      { rotationY: -TURN_DEG, z: -RECEDE_Z, opacity: 0 },
      {
        rotationY: 0,
        z: 0,
        opacity: 1,
        duration: DEAL_DURATION,
        ease: "power3.out",
        stagger: DEAL_STAGGER,
      },
    );

    // Fire the entrance the first time the band is actually on screen.
    // IntersectionObserver rather than a ScrollTrigger: this needs nothing from
    // the scroll position beyond "is it visible", and it keeps the band
    // independent of ScrollTrigger's global refresh cycle.
    const startDeal = () => {
      // Remeasure immediately before dealing: fonts may have settled since
      // mount, which changes every item's width and therefore its centre.
      measure();
      deal.play();
    };

    // The items are hidden until the deal plays (see immediateRender above), so
    // anything that prevents the trigger would strand them invisible. If there
    // is no IntersectionObserver, deal straight away rather than observing.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      startDeal();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            startDeal();
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(band ?? element);
    }

    if (!lenis) {
      return () => {
        window.removeEventListener("resize", onResize);
        observer?.disconnect();
        deal.kill();
        if (dealt) gsap.ticker.remove(shape);
        gsap.set(items, { clearProps: "transform,opacity" });
        tween.kill();
      };
    }

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
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(decay);
      deal.kill();
      if (dealt) gsap.ticker.remove(shape);
      // Leave the items in their natural flat state for a remount.
      gsap.set(items, { clearProps: "transform,opacity" });
      tween.kill();
    };
  }, [ref, lenis, reduceMotion, baseDuration]);
}
