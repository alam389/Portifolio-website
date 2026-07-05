"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findBySlug } from "../../content/manifest";
import { useTabs } from "./Providers";
import { CloseIcon, FileIcon } from "./Icons";

// Desktop: VS Code-style tab strip. Mobile (< md): the same state renders as a
// breadcrumb — one source of truth, two presentations (DESIGN.md §2.6).

export function TabBar() {
  const { tabs, closeTab } = useTabs();
  const pathname = usePathname();

  return (
    <div className="hidden min-w-0 flex-1 items-stretch overflow-x-auto font-mono text-[13px] md:flex">
      {tabs.map((slug) => {
        const node = findBySlug(slug);
        if (!node) return null;
        const active = slug === pathname;
        return (
          <div
            key={slug}
            className={`group flex shrink-0 items-stretch bg-tabbar ${
              active
                ? "border-b-2 border-b-accent text-foreground"
                : "border-b-2 border-b-transparent text-muted hover:text-foreground"
            }`}
          >
            <Link
              href={slug}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-1.5 py-1.5 pl-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <FileIcon kind={node.kind} className="h-4 w-4 shrink-0" />
              {node.label}
            </Link>
            <button
              type="button"
              aria-label={`Close ${node.label}`}
              onClick={() => closeTab(slug)}
              className={`mx-1 my-auto rounded p-0.5 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? "opacity-60 hover:opacity-100"
                  : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
              }`}
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const node = findBySlug(pathname);
  if (!node) return null;
  const segments =
    pathname === "/" ? [] : pathname.slice(1).split("/").slice(0, -1);
  const crumbs = [...segments, node.label];
  return (
    <nav
      aria-label="Current file"
      className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted md:hidden"
    >
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 text-muted/60">›</span>}
          <span className={i === crumbs.length - 1 ? "text-foreground" : ""}>
            {crumb}
          </span>
        </span>
      ))}
    </nav>
  );
}
