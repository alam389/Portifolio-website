"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
import { Composer, Linkified, Starters, Thinking, iconButton } from "./parts";
import type { AssistantChatState } from "./useAssistantChat";

/**
 * The assistant as a plain chat panel, for when the pet is turned off: a
 * full-screen sheet on mobile, a corner panel from md up.
 */
export default function ChatPanel({
  chat,
  greeting,
  starters,
  privacyNote,
  inputRef,
  onClose,
  onNavigate,
}: {
  chat: AssistantChatState;
  greeting: string;
  starters: string[];
  privacyNote: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const { messages, pending, send, stop } = chat;
  const log = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);

  return (
    <section
      role="dialog"
      aria-labelledby="assistant-title"
      data-pet-ignore
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex flex-col bg-surface transition-[opacity,translate] duration-200 starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none md:inset-auto md:right-6 md:bottom-6 md:z-30 md:h-[min(36rem,calc(100dvh-3rem))] md:w-96 md:rounded-[20px] md:border md:border-foreground/10 md:shadow-lg md:shadow-black/40 md:light:shadow-black/10"
    >
      <header className="flex items-start justify-between gap-4 border-b border-foreground/10 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 md:pt-3">
        <div>
          <h2 id="assistant-title" className="text-lg font-semibold">
            Ask my AI assistant
          </h2>
          <p className="font-mono text-[11px] text-muted">Built from this site. It can get things wrong.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className={iconButton}>
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      <div
        ref={log}
        role="log"
        aria-busy={pending}
        data-lenis-prevent
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <ol className="flex flex-col gap-4 text-sm leading-relaxed">
          <li className="max-w-[92%] text-foreground/85">{greeting}</li>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <li
                key={i}
                className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-foreground/[0.07] px-3 py-2 whitespace-pre-wrap"
              >
                <span className="sr-only">You: </span>
                {m.content}
              </li>
            ) : (
              <li
                key={i}
                className={`max-w-[92%] whitespace-pre-wrap ${m.error ? "text-muted" : "text-foreground/85"}`}
              >
                <span className="sr-only">Assistant: </span>
                {m.content ? <Linkified text={m.content} onNavigate={onNavigate} /> : <Thinking />}
              </li>
            ),
          )}
        </ol>
        {messages.length === 0 && (
          <Starters
            starters={starters}
            onPick={(s) => {
              // The buttons vanish once one's picked; keep focus in the panel.
              inputRef.current?.focus();
              void send(s);
            }}
          />
        )}
      </div>

      <Composer
        inputRef={inputRef}
        pending={pending}
        onSend={(t) => void send(t)}
        onStop={stop}
        note={privacyNote}
        placeholder="Ask about my work, projects…"
        className="border-t border-foreground/10 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
      />
    </section>
  );
}
