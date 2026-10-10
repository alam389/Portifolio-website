"use client";

import { useEffect, useRef } from "react";

export interface Day {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// GitHub's greens; level 0 stays neutral so it works on both themes.
const LEVEL_CLASS = [
  "bg-foreground/[0.06]",
  "bg-[#0e4429] light:bg-[#9be9a8]",
  "bg-[#006d32] light:bg-[#40c463]",
  "bg-[#26a641] light:bg-[#30a14e]",
  "bg-[#39d353] light:bg-[#216e39]",
];

const ROWS = 7;
const SIZE = 11;
const GAP = 3;
const PITCH = SIZE + GAP;
const SPEED = 14; // cells per second
const PAUSE = 2.5; // seconds the board stays eaten before refilling

export default function ContributionGraph({ cells }: { cells: (Day | null)[] }) {
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pacRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pac = pacRef.current;
    if (!wrap || !pac) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Smart path: hop to the cheapest remaining active cell (nearest, with a
    // penalty for doubling back), taking whichever L-shaped route crosses the
    // most uneaten cells on the way.
    const pending = new Set<number>();
    cells.forEach((d, i) => d && d.level > 0 && pending.add(i));
    const path: { x: number; y: number; index: number }[] = [];
    const visit = (c: number, r: number) => {
      const index = c * ROWS + r;
      path.push({ x: c * PITCH, y: r * PITCH, index });
      pending.delete(index);
    };
    const route = (c0: number, r0: number, c1: number, r1: number, horizontalFirst: boolean) => {
      const steps: [number, number][] = [];
      let c = c0;
      let r = r0;
      const walkH = () => {
        while (c !== c1) steps.push([(c += Math.sign(c1 - c)), r]);
      };
      const walkV = () => {
        while (r !== r1) steps.push([c, (r += Math.sign(r1 - r))]);
      };
      if (horizontalFirst) {
        walkH();
        walkV();
      } else {
        walkV();
        walkH();
      }
      return steps;
    };

    let cc = 0;
    let cr = 0;
    if (pending.size) {
      const first = Math.min(...pending);
      cc = Math.floor(first / ROWS);
      cr = first % ROWS;
    }
    visit(cc, cr);
    while (pending.size) {
      let best = -1;
      let bestCost = Infinity;
      for (const i of pending) {
        const dc = Math.floor(i / ROWS) - cc;
        const dr = (i % ROWS) - cr;
        const cost = Math.abs(dc) + Math.abs(dr) + (dc < 0 ? 1.5 * -dc : 0);
        if (cost < bestCost) {
          bestCost = cost;
          best = i;
        }
      }
      const tc = Math.floor(best / ROWS);
      const tr = best % ROWS;
      const gain = (steps: [number, number][]) =>
        steps.filter(([c, r]) => pending.has(c * ROWS + r)).length;
      const h = route(cc, cr, tc, tr, true);
      const v = route(cc, cr, tc, tr, false);
      for (const [c, r] of gain(h) >= gain(v) ? h : v) visit(c, r);
      cc = tc;
      cr = tr;
    }
    if (path.length < 2) return;

    const runTime = (path.length - 1) / SPEED;
    const cycle = runTime + PAUSE;
    let raf = 0;
    let start = 0;
    let eaten = -1;
    let visible = false;

    const setEaten = (upTo: number) => {
      if (upTo === eaten) return;
      if (upTo < eaten) {
        cellRefs.current.forEach((el) => el && (el.style.opacity = ""));
        eaten = -1;
      }
      for (let i = eaten + 1; i <= upTo; i++) {
        const index = path[i].index;
        const el = cells[index]?.level ? cellRefs.current[index] : null;
        if (el) el.style.opacity = "0.12";
      }
      eaten = upTo;
    };

    const frame = (now: number) => {
      if (!start) start = now;
      const t = ((now - start) / 1000) % cycle;
      if (t >= runTime) {
        pac.style.opacity = "0";
        setEaten(path.length - 1);
      } else {
        const f = t * SPEED;
        const i = Math.min(Math.floor(f), path.length - 2);
        const a = path[i];
        const b = path[i + 1];
        const u = f - i;
        const x = a.x + (b.x - a.x) * u;
        const y = a.y + (b.y - a.y) * u;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        pac.style.opacity = "1";
        pac.style.transform = `translate(${x - 1}px, ${y - 1}px) rotate(${angle}rad)`;
        setEaten(i);
      }
      raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        start = 0;
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(wrap);

    const cellEls = cellRefs.current;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      cellEls.forEach((el) => el && (el.style.opacity = ""));
    };
  }, [cells]);

  return (
    <div ref={wrapRef} className="relative w-max">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
        {cells.map((day, i) => (
          <span
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            title={day ? `${day.count} on ${day.date}` : undefined}
            className={`size-[11px] rounded-[2px] transition-opacity duration-500 ${day ? LEVEL_CLASS[day.level] : ""}`}
          />
        ))}
      </div>
      <span
        ref={pacRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 size-[13px] rounded-full bg-[#facc15] opacity-0 [animation:pac-chomp_0.28s_linear_infinite]"
      />
    </div>
  );
}
