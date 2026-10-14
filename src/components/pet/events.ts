// Window events the paw menu sends to the pet. Kept apart from Pet.tsx so the
// menu doesn't pull the pet into the main bundle.

/** Throw the pet a ball. */
export const THROW_BALL_EVENT = "pet:throw-ball";

/** Drop the pet its food. */
export const FEED_EVENT = "pet:feed";

/** Pat the pet (the keyboard-friendly version of clicking it). */
export const PAT_EVENT = "pet:pat";

// The AI twin's chat, talking through the pet.

/** Marks the chat's speech bubble, which the pet positions over its head. */
export const TWIN_BUBBLE_SELECTOR = "[data-twin-bubble]";

/** Open the twin's chat (the pet's invite and the paw menu send this). */
export const TWIN_OPEN_EVENT = "twin:open";

/** The chat opened: sit where it is and carry the bubble. */
export const TWIN_SUMMON_EVENT = "pet:twin-summon";

/** The chat closed: hop off and carry on. */
export const TWIN_DISMISS_EVENT = "pet:twin-dismiss";

/** What the twin is doing, for the pet to act out; `detail` is a `TwinMood`. */
export const TWIN_MOOD_EVENT = "pet:twin-mood";
export type TwinMood = "thinking" | "answered" | "idle";
