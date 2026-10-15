// Window events the paw menu sends to the pet. Kept apart from Pet.tsx so the
// menu doesn't pull the pet into the main bundle.

/** Throw the pet a ball. */
export const THROW_BALL_EVENT = "pet:throw-ball";

/** Drop the pet its food. */
export const FEED_EVENT = "pet:feed";

/** Pat the pet (the keyboard-friendly version of clicking it). */
export const PAT_EVENT = "pet:pat";

// The AI assistant's chat, talking through the pet.

/** Marks the chat's speech bubble, which the pet positions over its head. */
export const ASSISTANT_BUBBLE_SELECTOR = "[data-assistant-bubble]";

/** Open the assistant's chat (the pet's invite and the paw menu send this). */
export const ASSISTANT_OPEN_EVENT = "assistant:open";

/** The chat opened: sit where it is and carry the bubble. */
export const ASSISTANT_SUMMON_EVENT = "pet:assistant-summon";

/** The chat closed: hop off and carry on. */
export const ASSISTANT_DISMISS_EVENT = "pet:assistant-dismiss";

/** What the assistant is doing, for the pet to act out; `detail` is a `AssistantMood`. */
export const ASSISTANT_MOOD_EVENT = "pet:assistant-mood";
export type AssistantMood = "thinking" | "answered" | "idle";
