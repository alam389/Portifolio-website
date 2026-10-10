// Window events the paw menu sends to the pet. Kept apart from Pet.tsx so the
// menu doesn't pull the pet into the main bundle.

/** Throw the pet a ball. */
export const THROW_BALL_EVENT = "pet:throw-ball";

/** Drop the pet its food. */
export const FEED_EVENT = "pet:feed";

/** Pat the pet (the keyboard-friendly version of clicking it). */
export const PAT_EVENT = "pet:pat";
