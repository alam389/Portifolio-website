"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { TWIN_DISMISS_EVENT, TWIN_OPEN_EVENT, TWIN_SUMMON_EVENT } from "@/components/pet/events";
import { usePetPreference } from "@/components/pet/preferences";
import ChatPanel from "./ChatPanel";
import PetBubble from "./PetBubble";
import { useTwinChat } from "./useTwinChat";

// The AI twin, on every page (mounted from layout.tsx, so the conversation
// survives navigation). With the pet on, there's no button: the pet invites
// the visitor to ask (and the paw menu has an "Ask" row), then relays the
// answers in a speech bubble. With it off, a corner button opens a plain panel.

export default function TwinChat({
  greeting,
  starters,
  privacyNote,
}: {
  greeting: string;
  starters: string[];
  privacyNote: string;
}) {
  const [open, setOpen] = useState(false);
  const chat = useTwinChat();
  const pet = usePetPreference();
  const input = useRef<HTMLTextAreaElement>(null);
  /** Whatever opened the chat (the launcher, the pet's invite, the paw menu), for focus to return to. */
  const opener = useRef<HTMLElement | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  // Focus moves into the chat on open and back to its opener on close. The
  // bubble exists once the open render has committed, so summon after it.
  function show() {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    flushSync(() => setOpen(true));
    input.current?.focus();
    dispatchEvent(new Event(TWIN_SUMMON_EVENT));
  }
  function hide() {
    dispatchEvent(new Event(TWIN_DISMISS_EVENT));
    flushSync(() => setOpen(false));
    // The launcher re-mounts on close, so it's a new element: focus that instead.
    if (opener.current?.isConnected) opener.current.focus();
    else launcher.current?.focus();
  }

  // The pet's invite and the paw menu open the chat from outside.
  const showRef = useRef(show);
  useEffect(() => {
    showRef.current = show;
  });
  useEffect(() => {
    const onOpen = () => showRef.current();
    addEventListener(TWIN_OPEN_EVENT, onOpen);
    return () => removeEventListener(TWIN_OPEN_EVENT, onOpen);
  }, []);
  // Following a link from a reply: on mobile the chat covers the page, so close it.
  function onNavigate() {
    if (!window.matchMedia("(min-width: 48rem)").matches) hide();
  }

  if (!open) {
    // With the pet on, the pet itself is the way in.
    if (pet.enabled) return null;
    return (
      <button
        ref={launcher}
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 rounded-full border border-foreground/10 bg-surface/90 p-3 text-sm text-foreground/80 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 light:shadow-black/10 md:right-6 md:bottom-6 md:px-4 md:py-2.5"
      >
        <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
        <span className="sr-only md:not-sr-only">Ask me</span>
      </button>
    );
  }

  const shared = { chat, starters, privacyNote, inputRef: input, onClose: hide, onNavigate };
  return pet.enabled ? (
    <PetBubble {...shared} species={pet.species} />
  ) : (
    <ChatPanel {...shared} greeting={greeting} />
  );
}
