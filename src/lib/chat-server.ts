import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SYSTEM_PROMPT } from "@/lib/chat-knowledge";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Groq decommissioned the Llama chat models; `openai/gpt-oss-*` is what the
 * free tier now serves. Drop to `openai/gpt-oss-20b` if the daily quota on the
 * 120b becomes the binding constraint — it handles straight recall over a few
 * hundred tokens of reference material perfectly well.
 *
 * Verify against `GET /openai/v1/models` if requests start 404ing: a
 * `model_not_found` here is a decommission, not a bad key.
 */
const MODEL = "openai/gpt-oss-120b";

/**
 * These are reasoning models: they spend part of the completion budget on a
 * `reasoning` field before emitting `content`. Left at the default effort, the
 * reasoning alone exhausts `max_tokens` against a system prompt this size and
 * the response comes back `finish_reason: "length"` with EMPTY content. Hence
 * low effort plus a budget well above the 2-4 sentences we actually want —
 * recalling site copy needs no deliberation.
 */
const REASONING_EFFORT = "low";
const MAX_TOKENS = 700;

/** Caps on what one request may cost us, since this endpoint is unauthenticated. */
const MAX_MESSAGES = 12;
const MAX_CHARS = 1000;

export const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_CHARS),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
export type ChatMessage = ChatInput["messages"][number];

export type ChatReply = { reply: string } | { error: string };

type GroqResponse = {
  choices?: { message?: { content?: string }; finish_reason?: string }[];
};

/**
 * The assistant's actual logic, kept separate from the `createServerFn` wrapper
 * below so it can be exercised directly: invoking the wrapper requires the Start
 * server runtime's AsyncLocalStorage context, which a unit test has no way to
 * provide.
 *
 * Runs only on the server, so `GROQ_API_KEY` never enters the client bundle.
 * Reads `process.env` rather than `import.meta.env` deliberately: the latter is
 * Vite's client-side mechanism and a `VITE_`-prefixed key would be inlined into
 * the shipped JS for anyone to read.
 *
 * Returns errors as data instead of throwing: a thrown error here would hit the
 * SSR error middleware in `src/start.ts` and render the full-page error shell,
 * when all we want is a failure message inside the chat panel.
 */
export async function requestChatReply(data: ChatInput): Promise<ChatReply> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    console.error("GROQ_API_KEY is not configured; the chat assistant is disabled.");
    return { error: "The assistant isn't available right now." };
  }

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        // Low, because we want faithful recall of the site's own copy rather
        // than invention.
        temperature: 0.3,
        max_tokens: MAX_TOKENS,
        reasoning_effort: REASONING_EFFORT,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });
  } catch (error) {
    console.error("Groq request failed", error);
    return { error: "Couldn't reach the assistant. Please try again." };
  }

  if (!response.ok) {
    // Upstream error bodies can echo the request, so log them and return a
    // generic message rather than forwarding anything to the browser.
    const body = await response.text();
    console.error(`Groq responded ${response.status}: ${body}`);
    if (response.status === 404 && body.includes("model_not_found")) {
      console.error(
        `MODEL "${MODEL}" is unavailable to this key — Groq likely decommissioned it. ` +
          `Check GET https://api.groq.com/openai/v1/models and update MODEL in this file.`,
      );
    }
    return {
      error:
        response.status === 429
          ? "The assistant is busy at the moment. Please try again shortly."
          : "Couldn't reach the assistant. Please try again.",
    };
  }

  const payload = (await response.json()) as GroqResponse;
  const choice = payload.choices?.[0];
  const reply = choice?.message?.content?.trim();
  if (!reply) {
    // `length` here means the reasoning phase ate the whole token budget —
    // raise MAX_TOKENS or lower REASONING_EFFORT rather than hunting the key.
    console.error(
      `Groq returned no message content (finish_reason: ${choice?.finish_reason ?? "unknown"})`,
    );
    return { error: "The assistant couldn't finish that answer. Please try rephrasing." };
  }

  return { reply };
}

/** Transport wrapper: validates the payload, then delegates to the logic above. */
export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(chatInputSchema)
  .handler(({ data }): Promise<ChatReply> => requestChatReply(data));
