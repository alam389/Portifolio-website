// Saves each twin exchange to the `twin_chats` table in Supabase, so Anthony
// can see what visitors ask and spot bad answers or misroutes. Server only:
// it uses the secret key, and the table has RLS on with no policies. No IPs
// or browser details are stored. Saving never breaks a chat: failures are
// logged and dropped, and nothing is saved without the Supabase env vars.

export interface ChatRecord {
  conversation_id: string;
  page: string | null;
  question: string;
  answer: string | null;
  outcome: "answered" | "refused" | "stopped" | "failed";
  refused_reason?: string | null;
  sections?: string[] | null;
  fallback?: boolean;
  model?: string | null;
  duration_ms: number;
}

export async function saveChat(record: ChatRecord): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) return;
  try {
    const res = await fetch(`${base}/rest/v1/twin_chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(record),
      cache: "no-store",
    });
    if (!res.ok) console.error("[twin] save failed", res.status, await res.text());
  } catch (err) {
    console.error("[twin] save failed", err);
  }
}

/**
 * Passes an answer stream through untouched while keeping a copy, and settles
 * once it's over: `complete` when it ran to the end, or not when the visitor
 * left or stopped it (`signal` aborted) partway.
 */
export function recordStream(
  stream: ReadableStream<Uint8Array>,
  signal: AbortSignal,
): { stream: ReadableStream<Uint8Array>; finished: Promise<{ text: string; complete: boolean }> } {
  const decoder = new TextDecoder();
  let text = "";
  let settle: (r: { text: string; complete: boolean }) => void = () => {};
  const finished = new Promise<{ text: string; complete: boolean }>((resolve) => {
    let done = false;
    settle = (r) => {
      if (done) return;
      done = true;
      resolve(r);
    };
  });
  signal.addEventListener("abort", () => settle({ text, complete: false }), { once: true });
  const copy = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, out) {
      text += decoder.decode(chunk, { stream: true });
      out.enqueue(chunk);
    },
    flush() {
      text += decoder.decode();
      settle({ text, complete: true });
    },
  });
  return { stream: stream.pipeThrough(copy), finished };
}
