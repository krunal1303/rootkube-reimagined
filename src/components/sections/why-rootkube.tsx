import { motion } from "motion/react";
import { SectionLabel, reveal } from "@/components/sections/shared";

const items = ["Business-first thinking", "Production-grade engineering", "Scalable architecture", "Modern cloud infrastructure", "AI-enabled solutions", "Long-term partnership"];

export function WhyRootKube() {
  return (
    <section className="section-space">
      <div className="page-shell grid gap-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <SectionLabel index="06">Why RootKube</SectionLabel>
          <motion.h2 {...reveal} className="section-heading mt-12 max-w-3xl">Engineering with <span className="text-primary">purpose.</span></motion.h2>
          <motion.p {...reveal} className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">The strongest systems balance what the business needs now with what the technology must support next.</motion.p>
        </div>
        <div className="border-t border-border">
          {items.map((item, i) => <motion.div key={item} {...reveal} className="flex items-center gap-5 border-b border-border py-6"><span className="font-mono text-[10px] text-primary">0{i+1}</span><span className="font-display text-xl">{item}</span></motion.div>)}
        </div>
      </div>
    </section>
  );
}
