"use client";

import { ASSISTANT_OPEN_EVENT } from "@/components/pet/events";

// Opens the assistant chat from anywhere on a page, the same way the paw menu does.
export default function AskAssistantButton() {
  return (
    <button
      type="button"
      onClick={() => dispatchEvent(new Event(ASSISTANT_OPEN_EVENT))}
      className="font-medium underline-offset-4 hover:underline"
    >
      Ask my assistant <span aria-hidden className="text-muted">→</span>
    </button>
  );
}
