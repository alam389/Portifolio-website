import { describe, expect, it } from "vitest";
import { decisionRequest, readDecision, type ChatMessage } from "./route";
import { SECTION_IDS } from "./serialize";

const nouls = (values: Record<string, number>) => ({
  answers: Object.fromEntries(Object.entries(values).map(([k, noul]) => [k, { type: "noul", noul }])),
});

describe("decisionRequest", () => {
  it("asks the guard questions and one per routable section", () => {
    const req = decisionRequest([{ role: "user", content: "hi" }], "jev");
    expect(Object.keys(req.questions)).toEqual(
      expect.arrayContaining(["on_topic", "injection", "needs_experience", "needs_projects"]),
    );
    expect(req.questions).not.toHaveProperty("needs_profile");
  });

  it("sends the latest message apart from the recent history", () => {
    const messages: ChatMessage[] = Array.from({ length: 9 }, (_, i) => ({
      role: i % 2 ? "assistant" : "user",
      content: `m${i}`,
    }));
    const { state } = decisionRequest(messages, "jev");
    expect(state.latest).toBe("m8");
    expect(state.conversation.map((m) => m.content)).toEqual(["m3", "m4", "m5", "m6", "m7"]);
  });
});

describe("readDecision", () => {
  it("refuses injection attempts before checking the topic", () => {
    expect(readDecision(nouls({ on_topic: 0.9, injection: 0.95 }))).toEqual({
      kind: "refuse",
      reason: "injection",
    });
  });

  it("refuses off-topic messages", () => {
    expect(readDecision(nouls({ on_topic: 0.1 }))).toEqual({ kind: "refuse", reason: "off-topic" });
  });

  it("includes profile plus the sections that scored high", () => {
    expect(
      readDecision(nouls({ on_topic: 0.9, injection: 0.05, needs_projects: 0.8, needs_journey: 0.1 })),
    ).toEqual({ kind: "answer", sections: ["profile", "projects"], fallback: false });
  });

  it("falls back to every section when nothing scores high", () => {
    expect(readDecision(nouls({ on_topic: 0.9, injection: 0, needs_projects: 0.2 }))).toEqual({
      kind: "answer",
      sections: [...SECTION_IDS],
      fallback: true,
    });
  });
});
