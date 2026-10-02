import { motion } from "motion/react";
import { SectionLabel, reveal } from "@/components/sections/shared";

const process = [
  ["01", "Discover", "Understand the business, users and technical requirements."],
  ["02", "Design", "Design the product experience and technical architecture."],
  ["03", "Engineer", "Build scalable, maintainable production software."],
  ["04", "Deploy", "Release securely using modern cloud and DevOps practices."],
  ["05", "Scale", "Monitor, optimize and continuously improve."],
] as const;

export function Process() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionLabel index="04">Our process</SectionLabel>
        <motion.h2 {...reveal} className="section-heading mt-12">From idea to production.</motion.h2>
        <div className="process-grid mt-16">
          {process.map(([num, title, description], i) => (
            <motion.article key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="process-step">
              <span className="process-dot" /><span className="font-mono text-xs text-primary">{num}</span><h3 className="mt-12 font-display text-2xl">{title}</h3><p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
