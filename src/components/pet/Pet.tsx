"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../useReducedMotion";
import { crispScale, drawFrame } from "./draw";
import { PetEngine } from "./engine";
import { THROW_BALL_EVENT } from "./events";
import { attachGestures } from "./gestures";
import {
  BALL,
  BALL_COLORS,
  SPECIES,
  SPRITE_SIZE,
  outlinedFrames,
  paletteFor,
  type SpeciesName,
  type Theme,
} from "./sprites";
import { trackSurfaces } from "./surfaces";

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export default function Pet({ species, coat }: { species: SpeciesName; coat: string }) {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ballBox = useRef<HTMLDivElement>(null);
  const ballCanvas = useRef<HTMLCanvasElement>(null);

  // Picking another pet (or toggling reduced motion) rebuilds the whole thing.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    const ballEl = ballCanvas.current;
    const ballCtx = ballEl?.getContext("2d");
    const petBox = box.current;
    const ballWrap = ballBox.current;
    if (!el || !ctx || !ballEl || !ballCtx || !petBox || !ballWrap) return;

    const variant = SPECIES[species].variants[coat];
    const frames = outlinedFrames(species);
    const engine = new PetEngine(species, 0, 0, reduced);
    const page = trackSurfaces(() => engine.size * 1.5);
    const floor = page.floor;

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

    let theme = currentTheme();
    let palette = paletteFor(variant, theme);
    let drawn = "";
    let placed = "";
    let ballTheme: Theme | null = null;
    let ballShown = false;
    ballWrap.style.visibility = "hidden";
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      engine.step(dt, page.at(now), floor);

      const { name, lift } = engine.frame();
      const key = `${name}|${engine.facing}|${theme}`;
      if (key !== drawn) {
        drawFrame(ctx, frames[name], palette, engine.facing < 0);
        drawn = key;
      }
      const at = `translate(${snap(engine.x)}px, ${snap(engine.y - engine.size - lift)}px)`;
      if (at !== placed) {
        petBox.style.transform = at;
        placed = at;
      }

      const ball = engine.ball;
      const show = !!ball && !ball.carried;
      if (show !== ballShown) {
        ballWrap.style.visibility = show ? "visible" : "hidden";
        ballShown = show;
      }
      if (show) {
        if (ballTheme !== theme) {
          drawFrame(ballCtx, BALL, paletteFor(BALL_COLORS, theme));
          ballTheme = theme;
        }
        ballWrap.style.transform = `translate(${snap(ball.x)}px, ${snap(ball.y - ball.size)}px)`;
      }
    };

    engine.spawn(floor);
    raf = requestAnimationFrame(tick);

    const detachGestures = attachGestures(el, engine, () => page.at(performance.now()), floor);
    const throwBall = () => engine.throwBall(floor);
    // Dev shortcut until the paw menu exists: B throws a ball.
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if (e.key === "b" && !typing && !e.metaKey && !e.ctrlKey) throwBall();
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
      palette = paletteFor(variant, theme);
    });
    themeWatch.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    if (process.env.NODE_ENV !== "production") addEventListener("keydown", onKey);
    addEventListener(THROW_BALL_EVENT, throwBall);
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      detachGestures();
      page.dispose();
      themeWatch.disconnect();
      removeEventListener("keydown", onKey);
      removeEventListener(THROW_BALL_EVENT, throwBall);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", measure);
    };
  }, [species, coat, reduced]);

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
