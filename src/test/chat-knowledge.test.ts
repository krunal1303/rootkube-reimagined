import { describe, expect, it } from "vitest";

import { SITE_KNOWLEDGE, SYSTEM_PROMPT } from "@/lib/chat-knowledge";

describe("chat knowledge base", () => {
  it("covers every service the site advertises", () => {
    for (const service of [
      "AI & Intelligent Systems",
      "Custom Software",
      "Cloud & DevOps",
      "Business Automation",
      "SaaS & Digital Products",
      "System Integration",
    ]) {
      expect(SITE_KNOWLEDGE).toContain(service);
    }
  });

  it("covers all five process stages", () => {
    for (const stage of ["Discover", "Design", "Engineer", "Deploy", "Scale"]) {
      expect(SITE_KNOWLEDGE).toContain(stage);
    }
  });

  it("embeds the reference material and the anti-fabrication rule", () => {
    expect(SYSTEM_PROMPT).toContain(SITE_KNOWLEDGE);
    expect(SYSTEM_PROMPT).toMatch(/never invent/i);
  });
});
