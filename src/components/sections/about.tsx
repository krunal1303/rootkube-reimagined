import { motion } from "motion/react";
import { MaskedLines } from "@/components/motion/masked-lines";
import { SectionLabel, reveal } from "@/components/sections/shared";

export function About() {
  return (
    <section id="about" className="section-space border-y border-border bg-contrast text-contrast-foreground">
      <div className="page-shell">
        <SectionLabel index="07">Our story</SectionLabel>
        <MaskedLines
          className="mt-12 max-w-5xl font-display text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[.98]"
          lines={["Two friends. One obsession:", "building useful technology."]}
        />
        <div className="mt-20 grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-contrast-muted">A shared engineering mindset</p>
          <motion.div {...reveal} className="grid gap-8 sm:grid-cols-2">
            <p className="text-xl leading-8">RootKube began with a simple conviction: technology earns its place when it makes something meaningfully better.</p>
            <p className="leading-7 text-contrast-muted">That principle still shapes how we work—staying close to the problem, making deliberate technical choices and building systems intended to last.</p>
          </motion.div>
        </div>
        <div className="mt-20 grid border-l border-t border-contrast-border sm:grid-cols-3">
          {["Built for real operations", "Designed to evolve", "Engineered as a partnership"].map((text, i) => <motion.div key={text} {...reveal} className="border-b border-r border-contrast-border p-7"><span className="font-mono text-[10px] text-contrast-muted">0{i+1}</span><p className="mt-10 font-display text-2xl">{text}</p></motion.div>)}
        </div>
      </div>
    </section>
  );
}
