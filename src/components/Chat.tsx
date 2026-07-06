"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile } from "@/data";
import {
  ENTRIES,
  matchEntry,
  type AgentEntry,
  type ProjectLink,
} from "@/data/agent";
import { AnswerBlocks } from "./AnswerBlocks";

// The digital-twin chat. Pregenerated engine (see src/data/agent.ts) — a
// swap to a live LLM later means replacing matchEntry with an API call.

interface Msg {
  id: number;
  role: "user" | "agent";
  text?: string;
  entry?: AgentEntry;
}

export function Chat({ projects }: { projects: ProjectLink[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const nextId = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = (entry: AgentEntry, question: string) => {
    setMessages((m) => [
      ...m,
      { id: ++nextId.current, role: "user", text: question },
      { id: ++nextId.current, role: "agent", entry },
    ]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(matchEntry(q), q);
  };

  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const started = messages.length > 0;
  const chips = ENTRIES.filter((e) => e.chip);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-4 pt-8 md:pt-12">
      {/* hero */}
      <div className={started ? "mb-6" : "mb-8 text-center"}>
        <div className={started ? "flex items-center gap-3" : ""}>
          <Image
            src="/images/TSI-headshot.jpeg"
            alt={`${profile.name} headshot`}
            width={started ? 40 : 88}
            height={started ? 40 : 88}
            className={`rounded-full object-cover ${started ? "" : "mx-auto"}`}
            priority
          />
          <div>
            <h1
              className={`font-semibold tracking-tight ${
                started ? "text-base" : "mt-4 text-3xl md:text-4xl"
              }`}
            >
              I&apos;m {profile.name.split(" ")[0]}&apos;s digital twin
            </h1>
            {started && (
              <p className="text-[12px] text-muted">
                pregenerated · no live model
              </p>
            )}
          </div>
        </div>
        {!started && (
          <>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-muted">
              {profile.about[0]}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-sidebar px-4 py-1.5 text-sm">
              <span
                className="h-2 w-2 rounded-full bg-syn-green"
                aria-hidden="true"
              />
              Open to work
            </span>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-2">
              {chips.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => ask(e, e.question)}
                  className="rounded-xl border border-border bg-sidebar px-4 py-3 text-left text-sm outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {e.question}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* conversation */}
      <div className="flex-1 space-y-5" aria-live="polite">
        {messages.map((m) =>
          m.role === "user" ? (
            <p
              key={m.id}
              className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-selection px-4 py-2 text-sm"
            >
              {m.text}
            </p>
          ) : (
            <div key={m.id} className="max-w-[95%] text-sm">
              {m.entry && <AnswerBlocks entry={m.entry} projects={projects} />}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {/* command bar + input */}
      <div className="sticky bottom-0 mt-6 bg-background pb-1 pt-2">
        <div className="mb-2.5 flex flex-wrap justify-center gap-1.5">
          {ENTRIES.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => ask(e, e.question)}
              className="rounded-full border border-border px-3 py-1 font-mono text-[12px] text-muted outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
            >
              {e.label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything"
            aria-label="Ask the digital twin a question"
            className="h-11 flex-1 rounded-full border border-border bg-sidebar px-5 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      </div>
    </div>
  );
}
