import { motion } from "motion/react";

import { CountUp } from "@/components/motion/count-up";
import { MaskedLines } from "@/components/motion/masked-lines";
import { SectionLabel, revealSlide, revealSoft, stagger } from "@/components/sections/shared";

const items = [
  "Business-first thinking",
  "Production-grade engineering",
  "Scalable architecture",
  "Modern cloud infrastructure",
  "AI-enabled solutions",
  "Long-term partnership",
];

export function WhyRootKube() {
  return (
    <section className="section-space">
      <div className="page-shell grid gap-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <SectionLabel index="06">Why RootKube</SectionLabel>
          <MaskedLines
            className="section-heading mt-12 max-w-3xl"
            lines={["Engineering with", <span className="text-primary">purpose.</span>]}
          />
          <motion.p
            {...revealSoft}
            transition={{ ...revealSoft.transition, delay: 0.15 }}
            className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground"
          >
            The strongest systems balance what the business needs now with what the technology must
            support next.
          </motion.p>
        </div>
        <div className="border-t border-border">
          {items.map((item, i) => (
            <motion.div
              key={item}
              {...revealSlide}
              transition={{ ...revealSlide.transition, delay: stagger(i, 0.06) }}
              className="value-row group"
            >
              <CountUp to={i + 1} className="font-mono text-[10px] text-primary" />
              <span className="font-display text-xl transition-transform duration-400 ease-out group-hover:translate-x-1.5">
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
