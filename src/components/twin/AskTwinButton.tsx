"use client";

import { TWIN_OPEN_EVENT } from "@/components/pet/events";

// Opens the twin chat from anywhere on a page, the same way the paw menu does.
export default function AskTwinButton() {
  return (
    <button
      type="button"
      onClick={() => dispatchEvent(new Event(TWIN_OPEN_EVENT))}
      className="font-medium underline-offset-4 hover:underline"
    >
      Ask the twin <span aria-hidden className="text-muted">→</span>
    </button>
  );
}
