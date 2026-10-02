import { useRef } from "react";
import { useSpring, useMotionValue, useReducedMotion } from "motion/react";

const SPRING = { stiffness: 220, damping: 20, mass: 0.4 };

export function useMagnetic<T extends HTMLElement>(strength = 0.35, radius = 70) {
  const ref = useRef<T>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const handlePointerMove = (event: React.PointerEvent<T>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(relX, relY);
    if (distance > radius) return;
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, style: { x: springX, y: springY }, handlePointerMove, handlePointerLeave };
}
