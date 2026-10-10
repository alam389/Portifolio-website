"use client";

import { useEffect, useRef } from "react";
import { crispScale, drawFrame } from "./draw";
import { PetEngine, type Surface } from "./engine";
import { FEED_EVENT, PAT_EVENT, THROW_BALL_EVENT } from "./events";
import {
  BALL,
  BALL_COLORS,
  FOOD,
  SPECIES,
  SPRITE_SIZE,
  bitten,
  outlinedFrames,
  paletteFor,
  type SpeciesName,
  type Theme,
} from "./sprites";

// Page elements whose top edge the pet can stand on. Opt an element in with
// data-pet-platform, or out (with everything inside it) with data-pet-ignore.
const PLATFORMS = [
  "body > aside",
  "body > nav",
  "main h1",
  "main h2",
  "main img",
  "main figure",
  "main > footer",
  "[data-pet-platform]",
].join(", ");

// How often the platform list is re-queried (route changes, new content).
const RECOLLECT_MS = 500;
/** Pointer travel before a press becomes a drag instead of a pat. */
const DRAG_PX = 4;
/** Throw velocity is measured over the last stretch of the drag. */
const THROW_WINDOW_MS = 80;

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

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

export default function Pet({ species, coat }: { species: SpeciesName; coat: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ballBox = useRef<HTMLDivElement>(null);
  const ballCanvas = useRef<HTMLCanvasElement>(null);
  const foodBox = useRef<HTMLDivElement>(null);
  const foodCanvas = useRef<HTMLCanvasElement>(null);
  const food = FOOD[species];

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    const ballEl = ballCanvas.current;
    const ballCtx = ballEl?.getContext("2d");
    const foodEl = foodCanvas.current;
    const foodCtx = foodEl?.getContext("2d");
    if (!el || !ctx || !ballEl || !ballCtx || !foodEl || !foodCtx) return;

    const variant = SPECIES[species].variants[coat];
    const frames = outlinedFrames(species);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new PetEngine(species, 0, 0, reduced);

    let dpr = 1;
    const measure = () => {
      dpr = devicePixelRatio || 1;
      engine.scale = crispScale(innerWidth >= 768 ? 3 : 2, dpr);
      engine.size = SPRITE_SIZE * engine.scale;
      el.style.width = el.style.height = `${engine.size}px`;
      const ballSize = BALL.length * engine.scale;
      ballEl.style.width = ballEl.style.height = `${ballSize}px`;
      foodEl.style.width = `${food.frame[0].length * engine.scale}px`;
      foodEl.style.height = `${food.frame.length * engine.scale}px`;
    };
    measure();

    const floor = (): Surface => ({ el: null, left: 0, right: innerWidth, top: innerHeight });
    let platforms: Element[] = [];
    let collectedAt = -Infinity;
    let latest: Surface[] = [];
    const surfaces = (now: number): Surface[] => {
      if (now - collectedAt > RECOLLECT_MS) {
        platforms = [...document.querySelectorAll(PLATFORMS)].filter(
          (p) => !p.closest("[data-pet-ignore]"),
        );
        collectedAt = now;
      }
      latest = platforms.flatMap((p) => {
        const r = p.getBoundingClientRect();
        // Too narrow to walk on (or hidden): skip.
        return r.width >= engine.size * 1.5
          ? [{ el: p, left: r.left, right: r.right, top: r.top }]
          : [];
      });
      return latest;
    };

    let theme = currentTheme();
    let drawn = "";
    let ballDrawn = "";
    let foodDrawn = "";
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      engine.step(dt, surfaces(now), floor());

      const { name, lift, sx, sy, face } = engine.frame();
      const key = `${name}|${face}|${theme}`;
      if (key !== drawn) {
        drawFrame(ctx, frames[name], paletteFor(variant, theme), face < 0);
        drawn = key;
      }
      if (box.current) {
        box.current.style.transformOrigin = "50% 100%";
        box.current.style.transform = `translate(${snap(engine.x)}px, ${snap(engine.y - engine.size - lift)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      }

      const ball = engine.ball;
      if (ballBox.current) {
        // About to vanish: blink.
        const blink = !!ball?.fading && Math.floor(now / 120) % 2 === 0;
        const show = !!ball && !ball.carried && !blink;
        ballBox.current.style.visibility = show ? "visible" : "hidden";
        if (show) {
          if (ballDrawn !== theme) {
            drawFrame(ballCtx, BALL, paletteFor(BALL_COLORS, theme));
            ballDrawn = theme;
          }
          ballBox.current.style.transform = `translate(${snap(ball.x)}px, ${snap(ball.y - ball.size)}px)`;
        }
      }

      const treat = engine.food;
      if (foodBox.current) {
        const blink = !!treat?.fading && Math.floor(now / 120) % 2 === 0;
        foodBox.current.style.visibility = treat && !blink ? "visible" : "hidden";
        if (treat) {
          // Bites come out of the side the pet is eating from.
          const fromLeft = engine.x + engine.size / 2 < treat.x + treat.size / 2;
          const cut = Math.round(food.frame[0].length * engine.foodEaten);
          const key = `${cut}|${fromLeft}|${theme}`;
          if (key !== foodDrawn) {
            drawFrame(foodCtx, bitten(food.frame, engine.foodEaten, fromLeft), paletteFor(food.colors, theme));
            foodDrawn = key;
          }
          const h = food.frame.length * engine.scale;
          foodBox.current.style.transform = `translate(${snap(treat.x)}px, ${snap(treat.y - h)}px)`;
        }
      }
    };

    engine.spawn(floor());
    raf = requestAnimationFrame(tick);

    // The pet: tap to pat, drag to pick up and throw.
    const undragPet = draggable(el, {
      tap: () => engine.pet(),
      grab: () => (engine.grab(), true),
      hold: (x, y) => engine.holdAt(x, y),
      release: (vx, vy) => engine.release(vx, vy, latest, floor()),
    });
    // The ball: tap to pop it up, drag to fling it.
    const undragBall = draggable(ballEl, {
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
    const throwBall = () => engine.throwBall(floor());
    const pat = () => engine.pet();
    const feed = () => engine.feed(floor(), food.frame[0].length);
    // Dev shortcuts: B throws a ball, F feeds.
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if (typing || e.metaKey || e.ctrlKey || process.env.NODE_ENV === "production") return;
      if (e.key === "b") throwBall();
      if (e.key === "f") feed();
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const themeWatch = new MutationObserver(() => {
      theme = currentTheme();
    });
    themeWatch.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    addEventListener("keydown", onKey);
    addEventListener(THROW_BALL_EVENT, throwBall);
    addEventListener(PAT_EVENT, pat);
    addEventListener(FEED_EVENT, feed);
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      undragPet();
      undragBall();
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      removeEventListener("keydown", onKey);
      removeEventListener(THROW_BALL_EVENT, throwBall);
      removeEventListener(PAT_EVENT, pat);
      removeEventListener(FEED_EVENT, feed);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", measure);
    };
  }, [species, coat, food]);

  return (
    <>
      <div
        ref={foodBox}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40"
        style={{ visibility: "hidden", willChange: "transform" }}
      >
        <canvas
          ref={foodCanvas}
          width={food.frame[0].length}
          height={food.frame.length}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div
        ref={ballBox}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40"
        style={{ visibility: "hidden", willChange: "transform" }}
      >
        <canvas
          ref={ballCanvas}
          width={BALL[0].length}
          height={BALL.length}
          // The ball is tiny: pad the hit area without moving the sprite.
          className="pointer-events-auto -m-2 box-content block cursor-grab touch-none p-2"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div
        ref={box}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40"
        style={{ transform: "translate(-200px, -200px)", willChange: "transform" }}
      >
        <canvas
          ref={canvas}
          width={SPRITE_SIZE}
          height={SPRITE_SIZE}
          className="pointer-events-auto block cursor-grab touch-none"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </>
  );
}
