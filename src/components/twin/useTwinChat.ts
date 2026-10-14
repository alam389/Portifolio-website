"use client";

import { useEffect, useRef, useState } from "react";
import { TWIN_MOOD_EVENT, type TwinMood } from "@/components/pet/events";
import { Pacer } from "@/lib/twin/pace";

export interface Message {
  role: "user" | "assistant";
  content: string;
  /** A failed request, shown in the log but never sent back as history. */
  error?: boolean;
  /** When the pet relays the answer: its aside before it, and what it does while waiting. */
  relay?: { aside: string; thinking: string };
}

/** An error whose message is safe to show the visitor. */
class ChatError extends Error {}

const OFFLINE = "Couldn't reach the twin. Check your connection and try again.";

/** Tells the pet what the twin is doing; harmless when there's no pet. */
const mood = (detail: TwinMood) => dispatchEvent(new CustomEvent(TWIN_MOOD_EVENT, { detail }));

/** How often the paced answer is redrawn. */
const TICK_MS = 50;

/**
 * The conversation with /api/chat: history, streaming and stopping. Answers
 * arrive as fast as the model writes them but are shown at reading pace
 * (`Pacer`), all at once under reduced motion; `pending` lasts until the
 * whole answer is on screen, so Stop and aria-busy cover the reveal. Shared by
 * the panel and the pet's speech bubble, and kept by TwinChat so switching
 * between them (the pet turned off mid-chat) keeps the conversation.
 */
export function useTwinChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const abort = useRef<AbortController | null>(null);
  /** Random, made on the first question; links this visit's turns in the saved chats. */
  const conversation = useRef<string | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  async function send(text: string, relay?: Message["relay"]) {
    const content = text.trim();
    if (!content || pending) return;
    const history: Message[] = [...messages.filter((m) => !m.error), { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "", relay }]);
    setPending(true);
    mood("thinking");
    const controller = new AbortController();
    abort.current = controller;
    conversation.current ??= crypto.randomUUID();
    const pacer = new Pacer();
    let shown = false;
    let broken = false;
    const show = (text: string) => {
      if (!text) return;
      if (!shown) mood("answered");
      shown = true;
      setMessages((ms) => appendToLast(ms, text));
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          conversationId: conversation.current,
          page: location.pathname,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new ChatError(body?.error ?? "Something went wrong. Try again in a moment.");
      }
      const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reveal as it streams in, then until everything that arrived is shown.
      const revealed = new Promise<void>((resolve) => {
        const id = setInterval(() => {
          if (!controller.signal.aborted && !broken) show(instant ? pacer.flush() : pacer.take(performance.now()));
          if (controller.signal.aborted || broken || pacer.done) {
            clearInterval(id);
            resolve();
          }
        }, TICK_MS);
      });
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        pacer.push(value);
      }
      pacer.end();
      await revealed;
      if (controller.signal.aborted) throw new DOMException("Stopped", "AbortError");
      if (!shown) mood("idle");
    } catch (err) {
      broken = true;
      mood("idle");
      // Stopped on purpose: the rest goes unsaid. Broken off: show what did arrive.
      const rest = controller.signal.aborted ? "" : pacer.flush();
      setMessages((ms) => {
        const kept = dropEmptyLast(rest ? appendToLast(ms, rest) : ms);
        // Stopped on purpose: keep whatever streamed, say nothing.
        if (controller.signal.aborted) return kept;
        return [...kept, { role: "assistant", content: err instanceof ChatError ? err.message : OFFLINE, error: true }];
      });
    } finally {
      setPending(false);
      abort.current = null;
    }
  }

  return { messages, pending, send, stop: () => abort.current?.abort() };
}

export type TwinChatState = ReturnType<typeof useTwinChat>;

function appendToLast(ms: Message[], text: string): Message[] {
  const last = ms[ms.length - 1];
  return [...ms.slice(0, -1), { ...last, content: last.content + text }];
}

function dropEmptyLast(ms: Message[]): Message[] {
  const last = ms[ms.length - 1];
  return last?.role === "assistant" && !last.content ? ms.slice(0, -1) : ms;
}
