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
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  DOCK_STORAGE_KEY,
  type Edge,
  type Placement,
} from "@/components/dockPlacement";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "About", icon: House },
  { href: "/experience", label: "Experience", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/journey", label: "Journey", icon: Route },
];

// Clockwise, for the E key.
const EDGES: Edge[] = ["top", "right", "bottom", "left"];
const DEFAULT: Placement = { edge: "left", t: 0.5 };
// Matches --dock-inset in globals.css.
const INSET = 16;
// Pointer must be this much closer to another edge before the dock flips,
// so it doesn't flicker near the window's diagonals.
const HYSTERESIS = 32;
// Arrow-key nudge along the edge; Shift moves 4x.
const NUDGE = 16;
// Glide from where the dock was dropped onto its edge.
const SNAP_MS = 280;

const isHorizontal = (edge: Edge) => edge === "top" || edge === "bottom";

function readSaved(): Placement | null {
  try {
    const p = JSON.parse(localStorage.getItem(DOCK_STORAGE_KEY) ?? "null");
    return EDGES.includes(p?.edge) && typeof p?.t === "number" ? p : null;
  } catch {
    return null;
  }
}

function save(p: Placement | null) {
  try {
    if (p) localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(p));
    else localStorage.removeItem(DOCK_STORAGE_KEY);
  } catch {
    // Storage blocked (private window etc.): the dock just won't remember.
  }
}

// Layout is pure CSS keyed off these (see .dock in globals.css), which is
// what lets the inline script in layout.tsx place the dock before paint.
// `resting` is false mid-drag: the dock turns live, but the page gutter
// (data-dock-rest) only moves once it lands.
function applyPlacement(p: Placement, prevEdge: Edge, resting: boolean) {
  const root = document.documentElement;
  if (p.edge !== prevEdge) {
    root.classList.add("dock-flipping");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("dock-flipping")),
    );
  }
  root.dataset.dock = p.edge;
  if (resting) root.dataset.dockRest = p.edge;
  root.style.setProperty("--dock-t", String(p.t));
}

// Converts the dock's leading-end coordinate along an edge into t (0-1).
function toT(start: number, edge: Edge, el: HTMLElement) {
  const length = isHorizontal(edge) ? window.innerWidth : window.innerHeight;
  // Same pill either way, just rotated, so its long side is its length.
  const size = Math.max(el.offsetWidth, el.offsetHeight);
  const travel = length - 2 * INSET - size;
  if (travel <= 0) return 0.5;
  return Math.min(1, Math.max(0, (start - INSET) / travel));
}

function nearestEdge(x: number, y: number, current: Edge): Edge {
  const dist: Record<Edge, number> = {
    left: x,
    right: window.innerWidth - x,
    top: y,
    bottom: window.innerHeight - y,
  };
  const nearest = EDGES.reduce((a, b) => (dist[b] < dist[a] ? b : a));
  return dist[nearest] + HYSTERESIS < dist[current] ? nearest : current;
}

// Inline styles outrank the edge rules in globals.css, so these free the
// dock from its edge mid-drag. React never sets style on the dock, so it
// won't fight them.
function float(el: HTMLElement, x: number, y: number) {
  const maxX = window.innerWidth - el.offsetWidth - INSET;
  const maxY = window.innerHeight - el.offsetHeight - INSET;
  el.style.left = `${Math.max(INSET, Math.min(x, maxX))}px`;
  el.style.top = `${Math.max(INSET, Math.min(y, maxY))}px`;
  el.style.right = el.style.bottom = "auto";
  el.style.translate = "none";
}

function unfloat(el: HTMLElement) {
  for (const prop of ["left", "top", "right", "bottom", "translate"]) {
    el.style.removeProperty(prop);
  }
}

const pill =
  "rounded-[28px] border border-foreground/10 bg-neutral-900/90 p-2 backdrop-blur-md";

function Items({ variant }: { variant: "dock" | "bar" }) {
  const pathname = usePathname();
  const active = links.findIndex((l) => l.href === pathname);
  const dock = variant === "dock";

  return (
    <div className="relative">
      {active >= 0 && (
        <span
          aria-hidden
          style={{ "--i": active } as CSSProperties}
          className={`pointer-events-none absolute left-0 top-0 size-11 rounded-xl bg-foreground/10 ${
            dock
              ? "dock-hl"
              : "translate-x-[calc(var(--i)*var(--dock-step))] transition-[translate] duration-300 ease-out motion-reduce:transition-none"
          }`}
        />
      )}
      <ul className={`relative flex gap-1.5 ${dock ? "dock-list" : ""}`}>
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
                {dock && (
                  <span
                    aria-hidden
                    className="dock-tip pointer-events-none absolute whitespace-nowrap rounded-md border border-foreground/10 bg-neutral-900 px-2 py-1 text-xs text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
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
  // Source of truth for logic; the DOM (html attrs) is the source for layout.
  const placement = useRef<Placement>(DEFAULT);
  // Where in the dock it was grabbed, while dragging; null otherwise.
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // The inline script already applied any saved placement; just sync to it.
  useEffect(() => {
    placement.current = readSaved() ?? DEFAULT;
  }, []);

  function place(next: Placement, resting = true) {
    applyPlacement(next, placement.current.edge, resting);
    placement.current = next;
  }

  function reset() {
    place(DEFAULT);
    save(null);
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0 || !dockRef.current) return;
    // The dock moves under the cursor, so without this the browser starts a
    // native drag of whichever link slides beneath the press point, which
    // cancels the pointer mid-drag.
    e.preventDefault();
    const r = dockRef.current.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  // While dragging, the dock floats with the cursor but is already turned
  // for the edge it will land on.
  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const el = dockRef.current;
    let grab = drag.current;
    if (!grab || !el) return;
    const prev = placement.current.edge;
    const edge = nearestEdge(e.clientX, e.clientY, prev);
    // Turning the pill transposes it through the grip, so swapping the
    // offsets keeps the grip under the cursor.
    if (isHorizontal(edge) !== isHorizontal(prev)) {
      grab = drag.current = { dx: grab.dy, dy: grab.dx };
    }
    place({ edge, t: placement.current.t }, false);
    float(el, e.clientX - grab.dx, e.clientY - grab.dy);
  }

  // On release, attach to the edge level with where it was dropped and
  // glide there from the drop point.
  function onPointerUp() {
    const el = dockRef.current;
    if (!drag.current || !el) return;
    drag.current = null;
    setDragging(false);

    const { edge } = placement.current;
    const from = el.getBoundingClientRect();
    const next = {
      edge,
      t: toT(isHorizontal(edge) ? from.left : from.top, edge, el),
    };
    unfloat(el);
    place(next);
    save(next);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = el.getBoundingClientRect();
    el.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` },
        { transform: "none" },
      ],
      { duration: SNAP_MS, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const el = dockRef.current;
    if (!el) return;
    const { edge, t } = placement.current;
    let next: Placement | null = null;

    if (e.key === "Home") {
      e.preventDefault();
      reset();
      return;
    } else if (e.key === "e" || e.key === "E") {
      next = { edge: EDGES[(EDGES.indexOf(edge) + 1) % 4], t };
    } else {
      const back = isHorizontal(edge) ? "ArrowLeft" : "ArrowUp";
      const fwd = isHorizontal(edge) ? "ArrowRight" : "ArrowDown";
      if (e.key !== back && e.key !== fwd) return;
      const step = (e.shiftKey ? NUDGE * 4 : NUDGE) * (e.key === fwd ? 1 : -1);
      const r = el.getBoundingClientRect();
      const start = isHorizontal(edge) ? r.left : r.top;
      next = { edge, t: toT(start + step, edge, el) };
    }

    e.preventDefault();
    place(next);
    save(next);
  }

  return (
    <>
      {/* Desktop: dock attached to a window edge, draggable between them */}
      <nav
        ref={dockRef}
        aria-label="Main"
        className={`dock fixed z-30 hidden select-none items-center gap-1 transition-shadow duration-200 md:flex ${pill} ${
          dragging ? "shadow-2xl shadow-black/70" : "shadow-lg shadow-black/40"
        }`}
      >
        <button
          type="button"
          aria-label="Move navigation. Arrow keys slide it along the edge, E moves it to the next edge, Home resets it."
          title="Drag to move · double-click to reset"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={reset}
          onKeyDown={onKeyDown}
          className={`dock-grip flex shrink-0 touch-none items-center justify-center rounded-lg text-foreground/35 transition-colors hover:text-foreground/70 focus-visible:text-foreground/70 focus-visible:outline-2 focus-visible:outline-foreground/40 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <GripHorizontal size={18} aria-hidden />
        </button>
        <Items variant="dock" />
      </nav>

      {/* Mobile: fixed bottom bar, same pill laid out horizontally */}
      <nav
        aria-label="Main"
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 shadow-lg shadow-black/40 md:hidden ${pill}`}
      >
        <Items variant="bar" />
      </nav>
    </>
  );
}
