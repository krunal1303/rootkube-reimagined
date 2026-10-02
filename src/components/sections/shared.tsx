import type { ReactNode } from "react";

export const navItems = [
  ["Services", "services"],
  ["Solutions", "solutions"],
  ["About", "about"],
  ["Contact", "contact"],
] as const;

export const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export function Logo() {
  return (
    <a href="#top" className="group inline-flex items-center gap-2.5" aria-label="RootKube home">
      <span className="grid size-7 grid-cols-2 gap-0.5 border border-primary/60 p-1 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true">
        <span className="bg-primary" />
        <span className="border border-primary/70" />
        <span className="border border-primary/70" />
        <span className="bg-accent" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-foreground">ROOTKUBE</span>
    </a>
  );
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return <div className="section-label"><span>{index}</span><span>{children}</span></div>;
}
