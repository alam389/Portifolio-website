import type { Frame } from "./types";

/**
 * Adds a 1px outline: every transparent pixel that touches a filled pixel
 * (4-neighbors, which keeps corners soft) becomes `ch`. Sprites are authored
 * as fills only; hand-placed `ch` pixels still work for interior lines.
 * Uppercase characters are the "behind" layer (far-side legs): they cast no
 * outline, so they read as sitting behind the outlined near side.
 */
export function outline(frame: Frame, ch = "o"): Frame {
  const filled = (x: number, y: number) => {
    const c = frame[y]?.[x];
    return c !== undefined && c !== "." && c === c.toLowerCase();
  };
  return frame.map((row, y) =>
    [...row]
      .map((c, x) =>
        c === "." && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))
          ? ch
          : c,
      )
      .join(""),
  );
}
