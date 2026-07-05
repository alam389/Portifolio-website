"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { findBySlug } from "../../content/manifest";

// Tab state (DESIGN.md §2.2): a plain array of open slugs synced to the route.
// Scoped out on purpose: reorder, persistence, restore-on-reload.

interface TabsContextValue {
  tabs: string[];
  closeTab: (slug: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within <Providers>");
  return ctx;
}

function TabsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Fresh load / deep link seeds exactly one tab (the current route).
  const [tabs, setTabs] = useState<string[]>(() =>
    findBySlug(pathname) ? [pathname] : [],
  );

  // Open the current route as a tab (render-phase state adjustment; only
  // slugs that exist in the manifest become tabs — 404s don't).
  if (findBySlug(pathname) && !tabs.includes(pathname)) {
    setTabs([...tabs, pathname]);
  }

  const closeTab = (slug: string) => {
    const idx = tabs.indexOf(slug);
    if (idx === -1) return;
    const next = tabs.filter((s) => s !== slug);
    setTabs(next.length > 0 ? next : ["/"]);
    // Closing the active tab → go to the tab on its left, else about (DESIGN.md §2.2).
    if (slug === pathname) {
      router.push(next[idx - 1] ?? next[0] ?? "/");
    }
  };

  return (
    <TabsContext.Provider value={{ tabs, closeTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TabsProvider>{children}</TabsProvider>
    </ThemeProvider>
  );
}
