/**
 * Pet sprites are authored as text: each frame is 16 rows of 16 characters,
 * one character per pixel. "." is transparent; every other character is a key
 * into the variant's colors, so recoloring a pet (a coat variant, or the
 * light/dark outline) never touches the frames. Frames face right; facing
 * left is a horizontal flip at draw time.
 */
export const SPRITE_SIZE = 16;

export type Frame = readonly string[];

/** Character → CSS hex color. */
export type Palette = Readonly<Record<string, string>>;

export type Theme = "light" | "dark";

/** A coat color. The outline ("o") is per theme: it has to read on both backgrounds. */
export interface Variant {
  label: string;
  colors: Palette;
  outline: Readonly<Record<Theme, string>>;
}

export interface SpeciesSprites {
  /** The first variant is the default. */
  variants: Readonly<Record<string, Variant>>;
  frames: Readonly<Record<string, Frame>>;
}

export function paletteFor(variant: Variant, theme: Theme): Palette {
  return { ...variant.colors, o: variant.outline[theme] };
}
