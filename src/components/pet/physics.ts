/** Shared by the pet and its ball. Coordinates are viewport pixels. */

export interface Surface {
  /** The element whose top edge this is; null for the viewport floor. */
  el: Element | null;
  left: number;
  right: number;
  top: number;
}

/**
 * Where the pet lives: the viewport floor, plus the platforms on screen now.
 * The page adapter is `trackSurfaces` (surfaces.ts); tests use `Stage`
 * (stage.ts).
 */
export interface World {
  /** The bottom of the viewport; its `right` is the window width. */
  readonly floor: Surface;
  /** The platforms on screen now. */
  surfaces(): Surface[];
}

export const GRAVITY = 2000;
const MAX_FALL = 1400;

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** One gravity step, exact for constant acceleration so arcs reach their aim. */
export function fall(y: number, vy: number, dt: number) {
  const next = Math.min(vy + GRAVITY * dt, MAX_FALL);
  return { y: y + ((vy + next) / 2) * dt, vy: next };
}

/** The surface a body moving down from `prev` to `y` lands on this frame, if any. */
export function landing(surfaces: Surface[], floor: Surface, prev: number, y: number, cx: number, minTop: number) {
  for (const o of surfaces) {
    if (prev <= o.top + 2 && y >= o.top && cx >= o.left && cx <= o.right && o.top > minTop) return o;
  }
  return y >= floor.top ? floor : null;
}
