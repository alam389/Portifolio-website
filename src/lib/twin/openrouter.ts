import type { ChatMessage, DecisionRequest, DecisionResponse } from "./route";

// Both models go through OpenRouter on one key: Jev via its System One
// endpoint, the answer model via chat completions. Plain fetch, no SDK.
const BASE = "https://openrouter.ai/api/v1";

/** Jev's per-call timeout; past it the route falls back to every section. */
const DECIDE_TIMEOUT_MS = 3000;

function headers(key: string) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    // Optional OpenRouter attribution headers.
    "X-Title": "Anthony Lam portfolio twin",
  };
}

export async function decide(body: DecisionRequest, key: string): Promise<DecisionResponse> {
  const res = await fetch(`${BASE}/systemone`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(DECIDE_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Jev ${res.status}: ${await res.text()}`);
  return (await res.json()) as DecisionResponse;
}

/** Streams the answer as plain UTF-8 text. Throws before streaming if the request fails. */
export async function streamAnswer(opts: {
  key: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  signal: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(opts.key),
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      max_tokens: 1024,
      // A chat reply doesn't need deep reasoning; keep it fast and out of the output.
      reasoning: { effort: "low", exclude: true },
      messages: [{ role: "system", content: opts.system }, ...opts.messages],
    }),
    signal: opts.signal,
    cache: "no-store",
  });
  if (!res.ok || !res.body) throw new Error(`Answer model ${res.status}: ${await res.text()}`);
  return res.body.pipeThrough(sseToText());
}

/**
 * OpenAI-style server-sent events to plain text: keeps each chunk's
 * `choices[0].delta.content`, drops comments (OpenRouter's keep-alives) and
 * `[DONE]`, and errors the stream on an in-band `error` event.
 */
export function sseToText(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const handle = (line: string, out: TransformStreamDefaultController<Uint8Array>) => {
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    const event = JSON.parse(data) as {
      error?: { message?: string };
      choices?: { delta?: { content?: string } }[];
    };
    if (event.error) throw new Error(event.error.message ?? "Stream error");
    const text = event.choices?.[0]?.delta?.content;
    if (text) out.enqueue(encoder.encode(text));
  };

  return new TransformStream({
    transform(chunk, out) {
      buffer += decoder.decode(chunk, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";
      for (const line of parts) handle(line.trim(), out);
    },
    flush(out) {
      handle((buffer + decoder.decode()).trim(), out);
    },
  });
}
