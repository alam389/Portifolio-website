import { NextResponse, after, type NextRequest } from "next/server";
import { ASIDE_SEP, parseRelayed, splitAside } from "@/lib/twin/aside";
import { MAX_MESSAGE } from "@/lib/twin/limits";
import { loadHistory, modelCallsSince, recordStream, saveChat, type ChatRecord } from "@/lib/twin/log";
import { decide, streamAnswer } from "@/lib/twin/openrouter";
import { refusal, systemPrompt } from "@/lib/twin/prompt";
import { RateLimiter } from "@/lib/twin/rateLimit";
import {
  decisionRequest,
  everything,
  looksLikeInjection,
  obviouslyNonsense,
  readDecision,
  type ChatMessage,
  type Route,
} from "@/lib/twin/route";
import { serialize } from "@/lib/twin/serialize";
import { isPet, soulOf } from "@/lib/twin/souls";
import { UTM_TOKEN } from "@/lib/twin/visit";

// The AI twin. One Jev call guards and routes the question, then the answer
// model streams a reply grounded only in the routed sections of src/data.
// When the pet relays the chat, the model also writes the pet's aside in its
// voice (from its soul), and the response is `aside SEP answer` (lib/twin/aside).
// Each exchange is saved to Supabase once the response is over (lib/twin/log),
// and that table is also the twin's memory: the browser sends only the new
// question, and earlier turns are read back from the database, so a visitor
// can't put words in the twin's mouth by forging its past replies.
// Needs OPENROUTER_API_KEY; TWIN_MODEL and TWIN_ROUTER_MODEL override the models.
const ANSWER_MODEL = process.env.TWIN_MODEL ?? "deepseek/deepseek-v4.1-flash";
const ROUTER_MODEL = process.env.TWIN_ROUTER_MODEL ?? "typesafe/jev-1.13";

/**
 * Model calls allowed across all visitors, counted in the database so every
 * server instance shares them (the in-memory limiter is per instance). The
 * real backstop is the credit limit on the OpenRouter key.
 */
const HOURLY_CAP = 120;
const DAILY_CAP = 500;
const HOUR_MS = 60 * 60_000;

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
  const question = parse(body);
  if (!question) {
    return NextResponse.json(
      { error: `Send a question of up to ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }
  const where = visit(body);

  const now = Date.now();
  const [history, lastHour, lastDay] = await Promise.all([
    loadHistory(where.conversation_id),
    modelCallsSince(new Date(now - HOUR_MS)),
    modelCallsSince(new Date(now - 24 * HOUR_MS)),
  ]);
  // Uncountable (database down) doesn't block: the per-instance limiter and the key's credit limit still apply.
  if ((lastHour ?? 0) >= HOURLY_CAP || (lastDay ?? 0) >= DAILY_CAP) {
    console.warn("[twin] spend cap reached", { lastHour, lastDay });
    return NextResponse.json(
      { error: "The twin is taking a break. Try again later, or email me." },
      { status: 503 },
    );
  }
  const messages: ChatMessage[] = [...history, { role: "user", content: question }];

  let route: Route;
  if (obviouslyNonsense(question)) {
    // Nothing to read at all: no need to ask Jev.
    route = { kind: "refuse", reason: "nonsense" };
  } else {
    try {
      route = readDecision(await decide(decisionRequest(messages, ROUTER_MODEL), key));
    } catch (err) {
      // Jev down or slow: send everything rather than fail, but keep a crude
      // injection check so the guard isn't simply off. The answer prompt still holds the line.
      console.error("[twin] router failed, using every section", err);
      route = looksLikeInjection(question) ? { kind: "refuse", reason: "injection" } : everything();
    }
  }
  console.info("[twin]", JSON.stringify(route));

  const rawPet = (body as { pet?: unknown } | null)?.pet;
  const pet = isPet(rawPet) ? rawPet : null;
  const soul = pet && soulOf(pet);
  const relay = pet && soul ? { pet, soul } : undefined;
  // With a pet, every response starts with its (possibly empty) aside.
  const prefix = pet ? ASIDE_SEP : "";

  const base = { ...where, pet, question };
  const save = (record: Omit<ChatRecord, keyof typeof base | "duration_ms">) =>
    after(() => saveChat({ ...base, ...record, duration_ms: Date.now() - started }));

  if (route.kind === "refuse") {
    const reply = refusal(route.reason);
    save({ answer: reply, outcome: "refused", refused_reason: route.reason });
    return text(prefix + reply);
  }

  const routed = { sections: route.sections, fallback: route.fallback, model: ANSWER_MODEL };
  try {
    const answer = await streamAnswer({
      key,
      model: ANSWER_MODEL,
      system: systemPrompt(route.sections, sections, relay),
      messages,
      signal: req.signal,
    });
    // A pet without a soul still gets the prefix, with no aside: the bubble uses a fixed one.
    const relayed = relay
      ? answer.pipeThrough(splitAside())
      : prefix
        ? answer.pipeThrough(prepend(prefix))
        : answer;
    // Saved once the answer has finished streaming (or the visitor stopped it).
    const { stream, finished } = recordStream(relayed, req.signal);
    after(async () => {
      const { text, complete } = await finished;
      const { aside, answer } = prefix ? parseRelayed(text) : { aside: null, answer: text };
      await saveChat({
        ...base,
        ...routed,
        answer,
        aside,
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
 * The chat's random session ID, the page it was asked from and where the
 * visitor came from, for the saved record. Anything malformed is dropped (or
 * gets a fresh ID) rather than failing the chat.
 */
function visit(body: unknown): Pick<ChatRecord, "conversation_id" | "page" | "referrer" | "utm_source"> {
  const { conversationId, page, referrer, utmSource } = (body ?? {}) as Record<string, unknown>;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const domain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
  return {
    conversation_id: typeof conversationId === "string" && uuid.test(conversationId) ? conversationId : crypto.randomUUID(),
    page: typeof page === "string" && page.startsWith("/") ? page.slice(0, 200) : null,
    referrer: typeof referrer === "string" && referrer.length <= 100 && domain.test(referrer) ? referrer : null,
    utm_source: typeof utmSource === "string" && UTM_TOKEN.test(utmSource) ? utmSource : null,
  };
}

/** The visitor's new question; null when it's missing, empty or too long. */
function parse(body: unknown): string | null {
  const raw = (body as { question?: unknown } | null)?.question;
  if (typeof raw !== "string") return null;
  const question = raw.trim();
  return question && question.length <= MAX_MESSAGE ? question : null;
}

/** Puts `text` in front of a stream. */
function prepend(text: string): TransformStream<Uint8Array, Uint8Array> {
  return new TransformStream({
    start(out) {
      out.enqueue(new TextEncoder().encode(text));
    },
  });
}

const textHeaders = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

function text(body: string) {
  return new Response(body, { headers: textHeaders });
}
