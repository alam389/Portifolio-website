import type { PetEngine } from "./engine";
import type { Surface } from "./physics";

/** Pointer travel before a press becomes a drag instead of a pat. */
const DRAG_PX = 4;
/** Throw velocity is measured over the last stretch of the drag. */
const THROW_WINDOW_MS = 80;

interface DragHandlers {
  tap(): void;
  /** Return false to refuse the pick-up. */
  grab(): boolean;
  hold(x: number, y: number): void;
  /** Velocity in px/s over the last stretch of the drag. */
  release(vx: number, vy: number): void;
}

/**
 * Press and release = a tap; press and drag = pick up, then throw on release.
 * Returns the cleanup.
 */
function draggable(target: HTMLElement, on: DragHandlers) {
  let press: { id: number; x: number; y: number } | null = null;
  let dragging = false;
  let trail: { x: number; y: number; t: number }[] = [];

  const down = (e: PointerEvent) => {
    press = { id: e.pointerId, x: e.clientX, y: e.clientY };
    dragging = false;
    trail = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    target.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const move = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    if (!dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_PX) {
      if (!on.grab()) return void (press = null);
      dragging = true;
      target.style.cursor = "grabbing";
    }
    if (!dragging) return;
    on.hold(e.clientX, e.clientY);
    trail.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    while (trail.length > 2 && e.timeStamp - trail[0].t > THROW_WINDOW_MS) trail.shift();
  };
  const up = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    press = null;
    target.style.cursor = "";
    if (!dragging) return on.tap();
    const a = trail[0];
    const b = trail[trail.length - 1];
    const secs = Math.max((b.t - a.t) / 1000, 0.016);
    on.release((b.x - a.x) / secs, (b.y - a.y) / secs);
  };

  target.addEventListener("pointerdown", down);
  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", up);
  target.addEventListener("pointercancel", up);
  return () => {
    target.removeEventListener("pointerdown", down);
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", up);
    target.removeEventListener("pointercancel", up);
  };
}

/**
 * The pet: tap to pat, drag to pick up and throw. The ball: tap to pop it up,
 * drag to fling it. Also tracks the cursor so the pet can follow it. Returns
 * the cleanup.
 */
export function attachGestures(
  pet: HTMLElement,
  ball: HTMLElement,
  engine: PetEngine,
  surfaces: () => Surface[],
  floor: Surface,
) {
  const undragPet = draggable(pet, {
    tap: () => engine.pet(),
    grab: () => (engine.grab(), true),
    hold: (x, y) => engine.holdAt(x, y),
    release: (vx, vy) => engine.release(vx, vy, surfaces(), floor),
  });
  const undragBall = draggable(ball, {
    tap: () => {
      if (engine.grabBall()) engine.releaseBall((Math.random() - 0.5) * 240, -380);
    },
    grab: () => engine.grabBall(),
    hold: (x, y) => engine.holdBall(x, y),
    release: (vx, vy) => engine.releaseBall(vx, vy),
  });
  // Touch has no hovering cursor to follow.
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "touch") engine.point(e.clientX, e.clientY, e.timeStamp);
  };
  const onLeave = () => engine.unpoint();
  addEventListener("pointermove", onMove);
  document.documentElement.addEventListener("mouseleave", onLeave);
  return () => {
    undragPet();
    undragBall();
    removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("mouseleave", onLeave);
  };
}
