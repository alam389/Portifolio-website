/** Shared by the pet and its ball. Coordinates are viewport pixels. */

export interface Surface {
  /** The element whose top edge this is; null for the viewport floor. */
  el: Element | null;
  left: number;
  right: number;
  top: number;
}

export const GRAVITY = 2000;
export const MAX_FALL = 1400;

/** One gravity step, exact for constant acceleration so arcs reach their aim. */
export function fall(y: number, vy: number, dt: number) {
  const next = Math.min(vy + GRAVITY * dt, MAX_FALL);
  return { y: y + ((vy + next) / 2) * dt, vy: next };
}

/** The surface a body moving down from `prev` to `y` lands on this frame, if any. */
export function landing(surfaces: Surface[], floor: Surface, prev: number, y: number, cx: number, minTop: number) {
  return (
    surfaces.find((o) => prev <= o.top + 2 && y >= o.top && cx >= o.left && cx <= o.right && o.top > minTop) ??
    (y >= floor.top ? floor : null)
  );
}
