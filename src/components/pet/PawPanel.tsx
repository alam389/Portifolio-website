"use client";

import { Bone, Carrot, CircleDot, Eye, EyeOff, Fish, Hand, MessageCircle, MessageCircleOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { drawFrame } from "./draw";
import { FEED_EVENT, PAT_EVENT, THROW_BALL_EVENT } from "./events";
import { setPetPreference, usePetPreference } from "./preferences";
import {
  SPECIES,
  SPECIES_NAMES,
  SPRITE_SIZE,
  outlinedFrames,
  paletteFor,
  variantsOf,
  type SpeciesName,
} from "./sprites";

const TREAT_ICON = { cat: Fish, dog: Bone, bunny: Carrot } as const;

const chip =
  "flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";
const on = "border-foreground/40 bg-foreground/10";
const off = "border-transparent hover:bg-foreground/5";
const action =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-foreground/40";

/** A still of the species' idle frame in the chosen coat. */
function Preview({ species, coat }: { species: SpeciesName; coat: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    drawFrame(ctx, outlinedFrames(species).idle1, paletteFor(SPECIES[species].variants[coat], theme));
  }, [species, coat]);
  return (
    <canvas
      ref={ref}
      aria-hidden
      width={SPRITE_SIZE}
      height={SPRITE_SIZE}
      className="block size-8"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function PawPanel() {
  const { species, coat, enabled, talk } = usePetPreference();
  const Treat = TREAT_ICON[species];

  return (
    <div className="flex w-44 flex-col gap-2">
      <div role="group" aria-label="Pet" className="flex gap-1">
        {SPECIES_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={species === name}
            onClick={() => setPetPreference({ species: name, enabled: true })}
            className={`${chip} ${species === name ? on : off} flex-1 py-1`}
          >
            <Preview species={name} coat={species === name ? coat : variantsOf(name)[0][0]} />
          </button>
        ))}
      </div>

      <div role="group" aria-label="Coat" className="flex gap-1.5 px-1">
        {variantsOf(species).map(([key, { label, colors }]) => (
          <button
            key={key}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={coat === key}
            onClick={() => setPetPreference({ coat: key, enabled: true })}
            className={`${chip} ${coat === key ? on : off} size-7 rounded-full`}
          >
            <span className="size-3.5 rounded-full" style={{ background: colors.b }} />
          </button>
        ))}
      </div>

      <div className="flex flex-col border-t border-foreground/10 pt-1.5">
        <button
          type="button"
          disabled={!enabled}
          onClick={() => dispatchEvent(new Event(THROW_BALL_EVENT))}
          className={action}
        >
          <CircleDot size={14} aria-hidden /> Throw ball
        </button>
        <button
          type="button"
          disabled={!enabled}
          onClick={() => dispatchEvent(new Event(FEED_EVENT))}
          className={action}
        >
          <Treat size={14} aria-hidden /> Feed the {species}
        </button>
        <button
          type="button"
          disabled={!enabled}
          onClick={() => dispatchEvent(new Event(PAT_EVENT))}
          className={action}
        >
          <Hand size={14} aria-hidden /> Pet the {species}
        </button>
        <button
          type="button"
          disabled={!enabled}
          aria-pressed={talk}
          onClick={() => setPetPreference({ talk: !talk })}
          className={action}
        >
          {talk ? <MessageCircle size={14} aria-hidden /> : <MessageCircleOff size={14} aria-hidden />}
          {talk ? "Mute the chatter" : "Let it talk"}
        </button>
        <button type="button" onClick={() => setPetPreference({ enabled: !enabled })} className={action}>
          {!enabled ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
          {!enabled ? "Show pet" : "Hide pet"}
        </button>
      </div>
    </div>
  );
}
