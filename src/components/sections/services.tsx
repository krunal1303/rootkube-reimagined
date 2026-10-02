import { ArrowUpRight, Braces, BrainCircuit, CloudCog, Layers3, Network, Workflow } from "lucide-react";
import { motion } from "motion/react";
import { SectionLabel, reveal } from "@/components/sections/shared";

const services = [
  {
    title: "AI & Intelligent Systems",
    description: "AI-powered workflows, document processing, intelligent automation and business applications.",
    icon: BrainCircuit,
    code: "01 / INTELLIGENCE",
  },
  {
    title: "Custom Software",
    description: "Scalable web applications, enterprise platforms and digital products engineered around your business.",
    icon: Braces,
    code: "02 / SOFTWARE",
  },
  {
    title: "Cloud & DevOps",
    description: "Cloud architecture, migration, deployment, infrastructure automation and production operations.",
    icon: CloudCog,
    code: "03 / INFRASTRUCTURE",
  },
  {
    title: "Business Automation",
    description: "Reliable software automation and integrations that replace repetitive manual workflows.",
    icon: Workflow,
    code: "04 / AUTOMATION",
  },
  {
    title: "SaaS & Digital Products",
    description: "Transform business ideas into robust, scalable SaaS products and digital platforms.",
    icon: Layers3,
    code: "05 / PRODUCTS",
  },
  {
    title: "System Integration",
    description: "Connect APIs, databases, third-party systems and enterprise applications into one reliable whole.",
    icon: Network,
    code: "06 / INTEGRATION",
  },
] as const;

export function Services() {
  return (
    <section id="services" className="section-space border-y border-border bg-surface">
      <div className="page-shell">
        <SectionLabel index="02">Capabilities</SectionLabel>
        <motion.div {...reveal} className="mt-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="section-heading">What we build</h2>
          <p className="max-w-md text-muted-foreground">Purpose-built systems where product thinking, engineering discipline and business context work together.</p>
        </motion.div>
        <div className="mt-16 grid border-l border-t border-border md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.article key={service.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.04 }} className="service-card group">
                <div className="service-card-lattice" aria-hidden="true" />
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">{service.code}</span>
                  <Icon className="size-6 text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" strokeWidth={1.3} />
                </div>
                <div className="mt-20">
                  <h3 className="font-display text-2xl font-medium">{service.title}</h3>
                  <p className="mt-4 max-w-sm leading-7 text-muted-foreground">{service.description}</p>
                </div>
                <ArrowUpRight className="absolute bottom-7 right-7 size-5 translate-y-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
