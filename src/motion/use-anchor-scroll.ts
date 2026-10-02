import { useEffect } from "react";

import { useSmoothScroll } from "./smooth-scroll-context";

/** Header height at rest, so targets don't land underneath the fixed bar. */
const HEADER_OFFSET = -80;

/**
 * Routes in-page anchor clicks through Lenis. Focus is moved to the target so
 * keyboard and screen-reader users land where sighted users do; tabindex is
 * applied only for the duration of that focus call.
 */
export function useAnchorScroll() {
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      event.preventDefault();
      scrollTo(target, { offset: HEADER_OFFSET });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });

      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);
}
