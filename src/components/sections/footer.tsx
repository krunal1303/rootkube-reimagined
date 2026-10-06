import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { MaskedLines } from "@/components/motion/masked-lines";
import { Logo, navItems, reveal, revealSoft } from "@/components/sections/shared";

export function Footer() {
  const [showContactPlaceholder, setShowContactPlaceholder] = useState(false);
  return (
    <>
      <section id="contact" className="relative overflow-hidden py-28 sm:py-36">
        <div className="cta-grid" aria-hidden="true" />
        <div className="page-shell relative z-10 text-center">
          <motion.p
            {...revealSoft}
            className="font-mono text-xs uppercase tracking-[0.18em] text-primary"
          >
            Start a conversation
          </motion.p>
          <MaskedLines
            className="mx-auto mt-7 max-w-5xl font-display text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[.9]"
            lines={["Have something", "worth building?"]}
          />
          <motion.p
            {...revealSoft}
            transition={{ ...revealSoft.transition, delay: 0.16 }}
            className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground"
          >
            Tell us what you’re trying to solve. We’ll figure out the technology.
          </motion.p>
          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.24 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <MagneticButton>
              <Button
                size="lg"
                className="h-12 rounded-none px-6"
                onClick={() => setShowContactPlaceholder(true)}
              >
                Start a Conversation <ArrowUpRight />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-none bg-transparent px-6"
              >
                <a href="#services">Explore Our Services</a>
              </Button>
            </MagneticButton>
          </motion.div>
          {showContactPlaceholder && (
            <p className="mt-5 text-sm text-muted-foreground" role="status">
              RootKube’s project enquiry details will be added here.
            </p>
          )}
        </div>
      </section>
      <footer className="border-t border-border py-12">
        <div className="page-shell">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-5 text-sm text-muted-foreground">Digital Product Engineering</p>
            </div>
            <div>
              <p className="footer-title">Navigate</p>
              <div className="footer-links">
                {navItems.map(([label, id]) => (
                  <a href={`#${id}`} key={id}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="footer-title">Technology</p>
              <div className="footer-links">
                <span>AI</span>
                <span>Software</span>
                <span>Cloud</span>
                <span>Automation</span>
              </div>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-4 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} RootKube</span>
            <div className="flex gap-6">
              <span>LinkedIn</span>
              <span>GitHub</span>
            </div>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}
