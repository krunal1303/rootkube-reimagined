import { useRef } from "react";

import { useMarqueeVelocity } from "@/motion/use-marquee-velocity";

const items = ["AI", "Software", "Cloud", "Automation", "Data", "DevOps", "SaaS"];

export function CapabilityMarquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  useMarqueeVelocity(trackRef);

  return (
    <div className="overflow-hidden border-b border-border py-5" aria-label="Capabilities">
      {/* `animate-marquee` stays as the reduced-motion / no-JS baseline; the
          velocity hook takes over the transform when motion is enabled. */}
      <div ref={trackRef} className="marquee-track flex w-max items-center">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            <span className="mx-8 size-1 bg-primary" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
