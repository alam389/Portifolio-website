"use client";

import { PawPrint } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";

// Loaded on first open, so the sprite data stays out of the page bundle.
const PawPanel = dynamic(() => import("./PawPanel"), { ssr: false });

/**
 * The paw button in the sidebar: opens a small panel to pick the pet and its
 * coat, throw a ball, pat it, or hide it. `side` places the panel beside the
 * desktop rail or above the mobile bar.
 */
export default function PawMenu({
  className,
  size,
  side,
}: {
  className: string;
  size: number;
  side: "right" | "top";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    addEventListener("pointerdown", onDown);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("pointerdown", onDown);
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const place =
    side === "right"
      ? "left-full top-1/2 ml-4 -translate-y-1/2"
      : "bottom-full right-0 mb-4";

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label="Pet settings"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={className}
      >
        <PawPrint size={size} strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div
          id={id}
          role="region"
          aria-label="Pet settings"
          className={`absolute ${place} z-40 rounded-xl border border-foreground/10 bg-surface p-2 shadow-lg shadow-black/40 light:shadow-black/10`}
        >
          <PawPanel />
        </div>
      )}
    </div>
  );
}
