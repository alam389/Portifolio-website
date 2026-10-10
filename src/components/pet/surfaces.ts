import type { Surface } from "./physics";

// Page elements whose top edge the pet can stand on. Opt an element in with
// data-pet-platform, or out (with everything inside it) with data-pet-ignore.
const PLATFORMS = [
  "body > aside",
  "body > nav",
  "main h1",
  "main h2",
  "main img",
  "main figure",
  "main > footer",
  "[data-pet-platform]",
].join(", ");

/** The platform list and geometry are refreshed at least this often (route changes, layout shifts). */
const REFRESH_MS = 500;

export interface PageSurfaces {
  /** The viewport floor; mutated in place when the window resizes. */
  floor: Surface;
  /**
   * What the pet can stand on now. Geometry is measured again only after a
   * scroll or resize, or once REFRESH_MS has passed, so a pet idling on a
   * still page costs no layout reads. The returned array and its surfaces are
   * never mutated; a fresh measurement returns new ones.
   */
  at(now: number): Surface[];
  dispose(): void;
}

/** @param minWidth platforms narrower than this are too small to walk on. */
export function trackSurfaces(minWidth: () => number): PageSurfaces {
  const floor: Surface = { el: null, left: 0, right: innerWidth, top: innerHeight };
  let platforms: Element[] = [];
  let list: Surface[] = [];
  let measuredAt = -Infinity;
  let dirty = true;

  const onScroll = () => {
    dirty = true;
  };
  const onResize = () => {
    dirty = true;
    floor.right = innerWidth;
    floor.top = innerHeight;
  };
  // Capture so scrolling inside nested containers counts too.
  addEventListener("scroll", onScroll, { passive: true, capture: true });
  addEventListener("resize", onResize);

  return {
    floor,
    at(now) {
      const stale = now - measuredAt > REFRESH_MS;
      if (!dirty && !stale) return list;
      if (stale) {
        platforms = [...document.querySelectorAll(PLATFORMS)].filter(
          (p) => !p.closest("[data-pet-ignore]"),
        );
      }
      const min = minWidth();
      list = platforms.flatMap((el) => {
        const r = el.getBoundingClientRect();
        return r.width >= min ? [{ el, left: r.left, right: r.right, top: r.top }] : [];
      });
      measuredAt = now;
      dirty = false;
      return list;
    },
    dispose() {
      removeEventListener("scroll", onScroll, { capture: true });
      removeEventListener("resize", onResize);
    },
  };
}
