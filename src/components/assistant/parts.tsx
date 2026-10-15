"use client";

import Link from "next/link";
import { ArrowUp, Square } from "lucide-react";
import { useId, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { MAX_MESSAGE } from "@/lib/assistant/limits";

// Pieces shared by the chat panel and the pet's speech bubble.

export const iconButton =
  "flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 disabled:pointer-events-none disabled:opacity-40";

/** The question box: Enter sends, Shift+Enter is a new line; Stop while an answer streams. */
export function Composer({
  inputRef,
  pending,
  onSend,
  onStop,
  placeholder,
  note,
  className = "",
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  pending: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  placeholder: string;
  /** A line under the box, e.g. that chats are saved. */
  note?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const id = useId();

  function submit() {
    if (!draft.trim() || pending) return;
    onSend(draft);
    setDraft("");
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <label htmlFor={id} className="sr-only">
        Your question
      </label>
      <div className="flex items-end gap-2 rounded-xl border border-foreground/15 bg-background py-1.5 pr-1.5 pl-3 transition-colors focus-within:border-foreground/40">
        <textarea
          ref={inputRef}
          id={id}
          rows={1}
          maxLength={MAX_MESSAGE}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="field-sizing-content max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted"
        />
        {pending ? (
          <button type="button" onClick={onStop} aria-label="Stop" className={iconButton}>
            <Square size={14} strokeWidth={2} fill="currentColor" aria-hidden />
          </button>
        ) : (
          <button type="submit" disabled={!draft.trim()} aria-label="Send" className={iconButton}>
            <ArrowUp size={18} strokeWidth={1.75} aria-hidden />
          </button>
        )}
      </div>
      {(note || draft.length > MAX_MESSAGE - 50) && (
        <p className="mt-1.5 flex justify-between gap-3 font-mono text-[10px] text-muted">
          <span>{note}</span>
          {draft.length > MAX_MESSAGE - 50 && (
            <span>
              {draft.length}/{MAX_MESSAGE}
            </span>
          )}
        </p>
      )}
    </form>
  );
}

/** Suggested first questions. */
export function Starters({ starters, onPick }: { starters: string[]; onPick: (s: string) => void }) {
  if (!starters.length) return null;
  return (
    <ul aria-label="Suggested questions" className="mt-4 flex flex-col items-start gap-2">
      {starters.map((s) => (
        <li key={s}>
          <button
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-foreground/15 px-3 py-1.5 text-left text-sm text-foreground/75 transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Shown while the first words of an answer are on their way. */
export function Thinking({ label = "…" }: { label?: string }) {
  return (
    <span className="animate-pulse text-muted motion-reduce:animate-none">
      <span aria-hidden>{label}</span>
      <span className="sr-only">Thinking</span>
    </span>
  );
}

// Site paths (/projects), emails and URLs in a reply become links. The path
// can't follow a word or slash, so "and/or" stays text.
const TOKEN =
  /(https?:\/\/[^\s)]*[^\s).,!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|(?<![\w/])\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*)/gi;
const linkClass = "underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";

export function Linkified({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  return text.split(TOKEN).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part.startsWith("/")) {
      return (
        <Link key={i} href={part} onClick={onNavigate} className={linkClass}>
          {part}
        </Link>
      );
    }
    const href = part.includes("@") && !part.startsWith("http") ? `mailto:${part}` : part;
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {part}
      </a>
    );
  });
}
