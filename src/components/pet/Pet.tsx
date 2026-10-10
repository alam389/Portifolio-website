"use client";

import { useEffect, useRef } from "react";
import { crispScale, drawFrame } from "./draw";
import { PetEngine, type Surface } from "./engine";
import { THROW_BALL_EVENT } from "./events";
import {
  BALL,
  BALL_COLORS,
  SPECIES,
  SPECIES_NAMES,
  SPRITE_SIZE,
  outlinedFrames,
  paletteFor,
  variantsOf,
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

/** Which pet to show. Until the picker exists: ?pet=dog&coat=black, else the cat. */
function choose(): { species: SpeciesName; coat: string } {
  const params = new URLSearchParams(location.search);
  const pet = params.get("pet");
  const species = SPECIES_NAMES.find((s) => s === pet) ?? "cat";
  const coat = params.get("coat");
  return { species, coat: coat && coat in SPECIES[species].variants ? coat : variantsOf(species)[0][0] };
}

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export default function Pet() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ballBox = useRef<HTMLDivElement>(null);
  const ballCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    const ballEl = ballCanvas.current;
    const ballCtx = ballEl?.getContext("2d");
    if (!el || !ctx || !ballEl || !ballCtx) return;

    const { species, coat } = choose();
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
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      engine.step(dt, surfaces(now), floor());

      const { name, lift } = engine.frame();
      const key = `${name}|${engine.facing}|${theme}`;
      if (key !== drawn) {
        drawFrame(ctx, frames[name], paletteFor(variant, theme), engine.facing < 0);
        drawn = key;
      }
      if (box.current) {
        box.current.style.transform = `translate(${snap(engine.x)}px, ${snap(engine.y - engine.size - lift)}px)`;
      }

      const ball = engine.ball;
      if (ballBox.current) {
        const show = !!ball && !ball.carried;
        ballBox.current.style.visibility = show ? "visible" : "hidden";
        if (show) {
          if (ballDrawn !== theme) {
            drawFrame(ballCtx, BALL, paletteFor(BALL_COLORS, theme));
            ballDrawn = theme;
          }
          ballBox.current.style.transform = `translate(${snap(ball.x)}px, ${snap(ball.y - ball.size)}px)`;
        }
      }
    };

    engine.spawn(floor());
    raf = requestAnimationFrame(tick);

    // Press and release = a pat; press and drag = pick up, then throw on release.
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
      engine.release((b.x - a.x) / secs, (b.y - a.y) / secs, latest, floor());
    };
    const throwBall = () => engine.throwBall(floor());
    // Dev shortcut until the paw menu exists: B throws a ball.
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if (e.key === "b" && !typing && !e.metaKey && !e.ctrlKey && process.env.NODE_ENV !== "production") {
        throwBall();
      }
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
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    addEventListener("keydown", onKey);
    addEventListener(THROW_BALL_EVENT, throwBall);
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("keydown", onKey);
      removeEventListener(THROW_BALL_EVENT, throwBall);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
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
          className="block"
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
