import { createContext, useContext } from "react";
import type Lenis from "lenis";

export type ScrollTo = (
  target: string | number | HTMLElement,
  options?: { offset?: number; immediate?: boolean },
) => void;

export type SmoothScrollValue = {
  /** Null when reduced motion is on and native scrolling is in use. */
  lenis: Lenis | null;
  scrollTo: ScrollTo;
  stop: () => void;
  start: () => void;
};

export const SmoothScrollContext = createContext<SmoothScrollValue | null>(null);

export function useSmoothScroll() {
  const value = useContext(SmoothScrollContext);
  if (!value) throw new Error("useSmoothScroll must be used within SmoothScrollProvider");
  return value;
}
