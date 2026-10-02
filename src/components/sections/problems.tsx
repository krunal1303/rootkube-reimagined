import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { SectionLabel, reveal } from "@/components/sections/shared";

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
          <motion.h2 {...reveal} className="section-heading mt-12 max-w-xl">Built around your problems.</motion.h2>
        </div>
        <div className="border-t border-border">
          {problems.map(([problem, answer], i) => (
            <motion.div key={problem} {...reveal} className="problem-row group">
              <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              <h3 className="font-display text-xl sm:text-2xl">{problem}</h3>
              <div className="flex items-center justify-between gap-4 text-sm text-primary"><span>{answer}</span><ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
