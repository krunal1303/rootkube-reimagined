import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { useReducedMotion } from "./use-reduced-motion";
import { useSmoothScroll } from "./smooth-scroll-context";

const SESSION_KEY = "rk-preloaded";

/**
 * Runs once per session (sessionStorage-gated), then stays unmounted for the
 * rest of the tab's life. Server and first client render both render nothing
 * visible — the overlay only appears once an effect confirms this is the
 * first load this session, so there's no hydration mismatch and no CLS.
 */
export function Preloader({ onDone }: { onDone?: () => void }) {
  const reduceMotion = useReducedMotion();
  const { stop, start } = useSmoothScroll();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  // React dev-mode double-invokes mount effects. sessionStorage alone can't
  // tell "already seen on a previous page load" apart from "already seen
  // because this component's own first invocation just set it a moment
  // ago" — this ref belongs to one component instance, so it can.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let alreadySeen = true;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (privacy mode) — treat as unseen, preloader just won't persist.
    }

    if (alreadySeen) {
      setDone(true);
      doneRef.current?.();
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }

    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      // Lenis never initializes under reduced motion, so there's nothing to stop/start.
      setDone(true);
      doneRef.current?.();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    stop();
    const counter = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true);
        doneRef.current?.();
        start();
      },
    });

    tl.to(counter, {
      value: 100,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.value));
      },
    }).to(root, {
      autoAlpha: 0,
      duration: 0.5,
      ease: "power1.out",
    });

    return () => {
      tl.kill();
      start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduceMotion]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="font-mono text-sm tabular-nums tracking-[0.2em] text-muted-foreground">
        <span ref={countRef}>0</span>%
      </span>
    </div>
  );
}
