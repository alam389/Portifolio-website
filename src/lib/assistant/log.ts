import type { ChatMessage } from "./route";

// The `twin_chats` table in Supabase: each exchange is saved there, so Anthony
// can see what visitors ask and spot bad answers or misroutes, and it's also
// the assistant's memory (a session's history is rebuilt from it, never taken from
// the browser) and its spend meter (a global cap on model calls). Server only:
// it uses the secret key, and the table has RLS on with no policies and no
// grants to the public roles. No IPs; the only browser details are the
// referring domain and utm_source. Saving never breaks a chat: failures are
// logged and dropped, and nothing is saved without the Supabase env vars.

/** Past exchanges sent back to the model as context. */
const HISTORY_TURNS = 6;
/** Longest past answer sent back as context. */
const MAX_PAST_ANSWER = 4000;
/** Reads are on the request path: give up quickly and carry on without them. */
const READ_TIMEOUT_MS = 1500;

export interface ChatRecord {
  conversation_id: string;
  page: string | null;
  /** The referring site's domain, never the full URL. */
  referrer: string | null;
  utm_source: string | null;
  /** The pet that relayed the chat, if one did. */
  pet: string | null;
  question: string;
  /** The pet's aside before the answer, when the model wrote a usable one. */
  aside?: string | null;
  answer: string | null;
  outcome: "answered" | "refused" | "stopped" | "failed";
  refused_reason?: string | null;
  sections?: string[] | null;
  fallback?: boolean;
  model?: string | null;
  duration_ms: number;
}

function supabase() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) return null;
  return { url: `${base}/rest/v1/twin_chats`, headers: { Authorization: `Bearer ${key}`, apikey: key } };
}

export interface PastTurn {
  question: string;
  answer: string | null;
  outcome: ChatRecord["outcome"];
}

/**
 * A session's recent exchanges as chat messages, oldest first. Only real
 * answers count: refusals and failures add nothing a follow-up needs.
 */
export function historyFrom(rows: PastTurn[]): ChatMessage[] {
  return rows
    .filter((r) => (r.outcome === "answered" || r.outcome === "stopped") && r.answer?.trim())
    .flatMap((r): ChatMessage[] => [
      { role: "user", content: r.question },
      { role: "assistant", content: r.answer!.trim().slice(0, MAX_PAST_ANSWER) },
    ]);
}

/** The session's recent history from the database; empty if there's none or it can't be read. */
export async function loadHistory(conversationId: string): Promise<ChatMessage[]> {
  const db = supabase();
  if (!db) return [];
  const query = new URLSearchParams({
    select: "question,answer,outcome",
    conversation_id: `eq.${conversationId}`,
    order: "created_at.desc",
    limit: String(HISTORY_TURNS),
  });
  try {
    const res = await fetch(`${db.url}?${query}`, {
      headers: db.headers,
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return historyFrom(((await res.json()) as PastTurn[]).reverse());
  } catch (err) {
    console.error("[assistant] history unavailable", err);
    return [];
  }
}

/**
 * Model calls (answers, stopped answers and failures; refusals cost nothing)
 * across every visitor since `since`. Null when it can't be counted.
 */
export async function modelCallsSince(since: Date): Promise<number | null> {
  const db = supabase();
  if (!db) return null;
  const query = new URLSearchParams({
    select: "id",
    created_at: `gte.${since.toISOString()}`,
    outcome: "in.(answered,stopped,failed)",
  });
  try {
    const res = await fetch(`${db.url}?${query}`, {
      method: "HEAD",
      headers: { ...db.headers, Prefer: "count=exact" },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      cache: "no-store",
    });
    // "0-41/42", or "*/0" when there are none.
    const total = res.headers.get("content-range")?.split("/")[1];
    if (!res.ok || total === undefined || !/^\d+$/.test(total)) throw new Error(`count ${res.status}`);
    return Number(total);
  } catch (err) {
    console.error("[assistant] spend count unavailable", err);
    return null;
  }
}

export async function saveChat(record: ChatRecord): Promise<void> {
  const db = supabase();
  if (!db) return;
  try {
    const res = await fetch(db.url, {
      method: "POST",
      headers: { ...db.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(record),
      cache: "no-store",
    });
    if (!res.ok) console.error("[assistant] save failed", res.status, await res.text());
  } catch (err) {
    console.error("[assistant] save failed", err);
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
