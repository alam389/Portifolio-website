import { outline } from "./outline";
import type { Frame, Variant } from "./types";

export interface Food {
  frame: Frame;
  colors: Variant;
}

// Each species' treat, fills only (the outline is added at load). They lie on
// their side with a column of padding so the outline fits.

// Fish, head left. b scales, w belly, t tail, e eye.
const fish: Frame = [
  "...........",
  "....bbb..t.",
  "..bbbbbbtt.",
  ".bebbbbbbt.",
  "..wwwwwbtt.",
  "....www..t.",
  "...........",
];

// Bone. w bone, s underside shade.
const bone: Frame = [
  "............",
  ".ww......ww.",
  ".wwwwwwwwww.",
  ".wsssssssws.",
  ".ws......ws.",
  "............",
];

// Carrot, point left, leaves right. c carrot, d ridges, g leaves.
const carrot: Frame = [
  ".............",
  "....ccccc.g..",
  ".cccdcccdcgg.",
  "...ccccccc.g.",
  ".............",
];

export const FOOD = {
  cat: {
    frame: outline(fish),
    colors: {
      label: "Fish",
      colors: { b: "#8fb3c9", w: "#e3edf2", t: "#5f86a0", e: "#1f1a17" },
      outline: { light: "#2b3a45", dark: "#4e6b80" },
    },
  },
  dog: {
    frame: outline(bone),
    colors: {
      label: "Bone",
      colors: { w: "#efe6d2", s: "#c9bc9e" },
      outline: { light: "#4a3f2e", dark: "#8a7d63" },
    },
  },
  bunny: {
    frame: outline(carrot),
    colors: {
      label: "Carrot",
      colors: { c: "#ec8a2e", d: "#c0641a", g: "#5fae4a" },
      outline: { light: "#4a2a10", dark: "#8a4a1c" },
    },
  },
} satisfies Record<string, Food>;

/**
 * The treat with a share already eaten (0 whole, 1 gone), bitten from the
 * side the pet is eating at.
 */
export function bitten(frame: Frame, eaten: number, fromLeft: boolean): Frame {
  const width = frame[0].length;
  const cut = Math.round(width * eaten);
  return frame.map((row) =>
    fromLeft ? ".".repeat(cut) + row.slice(cut) : row.slice(0, width - cut) + ".".repeat(cut),
  );
}
