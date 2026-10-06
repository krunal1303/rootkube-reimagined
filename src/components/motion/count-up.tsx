import { useRef } from "react";

import { useGsap } from "@/motion/use-gsap";

/**
 * Counts to `to` when scrolled into view.
 *
 * The server and first client render both output the final value, so there's no
 * hydration mismatch and no layout shift — GSAP resets it to the start value
 * only once an effect has confirmed we're on the client with motion enabled.
 * Under reduced motion `useGsap` skips the effect entirely, leaving the final
 * number in place.
 */
export function CountUp({
  to,
  pad = true,
  className,
  duration = 1.1,
}: {
  to: number;
  /** Zero-pad to two digits, matching the site's `01`-style numbering. */
  pad?: boolean;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  const format = (value: number) => {
    const rounded = Math.round(value);
    return pad ? String(rounded).padStart(2, "0") : String(rounded);
  };

  useGsap(
    ref,
    ({ gsap, scope }) => {
      const counter = { value: 0 };

      gsap.to(counter, {
        value: to,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          scope.textContent = format(counter.value);
        },
        scrollTrigger: {
          trigger: scope,
          start: "top 88%",
          once: true,
          // Only blank out the number once the trigger is live, so a visitor who
          // lands mid-page never sees it flash to zero.
          onEnter: () => {
            scope.textContent = format(0);
          },
        },
      });
    },
    [to],
  );

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
