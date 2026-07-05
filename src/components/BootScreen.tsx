"use client";

import { useEffect, useState } from "react";

// Boot animation (DESIGN.md §2.9): a terminal "git clone" intro before the
// editor. Sanctioned exception to the no-fake-terminal non-goal — bounded:
// once per session, ~2.5s, skippable (any key / click), and skipped entirely
// under prefers-reduced-motion.

// TODO(Anthony): point at the real public repo URL if you want it clickable-true.
const CMD = "git clone https://github.com/alam389/portfolio.git";

const LINES = [
  "Cloning into 'anthony-lam'...",
  "remote: Enumerating objects: 8, done.",
  "remote: Compressing objects: 100% (8/8), done.",
  "Receiving objects: 100% (8/8), done.",
  "Resolving deltas: 100% (2/2), done.",
];

const DONE_LINE = "✓ workspace ready — opening editor";

const TYPE_MS = 22; // per character
const LINE_MS = 110; // per output line

export function BootScreen() {
  // Visible in SSR markup so the first paint is the terminal, not a flash of
  // the editor. Repeat visitors get dismissed on mount (sessionStorage).
  const [visible, setVisible] = useState(true);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const pending: ReturnType<typeof setTimeout>[] = [];
    const root = document.documentElement;
    const finish = () => {
      sessionStorage.setItem("boot-played", "1");
      // Release the staggered load choreography (globals.css).
      root.classList.remove("booting");
      root.classList.add("booted");
      setVisible(false);
    };

    if (
      sessionStorage.getItem("boot-played") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.classList.add("booted");
      setVisible(false);
      return;
    }

    root.classList.add("booting");

    const at = (ms: number, fn: () => void) => {
      pending.push(setTimeout(fn, ms));
    };

    // Schedule the whole sequence upfront.
    for (let i = 1; i <= CMD.length; i++) at(i * TYPE_MS, () => setTyped(i));
    const base = CMD.length * TYPE_MS + 150;
    LINES.forEach((_, j) => at(base + (j + 1) * LINE_MS, () => setLines(j + 1)));
    const doneAt = base + LINES.length * LINE_MS + 200;
    at(doneAt, () => setDone(true));
    at(doneAt + 450, () => setFading(true));
    at(doneAt + 770, finish);

    const skip = () => {
      pending.forEach(clearTimeout);
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      pending.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background font-mono text-sm transition-opacity duration-300 motion-reduce:transition-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-xl px-6">
        <div className="overflow-hidden rounded-lg border border-border bg-code-bg shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="text-xs text-muted">anthony@portfolio — zsh</span>
          </div>
          <div className="px-4 py-3 leading-6">
            <p className="whitespace-pre-wrap break-all">
              <span className="text-accent">➜</span>{" "}
              <span className="text-muted">~</span> {CMD.slice(0, typed)}
              {!done && (
                <span
                  className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-foreground/80"
                  aria-hidden="true"
                />
              )}
            </p>
            {LINES.slice(0, lines).map((line) => (
              <p key={line} className="text-muted">
                {line}
              </p>
            ))}
            {done && <p className="text-accent">{DONE_LINE}</p>}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          press any key to skip
        </p>
      </div>
    </div>
  );
}
