import type { Frame, Variant } from "./types";

// The fetch ball, 6x6 with its outline drawn in. r red, d shade, w shine.
export const BALL: Frame = [
  ".oooo.",
  "owwrro",
  "owrrro",
  "orrrdo",
  "orrddo",
  ".oooo.",
];

export const BALL_COLORS: Variant = {
  label: "Ball",
  colors: { r: "#d9483b", d: "#a8322a", w: "#f6b0a6" },
  outline: { light: "#3a1f1a", dark: "#7a2a22" },
};
