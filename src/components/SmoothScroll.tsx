"use client";

import { useEffect } from "react";
import Lenis from "lenis";

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

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
