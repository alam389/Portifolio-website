import { bunny } from "./bunny";
import { cat } from "./cat";
import { dog } from "./dog";
import { outline } from "./outline";
import type { Frame, SpeciesSprites } from "./types";

export { SPRITE_SIZE, paletteFor } from "./types";
export type { Frame, Palette, Theme, Variant } from "./types";

export const SPECIES = { cat, dog, bunny } as const;
export type SpeciesName = keyof typeof SPECIES;
export const SPECIES_NAMES = Object.keys(SPECIES) as SpeciesName[];

/** A species' coat variants as [key, variant] pairs, default first. */
export function variantsOf(species: SpeciesName) {
  return Object.entries(SPECIES[species].variants);
}

export interface Animation {
  frames: readonly string[];
  fps: number;
}

const shared: Record<string, Animation> = {
  // Mostly still, with a blink every couple of seconds.
  idle: { frames: ["idle1", "idle1", "idle1", "idle1", "idle1", "idle2"], fps: 3 },
  sit: { frames: ["sit"], fps: 1 },
  walk: { frames: ["walk1", "walk2", "walk3", "walk4"], fps: 8 },
  jump: { frames: ["crouch", "jump", "fall", "crouch"], fps: 6 },
  sleep: { frames: ["sleep1", "sleep2"], fps: 1.5 },
  held: { frames: ["held"], fps: 1 },
  happy: { frames: ["happy"], fps: 1 },
};

/** Every animation a species can play: the shared set plus its fetch move. */
export const ANIMATIONS: Record<SpeciesName, Record<string, Animation>> = {
  cat: { ...shared, swat: { frames: ["sit", "swat1", "swat2", "swat1"], fps: 6 } },
  dog: { ...shared, carry: { frames: ["carry1", "carry2", "carry3", "carry4"], fps: 8 } },
  bunny: {
    ...shared,
    walk: { frames: ["walk1", "walk2", "walk3", "walk4"], fps: 10 },
    nudge: { frames: ["nudge1", "nudge2"], fps: 4 },
  },
};

const cache = new Map<SpeciesSprites, Record<string, Frame>>();

/** A species' frames with the outline applied, computed once. */
export function outlinedFrames(species: SpeciesName): Record<string, Frame> {
  const sprites = SPECIES[species];
  let frames = cache.get(sprites);
  if (!frames) {
    frames = Object.fromEntries(
      Object.entries(sprites.frames).map(([name, frame]) => [name, outline(frame)]),
    );
    cache.set(sprites, frames);
  }
  return frames;
}
