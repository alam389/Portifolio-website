"use client";

import { useEffect, useRef } from "react";

// Keys typed into these belong to the field, not the page.
const EDITABLE = "input, textarea, select, [contenteditable]";

/**
 * Arrow Up/Down and Page Up/Down call `onStep` with the direction instead of
 * nudging the page, so the keyboard moves one stop at a time. Wheel and touch
 * still scroll freely.
 */
export function useStepKeys(onStep: (dir: 1 | -1) => void) {
  const latest = useRef(onStep);
  useEffect(() => {
    latest.current = onStep;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest(EDITABLE)) return;
      const dir =
        e.key === "ArrowDown" || e.key === "PageDown" ? 1
        : e.key === "ArrowUp" || e.key === "PageUp" ? -1
        : 0;
      if (!dir) return;
      e.preventDefault();
      latest.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
