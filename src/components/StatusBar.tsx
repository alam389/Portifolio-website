import type { CSSProperties } from "react";
import { profile } from "@/data";
import { BranchIcon } from "./Icons";

// VS Code-style status bar (.impeccable.md: authentic editor details).
// Static/decorative — real data only (branch, location, availability).

export function StatusBar() {
  return (
    <footer
      className="stagger flex h-6 shrink-0 items-center gap-3 overflow-hidden border-t border-border bg-statusbar px-3 font-mono text-[11px] text-muted"
      style={{ "--stagger-delay": "450ms" } as CSSProperties}
    >
      <span className="flex items-center gap-1">
        <BranchIcon className="h-3.5 w-3.5" />
        main
      </span>
      <span className="hidden sm:inline">✕ 0 ⚠ 0</span>
      <span className="flex-1" aria-hidden="true" />
      <span className="hidden md:inline">Spaces: 2</span>
      <span className="hidden md:inline">UTF-8</span>
      <span className="hidden sm:inline">Markdown</span>
      <span className="hidden sm:inline">{profile.location}</span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-syn-green" aria-hidden="true" />
        open to work
      </span>
    </footer>
  );
}
