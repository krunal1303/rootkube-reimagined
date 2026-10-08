import { ScrambleText } from "@/components/motion/scramble-text";
import { EASE } from "@/motion/ease";

export const navItems = [
  ["Services", "services"],
  ["Solutions", "solutions"],
  ["About", "about"],
  ["Contact", "contact"],
] as const;

const VIEWPORT = { once: true, margin: "-80px" } as const;

export const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, ease: EASE },
};

/**
 * Differentiated reveals. One shared `reveal` across every section reads as no
 * animation at all by the third screen, so each section gets a motion that
 * matches the shape of its own content: `revealSoft` for supporting copy that
 * shouldn't compete, `revealRise` for cards that should feel lifted into place,
 * `revealSlide` for list rows that read left-to-right.
 *
 * All of them land on the same easing curve so the vocabulary stays coherent.
 */
export const revealSoft = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.7, ease: EASE },
};

export const revealRise = {
  initial: { opacity: 0, y: 44, scale: 0.985 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: VIEWPORT,
  transition: { duration: 0.8, ease: EASE },
};

export const revealSlide = {
  initial: { opacity: 0, x: -24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.6, ease: EASE },
};

/** Per-item delay for staggered lists, capped so long lists don't crawl. */
export function stagger(index: number, step = 0.05, max = 0.4) {
  return Math.min(index * step, max);
}

export function Logo() {
  return (
    <a href="#top" className="group inline-flex items-center gap-2.5" aria-label="RootKube home">
      <span
        className="grid size-7 grid-cols-2 gap-0.5 border border-primary/60 p-1 transition-transform duration-300 group-hover:rotate-45"
        aria-hidden="true"
      >
        <span className="bg-primary" />
        <span className="border border-primary/70" />
        <span className="border border-primary/70" />
        <span className="bg-accent" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-foreground">
        ROOTKUBE
      </span>
    </a>
  );
}

export function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="section-label">
      {/* The index scrambles through digits only; the words use the full
          uppercase pool. Mixing pools keeps the two from resolving in visual
          lockstep, which looked mechanical. */}
      <ScrambleText chars="0123456789" duration={0.7}>
        {index}
      </ScrambleText>
      <ScrambleText duration={1} delay={0.08}>
        {children}
      </ScrambleText>
    </div>
  );
}
