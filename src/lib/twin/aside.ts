// When the pet relays the chat, the answer model writes the pet's aside first
// ("ooh, the Graph-RAG one!! he says:"), then a line of "---", then Anthony's
// answer. The route splits the two as they stream and sends the client
// `aside SEP answer…`, with the aside empty when the model's wasn't usable;
// the bubble then falls back to a fixed line from speech.ts.

/** Between the aside and the answer in the response body (ASCII record separator). */
export const ASIDE_SEP = "\u001e";

/** No delimiter within this many characters: the model skipped the aside, so it's all answer. */
const MAX_PREFIX = 240;
const DELIMITER = /\n[ \t]*-{3,}[ \t]*\n/;

/**
 * The aside if it's fit to show: one short line, in the pet's voice. Anything
 * that could be a fact (digits, links, emails) or that runs long is dropped,
 * since the pet must never state things about Anthony.
 */
export function cleanAside(raw: string): string | null {
  const text = raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .trim();
  if (!text || text.length > 80 || text.split(" ").length > 12) return null;
  if (/\d|https?:|www\.|@|<|>|—/i.test(text)) return null;
  return text;
}

/** Splits the aside off the front of a streamed answer; see the module comment for the output. */
export function splitAside(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let split = false;
  // Blank lines after the delimiter aren't part of the answer, even if they arrive later.
  let leading = true;
  const answer = (out: TransformStreamDefaultController<Uint8Array>, text: string) => {
    if (leading) text = text.replace(/^\s+/, "");
    if (!text) return;
    leading = false;
    out.enqueue(encoder.encode(text));
  };
  const emit = (out: TransformStreamDefaultController<Uint8Array>, aside: string, rest: string) => {
    split = true;
    out.enqueue(encoder.encode(`${aside}${ASIDE_SEP}`));
    answer(out, rest);
  };
  return new TransformStream({
    transform(chunk, out) {
      const text = decoder.decode(chunk, { stream: true });
      if (split) return answer(out, text);
      buffer += text;
      const match = DELIMITER.exec(buffer);
      if (match) {
        emit(out, cleanAside(buffer.slice(0, match.index)) ?? "", buffer.slice(match.index + match[0].length));
      } else if (buffer.length > MAX_PREFIX) {
        emit(out, "", buffer);
      }
    },
    flush(out) {
      const rest = decoder.decode();
      if (split) return answer(out, rest);
      buffer += rest;
      // Ended without a delimiter: a one-line reply is the answer, not an aside.
      const match = /^([^\n]*)\n[ \t]*-{3,}[ \t]*$/.exec(buffer);
      if (match) emit(out, cleanAside(match[1]) ?? "", "");
      else emit(out, "", buffer);
    },
  });
}

/** Splits a saved `aside SEP answer` text back apart. */
export function parseRelayed(text: string): { aside: string | null; answer: string } {
  const at = text.indexOf(ASIDE_SEP);
  if (at < 0) return { aside: null, answer: text };
  return { aside: text.slice(0, at) || null, answer: text.slice(at + ASIDE_SEP.length) };
}
