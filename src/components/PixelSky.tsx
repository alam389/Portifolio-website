"use client";

import { useEffect, useRef } from "react";

// 8-bit sky, theme-aware: night (.dark) = twinkling square stars, drifting
// blocky clouds, rare shooting stars; day = banded blue sky, bright clouds,
// and a pixel sun. A snow-capped mountain range and rolling hills with pines
// ground the bottom edge. Drawn at low internal resolution and upscaled with
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
  land: {
    mtnTop: "#1a2233",
    mtn: "#131a29",
    snowCap: "#39445f",
    snowEdge: "#2a3349",
    farTop: "#171e2e",
    far: "#121826",
    midTop: "#142224",
    mid: "#0f191b",
    nearTop: "#122219",
    near: "#0d1812",
    canopy: "#101f16",
    canopyLight: "#16291b",
    trunk: "#14111a",
    wall: "#1b2132",
    wallShade: "#151a28",
    window: "#ffd77a",
    rock: "#1d2430",
    flowers: [] as string[],
  },
};

const DAY = {
  bands: ["#7fc2ee", "#89c8f1", "#93cdf3", "#9dd3f5", "#a7d8f7", "#b1def9"],
  cloudLight: "rgba(255, 255, 255, 0.92)",
  cloudShadow: "rgba(110, 140, 170, 0.5)",
  land: {
    mtnTop: "#c4d5e0",
    mtn: "#b6cbd8",
    snowCap: "#f0f6f9",
    snowEdge: "#dbe7ee",
    farTop: "#bcd3e0",
    far: "#a6c2d2",
    midTop: "#8fbc98",
    mid: "#79a884",
    nearTop: "#69b877",
    near: "#4e9a5a",
    canopy: "#2e7d44",
    canopyLight: "#48a35c",
    trunk: "#7a5230",
    wall: "#e3cb92",
    wallShade: "#c2a76b",
    window: "#6b573a",
    rock: "#8fa0a8",
    flowers: ["#ffd95e", "#e0685a", "#f5f2ea", "#e78fb3"],
  },
};

// Tiny castle keep on a distant hill (X wall, S shaded wall, O window).
const CASTLE = [
  "....X.X.X",
  "....XXXXX",
  "....XOXOX",
  "X.X.XXXXX",
  "XXX.XXXXX",
  "XXXXXXXXX",
  "XSXXXOXSX",
];

// extra heightmap columns so parallax shifts never read out of bounds
const LAND_PAD = 24;

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

    // landscape: rolling-hill heightmaps (three parallax layers) plus the
    // props scattered on them, all regenerated on resize
    let mtn: number[] = [];
    let snowJit: number[] = [];
    let hillFar: number[] = [];
    let hillMid: number[] = [];
    let hillNear: number[] = [];
    let trees: { x: number; big: boolean }[] = [];
    let flowers: { x: number; c: number }[] = [];
    let rocks: number[] = [];

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
        makeCloud(Math.floor(H * 0.52), 1.1),
      ];

      // layered sines with random phases give rolling hills; quantizing to
      // 2px steps keeps the outline blocky
      const makeHill = (base: number, amp: number) => {
        const p1 = Math.random() * Math.PI * 2;
        const p2 = Math.random() * Math.PI * 2;
        const p3 = Math.random() * Math.PI * 2;
        return Array.from({ length: W + LAND_PAD * 2 }, (_, i) => {
          const x = i - LAND_PAD;
          const v =
            0.55 * Math.sin(x * 0.012 + p1) +
            0.33 * Math.sin(x * 0.033 + p2) +
            0.12 * Math.sin(x * 0.074 + p3);
          return Math.round((base + v * amp) / 2) * 2;
        });
      };
      hillFar = makeHill(H * 0.78, H * 0.055);
      hillMid = makeHill(H * 0.85, H * 0.045);
      hillNear = makeHill(H * 0.92, H * 0.04);

      // snow-capped range behind the hills: overlapping triangular peaks,
      // quantized to 2px steps so the slopes stay blocky
      const len = W + LAND_PAD * 2;
      mtn = new Array(len).fill(H * 0.86);
      const nPeaks = Math.max(3, Math.round(W / 70));
      for (let i = 0; i < nPeaks; i++) {
        const px = ((i + 0.15 + Math.random() * 0.7) / nPeaks) * len;
        const tip = H * (0.5 + Math.random() * 0.13);
        const slope = 0.75 + Math.random() * 0.55;
        for (let j = 0; j < len; j++) {
          mtn[j] = Math.min(mtn[j], tip + Math.abs(j - px) * slope);
        }
      }
      mtn = mtn.map((v) => Math.round(v / 2) * 2);
      // ragged snowline offsets, sampled per screen column
      snowJit = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 3) * 2,
      );

      trees = [];
      for (let x = 3; x < W - 3; x += 6 + Math.floor(Math.random() * 10)) {
        trees.push({ x, big: Math.random() < 0.3 });
      }
      flowers = Array.from({ length: Math.floor(W / 14) }, () => ({
        x: Math.floor(Math.random() * W),
        c: Math.floor(Math.random() * 4),
      }));
      rocks = Array.from({ length: Math.floor(W / 40) }, () =>
        Math.floor(Math.random() * W),
      );
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

    // A feature at world column x renders at screen column x - shift, and
    // hill columns are sampled at x + shift, so hills and props stay glued
    // together while each layer parallaxes at its own rate.
    const hillAt = (arr: number[], x: number) =>
      arr[Math.min(arr.length - 1, Math.max(0, x + LAND_PAD))];

    const drawLandscape = (t: number) => {
      const land = dark ? NIGHT.land : DAY.land;
      const sFar = Math.round(mx * 2);
      const sMid = Math.round(mx * 4);
      const sNear = Math.round(mx * 7);

      const fillLayer = (arr: number[], shift: number, top: string, body: string) => {
        for (let x = 0; x < W; x++) {
          const y = hillAt(arr, x + shift);
          ctx.fillStyle = top;
          ctx.fillRect(x, y, 1, 2);
          ctx.fillStyle = body;
          ctx.fillRect(x, y + 2, 1, H - y);
        }
      };

      // mountains sit behind everything and barely move; columns whose tops
      // rise past the (ragged) snowline get snow caps
      const sMtn = Math.round(mx * 1);
      const snowLine = Math.round((H * 0.66) / 2) * 2;
      for (let x = 0; x < W; x++) {
        const yTop = hillAt(mtn, x + sMtn);
        const line = snowLine + snowJit[Math.abs(x + sMtn) % snowJit.length];
        if (yTop < line) {
          ctx.fillStyle = land.snowCap;
          ctx.fillRect(x, yTop, 1, line - yTop);
          ctx.fillStyle = land.snowEdge;
          ctx.fillRect(x, line, 1, 2);
          ctx.fillStyle = land.mtn;
          ctx.fillRect(x, line + 2, 1, H - line);
        } else {
          ctx.fillStyle = land.mtnTop;
          ctx.fillRect(x, yTop, 1, 2);
          ctx.fillStyle = land.mtn;
          ctx.fillRect(x, yTop + 2, 1, H - yTop);
        }
      }

      fillLayer(hillFar, sFar, land.farTop, land.far);
      fillLayer(hillMid, sMid, land.midTop, land.mid);

      // castle keep on a mid-hill crest; windows glow warmly at night
      const cx = Math.floor(W * 0.72);
      const cyTop = hillAt(hillMid, cx) - CASTLE.length + 1;
      const csx = cx - 4 - sMid;
      CASTLE.forEach((row, ry) => {
        for (let rx = 0; rx < row.length; rx++) {
          const ch = row[rx];
          if (ch === ".") continue;
          if (ch === "O") {
            ctx.fillStyle = dark
              ? `rgba(255, 215, 122, ${(0.75 + 0.2 * Math.sin(t * 2.4 + rx)).toFixed(3)})`
              : land.window;
          } else {
            ctx.fillStyle = ch === "S" ? land.wallShade : land.wall;
          }
          ctx.fillRect(csx + rx, cyTop + ry, 1, 1);
        }
      });

      fillLayer(hillNear, sNear, land.nearTop, land.near);

      for (const r of rocks) {
        ctx.fillStyle = land.rock;
        ctx.fillRect(r - sNear, hillAt(hillNear, r) - 1, 2, 1);
      }
      for (const f of flowers) {
        const c = land.flowers[f.c % (land.flowers.length || 1)];
        if (!c) break; // no flowers at night
        ctx.fillStyle = c;
        ctx.fillRect(f.x - sNear, hillAt(hillNear, f.x) - 1, 1, 1);
      }

      for (const tr of trees) {
        const sx = tr.x - sNear;
        const y0 = hillAt(hillNear, tr.x);
        ctx.fillStyle = land.trunk;
        ctx.fillRect(sx, y0 - (tr.big ? 4 : 2), 1, tr.big ? 4 : 2);
        ctx.fillStyle = land.canopy;
        if (tr.big) {
          // stepped alpine pine: tiers widen 1 > 3 > 3 > 5 > 5 > 7
          ctx.fillRect(sx, y0 - 10, 1, 1);
          ctx.fillRect(sx - 1, y0 - 9, 3, 2);
          ctx.fillRect(sx - 2, y0 - 7, 5, 2);
          ctx.fillRect(sx - 3, y0 - 5, 7, 1);
        } else {
          ctx.fillRect(sx, y0 - 5, 1, 1);
          ctx.fillRect(sx - 1, y0 - 4, 3, 2);
        }
        ctx.fillStyle = land.canopyLight;
        ctx.fillRect(sx - 1, y0 - (tr.big ? 8 : 4), 1, 1);
      }
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

      drawLandscape(t);
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
