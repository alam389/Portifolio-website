"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile } from "@/data";
import { ENTRIES, matchEntry, type AgentEntry } from "@/data/agent";
import { AnswerBlock } from "./AnswerCards";
import { ThemeToggle } from "./ThemeToggle";
import { pixelPoof } from "@/lib/poof";

// Chat-first digital twin — the whole site is the conversation (DESIGN.md B).
// Empty state: one centered group with the composer as the focal point.
// Started state: real chat anatomy — messages scroll, composer at the bottom.
// Pregenerated engine now; the live /api/chat swap is the one seam in `reply`.

interface Msg {
  id: number;
  role: "user" | "twin";
  text?: string;
  entry?: AgentEntry;
}

const firstName = profile.name.split(" ")[0];

export function Twin() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const nextId = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = (entry: AgentEntry, question: string) => {
    setMessages((m) => [
      ...m,
      { id: ++nextId.current, role: "user", text: question },
      { id: ++nextId.current, role: "twin", entry },
    ]);
  };

  // --- ANSWER SEAM -----------------------------------------------------------
  // Pregenerated today. To go live: replace matchEntry(q) with a fetch to
  // POST /api/chat and stream chunks into the last twin message.
  // TODO(backend): const res = await fetch("/api/chat", { method: "POST",
  //   body: JSON.stringify({ messages }) }); then read res.body as a stream.
  const reply = (q: string): AgentEntry => matchEntry(q);
  // ---------------------------------------------------------------------------

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(reply(q), q);
  };

  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const started = messages.length > 0;
  const chips = ENTRIES.filter((e) => e.chip);

  const composer = (
    <form onSubmit={submit} className="relative w-full">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything"
        aria-label="Ask the digital twin"
        className="glass px-shadow h-[52px] w-full border-2 border-border pl-5 pr-14 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-fg/70"
      />
      <button
        type="submit"
        aria-label="Send"
        className="mc-btn absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-ok text-[#0a1a05] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/70"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <path
            d="M2.5 8h10m0 0L8.5 4M12.5 8l-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );

  return (
    <div className="pixel-ui mx-auto flex h-full w-full max-w-3xl flex-col px-4 md:px-8">
      <Header />

      {!started ? (
        /* Empty state: one centered composition — identity, one line, composer,
           suggestion chips. No orphaned bottom bar. */
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pb-12 text-center">
          {/* tiny source upscaled with image-rendering:pixelated = blocky MC head */}
          <Image
            src="/images/TSI-headshot.jpeg"
            alt={`${profile.name} headshot`}
            width={20}
            height={20}
            priority
            className="reveal pixelated px-shadow h-[80px] w-[80px] border-2 border-fg/25 object-cover"
          />
          <h1 className="reveal mt-6 text-balance px-2 text-[clamp(1.4rem,6.5vw,2.25rem)] font-semibold leading-tight tracking-tight">
            I&apos;m {firstName}&apos;s digital twin
          </h1>
          <p className="reveal mt-3 text-muted">
            Ask about my skills, projects, or experience.
          </p>
          <span className="reveal mc-btn mt-5 inline-flex items-center gap-2 border border-border bg-surface px-4 py-1.5 text-sm">
            <span className="h-2.5 w-2.5 bg-ok" aria-hidden="true" />
            Open to work
          </span>
          <div className="reveal mt-9 w-full max-w-xl">{composer}</div>
          <div className="reveal mt-4 flex flex-wrap items-center justify-center gap-2">
            {chips.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={(ev) => {
                  pixelPoof(ev.currentTarget);
                  ask(e, e.question);
                }}
                className="glass mc-btn border border-border px-4 py-2 text-[13px] text-fg/85 transition-colors hover:border-fg/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/70"
              >
                {e.question}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Started state: real chat anatomy. */
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-6 py-6" aria-live="polite">
              {messages.map((m) =>
                m.role === "user" ? (
                  <p
                    key={m.id}
                    className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-surface px-4 py-2 text-sm"
                  >
                    {m.text}
                  </p>
                ) : (
                  m.entry && <TwinMessage key={m.id} entry={m.entry} />
                ),
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="pb-4 pt-2">
            <div className="mb-2.5 flex flex-wrap justify-center gap-1.5">
              {ENTRIES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={(ev) => {
                    pixelPoof(ev.currentTarget);
                    ask(e, e.question);
                  }}
                  className="mc-btn border border-border px-3 py-1 text-[12px] text-muted transition-colors hover:border-fg/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/70"
                >
                  {e.label}
                </button>
              ))}
            </div>
            {composer}
          </div>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2.5">
        <Image
          src="/images/TSI-headshot.jpeg"
          alt=""
          width={12}
          height={12}
          className="pixelated h-9 w-9 border border-fg/20 object-cover"
        />
        <div className="leading-tight">
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="text-[11px] text-muted">{profile.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
          <span className="h-1.5 w-1.5 bg-muted" aria-hidden="true" />
          pregenerated
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

function TwinMessage({ entry }: { entry: AgentEntry }) {
  const { shown, done } = useTyped(entry.text);
  return (
    <div className="max-w-[92%] text-sm">
      {/* Visible typing is aria-hidden so SR isn't spammed per character; the
          full answer is announced once via the sr-only region below. */}
      <p className="leading-7" aria-hidden="true">
        {shown}
        {!done && (
          <span
            className="ml-0.5 inline-block h-4 w-[6px] translate-y-0.5 animate-pulse bg-fg/70"
          />
        )}
      </p>
      {done && <span className="sr-only">{entry.text}</span>}
      {done && entry.block && <AnswerBlock block={entry.block} />}
    </div>
  );
}

// Streaming-style typing effect (instant under reduced-motion).
function useTyped(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setN(text.length);
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setN(Math.min(i, text.length));
      if (i >= text.length) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [text]);
  return { shown: text.slice(0, n), done: n >= text.length };
}
