import { describe, expect, it } from "vitest";
import { ANIMATIONS, SPECIES, SPECIES_NAMES, outlinedFrames, paletteFor } from ".";
import { SPRITE_SIZE } from "./types";

describe.each(SPECIES_NAMES)("%s sprites", (species) => {
  const frames = outlinedFrames(species);

  it("has every frame its animations reference", () => {
    for (const [anim, { frames: names }] of Object.entries(ANIMATIONS[species])) {
      for (const name of names) {
        expect(frames[name], `${anim} → ${name}`).toBeDefined();
      }
    }
  });

  it("draws every frame as 16x16 using only palette characters", () => {
    for (const variant of Object.values(SPECIES[species].variants)) {
      for (const theme of ["light", "dark"] as const) {
        const palette = paletteFor(variant, theme);
        for (const [name, rows] of Object.entries(frames)) {
          expect(rows, name).toHaveLength(SPRITE_SIZE);
          for (const row of rows) {
            expect(row, name).toHaveLength(SPRITE_SIZE);
            for (const ch of row) if (ch !== ".") expect(palette, `${name} "${ch}"`).toHaveProperty(ch);
          }
        }
      }
    }
  });
});
