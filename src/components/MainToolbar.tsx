"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { BranchIcon, ChevronIcon, MenuIcon, RunIcon } from "./Icons";

// IntelliJ New-UI main toolbar: project chip, VCS branch widget, run config.
// Honest controls only — "run hire_me" really runs it (opens the file).

export function MainToolbar({ onMenu }: { onMenu: () => void }) {
  return (
    <div
      className="stagger flex h-10 shrink-0 items-center gap-2.5 border-b border-border bg-sidebar px-2 font-mono text-[12px]"
      style={{ "--stagger-delay": "250ms" } as React.CSSProperties}
    >
      <button
        type="button"
        aria-label="Open file tree"
        onClick={onMenu}
        className="p-1.5 text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent md:hidden"
      >
        <MenuIcon className="h-4 w-4" />
      </button>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-[10px] font-bold text-white"
        aria-hidden="true"
      >
        AL
      </span>
      <span className="flex items-center gap-1 font-medium text-foreground">
        anthony-lam
        <ChevronIcon className="h-3 w-3 rotate-90 text-muted" />
      </span>
      <span className="hidden items-center gap-1 text-muted sm:flex">
        <BranchIcon className="h-3.5 w-3.5" />
        main
        <ChevronIcon className="h-3 w-3 rotate-90" />
      </span>
      <span className="flex-1" aria-hidden="true" />
      <Link
        href="/recruiter/hire-me"
        title="Run: hire_me"
        className="hidden items-center gap-1.5 rounded px-2 py-1 text-muted outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent sm:flex"
      >
        <RunIcon className="h-3.5 w-3.5 text-syn-green" />
        hire_me
      </Link>
      <ThemeToggle />
    </div>
  );
}
