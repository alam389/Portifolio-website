import { describe, expect, it } from "vitest";
import { ASIDE_SEP, cleanAside, parseRelayed, splitAside } from "./aside";

/** Streams `chunks` through splitAside and returns the whole output. */
async function run(chunks: string[]) {
  const encoder = new TextEncoder();
  const source = new ReadableStream<Uint8Array>({
    start(c) {
      for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
      c.close();
    },
  });
  return new Response(source.pipeThrough(splitAside())).text();
}

describe("splitAside", () => {
  it("splits the aside from the answer, even across chunks", async () => {
    const out = await run(["ooh, the RAG one!! he", " says:\n-", "--\nI built MAL-Athena", " at McGregor."]);
    expect(out).toBe(`ooh, the RAG one!! he says:${ASIDE_SEP}I built MAL-Athena at McGregor.`);
  });

  it("drops blank lines between the delimiter and the answer, even in a later chunk", async () => {
    expect(await run(["*perks up*\n---\n", "\n", "\nI built two things."])).toBe(
      `*perks up*${ASIDE_SEP}I built two things.`,
    );
  });

  it("drops an aside that states facts, but keeps the answer", async () => {
    const out = await run(["he saved $6,000!!\n---\nThe HCM platform replaced about $6,000 of tools."]);
    expect(out).toBe(`${ASIDE_SEP}The HCM platform replaced about $6,000 of tools.`);
  });

  it("treats a reply with no delimiter as all answer", async () => {
    const answer = "I haven't written about that here. ".repeat(10);
    expect(await run([answer])).toBe(`${ASIDE_SEP}${answer}`);
    expect(await run(["Short answer."])).toBe(`${ASIDE_SEP}Short answer.`);
  });

  it("keeps later --- lines in the answer", async () => {
    const out = await run(["*sniff* he says:\n---\nOne\n---\nTwo"]);
    expect(parseRelayed(out)).toEqual({ aside: "*sniff* he says:", answer: "One\n---\nTwo" });
  });
});

describe("cleanAside", () => {
  it("keeps short in-voice lines, without wrapping quotes", () => {
    expect(cleanAside('"fine. he says:"')).toBe("fine. he says:");
  });

  it("rejects anything long or fact-like", () => {
    expect(cleanAside("he worked there in 2025")).toBeNull();
    expect(cleanAside("see https://example.com")).toBeNull();
    expect(cleanAside("email lam@example.com")).toBeNull();
    expect(cleanAside("one two three four five six seven eight nine ten eleven twelve thirteen")).toBeNull();
    expect(cleanAside("   ")).toBeNull();
  });
});
