import { motion } from "motion/react";
import { MaskedLines } from "@/components/motion/masked-lines";
import { SectionLabel, revealSoft } from "@/components/sections/shared";

export function Introduction() {
  return (
    <section id="intro" className="section-space">
      <div className="page-shell grid gap-10 lg:grid-cols-[.35fr_1.65fr]">
        <SectionLabel index="01">Our point of view</SectionLabel>
        <div>
          <MaskedLines
            className="section-heading max-w-5xl"
            lines={[
              "Technology should solve problems,",
              <span className="text-muted-foreground">not create more complexity.</span>,
            ]}
          />
          <motion.div
            {...revealSoft}
            transition={{ ...revealSoft.transition, delay: 0.14 }}
            className="mt-12 grid gap-8 border-t border-border pt-8 sm:grid-cols-2"
          >
            <p className="text-xl leading-8 text-foreground">
              We work with businesses to design, build, modernize and scale the digital systems they
              depend on.
            </p>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              From first architecture decisions to production operations, every engagement is
              grounded in the business outcome—not technology for technology’s sake.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
