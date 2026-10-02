import { useEffect, useState } from "react";

import { useSmoothScroll } from "./smooth-scroll-context";

const SCROLLED_AT = 36;
/** Don't start hiding until clear of the hero, or the header flickers at the top. */
const HIDE_AFTER = 240;

export function useHeaderScrollState() {
  const { lenis } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Lenis does not update window.scrollY in transform mode, so when it is
    // active we read from it; otherwise fall back to the native position.
    if (lenis) {
      const onScroll = ({ scroll, direction }: { scroll: number; direction: number }) => {
        setScrolled(scroll > SCROLLED_AT);
        setHidden(direction === 1 && scroll > HIDE_AFTER);
      };
      lenis.on("scroll", onScroll);
      return () => lenis.off("scroll", onScroll);
    }

    let previous = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > SCROLLED_AT);
      setHidden(current > previous && current > HIDE_AFTER);
      previous = current;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis]);

  return { scrolled, hidden };
}
