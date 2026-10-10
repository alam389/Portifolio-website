"use client";

import { useEffect, useRef, useState } from "react";
import { crispScale, drawFrame } from "./draw";
import { TRAITS } from "./engine";
import { clamp } from "./physics";
import {
  ANIMATIONS,
  SPECIES,
  SPECIES_NAMES,
  SPRITE_SIZE,
  outlinedFrames,
  paletteFor,
  variantsOf,
  type SpeciesName,
  type Theme,
} from "./sprites";

// Fixed panel colors, so both themes show side by side whatever the site theme.
const PANEL: Record<Theme, { bg: string; fg: string }> = {
  light: { bg: "#fafafa", fg: "rgba(23,23,23,0.6)" },
  dark: { bg: "#0a0a0a", fg: "rgba(237,237,237,0.6)" },
};

const SCALES = [2, 3, 4, 6];

function useDpr() {
  const [dpr, setDpr] = useState(1);
  useEffect(() => setDpr(window.devicePixelRatio || 1), []);
  return dpr;
}

function Sprite({
  species,
  coat,
  anim,
  theme,
  size,
  playing,
  flip = false,
}: {
  species: SpeciesName;
  coat: string;
  anim: string;
  theme: Theme;
  size: number;
  playing: boolean;
  flip?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const { frames, fps } = ANIMATIONS[species][anim];

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000 / fps);
    return () => clearInterval(id);
  }, [playing, fps, frames.length]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const frame = outlinedFrames(species)[frames[tick % frames.length]];
    drawFrame(ctx, frame, paletteFor(SPECIES[species].variants[coat], theme), flip);
  }, [species, coat, frames, tick, theme, flip]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      width={SPRITE_SIZE}
      height={SPRITE_SIZE}
      className="block"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}

/** The walk cycle actually moving, back and forth, to judge pace vs. legs. */
function WalkTrack({
  species,
  coat,
  theme,
  size,
  scale,
  playing,
}: {
  species: SpeciesName;
  coat: string;
  theme: Theme;
  size: number;
  scale: number;
  playing: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pet = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const dir = useRef(1);
  const [facingLeft, setFacingLeft] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = (track.current?.clientWidth ?? 0) - size;
      x.current += dir.current * TRAITS[species].walk * scale * dt;
      if (x.current >= max || x.current <= 0) {
        x.current = clamp(x.current, 0, max);
        dir.current = -dir.current;
        setFacingLeft(dir.current < 0);
      }
      if (pet.current) pet.current.style.transform = `translateX(${x.current}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, species, scale, size]);

  return (
    <div ref={track} className="relative border-b" style={{ height: size, borderColor: PANEL[theme].fg }}>
      <div ref={pet} className="absolute bottom-0 left-0">
        <Sprite
          species={species}
          coat={coat}
          anim="walk"
          theme={theme}
          size={size}
          playing={playing}
          flip={facingLeft}
        />
      </div>
    </div>
  );
}

const button =
  "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";
const on = "border-foreground/50 text-foreground";
const off = "border-foreground/15 text-foreground/60 hover:border-foreground/30";

function SpeciesSection({
  species,
  size,
  scale,
  flip,
  playing,
}: {
  species: SpeciesName;
  size: number;
  scale: number;
  flip: boolean;
  playing: boolean;
}) {
  const variants = variantsOf(species);
  const [coat, setCoat] = useState(variants[0][0]);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="text-xl font-semibold capitalize">{species}</h2>
        <div className="flex flex-wrap gap-2">
          {variants.map(([key, { label, colors }]) => (
            <button
              key={key}
              type="button"
              aria-pressed={coat === key}
              onClick={() => setCoat(key)}
              className={`${button} ${coat === key ? on : off} inline-flex items-center gap-1.5`}
            >
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: colors.b }} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(["light", "dark"] as const).map((theme) => (
          <div
            key={theme}
            className="flex flex-col gap-5 rounded-lg border border-foreground/10 p-4"
            style={{ background: PANEL[theme].bg }}
          >
            <WalkTrack
              species={species}
              coat={coat}
              theme={theme}
              size={size}
              scale={scale}
              playing={playing}
            />
            <ul className="flex flex-wrap gap-x-4 gap-y-3">
              {Object.keys(ANIMATIONS[species]).map((anim) => (
                <li key={anim} className="flex flex-col items-center gap-1">
                  <Sprite
                    species={species}
                    coat={coat}
                    anim={anim}
                    theme={theme}
                    size={size}
                    playing={playing}
                    flip={flip}
                  />
                  <span className="font-mono text-[11px]" style={{ color: PANEL[theme].fg }}>
                    {anim}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PetLab() {
  const dpr = useDpr();
  const [scale, setScale] = useState(3);
  const [flip, setFlip] = useState(false);
  const [playing, setPlaying] = useState(true);
  const crisp = crispScale(scale, dpr);
  const size = SPRITE_SIZE * crisp;

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Pet lab</h1>
        <p className="mt-1 text-foreground/60">
          Dev only. Every pet animation at real speed, in both themes.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={scale === s}
              onClick={() => setScale(s)}
              className={`${button} ${scale === s ? on : off}`}
            >
              {s}×
            </button>
          ))}
          <span className="mx-1 h-4 border-l border-foreground/15" />
          <button
            type="button"
            aria-pressed={flip}
            onClick={() => setFlip((f) => !f)}
            className={`${button} ${flip ? on : off}`}
          >
            Face left
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className={`${button} ${off}`}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </section>

      {SPECIES_NAMES.map((species) => (
        <SpeciesSection
          key={species}
          species={species}
          size={size}
          scale={crisp}
          flip={flip}
          playing={playing}
        />
      ))}
    </div>
  );
}
