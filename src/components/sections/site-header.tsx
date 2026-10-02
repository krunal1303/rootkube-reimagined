import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Logo, navItems } from "@/components/sections/shared";
import { useHeaderScrollState } from "@/motion/use-header-scroll-state";
import { useSmoothScroll } from "@/motion/smooth-scroll-context";

export function SiteHeader() {
  const { scrolled, hidden } = useHeaderScrollState();
  const { stop, start } = useSmoothScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  // Radix locks body scroll for the drawer; Lenis needs telling separately.
  useEffect(() => {
    if (menuOpen) stop();
    else start();
  }, [menuOpen, stop, start]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[transform,background-color,border-color,height] duration-300 ${scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-transparent"} ${hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`page-shell flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}
      >
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="nav-link">
              {label}
            </a>
          ))}
        </nav>
        <MagneticButton className="hidden md:inline-flex">
          <Button asChild className="h-10 rounded-none px-5">
            <a href="#contact">
              Start a Project <ArrowUpRight />
            </a>
          </Button>
        </MagneticButton>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full border-l border-border bg-background p-7 sm:max-w-md">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <Logo />
            <nav className="mt-20 flex flex-col" aria-label="Mobile navigation">
              {navItems.map(([label, id], index) => (
                <SheetClose asChild key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-center justify-between border-b border-border py-5 font-display text-3xl text-foreground"
                  >
                    {label}
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  </a>
                </SheetClose>
              ))}
            </nav>
            <SheetClose asChild>
              <Button asChild className="mt-10 h-12 w-full rounded-none">
                <a href="#contact">
                  Start a Project <ArrowUpRight />
                </a>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
