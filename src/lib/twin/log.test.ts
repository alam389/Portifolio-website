import { describe, expect, it } from "vitest";
import { recordStream } from "./log";

const source = (chunks: string[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
      c.close();
    },
  });
};

describe("recordStream", () => {
  it("passes the stream through and keeps a copy of the whole answer", async () => {
    const { stream, finished } = recordStream(source(["Hi, ", "I'm Anthony."]), new AbortController().signal);
    expect(await new Response(stream).text()).toBe("Hi, I'm Anthony.");
    expect(await finished).toEqual({ text: "Hi, I'm Anthony.", complete: true });
  });

  it("settles with what arrived when the visitor leaves partway", async () => {
    const controller = new AbortController();
    const encoder = new TextEncoder();
    let push: (s: string) => void = () => {};
    const live = new ReadableStream<Uint8Array>({
      start(c) {
        push = (s) => c.enqueue(encoder.encode(s));
      },
    });
    const { stream, finished } = recordStream(live, controller.signal);
    const reader = stream.getReader();
    push("Half an ");
    await reader.read();
    controller.abort();
    expect(await finished).toEqual({ text: "Half an ", complete: false });
  });
});
