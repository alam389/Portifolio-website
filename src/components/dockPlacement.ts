// Shared by Dock.tsx (client) and the root layout (server), so it must not be
// a "use client" module: the layout needs the real values, not references.

export type Edge = "left" | "right" | "top" | "bottom";

// Where the dock sits: which window edge, and how far along it (0 = start,
// 1 = end of the travel). A fraction, so the spot scales with the window.
export type Placement = { edge: Edge; t: number };

export const DOCK_STORAGE_KEY = "dock-position";

// Runs in <head> before first paint so a saved placement never flashes in
// from the default spot. Mirrors applyPlacement() in Dock.tsx.
export const dockInitScript = `try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  DOCK_STORAGE_KEY,
)}));if(p&&["left","right","top","bottom"].indexOf(p.edge)>-1&&typeof p.t==="number"){var r=document.documentElement;r.dataset.dock=r.dataset.dockRest=p.edge;r.style.setProperty("--dock-t",String(Math.min(1,Math.max(0,p.t))))}}catch(e){}`;
