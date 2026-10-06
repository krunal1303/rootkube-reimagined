import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { CountUp } from "@/components/motion/count-up";
import { MaskedLines } from "@/components/motion/masked-lines";
import { SectionLabel, revealSlide, stagger } from "@/components/sections/shared";

const problems = [
  ["Too many manual processes", "Automation"],
  ["Legacy systems slowing you down", "Modernization"],
  ["Disconnected applications", "System Integration"],
  ["Data trapped in documents", "AI & Intelligent Processing"],
  ["An idea that needs to become a product", "Product Engineering"],
  ["Growing infrastructure complexity", "Cloud & DevOps"],
] as const;

export function Problems() {
  return (
    <section id="solutions" className="section-space">
      <div className="page-shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionLabel index="03">Business outcomes</SectionLabel>
          <MaskedLines
            className="section-heading mt-12 max-w-xl"
            lines={["Built around", "your problems."]}
          />
        </div>
        <div className="border-t border-border">
          {problems.map(([problem, answer], i) => (
            <motion.div
              key={problem}
              {...revealSlide}
              transition={{ ...revealSlide.transition, delay: stagger(i, 0.06) }}
              className="problem-row group"
            >
              <CountUp to={i + 1} className="font-mono text-[10px] text-muted-foreground" />
              <h3 className="font-display text-xl transition-transform duration-400 ease-out group-hover:translate-x-1.5 sm:text-2xl">
                {problem}
              </h3>
              <div className="flex items-center justify-between gap-4 text-sm text-primary">
                <span>{answer}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
