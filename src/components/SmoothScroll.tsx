"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | null = null;

/**
 * Scrolls the page to `y`, gliding through Lenis when it's running. Lenis
 * turns off native smooth scrolling, so window.scrollTo would jump; without
 * Lenis (reduced motion) the page jumps, which is what that reader wants.
 */
export function scrollToY(y: number, duration = 1.2) {
  if (instance) instance.scrollTo(y, { duration });
  else window.scrollTo(0, y);
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // lerp = fraction of the remaining distance covered per frame, so the
    // page decelerates exponentially and glides to a stop. Lower = softer.
    // wheelMultiplier < 1 damps wheel input so it moves slower than native.
    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.7,
    });
    instance = lenis;

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
