import type { PetEngine } from "./engine";
import type { Surface } from "./physics";

/** Pointer travel before a press becomes a drag instead of a pat. */
const DRAG_PX = 4;
/** Throw velocity is measured over the last stretch of the drag. */
const THROW_WINDOW_MS = 80;

/**
 * Press and release = a pat; press and drag = pick up, then throw on release.
 * Also tracks the pointer so the dog knows where to bring the ball.
 */
export function attachGestures(
  el: HTMLElement,
  engine: PetEngine,
  surfaces: () => Surface[],
  floor: Surface,
) {
  let press: { id: number; x: number; y: number } | null = null;
  let dragging = false;
  let trail: { x: number; y: number; t: number }[] = [];

  const onDown = (e: PointerEvent) => {
    press = { id: e.pointerId, x: e.clientX, y: e.clientY };
    dragging = false;
    trail = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => {
    engine.pointerX = e.clientX;
    if (!press || e.pointerId !== press.id) return;
    if (!dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_PX) {
      dragging = true;
      engine.grab();
      el.style.cursor = "grabbing";
    }
    if (!dragging) return;
    engine.holdAt(e.clientX, e.clientY);
    trail.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    while (trail.length > 2 && e.timeStamp - trail[0].t > THROW_WINDOW_MS) trail.shift();
  };
  const onUp = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    press = null;
    el.style.cursor = "";
    if (!dragging) return engine.pet();
    const a = trail[0];
    const b = trail[trail.length - 1];
    const secs = Math.max((b.t - a.t) / 1000, 0.016);
    engine.release((b.x - a.x) / secs, (b.y - a.y) / secs, surfaces(), floor);
  };

  el.addEventListener("pointerdown", onDown);
  addEventListener("pointermove", onMove);
  addEventListener("pointerup", onUp);
  addEventListener("pointercancel", onUp);
  return () => {
    el.removeEventListener("pointerdown", onDown);
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerup", onUp);
    removeEventListener("pointercancel", onUp);
  };
}
