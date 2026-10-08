import { useRef } from "react";

import { useMarqueeVelocity } from "@/motion/use-marquee-velocity";

const items = ["AI", "Software", "Cloud", "Automation", "Data", "DevOps", "SaaS"];

export function CapabilityMarquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  useMarqueeVelocity(trackRef);

  return (
    <div className="capability-band border-b border-border py-5" aria-label="Capabilities">
      {/* No CSS animation class here on purpose: the hook owns `transform`, and
          a keyframe animation on the same element would write a competing one.
          Without JS (or under reduced motion) the strip simply sits still with
          every label legible, which is the correct resting state for a band
          that is decorative rather than informational. */}
      <div ref={trackRef} className="marquee-track flex w-max items-center">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            data-marquee-item
            className="marquee-item flex items-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            <span className="mx-8 size-1 bg-primary" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
