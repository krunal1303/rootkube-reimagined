import { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { SplitHeading } from "@/components/motion/split-heading";
import { reveal } from "@/components/sections/shared";
import { usePreloadDone } from "@/motion/preload-context";
import { useHeroParallax } from "@/motion/use-hero-parallax";
import { HeroCursorLines } from "@/motion/hero-cursor-lines";
import { useHeroPathDraw } from "@/motion/use-hero-path-draw";
import { useHeroNetwork } from "@/motion/use-hero-network";
import { HERO_EDGES, HERO_NODES, HERO_ROUTES, incidentEdges } from "@/motion/hero-network";

const noiseField = [
  { x: "22%", y: "14%" },
  { x: "68%", y: "9%" },
  { x: "84%", y: "33%" },
  { x: "8%", y: "48%" },
  { x: "52%", y: "62%" },
  { x: "31%", y: "81%" },
  { x: "77%", y: "77%" },
  { x: "46%", y: "28%" },
  { x: "91%", y: "58%" },
];

/**
 * Fallback geometry for the pre-hydration / reduced-motion diagram.
 *
 * The simulation rewrites every edge's `d` from live node centres once it
 * starts, but the server has no layout to measure, so edges ship with a path
 * derived from the same fractional coordinates against the viewBox. That keeps
 * the SSR markup and the first client render byte-identical, and leaves a
 * correct, complete diagram for anyone who never gets the simulation.
 */
const VIEW = 600;

function staticEdgePath(edge: (typeof HERO_EDGES)[number]) {
  const a = HERO_NODES[edge.from];
  const b = HERO_NODES[edge.to];
  if (!a || !b) return "";
  return `M${a.x * VIEW} ${a.y * VIEW} L${b.x * VIEW} ${b.y * VIEW}`;
}

function HeroSystem({ active = true, draw = false }: { active?: boolean; draw?: boolean }) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // DrawSVG rather than Motion's pathLength: it strokes each edge with its own
  // timing, so the graph reads as being traced link by link instead of every
  // edge fading up at once.
  const traced = useHeroPathDraw(svgRef, draw);
  // Takes over once the trace finishes: drift, pointer repulsion, live edges
  // and packet traffic. Gated on `traced` rather than `draw` so it never writes
  // `d` while DrawSVG is still stroking against a measured path length.
  useHeroNetwork(panelRef, svgRef, { active, start: traced, hovered });

  const lit = hovered === null ? null : incidentEdges(hovered);

  return (
    <div
      ref={panelRef}
      className={`hero-system ${active ? "" : "hero-system-idle"}`}
      aria-hidden="true"
    >
      <div className="system-grid" />
      {/* Once the simulation starts it writes `d` in panel pixels and swaps the
          viewBox to match, so edges track the real node boxes at any aspect
          ratio. Until then this square viewBox renders the fallback paths. */}
      <svg ref={svgRef} className="hero-system-svg" viewBox={`0 0 ${VIEW} ${VIEW}`}>
        {HERO_EDGES.map((edge, i) => (
          <path
            key={`${edge.from}-${edge.to}`}
            data-edge={i}
            d={staticEdgePath(edge)}
            className={[
              "system-path",
              edge.kind === "dim" ? "system-path-dim" : "",
              edge.kind === "dim" ? "hero-draw-dim" : "hero-draw",
              lit?.includes(i) ? "system-path-lit" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
        {/* One dot per route. They start hidden and are positioned entirely by
            the hook, so with JS off they are simply absent. */}
        {HERO_ROUTES.map((_, i) => (
          <circle key={i} data-packet={i} r="3.5" className="signal-dot" opacity="0" />
        ))}
      </svg>

      {/* These settle at opacity 0 either way, so reduced motion only shortens
          the transition — the rendered tree is unchanged. */}
      {noiseField.map((point, i) => (
        <motion.span
          key={i}
          className="noise-point"
          style={{ left: point.x, top: point.y }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.15 + i * 0.03,
            ease: "easeIn",
          }}
        />
      ))}

      {HERO_NODES.map((node, i) => (
        <motion.div
          key={node.label}
          data-node={i}
          className={`system-node ${hovered === i ? "system-node-hot" : ""}`}
          style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
          onPointerEnter={() => setHovered(i)}
          onPointerLeave={() => setHovered((current) => (current === i ? null : current))}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            delay: reduceMotion ? 0 : 0.5 + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="system-node-core" />
          {node.label}
        </motion.div>
      ))}

      <motion.div
        className="system-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 1.6 }}
      >
        <span className="status-dot" />
        SYSTEMS CONNECTED
      </motion.div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const preloadDone = usePreloadDone();
  const heroActive = useHeroParallax(sectionRef, panelRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[94svh] items-end overflow-hidden border-b border-border pt-28"
    >
      <div className="hero-beam" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="page-shell relative z-10 grid gap-12 pb-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:pb-16">
        <div>
          <motion.div
            {...reveal}
            className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className="status-dot" /> Digital Product Engineering
          </motion.div>
          <SplitHeading
            as="h1"
            className="max-w-5xl font-display text-[clamp(3.5rem,8.4vw,8.7rem)] font-medium leading-[0.89] text-balance"
            enabled={preloadDone}
            stagger={0.035}
            duration={1}
          >
            We build technology that moves businesses <span className="text-primary">forward.</span>
          </SplitHeading>
          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.18 }}
            className="mt-9 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              RootKube engineers digital products, intelligent systems, cloud infrastructure and
              automation that solve real business problems.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticButton>
                <Button asChild size="lg" className="h-12 rounded-none px-6">
                  <a href="#contact">
                    Start a Project <ArrowUpRight />
                  </a>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-none bg-transparent px-6"
                >
                  <a href="#services">
                    Explore Our Services <ArrowDown />
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="relative"
        >
          <HeroSystem active={heroActive} draw={preloadDone} />
          <HeroCursorLines targetRef={panelRef} />
        </motion.div>
      </div>
      <a
        href="#intro"
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground xl:flex"
      >
        Scroll to explore{" "}
        <span className="h-8 w-px bg-border">
          <span className="block h-3 w-px animate-scroll-line bg-primary" />
        </span>
      </a>
    </section>
  );
}
