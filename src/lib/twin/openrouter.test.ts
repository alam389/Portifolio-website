import { describe, expect, it } from "vitest";
import { sseToText } from "./openrouter";

async function run(chunks: string[]) {
  const encoder = new TextEncoder();
  const source = new ReadableStream<Uint8Array>({
    start(c) {
      for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
      c.close();
    },
  });
  return new Response(source.pipeThrough(sseToText())).text();
}

const delta = (content: string) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

describe("sseToText", () => {
  it("joins content deltas and ignores comments and [DONE]", async () => {
    const text = await run([": OPENROUTER PROCESSING\n\n", delta("Hi, "), delta("I'm Anthony."), "data: [DONE]\n\n"]);
    expect(text).toBe("Hi, I'm Anthony.");
  });

  it("handles events split across chunks", async () => {
    const event = delta("split");
    expect(await run([event.slice(0, 12), event.slice(12)])).toBe("split");
  });

  it("errors on an in-band error event", async () => {
    await expect(run([delta("a"), `data: {"error":{"message":"boom"}}\n\n`])).rejects.toThrow("boom");
  });
});
