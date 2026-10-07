// Shared by Sidebar.tsx (client) and the root layout (server), so it must not
// be a "use client" module: the layout needs the real values.

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before first paint so the page never flashes the wrong
// theme. A saved choice wins; otherwise follow the OS. Without JS the page
// stays dark (the :root default in globals.css).
export const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}`;
