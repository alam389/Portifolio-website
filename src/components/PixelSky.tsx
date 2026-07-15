"use client";

import { useEffect, useRef } from "react";

// 8-bit sky, theme-aware: night (.dark) = twinkling square stars, drifting
// blocky clouds, rare shooting stars; day = banded blue sky, bright clouds,
// and a pixel sun. Drawn at low internal resolution and upscaled with
// image-rendering: pixelated so everything stays blocky.
// Reduced-motion: one static frame. Pauses on hidden tabs.

const PIXEL = 5; // css pixels per sky pixel

interface Star {
  x: number;
  y: number;
  base: number;
  phase: number;
  speed: number;
  size: number;
  /** parallax depth: deeper stars drift less with the mouse */
  depth: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  cells: [number, number, 0 | 1][]; // [dx, dy, shade]
  width: number;
}

interface Shooter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const NIGHT = {
  bands: ["#0a0c11", "#0b0d13", "#0d1016", "#0f1219", "#11141c", "#12161f"],
  cloudLight: "rgba(216, 226, 244, 0.055)",
  cloudShadow: "rgba(6, 8, 12, 0.35)",
};

const DAY = {
  bands: ["#7fc2ee", "#89c8f1", "#93cdf3", "#9dd3f5", "#a7d8f7", "#b1def9"],
  cloudLight: "rgba(255, 255, 255, 0.92)",
  cloudShadow: "rgba(110, 140, 170, 0.5)",
};

export default function PixelSky({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = () => document.documentElement.classList.contains("dark");
    let dark = isDark();

    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let clouds: Cloud[] = [];
    let shooter: Shooter | null = null;

    // parallax: lerped mouse offset, scaled by each star's depth
    let tmx = 0;
    let tmy = 0;
    let mx = 0;
    let my = 0;

    const makeCloud = (y: number, speed: number): Cloud => {
      // Minecraft-style cloud: three stacked rows of random run lengths,
      // middle row widest; top cells lit, bottom cells shadowed.
      const len = 10 + Math.floor(Math.random() * 14);
      const cells: Cloud["cells"] = [];
      const rows: [number, number][] = [
        [Math.floor(Math.random() * 3), len - Math.floor(Math.random() * 5)],
        [-2, len + 4],
        [Math.floor(Math.random() * 4), len - Math.floor(Math.random() * 6)],
      ];
      rows.forEach(([start, rowLen], r) => {
        for (let i = 0; i < rowLen; i++) {
          cells.push([start + i, r, r === 2 ? 1 : 0]);
        }
      });
      return { x: Math.random() * 1.2 - 0.1, y, speed, cells, width: len + 6 };
    };

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(40, Math.ceil(rect.width / PIXEL));
      H = Math.max(40, Math.ceil(rect.height / PIXEL));
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = false;

      stars = Array.from({ length: Math.floor((W * H) / 320) }, () => ({
        x: Math.floor(Math.random() * W),
        y: Math.floor(Math.random() * H),
        base: 0.2 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.3,
        size: Math.random() < 0.12 ? 2 : 1,
        depth: 0.25 + Math.random() * 0.75,
      }));

      clouds = [
        makeCloud(Math.floor(H * 0.14), 1.4),
        makeCloud(Math.floor(H * 0.32), 0.9),
        makeCloud(Math.floor(H * 0.7), 1.1),
      ];
    };

    const drawSun = () => {
      const sx = Math.floor(W * 0.8) - Math.round(mx * 3);
      const sy = Math.floor(H * 0.14) - Math.round(my * 2);
      ctx.fillStyle = "#ffd95e";
      ctx.fillRect(sx - 2, sy - 2, 5, 5);
      ctx.fillStyle = "#ffea9d";
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
      // ray pixels
      ctx.fillStyle = "rgba(255, 217, 94, 0.8)";
      ctx.fillRect(sx - 4, sy, 1, 1);
      ctx.fillRect(sx + 4, sy, 1, 1);
      ctx.fillRect(sx, sy - 4, 1, 1);
      ctx.fillRect(sx, sy + 4, 1, 1);
    };

    const draw = (t: number) => {
      // ease the parallax toward the mouse (rounded to whole sky pixels
      // when applied, so the effect stays honestly blocky)
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      const pal = dark ? NIGHT : DAY;
      const bandH = Math.ceil(H / pal.bands.length);
      pal.bands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bandH, W, bandH);
      });

      if (dark) {
        // stars twinkle (night only)
        for (const s of stars) {
          const a = s.base * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
          ctx.fillStyle = `rgba(214, 224, 240, ${a.toFixed(3)})`;
          const px = (s.x - (Math.round(mx * s.depth * 10) % W) + W) % W;
          const py = (s.y - (Math.round(my * s.depth * 6) % H) + H) % H;
          ctx.fillRect(px, py, s.size, s.size);
        }
      } else {
        drawSun();
      }

      // clouds drift (both modes; bright by day, faint by night)
      for (const c of clouds) {
        c.x += c.speed * 0.0005;
        if (c.x * W - c.width > W) c.x = -c.width / W;
        const cx = Math.floor(c.x * W) - Math.round(mx * c.speed * 3);
        for (const [dx, dy, shade] of c.cells) {
          ctx.fillStyle = shade === 0 ? pal.cloudLight : pal.cloudShadow;
          ctx.fillRect(cx + dx, c.y + dy, 1, 1);
        }
      }

      // shooting star (night only): rare spawn, fading pixel tail
      if (dark) {
        if (!shooter && Math.random() < 0.0018) {
          shooter = {
            x: Math.random() * W * 0.7 + W * 0.15,
            y: Math.random() * H * 0.25,
            vx: 0.9 + Math.random() * 0.5,
            vy: 0.45 + Math.random() * 0.3,
            life: 1,
          };
        }
        if (shooter) {
          shooter.x += shooter.vx;
          shooter.y += shooter.vy;
          shooter.life -= 0.02;
          for (let i = 0; i < 8; i++) {
            const a = Math.max(0, shooter.life - i * 0.09);
            if (a <= 0) continue;
            ctx.fillStyle = `rgba(230, 238, 250, ${(a * 0.9).toFixed(3)})`;
            ctx.fillRect(
              Math.floor(shooter.x - i * shooter.vx),
              Math.floor(shooter.y - i * shooter.vy),
              1,
              1,
            );
          }
          if (shooter.life <= 0 || shooter.x > W + 8 || shooter.y > H + 8) {
            shooter = null;
          }
        }
      } else {
        shooter = null;
      }
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      draw((now - t0) * 0.001);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!reducedMotion && raf === 0 && !document.hidden) {
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Repaint when next-themes flips the class (day ↔ night).
    const mo = new MutationObserver(() => {
      const d = isDark();
      if (d !== dark) {
        dark = d;
        draw(0);
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const ro = new ResizeObserver(() => {
      init();
      draw(0);
    });
    ro.observe(canvas);
    init();
    draw(0); // static frame (this is all reduced-motion users get)
    start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (ev: MouseEvent) => {
      tmx = ev.clientX / window.innerWidth - 0.5;
      tmy = ev.clientY / window.innerHeight - 0.5;
    };
    if (!reducedMotion) {
      window.addEventListener("mousemove", onMove, { passive: true });
    }

    return () => {
      stop();
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full [image-rendering:pixelated] ${className}`.trim()}
    />
  );
}
