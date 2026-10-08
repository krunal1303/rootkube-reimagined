import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

import { HERO_EDGES, HERO_NODES, HERO_ROUTES } from "./hero-network";
import { useReducedMotion } from "./use-reduced-motion";

const POINTER_FINE_QUERY = "(pointer: fine)";

/** Radius (px) inside which the pointer pushes nodes away. */
const REPEL_RADIUS = 150;
/** Peak displacement (px) at the pointer's exact position. */
const REPEL_STRENGTH = 26;
/** Per-frame approach rate toward the target offset. Lower = heavier. */
const REPEL_EASE = 0.1;
const DRIFT_EASE = 0.06;

/**
 * Depth model.
 *
 * The scene is treated as a shallow slab that tilts toward the pointer. A node's
 * `z` (-1 back, 1 front) then drives every depth cue at once — they have to move
 * together or the illusion collapses into a flat plane with effects on it.
 */
/** Max px a z=1 node swings as the scene tilts. Far nodes swing less. */
const PARALLAX = 30;
/** Scale at z=-1 vs z=1; near nodes are drawn larger. */
const SCALE_NEAR = 1.09;
const SCALE_FAR = 0.87;
/** Far nodes fade toward the background — cheap, convincing aerial perspective. */
const FADE_FAR = 0.62;
/**
 * Hover response.
 *
 * The node is pulled toward the camera along Z rather than merely scaled up.
 * With `perspective` on the panel, translateZ is genuine approach: the box
 * foreshortens, its parallax swing grows, and it crosses in front of its
 * neighbours. Scaling alone just makes a flat rectangle bigger, which is the
 * difference between "nearer" and "zoomed".
 */
/** px along Z a hovered node travels toward the viewer. */
const HOVER_Z = 86;
/** Slight physical rise, so it lifts off the floor as well as approaching. */
const HOVER_LIFT = 10;
/** Resting Z spread of the slab, in px — far nodes sit behind the plane. */
const DEPTH_Z = 70;
/** Max deg the slab rotates under tilt. Small: this is a lean, not a spin. */
const TILT_DEG = 7;
/** Tilt easing; slower than the repel so the scene feels heavy. */
const TILT_EASE = 0.055;

/** Seconds a packet takes to cross one edge. */
const PACKET_LEG_DURATION = 1.5;
/** Gap between a packet finishing a route and the next one departing. */
const PACKET_GAP = 1.1;

type Point = { x: number; y: number };

type NodeState = {
  el: HTMLElement;
  /** Rest position in px, from the node's fractional coords. */
  base: Point;
  /** Current rendered offset from base, in px. */
  offset: Point;
  /** Where the offset is heading; `offset` chases this with easing. */
  target: Point;
  /** Eased 0→1 hover weight, so the lift has inertia instead of snapping. */
  hover: number;
};

/**
 * Drives the hero diagram as a live network rendered in a shallow 3D space.
 *
 * Everything runs off one rAF loop so the whole thing costs a single frame
 * callback:
 *
 * 1. Each node wanders on its own low-frequency sine pair. Independent phases
 *    and radii stop the group from pulsing in lockstep, which is what made the
 *    original shared float read as decoration.
 * 2. The pointer repels nearby nodes with a falloff, and they ease back when it
 *    leaves. This is the beat that makes the graph feel like matter: it reacts.
 * 3. The whole scene tilts toward the pointer, and each node parallaxes by its
 *    own `z`. Differential parallax is the depth cue that actually sells 3D —
 *    shadows and scale alone just look like a styled flat diagram, because the
 *    eye reads relative motion as depth far more strongly than it reads shading.
 * 4. Edges are re-pathed every frame from live node centres, so lines stay
 *    welded to boxes that are each moving by a different amount.
 *
 * Node transforms are written with `gsap.quickSetter` (straight to GSAP's cached
 * transform, no per-frame tween allocation) and only ever touch `transform`,
 * `opacity` and `zIndex`, so nothing here triggers layout.
 *
 * Packets are separate GSAP timelines rather than part of the loop: they are
 * interpolating along edges whose endpoints move, so each tick reads the
 * current node positions when it places the dot.
 */
export function useHeroNetwork(
  panelRef: RefObject<HTMLElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
  { active, start, hovered }: { active: boolean; start: boolean; hovered: number | null },
) {
  const reduceMotion = useReducedMotion();
  // Read inside the loop so toggling `active` doesn't tear down the simulation
  // and snap every node back to rest — the loop just idles instead.
  const activeRef = useRef(active);
  activeRef.current = active;
  // Same reasoning for hover: React owns the hovered index (it also drives the
  // lit edges in the markup), but the loop must read it without the effect
  // re-running and restarting the simulation on every pointer enter.
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const timelinesRef = useRef<Array<gsap.core.Timeline | null>>([]);

  useEffect(() => {
    if (reduceMotion || !start) return;
    const panel = panelRef.current;
    const svg = svgRef.current;
    if (!panel || !svg) return;

    const nodeEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-node]"));
    const edgeEls = Array.from(svg.querySelectorAll<SVGPathElement>("[data-edge]"));
    const packetEls = Array.from(svg.querySelectorAll<SVGCircleElement>("[data-packet]"));
    if (nodeEls.length !== HERO_NODES.length) return;

    const states: NodeState[] = [];
    // Separate x/y quickSetters rather than quickSetter(el, "css"): these write
    // straight into GSAP's cached transform for the element instead of parsing a
    // style object every frame. They drive `transform`, which is independent of
    // the CSS `translate` property that centres the node on its coordinate.
    const setX = nodeEls.map((el) => gsap.quickSetter(el, "x", "px"));
    const setY = nodeEls.map((el) => gsap.quickSetter(el, "y", "px"));
    const setScale = nodeEls.map((el) => gsap.quickSetter(el, "scale"));
    const setOpacity = nodeEls.map((el) => gsap.quickSetter(el, "opacity"));
    const setZ = nodeEls.map((el) => gsap.quickSetter(el, "z", "px"));
    const setRotX = nodeEls.map((el) => gsap.quickSetter(el, "rotationX", "deg"));
    const setRotY = nodeEls.map((el) => gsap.quickSetter(el, "rotationY", "deg"));

    // Depth cues that don't change per frame are written once here: stacking
    // order so near boxes overlap far ones, and the resting elevation shadow.
    // Writing z-index every frame would be wasted work — `z` never changes.
    const depthOrder = HERO_NODES.map((node, i) => ({ i, z: node.z }))
      .sort((a, b) => a.z - b.z)
      .map((entry) => entry.i);
    depthOrder.forEach((nodeIndex, rank) => {
      const el = nodeEls[nodeIndex];
      if (el) el.style.zIndex = String(10 + rank);
    });

    /**
     * Resolves rest positions in px. Called on mount and on resize; the node
     * elements are positioned by CSS percentage, so `base` only needs to track
     * the panel box, not the elements themselves.
     */
    let width = 0;
    let height = 0;
    const measure = () => {
      const rect = panel.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // The hook writes `d` in panel pixels, so the viewBox has to be the panel
      // box 1:1. The markup ships a square viewBox for the SSR fallback paths;
      // this is the handover to real coordinates.
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      HERO_NODES.forEach((node, i) => {
        const el = nodeEls[i];
        if (!el) return;
        const base = { x: node.x * width, y: node.y * height };
        const existing = states[i];
        if (existing) {
          existing.base = base;
        } else {
          states[i] = {
            el,
            base,
            offset: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            hover: 0,
          };
        }
      });
    };
    measure();

    /** Live centre of a node in panel px — rest position plus current offset. */
    const centre = (i: number): Point => {
      const state = states[i];
      if (!state) return { x: 0, y: 0 };
      return { x: state.base.x + state.offset.x, y: state.base.y + state.offset.y };
    };

    const pointer: Point & { inside: boolean } = { x: 0, y: 0, inside: false };
    const finePointer = window.matchMedia(POINTER_FINE_QUERY).matches;

    // Scene tilt, -1..1 on each axis, eased toward the pointer's offset from
    // centre. Held as its own state (rather than read straight from `pointer`)
    // so the slab keeps swinging for a moment after the cursor stops — the lag
    // is what gives it mass.
    const tilt = { x: 0, y: 0 };

    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    if (finePointer) {
      panel.addEventListener("pointermove", onMove, { passive: true });
      panel.addEventListener("pointerleave", onLeave);
    }

    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });

    // Edges inherit the depth of the nodes they join: a wire running between two
    // far boxes is drawn thinner and fainter than one in front. Set once rather
    // than per frame, since `z` is fixed — only the endpoints move.
    edgeEls.forEach((path, i) => {
      const edge = HERO_EDGES[i];
      if (!edge) return;
      const a = HERO_NODES[edge.from];
      const b = HERO_NODES[edge.to];
      if (!a || !b) return;
      const depth = (a.z + b.z) / 2; // -1 far .. 1 near
      path.style.setProperty("--edge-depth", ((depth + 1) / 2).toFixed(3));
    });

    // Tracks which node currently holds the promoted z-index.
    let lastHovered: number | null = null;

    const started = performance.now();

    const tick = () => {
      // Seconds since mount. Drift is a pure function of elapsed time, so a
      // dropped frame changes nothing about where a node should be.
      const t = (performance.now() - started) / 1000;
      const running = activeRef.current;

      // Ease the slab toward the pointer. Normalised to -1..1 from the panel
      // centre, so the tilt is independent of panel size.
      const wantTiltX = running && pointer.inside && width > 0 ? (pointer.x / width) * 2 - 1 : 0;
      const wantTiltY = running && pointer.inside && height > 0 ? (pointer.y / height) * 2 - 1 : 0;
      tilt.x += (wantTiltX - tilt.x) * TILT_EASE;
      tilt.y += (wantTiltY - tilt.y) * TILT_EASE;

      const hoveredIndex = hoveredRef.current;
      if (hoveredIndex !== lastHovered) {
        // z-index is otherwise assigned once by depth rank. A node travelling
        // toward the camera has to paint in front of every resting node, not
        // just the ones it started behind, so the hovered one is promoted above
        // the whole stack and restored on exit.
        if (lastHovered !== null) {
          const prev = nodeEls[lastHovered];
          const rank = depthOrder.indexOf(lastHovered);
          if (prev && rank >= 0) prev.style.zIndex = String(10 + rank);
        }
        if (hoveredIndex !== null) {
          const el = nodeEls[hoveredIndex];
          if (el) el.style.zIndex = "40";
        }
        lastHovered = hoveredIndex;
      }

      states.forEach((state, i) => {
        const node = HERO_NODES[i];
        if (!node) return;

        // Two sines at incommensurate rates: the path never visibly repeats,
        // which is what separates "alive" from "looping".
        const driftX = running ? Math.sin(t * 0.21 + node.phase) * node.drift : 0;
        const driftY = running ? Math.cos(t * 0.17 + node.phase * 1.3) * node.drift : 0;

        // Differential parallax. A node's swing is proportional to its depth, so
        // near and far nodes separate as the scene tilts — this is the cue the
        // eye actually reads as 3D. Inverted against the tilt because near
        // objects move opposite the camera.
        const parallaxX = -tilt.x * node.z * PARALLAX;
        const parallaxY = -tilt.y * node.z * PARALLAX;

        let repelX = 0;
        let repelY = 0;
        if (running && pointer.inside) {
          const dx = state.base.x + driftX - pointer.x;
          const dy = state.base.y + driftY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < REPEL_RADIUS && distance > 0.001) {
            // Linear falloff, squared for a softer shoulder — nodes at the edge
            // of the radius barely stir while the nearest one clearly yields.
            const falloff = (1 - distance / REPEL_RADIUS) ** 2;
            repelX = (dx / distance) * falloff * REPEL_STRENGTH;
            repelY = (dy / distance) * falloff * REPEL_STRENGTH;
          }
        }

        // Ease the hover weight rather than switching on it, so the pop has the
        // same inertia as everything else in the scene.
        const wantHover = hoveredIndex === i ? 1 : 0;
        state.hover += (wantHover - state.hover) * 0.14;

        // A hovered node rises slightly as it comes forward — the approach
        // itself is the translateZ below, this is just the lift off the floor.
        const liftY = -state.hover * HOVER_LIFT;

        state.target.x = driftX + repelX + parallaxX;
        state.target.y = driftY + repelY + parallaxY + liftY;

        // Easing toward the target (rather than assigning it) gives the nodes
        // weight: they lag the cursor on approach and glide back on exit.
        const rate = pointer.inside ? REPEL_EASE : DRIFT_EASE;
        state.offset.x += (state.target.x - state.offset.x) * rate;
        state.offset.y += (state.target.y - state.offset.y) * rate;

        // Remaining depth cues, all driven off the same `z` so they agree:
        // near nodes are larger and fully opaque, far nodes shrink and fade
        // into the background (aerial perspective). Hover adds its own scale on
        // top, so a lifted node reads as nearer still.
        const depth = (node.z + 1) / 2; // 0 (far) .. 1 (near)

        // Real Z translation under the panel's perspective. The resting spread
        // places each node in the slab; hover pulls it bodily toward the camera.
        // The browser derives the foreshortening, so a hovered box grows AND
        // its edges converge — the cue that separates approaching from scaling.
        const z = node.z * DEPTH_Z + state.hover * HOVER_Z;

        // Scale is left to perspective for the depth component; only a small
        // explicit bump remains for hover, so the box doesn't rely on Z alone
        // at narrow viewports where the perspective is shallow.
        const scale = SCALE_FAR + (SCALE_NEAR - SCALE_FAR) * depth + state.hover * 0.03;
        const opacity = FADE_FAR + (1 - FADE_FAR) * depth + state.hover * (1 - FADE_FAR) * 0.5;

        // The slab leans under the tilt, and a hovered node counter-rotates to
        // square up with the viewer — it turns to face you as it arrives.
        const face = 1 - state.hover;
        const rotY = tilt.x * TILT_DEG * face;
        const rotX = -tilt.y * TILT_DEG * face;

        setX[i]?.(state.offset.x);
        setY[i]?.(state.offset.y);
        setZ[i]?.(z);
        setRotX[i]?.(rotX);
        setRotY[i]?.(rotY);
        setScale[i]?.(scale);
        setOpacity[i]?.(Math.min(1, opacity));
      });

      // Re-path the edges from the positions just written, so lines and boxes
      // move as one rigid-feeling structure.
      edgeEls.forEach((path, i) => {
        const edge = HERO_EDGES[i];
        if (!edge) return;
        const a = centre(edge.from);
        const b = centre(edge.to);
        path.setAttribute(
          "d",
          `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
        );
      });

      frame = requestAnimationFrame(tick);
    };

    let frame = requestAnimationFrame(tick);

    /**
     * One timeline per packet. `progress` is tweened per leg and the position
     * is resolved from live node centres on every update, so a packet stays on
     * its wire even while both endpoints are drifting or being pushed away.
     */
    const timelines = HERO_ROUTES.map((route, routeIndex) => {
      const dot = packetEls[routeIndex];
      if (!dot) return null;

      const leg = { from: 0, to: 0, progress: 0 };
      const tl = gsap.timeline({ repeat: -1, delay: routeIndex * 0.9 });

      const place = () => {
        const a = centre(leg.from);
        const b = centre(leg.to);
        dot.setAttribute("cx", (a.x + (b.x - a.x) * leg.progress).toFixed(1));
        dot.setAttribute("cy", (a.y + (b.y - a.y) * leg.progress).toFixed(1));

        // The packet takes on the depth of the wire it is riding, interpolated
        // between its endpoints: a dot running from a far node to a near one
        // grows as it comes forward. Without this the packets sit at a constant
        // size over a scene that has depth, and read as pasted on top of it.
        const za = HERO_NODES[leg.from]?.z ?? 0;
        const zb = HERO_NODES[leg.to]?.z ?? 0;
        const z = za + (zb - za) * leg.progress;
        dot.setAttribute("r", (2.6 + ((z + 1) / 2) * 2).toFixed(2));
      };

      for (let hop = 0; hop < route.length - 1; hop += 1) {
        const from = route[hop];
        const to = route[hop + 1];
        if (from === undefined || to === undefined) continue;

        tl.set(leg, { from, to, progress: 0 });
        // Fade in on the first leg only; subsequent hops are continuous.
        if (hop === 0) tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.3 }, "<");
        tl.to(leg, {
          progress: 1,
          duration: PACKET_LEG_DURATION,
          ease: "none",
          onUpdate: place,
        });

        // Arrival pulse on the receiving node: the packet visibly delivers
        // something, which is what sells the graph as carrying traffic rather
        // than just animating.
        const arrivalEl = nodeEls[to];
        if (arrivalEl) {
          const core = arrivalEl.querySelector(".system-node-core");
          if (core) {
            tl.fromTo(
              core,
              { scale: 1 },
              { scale: 1.9, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" },
              ">-0.05",
            );
          }
        }
      }

      tl.to(dot, { opacity: 0, duration: 0.3 }).to({}, { duration: PACKET_GAP });
      return tl;
    });

    // Published so the `active` effect below can pause them without tearing the
    // simulation down and snapping every node back to rest.
    timelinesRef.current = timelines;

    return () => {
      timelinesRef.current = [];
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      if (finePointer) {
        panel.removeEventListener("pointermove", onMove);
        panel.removeEventListener("pointerleave", onLeave);
      }
      timelines.forEach((tl) => tl?.kill());
      // Return every node to rest so a remount (StrictMode, route change)
      // starts from the same state the server rendered.
      gsap.set(nodeEls, { clearProps: "transform,opacity" });
      nodeEls.forEach((el) => {
        el.style.zIndex = "";
      });
    };
  }, [panelRef, svgRef, reduceMotion, start]);

  // Packets are main-thread work with nothing to show once the hero has
  // scrolled past, so they pause with the section instead of looping behind the
  // rest of the page. The drift rAF keeps running — it has to, or the edges
  // would desync from the nodes — but idles on `activeRef`.
  useEffect(() => {
    timelinesRef.current.forEach((tl) => {
      if (!tl) return;
      if (active) tl.resume();
      else tl.pause();
    });
  }, [active]);
}
