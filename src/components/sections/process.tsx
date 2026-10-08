import { useRef } from "react";
import { motion } from "motion/react";

import { CountUp } from "@/components/motion/count-up";
import { SplitHeading } from "@/components/motion/split-heading";
import { SectionLabel, revealRise, stagger } from "@/components/sections/shared";
import { useGsap } from "@/motion/use-gsap";

const process = [
  ["Discover", "Understand the business, users and technical requirements."],
  ["Design", "Design the product experience and technical architecture."],
  ["Engineer", "Build scalable, maintainable production software."],
  ["Deploy", "Release securely using modern cloud and DevOps practices."],
  ["Scale", "Monitor, optimize and continuously improve."],
] as const;

export function Process() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  // The connector draws itself across the five steps as you scroll through the
  // section, so the row reads as one pipeline rather than five separate cards.
  useGsap(gridRef, ({ gsap, scope }) => {
    const line = scope.querySelector<HTMLElement>(".process-line-fill");
    if (!line) return;

    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top 80%",
          end: "bottom 65%",
          scrub: 0.4,
        },
      },
    );

    gsap.from(scope.querySelectorAll(".process-dot"), {
      scale: 0,
      stagger: 0.12,
      duration: 0.5,
      ease: "back.out(2)",
      scrollTrigger: { trigger: scope, start: "top 80%", once: true },
    });
  });

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionLabel index="04">Our process</SectionLabel>
        <SplitHeading className="section-heading mt-12">From idea to production.</SplitHeading>
        <div ref={gridRef} className="process-grid mt-16">
          <div className="process-line" aria-hidden="true">
            <div className="process-line-fill" />
          </div>
          {process.map(([title, description], i) => (
            <motion.article
              key={title}
              {...revealRise}
              transition={{ ...revealRise.transition, delay: stagger(i, 0.07) }}
              className="process-step group"
            >
              <span className="process-dot" />
              <CountUp to={i + 1} className="font-mono text-xs text-primary" />
              <h3 className="mt-12 font-display text-2xl transition-colors duration-300 group-hover:text-primary">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
