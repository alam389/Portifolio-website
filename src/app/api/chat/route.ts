import { NextResponse, after, type NextRequest } from "next/server";
import { MAX_MESSAGE } from "@/lib/twin/limits";
import { recordStream, saveChat, type ChatRecord } from "@/lib/twin/log";
import { decide, streamAnswer } from "@/lib/twin/openrouter";
import { refusal, systemPrompt } from "@/lib/twin/prompt";
import { RateLimiter } from "@/lib/twin/rateLimit";
import { decisionRequest, everything, readDecision, type ChatMessage, type Route } from "@/lib/twin/route";
import { serialize } from "@/lib/twin/serialize";

// The AI twin. One Jev call guards and routes the question, then the answer
// model streams a reply grounded only in the routed sections of src/data.
// Each exchange is saved to Supabase once the response is over (lib/twin/log).
// Needs OPENROUTER_API_KEY; TWIN_MODEL and TWIN_ROUTER_MODEL override the models.
const ANSWER_MODEL = process.env.TWIN_MODEL ?? "deepseek/deepseek-v4.1-flash";
const ROUTER_MODEL = process.env.TWIN_ROUTER_MODEL ?? "typesafe/jev-1.13";

/** Turns of history kept for the answer model. */
const MAX_TURNS = 12;
/** Longest past assistant reply sent back as history. */
const MAX_REPLY = 4000;

// src/data is static, so serialize once per server instance.
const sections = serialize();
const limiter = new RateLimiter();

export async function POST(req: NextRequest) {
  const started = Date.now();
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ error: "The twin is offline right now." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limiter.take(ip)) {
    return NextResponse.json(
      { error: "That's a lot of questions. Give me a minute and try again." },
      { status: 429 },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const messages = parse(body);
  if (!messages) {
    return NextResponse.json(
      { error: `Messages must be under ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  let route: Route;
  try {
    route = readDecision(await decide(decisionRequest(messages, ROUTER_MODEL), key));
  } catch (err) {
    // Jev down or slow: skip the guard and send everything. The answer prompt still holds the line.
    console.error("[twin] router failed, using every section", err);
    route = everything();
  }
  console.info("[twin]", JSON.stringify(route));

  const base = { ...visit(body), question: messages[messages.length - 1].content };
  const save = (record: Omit<ChatRecord, keyof typeof base | "duration_ms">) =>
    after(() => saveChat({ ...base, ...record, duration_ms: Date.now() - started }));

  if (route.kind === "refuse") {
    const reply = refusal();
    save({ answer: reply, outcome: "refused", refused_reason: route.reason });
    return text(reply);
  }

  const routed = { sections: route.sections, fallback: route.fallback, model: ANSWER_MODEL };
  try {
    const answer = await streamAnswer({
      key,
      model: ANSWER_MODEL,
      system: systemPrompt(route.sections, sections),
      messages,
      signal: req.signal,
    });
    // Saved once the answer has finished streaming (or the visitor stopped it).
    const { stream, finished } = recordStream(answer, req.signal);
    after(async () => {
      const { text, complete } = await finished;
      await saveChat({
        ...base,
        ...routed,
        answer: text,
        outcome: complete ? "answered" : "stopped",
        duration_ms: Date.now() - started,
      });
    });
    return new Response(stream, { headers: textHeaders });
  } catch (err) {
    console.error("[twin] answer failed", err);
    save({ ...routed, answer: null, outcome: "failed" });
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 502 });
  }
}

/**
 * The chat's random conversation ID and the page it was asked from, for the
 * saved record. Anything malformed gets a fresh ID / no page rather than a 400.
 */
function visit(body: unknown): Pick<ChatRecord, "conversation_id" | "page"> {
  const { conversationId, page } = (body ?? {}) as { conversationId?: unknown; page?: unknown };
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return {
    conversation_id: typeof conversationId === "string" && uuid.test(conversationId) ? conversationId : crypto.randomUUID(),
    page: typeof page === "string" && page.startsWith("/") ? page.slice(0, 200) : null,
  };
}

/** Validates the body and trims history; null when it's malformed or the latest message is too long. */
function parse(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_TURNS)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.trim();
    if (!content) return null;
    if (m.role === "user" && content.length > MAX_MESSAGE) return null;
    messages.push({ role: m.role, content: content.slice(0, MAX_REPLY) });
  }
  // History must start with the visitor and end on their new message.
  while (messages[0]?.role === "assistant") messages.shift();
  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}

const textHeaders = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

function text(body: string) {
  return new Response(body, { headers: textHeaders });
}
