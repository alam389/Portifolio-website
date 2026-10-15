"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Architecture, ArchitectureStep } from "@/data";

// Hovering waits this long before switching steps, so a pointer crossing other
// steps on its way down to the panel doesn't swap the text.
const HOVER_DELAY_MS = 120;
const COLUMNS = 3;

const STEP_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

// A pipeline drawn as numbered boxes, three to a row. Hovering, focusing or
// tapping a step shows why it's built that way: in the panel below on wider
// screens, and right under the step on phones, where the panel would be off-screen.
export default function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const { steps } = architecture;
  const [activeId, setActiveId] = useState(steps[0].id);
  const hoverTimer = useRef<number>(undefined);
  const panelId = useId();
  const index = Math.max(0, steps.findIndex((s) => s.id === activeId));
  const active = steps[index];
  const anyChanged = steps.some((s) => s.instead);

  function select(id: string) {
    window.clearTimeout(hoverTimer.current);
    setActiveId(id);
  }

  function hover(id: string) {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveId(id), HOVER_DELAY_MS);
  }

  // Arrow keys, Home and End move between steps; focusing one selects it.
  function onKeyDown(e: KeyboardEvent<HTMLOListElement>) {
    const buttons = [...e.currentTarget.querySelectorAll("button")];
    const from = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (from < 0) return;
    let to: number;
    if (e.key === "Home") to = 0;
    else if (e.key === "End") to = buttons.length - 1;
    else if (e.key in STEP_KEYS) to = Math.min(buttons.length - 1, Math.max(0, from + STEP_KEYS[e.key]));
    else return;
    e.preventDefault();
    buttons[to].focus();
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Pick a step to see why it&apos;s built that way.
        {anyChanged && " Steps marked “changed” differ from the first plan."}
      </p>

      <ol onKeyDown={onKeyDown} className="mt-4 grid gap-2 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-4">
        {steps.map((step, i) => {
          const selected = step.id === active.id;
          return (
            <li key={step.id} className="relative">
              {i % COLUMNS !== 0 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -left-8 hidden w-8 -translate-y-1/2 text-center text-foreground/30 sm:block"
                >
                  →
                </span>
              )}
              <button
                type="button"
                aria-pressed={selected}
                aria-controls={panelId}
                onMouseEnter={() => hover(step.id)}
                onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                onFocus={() => select(step.id)}
                onClick={() => select(step.id)}
                className={`flex w-full flex-col rounded-md border px-3 py-2.5 text-left transition-colors duration-150 sm:h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 ${
                  selected
                    ? "border-foreground/50 bg-foreground/10"
                    : "border-foreground/15 hover:border-foreground/30"
                }`}
              >
                <span className="flex justify-between font-mono text-xs text-muted">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {step.instead && <span>changed</span>}
                </span>
                <span className="mt-1 text-sm font-medium">{step.label}</span>
                {step.detail && (
                  <span className="mt-0.5 text-xs leading-snug text-muted">{step.detail}</span>
                )}
              </button>
              {selected && (
                <div className="mt-2 rounded-md bg-foreground/5 px-3 py-2.5 text-sm sm:hidden">
                  <Reasoning step={step} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div
        id={panelId}
        aria-live="polite"
        className="mt-4 hidden min-h-28 rounded-md bg-foreground/5 px-4 py-3.5 sm:block"
      >
        <p className="font-mono text-xs text-muted">
          Step {index + 1} · {active.label}
        </p>
        <div className="mt-1.5">
          <Reasoning step={active} />
        </div>
      </div>
    </div>
  );
}

function Reasoning({ step }: { step: ArchitectureStep }) {
  return (
    <>
      <p className="text-foreground/85">{step.why}</p>
      {step.instead && (
        <p className="mt-3 text-sm text-foreground/70">
          <span className="font-mono text-xs text-muted">First plan: </span>
          {step.instead}
        </p>
      )}
    </>
  );
}
