"use client";

import { useEffect, useRef } from "react";
import { crispScale, drawFrame } from "./draw";
import { PetEngine, type Surface } from "./engine";
import {
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
  const engineRef = useRef<PetEngine | null>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const { species, coat } = choose();
    const variant = SPECIES[species].variants[coat];
    const frames = outlinedFrames(species);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new PetEngine(species, 0, 0, reduced);
    engineRef.current = engine;

    let dpr = 1;
    const measure = () => {
      dpr = devicePixelRatio || 1;
      engine.scale = crispScale(innerWidth >= 768 ? 3 : 2, dpr);
      engine.size = SPRITE_SIZE * engine.scale;
      el.style.width = el.style.height = `${engine.size}px`;
    };
    measure();

    const floor = (): Surface => ({ el: null, left: 0, right: innerWidth, top: innerHeight });
    let platforms: Element[] = [];
    let collectedAt = -Infinity;
    const surfaces = (now: number): Surface[] => {
      if (now - collectedAt > RECOLLECT_MS) {
        platforms = [...document.querySelectorAll(PLATFORMS)].filter(
          (p) => !p.closest("[data-pet-ignore]"),
        );
        collectedAt = now;
      }
      return platforms.flatMap((p) => {
        const r = p.getBoundingClientRect();
        // Too narrow to walk on (or hidden): skip.
        return r.width >= engine.size * 1.5
          ? [{ el: p, left: r.left, right: r.right, top: r.top }]
          : [];
      });
    };

    let theme = currentTheme();
    let drawn = "";
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
    };

    engine.spawn(floor());
    raf = requestAnimationFrame(tick);

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
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", measure);
    };
  }, []);

  return (
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
        onClick={() => engineRef.current?.pet()}
        className="pointer-events-auto block cursor-pointer"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
