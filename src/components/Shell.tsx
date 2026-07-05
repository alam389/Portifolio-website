"use client";

import { useState, type ReactNode } from "react";
import { FileTree } from "./FileTree";
import { TabBar, Breadcrumb } from "./TabBar";
import { MobileDrawer } from "./MobileDrawer";
import { MainToolbar } from "./MainToolbar";
import { StatusBar } from "./StatusBar";
import { ActivityBar } from "./ActivityBar";
import { ChevronIcon } from "./Icons";

// IntelliJ New-UI chrome: main toolbar on top, tool-window rail + Project
// panel left, tabbed editor, status bar spanning the bottom. Lives in the
// root layout so it never re-renders on navigation (DESIGN.md §2.2).

export function Shell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 px-3 pb-1 pt-2.5 font-mono text-[12px] font-semibold text-foreground/90">
        Project
        <ChevronIcon className="h-3 w-3 rotate-90 text-muted" />
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {/* project root node, IntelliJ style */}
        <div className="flex items-center gap-1.5 px-3 pb-1 pt-1 font-mono text-[13px] font-semibold text-foreground">
          <ChevronIcon className="h-3.5 w-3.5 rotate-90 text-muted" />
          anthony-lam
        </div>
        <FileTree onNavigate={() => setDrawerOpen(false)} />
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <MainToolbar onMenu={() => setDrawerOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
          {sidebar}
        </aside>

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </MobileDrawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="stagger flex items-center border-b border-border bg-tabbar pl-3 md:pl-0"
            style={{ "--stagger-delay": "320ms" } as React.CSSProperties}
          >
            <TabBar />
            <Breadcrumb />
          </header>
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
