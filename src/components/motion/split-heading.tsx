import { useRef, type ElementType, type ReactNode } from "react";

import { useSplitReveal } from "@/motion/use-split-reveal";

/**
 * Headline whose words rise into place on scroll.
 *
 * Unlike MaskedLines, the text is plain children rather than an array of lines:
 * SplitText derives the lines itself from however the text actually wraps, so
 * the copy doesn't carry hard-coded line breaks that only look right at one
 * viewport width. That's what makes this the responsive-correct option.
 *
 * The full text ships in the server HTML and is never hidden by CSS — the
 * reveal only begins once SplitText has run on the client, so the headline is
 * readable with JS disabled and under reduced motion.
 */
export function SplitHeading({
  children,
  as: Tag = "h2",
  className,
  mode = "words",
  stagger,
  duration,
  delay,
  start,
  enabled,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  mode?: "words" | "chars";
  stagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  /** Gate the reveal on an external signal, e.g. the preloader finishing. */
  enabled?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  // Built conditionally rather than spread wholesale: exactOptionalPropertyTypes
  // distinguishes "absent" from "explicitly undefined", and the hook's defaults
  // only apply to genuinely absent keys.
  useSplitReveal(ref, {
    mode,
    ...(stagger !== undefined && { stagger }),
    ...(duration !== undefined && { duration }),
    ...(delay !== undefined && { delay }),
    ...(start !== undefined && { start }),
    ...(enabled !== undefined && { enabled }),
  });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
