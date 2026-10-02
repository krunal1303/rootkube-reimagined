export function CapabilityMarquee() {
  const items = ["AI", "Software", "Cloud", "Automation", "Data", "DevOps", "SaaS"];
  return (
    <div className="overflow-hidden border-b border-border py-5" aria-label="Capabilities">
      <div className="animate-marquee flex w-max items-center">
        {[...items, ...items].map((item, i) => <span key={`${item}-${i}`} className="flex items-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"><span className="mx-8 size-1 bg-primary" />{item}</span>)}
      </div>
    </div>
  );
}
