import { DatabaseZap } from "lucide-react";
import { motion } from "motion/react";
import { SectionLabel, reveal } from "@/components/sections/shared";

const technologyGroups = [
  { label: "INTERFACE", items: ["React", "TypeScript", "REST APIs"] },
  { label: "SYSTEMS", items: ["Node.js", "Python", "AI / ML"] },
  { label: "DATA", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { label: "OPERATIONS", items: ["AWS", "Docker", "CI/CD"] },
] as const;

export function Technology() {
  return (
    <section className="section-space overflow-hidden border-y border-border bg-surface">
      <div className="page-shell">
        <SectionLabel index="05">Technology</SectionLabel>
        <div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <motion.h2 {...reveal} className="section-heading">Built with modern technology.</motion.h2>
          <motion.p {...reveal} className="max-w-lg text-muted-foreground">We choose technology to fit the system—not the other way around. Our toolkit evolves with the problem.</motion.p>
        </div>
        <div className="tech-ecosystem mt-16">
          <div className="tech-core"><DatabaseZap className="size-6" /><span>ROOTKUBE<br/>ENGINEERING</span></div>
          {technologyGroups.map((group, i) => (
            <motion.div key={group.label} {...reveal} transition={{ ...reveal.transition, delay: i * .06 }} className="tech-group">
              <div className="font-mono text-[10px] tracking-[0.18em] text-primary">{group.label}</div>
              <div className="mt-5 flex flex-wrap gap-2">{group.items.map(item => <span key={item} className="tech-pill">{item}</span>)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
