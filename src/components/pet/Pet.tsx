"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../useReducedMotion";
import { crispScale, drawFrame } from "./draw";
import { PetEngine } from "./engine";
import { FEED_EVENT, PAT_EVENT, THROW_BALL_EVENT } from "./events";
import { attachGestures } from "./gestures";
import { hourLine, perchLine, routeLine, themeLine } from "./speech";
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
import { trackSurfaces } from "./surfaces";

/** Pause between remarks about the page, so it comments rather than narrates. */
const REMARK_GAP_MS = 14000;
/** How long it stands on something before it has an opinion of it. */
const PERCH_SECONDS = 2.5;
/** Said once per visit, however often the pet is swapped. */
let greeted = false;

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export default function Pet({
  species,
  coat,
  talk,
}: {
  species: SpeciesName;
  coat: string;
  talk: boolean;
}) {
  const reduced = useReducedMotion();
  const path = usePathname();
  const pathRef = useRef(path);
  const talkRef = useRef(talk);
  useEffect(() => {
    talkRef.current = talk;
  }, [talk]);
  // Set by the effect below; called when the route changes.
  const onRoute = useRef<(path: string) => void>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const bubbleText = useRef<HTMLSpanElement>(null);
  const bubbleTail = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ballBox = useRef<HTMLDivElement>(null);
  const ballCanvas = useRef<HTMLCanvasElement>(null);
  const foodBox = useRef<HTMLDivElement>(null);
  const foodCanvas = useRef<HTMLCanvasElement>(null);
  const food = FOOD[species];

  // Picking another pet (or toggling reduced motion) rebuilds the whole thing.
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
    const engine = new PetEngine(species, 0, 0, reduced);
    engine.talk = talkRef.current;
    const page = trackSurfaces(() => engine.size * 1.5);
    const floor = page.floor;

    // Page-aware remarks: what it's standing on, the route, the theme.
    let lastRemark = -Infinity;
    const remarked = new WeakSet<Element>();
    let pending: { text: string; at: number } | null = null;
    const remark = (text: string, urgent = false) => {
      if (!engine.remark(text, urgent)) return false;
      lastRemark = performance.now();
      return true;
    };
    onRoute.current = (to) => {
      const text = routeLine(species, to);
      if (text) pending = { text, at: performance.now() + 1800 };
    };
    if (!greeted) {
      greeted = true;
      const text = hourLine(species, new Date().getHours());
      if (text) pending = { text, at: performance.now() + 3500 };
    }
    const wonder = (now: number) => {
      if (pending) {
        if (now >= pending.at && remark(pending.text)) pending = null;
        return;
      }
      if (now - lastRemark < REMARK_GAP_MS) return;
      const perch = engine.perch();
      if (!perch || perch.seconds < PERCH_SECONDS || remarked.has(perch.el)) return;
      const text = perchLine(species, {
        tag: perch.el.tagName.toLowerCase(),
        text: perch.el.textContent ?? "",
      });
      if (text && Math.random() < 0.7) remark(text);
      // Either way, once is enough for this element.
      remarked.add(perch.el);
    };

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

    let theme = currentTheme();
    let palette = paletteFor(variant, theme);
    let drawn = "";
    let ballDrawn = "";
    let foodDrawn = "";
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    // The speech bubble: follows the pet's head, flipping below it near the top.
    let shownId = 0;
    let bubbleW = 0;
    let bubbleH = 0;
    const place = (lift: number) => {
      const box = bubble.current;
      const text = bubbleText.current;
      const tail = bubbleTail.current;
      if (!box || !text || !tail) return;
      const say = engine.talk ? engine.speech : null;
      if (!say) {
        box.style.opacity = "0";
        shownId = 0;
        return;
      }
      if (say.id !== shownId) {
        shownId = say.id;
        text.textContent = say.text;
        bubbleW = box.offsetWidth;
        bubbleH = box.offsetHeight;
      }
      const pad = 8;
      const gap = 6;
      const centre = engine.x + engine.size / 2;
      const left = Math.min(Math.max(centre - bubbleW / 2, pad), innerWidth - bubbleW - pad);
      const above = engine.y - engine.size - lift - bubbleH - gap;
      const below = above < pad;
      const top = below ? engine.y + gap : above;
      tail.style.left = `${Math.min(Math.max(centre - left, 10), bubbleW - 10)}px`;
      tail.dataset.side = below ? "top" : "bottom";
      box.style.transform = `translate(${snap(left)}px, ${snap(top)}px)`;
      box.style.opacity = "1";
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      engine.talk = talkRef.current;
      engine.step(dt, page.at(now), floor);
      wonder(now);

      const { name, lift, sx, sy, face } = engine.frame();
      const key = `${name}|${face}|${theme}`;
      if (key !== drawn) {
        drawFrame(ctx, frames[name], palette, face < 0);
        drawn = key;
      }
      if (box.current) {
        box.current.style.transformOrigin = "50% 100%";
        box.current.style.transform = `translate(${snap(engine.x)}px, ${snap(engine.y - engine.size - lift)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      }

      place(lift);

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

    engine.spawn(floor);
    raf = requestAnimationFrame(tick);

    const detachGestures = attachGestures(el, ballEl, engine, () => page.at(performance.now()), floor);
    const throwBall = () => engine.throwBall(floor);
    const pat = () => engine.pet();
    const feed = () => engine.feed(floor, food.frame[0].length);
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
      const before = theme;
      theme = currentTheme();
      palette = paletteFor(variant, theme);
      if (theme !== before) remark(themeLine(species, theme), true);
    });
    themeWatch.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    addEventListener("keydown", onKey);
    addEventListener(THROW_BALL_EVENT, throwBall);
    addEventListener(PAT_EVENT, pat);
    addEventListener(FEED_EVENT, feed);
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      onRoute.current = null;
      themeWatch.disconnect();
      detachGestures();
      page.dispose();
      removeEventListener("keydown", onKey);
      removeEventListener(THROW_BALL_EVENT, throwBall);
      removeEventListener(PAT_EVENT, pat);
      removeEventListener(FEED_EVENT, feed);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", measure);
    };
  }, [species, coat, food, reduced]);

  // A new page: it has something to say about it, after a moment.
  useEffect(() => {
    if (pathRef.current === path) return;
    pathRef.current = path;
    onRoute.current?.(path);
  }, [path]);

  return (
    <>
      <div
        ref={bubble}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 rounded-md border border-foreground/25 bg-surface px-2 py-1 font-mono text-[11px] leading-none whitespace-nowrap text-foreground opacity-0 shadow-sm shadow-black/30 transition-opacity duration-150 motion-reduce:transition-none light:shadow-black/10"
        style={{ willChange: "transform" }}
      >
        <span ref={bubbleText} />
        {/* The tail: a rotated square on the edge facing the pet. */}
        <span
          ref={bubbleTail}
          className="absolute size-1.5 -translate-x-1/2 rotate-45 border-foreground/25 bg-surface data-[side=bottom]:-bottom-[4px] data-[side=bottom]:border-r data-[side=bottom]:border-b data-[side=top]:-top-[4px] data-[side=top]:border-t data-[side=top]:border-l"
        />
      </div>
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
