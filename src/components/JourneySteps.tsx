"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { JourneyStop } from "@/data";

type Props = {
  stops: JourneyStop[];
  /** Index of the stop on screen; -1 while the intro is showing. */
  active: number;
  onSelect: (index: number) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";

/**
 * Shows every stop and jumps to one on click: a dot rail on the right on
 * desktop, a "3 / 10" pill with a dropdown list on mobile.
 */
export default function JourneySteps(props: Props) {
  return (
    <>
      <StepRail {...props} />
      <StepMenu {...props} />
    </>
  );
}

function StepRail({ stops, active, onSelect }: Props) {
  return (
    <nav
      aria-label="Journey steps"
      className="fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 md:block"
    >
      <ol className="relative flex flex-col gap-2">
        <span
          aria-hidden
          className="absolute inset-y-2.5 left-1/2 w-px -translate-x-1/2 bg-foreground/15"
        />
        {stops.map((stop, i) => (
          <li key={stop.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${stop.date}: ${stop.title}`}
              aria-current={i === active ? "step" : undefined}
              className={`group relative flex size-5 items-center justify-center rounded-full ${focusRing}`}
            >
              <span
                aria-hidden
                className={`rounded-full transition-all duration-200 ${
                  i === active
                    ? "size-2.5 bg-foreground ring-4 ring-foreground/15"
                    : i < active
                      ? "size-1.5 bg-foreground/60 group-hover:bg-foreground"
                      : "size-1.5 border border-foreground/40 bg-background group-hover:border-foreground"
                }`}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-surface px-2 py-1 text-left text-xs text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <span className="font-mono text-foreground/50">{stop.date}</span>{" "}
                {stop.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepMenu({ stops, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close on Escape or a tap outside the menu.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = stops[active];

  return (
    <nav
      aria-label="Journey steps"
      className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 z-20 -translate-x-1/2 md:hidden"
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className={`flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-foreground/10 bg-surface/90 px-3.5 py-2 text-sm shadow-lg shadow-black/40 backdrop-blur-md light:shadow-black/10 ${focusRing}`}
        >
          {current ? (
            <>
              <span className="shrink-0 font-mono text-xs text-foreground/50">
                {active + 1} / {stops.length}
              </span>
              <span className="truncate">{current.title}</span>
            </>
          ) : (
            <span>View all {stops.length} stops</span>
          )}
          <ChevronDown
            size={16}
            aria-hidden
            className={`shrink-0 text-foreground/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <ol
            id={listId}
            data-lenis-prevent
            className="absolute top-full left-1/2 mt-2 max-h-[60svh] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-foreground/10 bg-surface/95 p-1.5 shadow-lg shadow-black/40 backdrop-blur-md light:shadow-black/10"
          >
            {stops.map((stop, i) => (
              <li key={stop.id}>
                <button
                  type="button"
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => {
                    setOpen(false);
                    onSelect(i);
                  }}
                  className={`flex w-full items-baseline gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  } ${focusRing}`}
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-foreground/40">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{stop.title}</span>
                    <span className="block font-mono text-xs text-foreground/50">
                      {stop.date} · {stop.place}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </nav>
  );
}
