import { useRef } from "react";
import { DatabaseZap } from "lucide-react";
import { motion } from "motion/react";

import { SplitHeading } from "@/components/motion/split-heading";
import { SectionLabel, revealSoft, stagger } from "@/components/sections/shared";
import { useGsap } from "@/motion/use-gsap";

const technologyGroups = [
  { label: "INTERFACE", items: ["React", "TypeScript", "REST APIs"] },
  { label: "SYSTEMS", items: ["Node.js", "Python", "AI / ML"] },
  { label: "DATA", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { label: "OPERATIONS", items: ["AWS", "Docker", "CI/CD"] },
] as const;

export function Technology() {
  const ecosystemRef = useRef<HTMLDivElement | null>(null);

  // Pills resolve individually rather than as four blocks, so the stack reads
  // as a toolkit assembling itself.
  useGsap(ecosystemRef, ({ gsap, scope }) => {
    gsap.from(scope.querySelectorAll(".tech-pill"), {
      opacity: 0,
      y: 12,
      scale: 0.94,
      duration: 0.5,
      ease: "power3.out",
      stagger: { each: 0.03, from: "start" },
      scrollTrigger: { trigger: scope, start: "top 78%", once: true },
    });
  });

  return (
    <section className="section-space overflow-hidden border-y border-border bg-surface">
      <div className="page-shell">
        <SectionLabel index="05">Technology</SectionLabel>
        <div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <SplitHeading className="section-heading">Built with modern technology.</SplitHeading>
          <motion.p {...revealSoft} className="max-w-lg text-muted-foreground">
            We choose technology to fit the system—not the other way around. Our toolkit evolves
            with the problem.
          </motion.p>
        </div>
        <div ref={ecosystemRef} className="tech-ecosystem mt-16">
          <div className="tech-core">
            <DatabaseZap className="size-6 tech-core-icon" />
            <span>
              ROOTKUBE
              <br />
              ENGINEERING
            </span>
          </div>
          {technologyGroups.map((group, i) => (
            <motion.div
              key={group.label}
              {...revealSoft}
              transition={{ ...revealSoft.transition, delay: stagger(i, 0.06) }}
              className="tech-group"
            >
              <div className="font-mono text-[10px] tracking-[0.18em] text-primary">
                {group.label}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="tech-pill">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
