import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { CapabilityMarquee } from "@/components/sections/capability-marquee";
import { Introduction } from "@/components/sections/introduction";
import { Services } from "@/components/sections/services";
import { Problems } from "@/components/sections/problems";
import { Process } from "@/components/sections/process";
import { Technology } from "@/components/sections/technology";
import { WhyRootKube } from "@/components/sections/why-rootkube";
import { About } from "@/components/sections/about";
import { Footer } from "@/components/sections/footer";
import { useAnchorScroll } from "@/motion/use-anchor-scroll";
import { ScrollProgress } from "@/motion/scroll-progress";

export function RootKubeSite() {
  useAnchorScroll();

  return (
    <main>
      {/* Scoped to the marketing page rather than the root layout: the 404 and
          error screens don't scroll, so a progress rail there is noise. */}
      <ScrollProgress />
      <SiteHeader />
      <Hero />
      <CapabilityMarquee />
      <Introduction />
      <Services />
      <Problems />
      <Process />
      <Technology />
      <WhyRootKube />
      <About />
      <Footer />
    </main>
  );
}
