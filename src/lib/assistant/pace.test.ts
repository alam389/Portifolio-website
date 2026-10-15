import { describe, expect, it } from "vitest";
import { Pacer } from "./pace";

/** Ticks a pacer every 50ms for `ms`, returning everything it let out. */
function tick(pacer: Pacer, from: number, ms: number) {
  let out = "";
  for (let t = from; t <= from + ms; t += 50) out += pacer.take(t);
  return out;
}

describe("Pacer", () => {
  it("lets text out at reading pace however fast it arrives", () => {
    const pacer = new Pacer(4);
    pacer.push("one two three four five six seven eight nine ten");
    pacer.end();
    // The first word at once, then four a second.
    expect(pacer.take(0)).toBe("one");
    const second = tick(pacer, 50, 950);
    expect(second.trim().split(/\s+/)).toHaveLength(4);
    expect(tick(pacer, 1050, 2000)).toBe(" six seven eight nine ten");
    expect(pacer.done).toBe(true);
  });

  it("never splits a word across chunks", () => {
    const pacer = new Pacer(100);
    pacer.push("Hello wor");
    expect(tick(pacer, 0, 500)).toBe("Hello");
    pacer.push("ld, again");
    pacer.end();
    expect(tick(pacer, 550, 500)).toBe(" world, again");
  });

  it("keeps line breaks with the word after them", () => {
    const pacer = new Pacer(100);
    pacer.push("First.\n\nSecond.\n");
    pacer.end();
    expect(tick(pacer, 0, 500)).toBe("First.\n\nSecond.\n");
  });

  it("doesn't bank time spent waiting for the network", () => {
    const pacer = new Pacer(4);
    pacer.take(0);
    // Ten seconds of silence, then a burst of text.
    pacer.take(10_000);
    pacer.push("a b c d e f g h ");
    expect(pacer.take(10_050).trim().split(/\s+/).length).toBeLessThanOrEqual(1);
  });

  it("flushes whatever's left at once", () => {
    const pacer = new Pacer(4);
    pacer.push("all of this right now");
    expect(pacer.flush()).toBe("all of this right now");
  });
});
