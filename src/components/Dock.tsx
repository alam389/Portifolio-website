"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code,
  FileText,
  GripHorizontal,
  House,
  Route,
  type LucideIcon,
} from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "About", icon: House },
  { href: "/experience", label: "Experience", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/journey", label: "Journey", icon: Route },
];

// Item box (size-11 = 44px) + list gap (gap-1.5 = 6px): how far the active
// highlight slides per item. Keep in sync with the classes in <Items>.
const STEP = 50;
// Minimum distance between the dock and the viewport edge (matches left-4).
const EDGE = 16;
// Arrow-key nudge on the grip; Shift moves 4x.
const NUDGE = 16;
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const STORAGE_KEY = "dock-position";

type Point = { x: number; y: number };

function readSaved(): Point | null {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return typeof p?.x === "number" && typeof p?.y === "number" ? p : null;
  } catch {
    return null;
  }
}

function save(p: Point | null) {
  try {
    if (p) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private window etc.): the dock just won't remember.
  }
}

function clamp(p: Point, el: HTMLElement): Point {
  const maxX = window.innerWidth - el.offsetWidth - EDGE;
  const maxY = window.innerHeight - el.offsetHeight - EDGE;
  return {
    x: Math.max(EDGE, Math.min(p.x, maxX)),
    y: Math.max(EDGE, Math.min(p.y, maxY)),
  };
}

const pill =
  "rounded-[28px] border border-foreground/10 bg-neutral-900/90 p-2 backdrop-blur-md";

function Items({
  orientation,
  tip,
}: {
  orientation: "vertical" | "horizontal";
  tip?: "left" | "right";
}) {
  const pathname = usePathname();
  const active = links.findIndex((l) => l.href === pathname);
  const vertical = orientation === "vertical";

  return (
    <div className="relative">
      {active >= 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 size-11 rounded-xl bg-foreground/10 transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            transform: vertical
              ? `translateY(${active * STEP}px)`
              : `translateX(${active * STEP}px)`,
          }}
        />
      )}
      <ul className={`relative flex gap-1.5 ${vertical ? "flex-col" : ""}`}>
        {links.map(({ href, label, icon: Icon }, i) => {
          const isActive = i === active;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex size-11 items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-foreground/40 ${
                  isActive
                    ? "text-foreground"
                    : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground focus-visible:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                {tip && (
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-neutral-900 px-2 py-1 text-xs text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                      tip === "right" ? "left-full ml-3" : "right-full mr-3"
                    }`}
                  >
                    {label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Dock() {
  const dockRef = useRef<HTMLElement>(null);
  // Pointer offset inside the dock + last position, set only while dragging.
  const drag = useRef<{ dx: number; dy: number; last: Point | null } | null>(
    null,
  );
  // null = default spot (left edge, vertically centered, done in CSS).
  const [pos, setPos] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);

  // Layout effect so a saved position applies before the first paint.
  useLayoutEffect(() => {
    const saved = readSaved();
    if (saved && dockRef.current) setPos(clamp(saved, dockRef.current));

    const onResize = () =>
      setPos((p) => (p && dockRef.current ? clamp(p, dockRef.current) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function origin(): Point {
    const r = dockRef.current!.getBoundingClientRect();
    return { x: r.left, y: r.top };
  }

  function reset() {
    setPos(null);
    save(null);
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    const o = origin();
    drag.current = { dx: e.clientX - o.x, dy: e.clientY - o.y, last: null };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || !dockRef.current) return;
    const next = clamp(
      { x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy },
      dockRef.current,
    );
    drag.current.last = next;
    setPos(next);
  }

  function onPointerUp() {
    if (!drag.current) return;
    if (drag.current.last) save(drag.current.last);
    drag.current = null;
    setDragging(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Home") {
      e.preventDefault();
      reset();
      return;
    }
    const dir = ARROWS[e.key];
    if (!dir || !dockRef.current) return;
    e.preventDefault();
    const step = e.shiftKey ? NUDGE * 4 : NUDGE;
    const o = origin();
    const next = clamp(
      { x: o.x + dir[0] * step, y: o.y + dir[1] * step },
      dockRef.current,
    );
    setPos(next);
    save(next);
  }

  // Tooltips open toward the roomier side of the screen.
  const tip = pos && pos.x > window.innerWidth / 2 ? "left" : "right";

  return (
    <>
      {/* Desktop: floating, draggable vertical dock */}
      <nav
        ref={dockRef}
        aria-label="Main"
        style={
          pos
            ? { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }
            : undefined
        }
        className={`fixed z-30 hidden select-none flex-col items-center gap-1 transition-shadow duration-200 md:flex ${pill} ${
          pos ? "left-0 top-0" : "left-4 top-1/2 -translate-y-1/2"
        } ${dragging ? "shadow-2xl shadow-black/70" : "shadow-lg shadow-black/40"}`}
      >
        <button
          type="button"
          aria-label="Move navigation. Arrow keys move it, Home resets it."
          title="Drag to move · double-click to reset"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={reset}
          onKeyDown={onKeyDown}
          className={`flex h-6 w-11 touch-none items-center justify-center rounded-lg text-foreground/35 transition-colors hover:text-foreground/70 focus-visible:text-foreground/70 focus-visible:outline-2 focus-visible:outline-foreground/40 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <GripHorizontal size={18} aria-hidden />
        </button>
        <Items orientation="vertical" tip={tip} />
      </nav>

      {/* Mobile: fixed bottom bar, same pill laid out horizontally */}
      <nav
        aria-label="Main"
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 shadow-lg shadow-black/40 md:hidden ${pill}`}
      >
        <Items orientation="horizontal" />
      </nav>
    </>
  );
}
