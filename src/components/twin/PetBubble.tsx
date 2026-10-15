"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
import { relayHello, relayLine } from "@/components/pet/speech";
import type { SpeciesName } from "@/components/pet/sprites";
import { Composer, Linkified, Starters, Thinking, iconButton } from "./parts";
import type { TwinChatState } from "./useTwinChat";

// The twin talking through the pet. The pet sits down wherever it is, and
// Pet.tsx positions this bubble (marked data-twin-bubble) over its head every
// frame, setting the tail's side (data-side) and position (--tail-x). Until
// the pet has placed it, it waits in the corner where the launcher was.

/**
 * Show the newest exchange, like a speech bubble would; the full history
 * still goes to the twin, so follow-ups work.
 */
export default function PetBubble({
  chat,
  species,
  starters,
  privacyNote,
  inputRef,
  onClose,
  onNavigate,
}: {
  chat: TwinChatState;
  species: SpeciesName;
  starters: string[];
  privacyNote: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const { messages, pending, send, stop } = chat;
  const log = useRef<HTMLDivElement>(null);
  const answer = messages.at(-1)?.role === "assistant" ? messages.at(-1) : undefined;
  const question = messages.findLast((m) => m.role === "user");

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [answer?.content]);

  // The pet's asides are picked here, in the event, so renders stay pure.
  const ask = (text: string) =>
    void send(text, {
      pet: species,
      aside: relayLine(species, "aside"),
      thinking: relayLine(species, "thinking"),
    });

  return (
    <>
      <section
        role="dialog"
        aria-labelledby="twin-title"
        data-pet-ignore
        data-twin-bubble
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="group fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-foreground/25 bg-surface shadow-lg shadow-black/40 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none light:shadow-black/10 md:right-6 md:bottom-6"
      >
        <div className="flex items-center justify-between gap-3 pt-2 pr-2 pl-4">
          <h2 id="twin-title" className="font-mono text-[11px] font-normal text-muted">
            the {species} · relaying Anthony&apos;s AI twin
          </h2>
          <button type="button" onClick={onClose} aria-label="Close chat" className={iconButton}>
            <X size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div
          ref={log}
          role="log"
          aria-busy={pending}
          data-lenis-prevent
          className="max-h-[min(18rem,45vh)] overflow-y-auto overscroll-contain px-4 pb-3 text-sm leading-relaxed"
        >
          {!question ? (
            <>
              <p className="text-foreground/85">{relayHello(species)}</p>
              <Starters
                starters={starters}
                onPick={(s) => {
                  // The buttons vanish once one's picked; keep focus in the bubble.
                  inputRef.current?.focus();
                  ask(s);
                }}
              />
            </>
          ) : (
            <>
              <p className="font-mono text-[11px] text-muted">
                <span className="sr-only">You asked: </span>
                <span aria-hidden>you: </span>
                {question.content}
              </p>
              {answer && (
                <div className={`mt-2 whitespace-pre-wrap ${answer.error ? "text-muted" : "text-foreground/85"}`}>
                  {answer.relay && answer.content && !answer.error && (
                    <p className="mb-1 font-mono text-[11px] text-muted">{answer.relay.aside}</p>
                  )}
                  {answer.content ? (
                    <Linkified text={answer.content} onNavigate={onNavigate} />
                  ) : (
                    <Thinking label={answer.relay?.thinking} />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <Composer
          inputRef={inputRef}
          pending={pending}
          onSend={ask}
          onStop={stop}
        note={privacyNote}
          placeholder={question ? "Ask a follow-up…" : "Ask about Anthony…"}
          className="px-3 pb-3"
        />

        {/* The tail, on the side facing the pet; hidden until the pet places the bubble. */}
        <span
          aria-hidden
          className="absolute left-(--tail-x) hidden size-2.5 -translate-x-1/2 rotate-45 border-foreground/25 bg-surface group-data-[side]:block group-data-[side=bottom]:-bottom-[6px] group-data-[side=bottom]:border-r group-data-[side=bottom]:border-b group-data-[side=top]:-top-[6px] group-data-[side=top]:border-t group-data-[side=top]:border-l"
        />
      </section>
    </>
  );
}
