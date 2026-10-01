import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Braces,
  BrainCircuit,
  CloudCog,
  DatabaseZap,
  Layers3,
  Menu,
  Network,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  ["Services", "services"],
  ["Solutions", "solutions"],
  ["Work", "work"],
  ["About", "about"],
  ["Contact", "contact"],
] as const;

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

const problems = [
  ["Too many manual processes", "Automation"],
  ["Legacy systems slowing you down", "Modernization"],
  ["Disconnected applications", "System Integration"],
  ["Data trapped in documents", "AI & Intelligent Processing"],
  ["An idea that needs to become a product", "Product Engineering"],
  ["Growing infrastructure complexity", "Cloud & DevOps"],
] as const;

const projects = [
  {
    name: "KYCPlus",
    category: "Financial Technology / KYC / Enterprise",
    description: "A structured verification experience designed to turn complex KYC workflows into clear, auditable decisions.",
    tags: ["Enterprise workflows", "Data", "Compliance"],
    variant: "kyc",
  },
  {
    name: "AZAPI",
    category: "AI / OCR / Automation",
    description: "An intelligent processing system that converts document-heavy operations into fast, usable business data.",
    tags: ["AI / ML", "OCR", "Automation"],
    variant: "azapi",
  },
  {
    name: "BOSS",
    category: "SaaS / Business Management",
    description: "A connected operational platform built to make everyday business management more visible and manageable.",
    tags: ["SaaS", "Operations", "Analytics"],
    variant: "boss",
  },
] as const;

const process = [
  ["01", "Discover", "Understand the business, users and technical requirements."],
  ["02", "Design", "Design the product experience and technical architecture."],
  ["03", "Engineer", "Build scalable, maintainable production software."],
  ["04", "Deploy", "Release securely using modern cloud and DevOps practices."],
  ["05", "Scale", "Monitor, optimize and continuously improve."],
] as const;

const technologyGroups = [
  { label: "INTERFACE", items: ["React", "TypeScript", "REST APIs"] },
  { label: "SYSTEMS", items: ["Node.js", "Python", "AI / ML"] },
  { label: "DATA", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { label: "OPERATIONS", items: ["AWS", "Docker", "CI/CD"] },
] as const;

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

function Logo() {
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

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className={`page-shell flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="nav-link">{label}</a>
          ))}
        </nav>
        <Button asChild className="hidden h-10 rounded-none px-5 md:inline-flex">
          <a href="#contact">Start a Project <ArrowUpRight /></a>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent className="w-full border-l border-border bg-background p-7 sm:max-w-md">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <Logo />
            <nav className="mt-20 flex flex-col" aria-label="Mobile navigation">
              {navItems.map(([label, id], index) => (
                <SheetClose asChild key={id}>
                  <a href={`#${id}`} className="flex items-center justify-between border-b border-border py-5 font-display text-3xl text-foreground">
                    {label}<span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  </a>
                </SheetClose>
              ))}
            </nav>
            <SheetClose asChild>
              <Button asChild className="mt-10 h-12 w-full rounded-none"><a href="#contact">Start a Project <ArrowUpRight /></a></Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return <div className="section-label"><span>{index}</span><span>{children}</span></div>;
}

function HeroSystem() {
  const reduceMotion = useReducedMotion();
  const nodes = [
    { label: "AI", x: "14%", y: "20%", delay: 0 },
    { label: "SOFTWARE", x: "61%", y: "12%", delay: 0.5 },
    { label: "CLOUD", x: "73%", y: "56%", delay: 1 },
    { label: "DATA", x: "18%", y: "72%", delay: 1.5 },
    { label: "AUTOMATION", x: "44%", y: "45%", delay: 2 },
  ];
  return (
    <div className="hero-system" aria-hidden="true">
      <div className="system-grid" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 600" preserveAspectRatio="none">
        <path d="M90 120 L360 72 L438 336 L264 270 L108 432 L438 336" className="system-path" />
        <path d="M90 120 L264 270 L360 72 M108 432 L264 270" className="system-path system-path-dim" />
        {!reduceMotion && <circle r="4" className="signal-dot"><animateMotion dur="5s" repeatCount="indefinite" path="M90 120 L360 72 L438 336 L264 270 L108 432" /></circle>}
      </svg>
      {nodes.map((node) => (
        <motion.div
          key={node.label}
          className="system-node"
          style={{ left: node.x, top: node.y }}
          animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
        >
          <span className="system-node-core" />{node.label}
        </motion.div>
      ))}
      <div className="system-status"><span className="status-dot" />SYSTEMS CONNECTED</div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative flex min-h-[94svh] items-end overflow-hidden border-b border-border pt-28">
      <div className="hero-beam" aria-hidden="true" />
      <div className="page-shell relative z-10 grid w-full gap-12 pb-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:pb-16">
        <div>
          <motion.div {...reveal} className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="status-dot" /> Digital Product Engineering
          </motion.div>
          <motion.h1 {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="max-w-5xl font-display text-[clamp(3.5rem,8.4vw,8.7rem)] font-medium leading-[0.89] text-balance">
            We build technology that moves businesses <span className="text-primary">forward.</span>
          </motion.h1>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.18 }} className="mt-9 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              RootKube engineers digital products, intelligent systems, cloud infrastructure and automation that solve real business problems.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-none px-6"><a href="#contact">Start a Project <ArrowUpRight /></a></Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-none bg-transparent px-6"><a href="#work">Explore Our Work <ArrowDown /></a></Button>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.25 }}>
          <HeroSystem />
        </motion.div>
      </div>
      <a href="#intro" className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground xl:flex">
        Scroll to explore <span className="h-8 w-px bg-border"><span className="block h-3 w-px animate-scroll-line bg-primary" /></span>
      </a>
    </section>
  );
}

function CapabilityMarquee() {
  const items = ["AI", "Software", "Cloud", "Automation", "Data", "DevOps", "SaaS"];
  return (
    <div className="overflow-hidden border-b border-border py-5" aria-label="Capabilities">
      <div className="animate-marquee flex w-max items-center">
        {[...items, ...items].map((item, i) => <span key={`${item}-${i}`} className="flex items-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"><span className="mx-8 size-1 bg-primary" />{item}</span>)}
      </div>
    </div>
  );
}

function Introduction() {
  return (
    <section id="intro" className="section-space">
      <div className="page-shell grid gap-10 lg:grid-cols-[.35fr_1.65fr]">
        <SectionLabel index="01">Our point of view</SectionLabel>
        <div>
          <motion.h2 {...reveal} className="section-heading max-w-5xl">Technology should solve problems, <span className="text-muted-foreground">not create more complexity.</span></motion.h2>
          <motion.div {...reveal} className="mt-12 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
            <p className="text-xl leading-8 text-foreground">We work with businesses to design, build, modernize and scale the digital systems they depend on.</p>
            <p className="max-w-md text-base leading-7 text-muted-foreground">From first architecture decisions to production operations, every engagement is grounded in the business outcome—not technology for technology’s sake.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Services() {
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

function Problems() {
  return (
    <section id="solutions" className="section-space">
      <div className="page-shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionLabel index="03">Business outcomes</SectionLabel>
          <motion.h2 {...reveal} className="section-heading mt-12 max-w-xl">Built around your problems.</motion.h2>
        </div>
        <div className="border-t border-border">
          {problems.map(([problem, answer], i) => (
            <motion.div key={problem} {...reveal} className="problem-row group">
              <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              <h3 className="font-display text-xl sm:text-2xl">{problem}</h3>
              <div className="flex items-center justify-between gap-4 text-sm text-primary"><span>{answer}</span><ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ variant, name }: { variant: string; name: string }) {
  if (variant === "kyc") return (
    <div className="project-screen screen-kyc" role="img" aria-label={`${name} interface concept`}>
      <div className="screen-sidebar"><div className="screen-logo" />{[1,2,3,4,5].map(i => <span key={i} />)}</div>
      <div className="screen-body"><div className="screen-bar" /><div className="screen-title" /><div className="screen-stats">{["91%", "24", "07"].map(v => <div key={v}><strong>{v}</strong><span /></div>)}</div><div className="screen-table">{[1,2,3,4].map(i => <div key={i}><span /><span /><span /><b /></div>)}</div></div>
    </div>
  );
  if (variant === "azapi") return (
    <div className="project-screen screen-azapi" role="img" aria-label={`${name} interface concept`}>
      <div className="document"><span className="doc-tag">INVOICE</span>{[1,2,3,4,5,6].map(i => <i key={i} />)}</div>
      <div className="scan-line" />
      <div className="data-panel"><span>EXTRACTED DATA</span>{["Supplier", "Date", "Amount", "Reference"].map(v => <div key={v}><small>{v}</small><b /></div>)}</div>
    </div>
  );
  return (
    <div className="project-screen screen-boss" role="img" aria-label={`${name} interface concept`}>
      <div className="boss-top"><span /><span /></div><div className="boss-grid"><div className="boss-chart"><span>OPERATIONS</span><div className="chart-bars">{[42,68,51,82,73,91,76].map((h,i) => <i key={i} style={{ height: `${h}%` }} />)}</div></div><div className="boss-ring"><span>84<small>%</small></span></div><div className="boss-list">{[1,2,3].map(i => <div key={i}><span /><b /></div>)}</div></div>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="section-space border-y border-border bg-surface">
      <div className="page-shell">
        <SectionLabel index="04">Selected work</SectionLabel>
        <motion.h2 {...reveal} className="section-heading mt-12">Built for the real world.</motion.h2>
        <div className="mt-16 space-y-24">
          {projects.map((project, i) => (
            <motion.article key={project.name} {...reveal} className="project group grid gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={`project-visual ${i % 2 ? "lg:order-2" : ""}`}><ProjectVisual variant={project.variant} name={project.name} /></div>
              <div className="flex flex-col justify-between py-2">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{project.category}</div>
                  <h3 className="mt-5 font-display text-5xl font-medium sm:text-7xl">{project.name}</h3>
                  <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">{project.description}</p>
                </div>
                <div className="mt-12">
                  <div className="flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}</div>
                  <div className="mt-8 inline-flex items-center gap-2 border-b border-primary pb-1 text-sm font-medium text-primary">View Case Study <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionLabel index="05">Our process</SectionLabel>
        <motion.h2 {...reveal} className="section-heading mt-12">From idea to production.</motion.h2>
        <div className="process-grid mt-16">
          {process.map(([num, title, description], i) => (
            <motion.article key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="process-step">
              <span className="process-dot" /><span className="font-mono text-xs text-primary">{num}</span><h3 className="mt-12 font-display text-2xl">{title}</h3><p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="section-space overflow-hidden border-y border-border bg-surface">
      <div className="page-shell">
        <SectionLabel index="06">Technology</SectionLabel>
        <div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <motion.h2 {...reveal} className="section-heading">Built with modern technology.</motion.h2>
          <motion.p {...reveal} className="max-w-lg text-muted-foreground">We choose technology to fit the system—not the other way around. Our toolkit evolves with the problem.</motion.p>
        </div>
        <div className="tech-ecosystem mt-16">
          <div className="tech-core"><DatabaseZap className="size-6" /><span>ROOTKUBE<br/>ENGINEERING</span></div>
          {technologyGroups.map((group, i) => (
            <motion.div key={group.label} {...reveal} transition={{ ...reveal.transition, delay: i * .06 }} className="tech-group">
              <div className="font-mono text-[10px] tracking-[0.18em] text-primary">{group.label}</div>
              <div className="mt-5 flex flex-wrap gap-2">{group.items.map(item => <span key={item} className="tech-pill">{item}</span>)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyRootKube() {
  const items = ["Business-first thinking", "Production-grade engineering", "Scalable architecture", "Modern cloud infrastructure", "AI-enabled solutions", "Long-term partnership"];
  return (
    <section className="section-space">
      <div className="page-shell grid gap-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <SectionLabel index="07">Why RootKube</SectionLabel>
          <motion.h2 {...reveal} className="section-heading mt-12 max-w-3xl">Engineering with <span className="text-primary">purpose.</span></motion.h2>
          <motion.p {...reveal} className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">The strongest systems balance what the business needs now with what the technology must support next.</motion.p>
        </div>
        <div className="border-t border-border">
          {items.map((item, i) => <motion.div key={item} {...reveal} className="flex items-center gap-5 border-b border-border py-6"><span className="font-mono text-[10px] text-primary">0{i+1}</span><span className="font-display text-xl">{item}</span></motion.div>)}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section-space border-y border-border bg-contrast text-contrast-foreground">
      <div className="page-shell">
        <SectionLabel index="08">Our story</SectionLabel>
        <motion.h2 {...reveal} className="mt-12 max-w-5xl font-display text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[.98]">Two friends. One obsession: building useful technology.</motion.h2>
        <div className="mt-20 grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-contrast-muted">A shared engineering mindset</p>
          <motion.div {...reveal} className="grid gap-8 sm:grid-cols-2">
            <p className="text-xl leading-8">RootKube began with a simple conviction: technology earns its place when it makes something meaningfully better.</p>
            <p className="leading-7 text-contrast-muted">That principle still shapes how we work—staying close to the problem, making deliberate technical choices and building systems intended to last.</p>
          </motion.div>
        </div>
        <div className="mt-20 grid border-l border-t border-contrast-border sm:grid-cols-3">
          {["Built for real operations", "Designed to evolve", "Engineered as a partnership"].map((text, i) => <motion.div key={text} {...reveal} className="border-b border-r border-contrast-border p-7"><span className="font-mono text-[10px] text-contrast-muted">0{i+1}</span><p className="mt-10 font-display text-2xl">{text}</p></motion.div>)}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [showContactPlaceholder, setShowContactPlaceholder] = useState(false);
  return (
    <>
      <section id="contact" className="relative overflow-hidden py-28 sm:py-36">
        <div className="cta-grid" aria-hidden="true" />
        <div className="page-shell relative z-10 text-center">
          <motion.p {...reveal} className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Start a conversation</motion.p>
          <motion.h2 {...reveal} className="mx-auto mt-7 max-w-5xl font-display text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[.9]">Have something worth building?</motion.h2>
          <motion.p {...reveal} className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">Tell us what you’re trying to solve. We’ll figure out the technology.</motion.p>
          <motion.div {...reveal} className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="h-12 rounded-none px-6" onClick={() => setShowContactPlaceholder(true)}>Start a Conversation <ArrowUpRight /></Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-none bg-transparent px-6"><a href="#work">Explore Our Work</a></Button>
          </motion.div>
          {showContactPlaceholder && <p className="mt-5 text-sm text-muted-foreground" role="status">RootKube’s project enquiry details will be added here.</p>}
        </div>
      </section>
      <footer className="border-t border-border py-12">
        <div className="page-shell">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2"><Logo /><p className="mt-5 text-sm text-muted-foreground">Digital Product Engineering</p></div>
            <div><p className="footer-title">Navigate</p><div className="footer-links">{navItems.map(([label,id]) => <a href={`#${id}`} key={id}>{label}</a>)}</div></div>
            <div><p className="footer-title">Technology</p><div className="footer-links"><span>AI</span><span>Software</span><span>Cloud</span><span>Automation</span></div></div>
          </div>
          <div className="mt-16 flex flex-col gap-4 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} RootKube</span><div className="flex gap-6"><span>LinkedIn</span><span>GitHub</span></div><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </>
  );
}

export function RootKubeSite() {
  return <main className="overflow-clip"><SiteHeader /><Hero /><CapabilityMarquee /><Introduction /><Services /><Problems /><Work /><Process /><Technology /><WhyRootKube /><About /><Footer /></main>;
}