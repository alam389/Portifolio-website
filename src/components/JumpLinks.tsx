"use client";

import type { MouseEvent } from "react";
import { scrollToY } from "@/components/SmoothScroll";

// Room left above a section when jumping to it.
const OFFSET = 32;

/**
 * In-page anchor links. Plain #hash links work without JS; with JS they glide
 * through Lenis instead of the instant jump Lenis leaves native anchors with.
 */
export default function JumpLinks({
  links,
}: {
  links: { id: string; label: string }[];
}) {
  function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToY(target.getBoundingClientRect().top + window.scrollY - OFFSET);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label="Sections" className="mt-6">
      <ul className="flex flex-wrap gap-2">
        {links.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => jump(e, id)}
              className="inline-block rounded-full border border-foreground/15 px-3 py-1 text-sm text-foreground/70 transition-colors duration-150 hover:border-foreground/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
