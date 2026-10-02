import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { cn } from "@/lib/utils";

export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, style, handlePointerMove, handlePointerLeave } = useMagnetic<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}
