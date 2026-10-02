import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { MaskedLines } from "@/components/motion/masked-lines";
import { reveal } from "@/components/sections/shared";

const nodes = [
  { label: "AI", x: "14%", y: "20%", delay: 0 },
  { label: "SOFTWARE", x: "61%", y: "12%", delay: 0.5 },
  { label: "CLOUD", x: "73%", y: "56%", delay: 1 },
  { label: "DATA", x: "18%", y: "72%", delay: 1.5 },
  { label: "AUTOMATION", x: "44%", y: "45%", delay: 2 },
];

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

const signalPath = "M90 120 L360 72 L438 336 L264 270 L108 432 L438 336";
const dimPath = "M90 120 L264 270 L360 72 M108 432 L264 270";

function HeroSystem() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hero-system" aria-hidden="true">
      <div className="system-grid" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 600"
        preserveAspectRatio="none"
      >
        <motion.path
          d={signalPath}
          className="system-path"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.9,
            delay: reduceMotion ? 0 : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        <motion.path
          d={dimPath}
          className="system-path system-path-dim"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            delay: reduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        {/* Markup stays identical regardless of reduced motion: the server always
            renders with it off, so any branch here mismatches on hydration.
            `.signal-dot` is hidden via the reduced-motion media query instead. */}
        <circle r="4" className="signal-dot">
          <animateMotion dur="5s" begin="1.4s" repeatCount="indefinite" path={signalPath} />
        </circle>
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

      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          className="system-node"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={
            reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -7, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.4, delay: 0.5 + i * 0.07 },
                  scale: { duration: 0.4, delay: 0.5 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 4, repeat: Infinity, delay: node.delay + 1.2, ease: "easeInOut" },
                }
          }
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
  return (
    <section
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
          <MaskedLines
            as="h1"
            className="max-w-5xl font-display text-[clamp(3.5rem,8.4vw,8.7rem)] font-medium leading-[0.89] text-balance"
            lines={[
              "We build technology",
              <>
                that moves businesses <span className="text-primary">forward.</span>
              </>,
            ]}
          />
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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
        >
          <HeroSystem />
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
