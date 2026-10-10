import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ScrambleText } from "@/components/motion/scramble-text";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { usePointerSpotlight } from "@/components/motion/use-pointer-spotlight";
import { EASE, STAGGER } from "@/motion/ease";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { sendChatMessage, type ChatMessage } from "@/lib/chat-server";

const GREETING =
  "Ask me anything about RootKube: what we build, how we work, or the technology we use.";

const SUGGESTIONS = [
  "What services do you offer?",
  "How does your process work?",
  "What technology do you use?",
] as const;

type Entry = ChatMessage | { role: "error"; content: string };

function isConversational(entry: Entry): entry is ChatMessage {
  return entry.role === "user" || entry.role === "assistant";
}

/**
 * Three dots on a staggered loop. Cheaper than it looks: transform/opacity only,
 * so it composites on the GPU and never triggers layout while the request is in
 * flight.
 */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 px-3 py-2" role="status" aria-label="Thinking">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Thinking
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1 rounded-full bg-primary"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.14,
            }}
          />
        ))}
      </span>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const magnetic = useMagnetic<HTMLDivElement>(0.3, 90);

  // Same cursor-tracked gradient the service cards use, so the panel belongs to
  // the same interaction language rather than feeling bolted on.
  usePointerSpotlight(transcriptRef, ".chat-bubble-assistant");

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [entries, pending, reduceMotion]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the panel, matching the Radix sheet behaviour in the header.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;

    // Drop any prior error rows: they aren't conversation the model should see.
    const history = entries.filter(isConversational);
    const next: Entry[] = [...history, { role: "user", content: text }];
    setEntries(next);
    setInput("");
    setPending(true);

    try {
      const result = await sendChatMessage({
        data: { messages: next.filter(isConversational).slice(-12) },
      });
      setEntries([
        ...next,
        "reply" in result
          ? { role: "assistant", content: result.reply }
          : { role: "error", content: result.error },
      ]);
    } catch (error) {
      console.error(error);
      setEntries([
        ...next,
        {
          role: "error",
          content: "Something went wrong. Please try again, or use the Contact section below.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  const lastEntry = entries.at(-1);

  return (
    <>
      {/* A plain <button>, deliberately NOT the shadcn `Button`: its base class
          sets a flat `bg-primary` (nothing for a gradient to show through),
          `hover:bg-primary/90`, and `[&_svg]:size-4`, all of which outrank these
          styles and flattened an earlier attempt at this. */}
      <motion.div
        ref={magnetic.ref}
        style={magnetic.style}
        onPointerMove={magnetic.handlePointerMove}
        onPointerLeave={magnetic.handlePointerLeave}
        className="fixed bottom-6 right-6 z-50"
      >
        {/* Two rings on a long offset loop, outside the clipped button so they
            can expand past its edge. Rendered regardless of motion preference
            and silenced in CSS: `useReducedMotion` starts false so SSR and the
            first client render agree, so branching the markup here would flash
            them before hydration removed them. */}
        {!open && (
          <>
            <span className="chat-launcher-ping" aria-hidden="true" />
            <span className="chat-launcher-ping chat-launcher-ping-delayed" aria-hidden="true" />
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="rootkube-chat-panel"
          className="chat-launcher"
          data-open={open ? "true" : undefined}
        >
          <span className="chat-launcher-sheen" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="chat-launcher-icon"
            >
              {open ? (
                <X className="size-5" strokeWidth={2} />
              ) : (
                <MessageSquare className="size-5" strokeWidth={2} />
              )}
            </motion.span>
          </AnimatePresence>
          <span className="sr-only">{open ? "Close the assistant" : "Ask about RootKube"}</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="rootkube-chat-panel"
            role="dialog"
            aria-label="RootKube assistant"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.42, ease: EASE }}
            style={{ transformOrigin: "bottom right" }}
            className="chat-panel fixed bottom-24 right-6 z-50 flex h-[min(32rem,calc(100dvh-8rem))] w-[min(23.5rem,calc(100vw-3rem))] flex-col border border-border bg-background"
          >
            {/* Scrub-free sibling of .process-line: a gradient hairline that
                draws itself across the top edge as the panel opens. */}
            <span className="chat-panel-rule" aria-hidden="true" />
            <div className="chat-panel-lattice" aria-hidden="true" />

            <header className="relative flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {reduceMotion ? (
                  "RootKube Assistant"
                ) : (
                  <ScrambleText duration={0.8}>RootKube Assistant</ScrambleText>
                )}
              </p>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <span className="chat-status-dot" aria-hidden="true" />
                Online
              </span>
            </header>

            <div
              ref={scrollRef}
              className="relative flex-1 space-y-3 overflow-y-auto p-4"
              data-cursor="view"
            >
              <div ref={transcriptRef} className="space-y-3">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
                  className="chat-bubble chat-bubble-assistant"
                >
                  <span className="chat-bubble-spot" aria-hidden="true" />
                  <span className="relative">{GREETING}</span>
                </motion.div>

                {entries.length === 0 && (
                  <div className="flex flex-col items-start gap-2 pt-1">
                    {SUGGESTIONS.map((suggestion, i) => (
                      <motion.button
                        key={suggestion}
                        type="button"
                        onClick={() => void ask(suggestion)}
                        initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.45,
                          ease: EASE,
                          delay: 0.24 + i * STAGGER.base,
                        }}
                        className="chat-suggestion"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {entries.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 12, x: entry.role === "user" ? 10 : -10 }
                      }
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      {...(entry.role === "error" ? { role: "alert" } : {})}
                      className={
                        entry.role === "user"
                          ? "chat-bubble chat-bubble-user"
                          : entry.role === "error"
                            ? "chat-bubble chat-bubble-error"
                            : "chat-bubble chat-bubble-assistant"
                      }
                    >
                      {entry.role === "assistant" && (
                        <span className="chat-bubble-spot" aria-hidden="true" />
                      )}
                      <span className="relative">{entry.content}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {pending && (
                    <motion.div
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <ThinkingDots />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Announced separately so screen readers hear replies without the
                  visual transcript being re-read on every render. */}
              <div aria-live="polite" className="sr-only">
                {pending ? "Assistant is replying" : (lastEntry?.content ?? "")}
              </div>
            </div>

            <form onSubmit={onSubmit} className="relative flex gap-2 border-t border-border p-3">
              <div className="chat-input-wrap">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={1000}
                  placeholder="Ask about RootKube…"
                  aria-label="Your question"
                  className="chat-input"
                />
                {/* Underline that grows from the left on focus — the same
                    hairline sweep .problem-row uses on hover. */}
                <span className="chat-input-rule" aria-hidden="true" />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={pending || input.trim().length === 0}
                className="chat-send rounded-none"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
