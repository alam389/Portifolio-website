"use client";

import { useId, useState } from "react";
import type { Architecture } from "@/data";

// A pipeline drawn as boxes in order. Hovering, focusing or tapping a step
// shows why it's built that way in the panel below; the last one stays open
// so the text doesn't flicker as the pointer crosses the gaps.
export default function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const { steps } = architecture;
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelId = useId();
  const index = steps.findIndex((s) => s.id === activeId);
  const active = index >= 0 ? steps[index] : null;

  return (
    <div>
      <ol className="flex flex-col lg:flex-row lg:items-stretch">
        {steps.map((step, i) => {
          const selected = step.id === activeId;
          return (
            <li key={step.id} className="flex flex-col items-center lg:flex-1 lg:flex-row">
              {i > 0 && (
                <span aria-hidden className="py-1 text-foreground/30 lg:px-1.5 lg:py-0">
                  <span className="lg:hidden">↓</span>
                  <span className="hidden lg:inline">→</span>
                </span>
              )}
              <button
                type="button"
                aria-pressed={selected}
                aria-controls={panelId}
                onMouseEnter={() => setActiveId(step.id)}
                onFocus={() => setActiveId(step.id)}
                onClick={() => setActiveId(step.id)}
                className={`flex w-full flex-col rounded-md border px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 lg:h-full ${
                  selected
                    ? "border-foreground/50 bg-foreground/10"
                    : "border-foreground/15 hover:border-foreground/30"
                }`}
              >
                <span className="text-sm font-medium">{step.label}</span>
                {step.detail && (
                  <span className="mt-1 font-mono text-xs text-muted">{step.detail}</span>
                )}
                {step.instead && (
                  <span className="mt-auto pt-2 font-mono text-xs text-foreground/40">
                    revised
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id={panelId}
        aria-live="polite"
        className="mt-4 min-h-28 rounded-md bg-foreground/5 px-4 py-3.5"
      >
        {active ? (
          <>
            <p className="font-mono text-xs text-muted">
              Step {index + 1} · {active.label}
            </p>
            <p className="mt-1.5 text-foreground/85">{active.why}</p>
            {active.instead && (
              <p className="mt-3 text-sm text-foreground/70">
                <span className="font-mono text-xs text-muted">Instead of: </span>
                {active.instead}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            Hover or tap a step to see why it&apos;s built that way. Steps marked
            &ldquo;revised&rdquo; changed from the first plan.
          </p>
        )}
      </div>
    </div>
  );
}
