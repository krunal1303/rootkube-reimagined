import type { ElementType, ReactNode } from "react";
import { motion } from "motion/react";

const lineVariants = {
  initial: { y: "100%" },
  whileInView: { y: "0%" },
};

export function MaskedLines({
  lines,
  as: Tag = "h2",
  className,
  animate,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Controlled trigger (e.g. a preloader handoff) instead of whileInView. */
  animate?: "initial" | "visible";
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={lineVariants}
            initial="initial"
            {...(animate ? { animate: animate === "visible" ? "whileInView" : "initial" } : { whileInView: "whileInView", viewport: { once: true, margin: "-80px" } })}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
