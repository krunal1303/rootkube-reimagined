import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { chatInputSchema, requestChatReply } from "@/lib/chat-server";

/**
 * Exercises the handler in isolation. The browser reaches it over the Start RPC
 * transport (seroval-encoded), which isn't worth reproducing here — what needs
 * covering is the branch logic: missing key, upstream failure, decommissioned
 * model, and the reasoning-budget exhaustion that returns empty content.
 */
function groqResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

const messages = [{ role: "user" as const, content: "What services do you offer?" }];

describe("requestChatReply", () => {
  beforeEach(() => {
    process.env["GROQ_API_KEY"] = "gsk_test_key";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the assistant reply on success", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        groqResponse({ choices: [{ message: { content: "  We offer six services.  " } }] }),
      );

    await expect(requestChatReply({ messages })).resolves.toEqual({
      reply: "We offer six services.",
    });

    // The key must travel in the Authorization header, never the body or URL.
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(headers["authorization"]).toBe("Bearer gsk_test_key");

    const sent = JSON.parse(init?.body as string) as {
      messages: { role: string }[];
      reasoning_effort: string;
    };
    // Grounding must be prepended, and reasoning kept low so `content` is
    // actually produced rather than eaten by the reasoning budget.
    expect(sent.messages[0]?.role).toBe("system");
    expect(sent.reasoning_effort).toBe("low");
  });

  it("reports a disabled assistant when the key is absent", async () => {
    delete process.env["GROQ_API_KEY"];
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(requestChatReply({ messages })).resolves.toEqual({
      error: "The assistant isn't available right now.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces rate limiting distinctly from other upstream failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      groqResponse({ error: "slow down" }, { status: 429 }),
    );

    await expect(requestChatReply({ messages })).resolves.toEqual({
      error: "The assistant is busy at the moment. Please try again shortly.",
    });
  });

  it("never forwards an upstream error body to the browser", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      groqResponse(
        { error: { message: "model_not_found", code: "model_not_found" } },
        { status: 404 },
      ),
    );

    const result = await requestChatReply({ messages });
    expect(result).toEqual({ error: "Couldn't reach the assistant. Please try again." });
    expect(JSON.stringify(result)).not.toContain("model_not_found");
  });

  it("explains an empty completion instead of blaming connectivity", async () => {
    // What a reasoning model returns once reasoning eats the whole budget.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      groqResponse({ choices: [{ message: { content: "" }, finish_reason: "length" }] }),
    );

    await expect(requestChatReply({ messages })).resolves.toEqual({
      error: "The assistant couldn't finish that answer. Please try rephrasing.",
    });
  });

  it("handles a network failure without throwing", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(requestChatReply({ messages })).resolves.toEqual({
      error: "Couldn't reach the assistant. Please try again.",
    });
  });

  it("caps conversation length and message size before calling out", () => {
    // The caps live in the validator on the exported server function, so assert
    // the schema rather than the handler: this endpoint is unauthenticated and
    // these bounds are what stop one client exhausting the daily quota.
    expect(chatInputSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      chatInputSchema.safeParse({
        messages: [{ role: "user", content: "x".repeat(1001) }],
      }).success,
    ).toBe(false);
    expect(
      chatInputSchema.safeParse({
        messages: Array.from({ length: 13 }, () => ({ role: "user", content: "hi" })),
      }).success,
    ).toBe(false);
    expect(
      chatInputSchema.safeParse({ messages: [{ role: "system", content: "hi" }] }).success,
    ).toBe(false);
    expect(chatInputSchema.safeParse({ messages }).success).toBe(true);
  });
});
