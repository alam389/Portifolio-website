import type { Bounds } from "./globe";

/*
 * The Journey's flight path: turns scroll progress into what the globe and
 * the step rail show. Progress is measured in stops: -1 = intro, 0 = first
 * stop's card centered, 1.5 = halfway between the second and third.
 * Plain maths, no React, DOM or three.js.
 */

const DEG = Math.PI / 180;

/** Camera distance (globe radius = 1) for the intro shot. */
export const WIDE = 3.4;
const CLOSE = 1.2; // camera distance while holding on a stop
const MAX_TILT = 0.95; // radians; tilts close shots so the horizon shows
const INTRO_TURN = 50; // the intro starts this many degrees east of the first stop

export type Place = { lat: number; lng: number };

export type CameraTarget = {
  /** Where the camera looks, in degrees; lng is wrapped to -180..180. */
  lat: number;
  lng: number;
  /** Camera distance from the globe's center (radius = 1). */
  distance: number;
  /** 0 in the wide intro shot, 1 when holding on a stop. */
  closeness: number;
  /** Radians to tilt toward the horizon. */
  tilt: number;
};

export class FlightPath {
  private readonly stops: readonly Place[];
  /** Angle in radians of each hop, stop i to stop i + 1. */
  private readonly hops: number[];

  constructor(stops: readonly Place[]) {
    this.stops = stops;
    this.hops = stops.slice(1).map((b, i) => angularDistance(stops[i], b) * DEG);
  }

  /** Where the camera looks and how far out it sits. */
  camera(progress: number): CameraTarget {
    const { stops } = this;
    const last = stops.length - 1;
    if (last < 0) return { lat: 0, lng: 0, distance: WIDE, closeness: 0, tilt: 0 };
    const p = clamp(progress, -1, last);
    let lat: number;
    let lng: number;
    let distance: number;

    // The path interpolates lat/lng rather than following the great circle,
    // so north stays up. Great circles between Ontario and Asia pass near
    // the pole, where a north-up camera would roll sideways.
    if (p < 0) {
      // Intro: start east of the first stop so the globe turns into place.
      const e = hopEase(p + 1, 0.1);
      lat = stops[0].lat;
      lng = stops[0].lng + INTRO_TURN * (1 - e);
      distance = WIDE + (CLOSE - WIDE) * e;
    } else {
      const i = Math.min(Math.floor(p), Math.max(last - 1, 0));
      const e = last === 0 ? 0 : hopEase(p - i);
      const a = stops[i];
      const b = stops[Math.min(i + 1, last)];
      lat = a.lat + (b.lat - a.lat) * e;
      lng = a.lng + wrapLng(b.lng - a.lng) * e; // shortest way round
      // Pull out mid-flight in proportion to the hop, so long hops show the
      // whole globe (2.2 lifts it all the way to WIDE) and short Ontario hops
      // barely lift.
      const angle = this.hops[i] ?? 0;
      distance = CLOSE + Math.sin(Math.PI * e) * Math.min(2.2, angle * 1.6);
    }

    const closeness = clamp((WIDE - distance) / (WIDE - CLOSE), 0, 1);
    return { lat, lng: wrapLng(lng), distance, closeness, tilt: MAX_TILT * closeness };
  }

  /**
   * The stop whose card is closest to filling the screen; -1 on the intro.
   * Past the last card it stays on the last stop.
   */
  activeStop(progress: number) {
    if (progress < -0.5 || this.stops.length === 0) return -1;
    return clamp(Math.round(progress), 0, this.stops.length - 1);
  }

  /** How much of the arc from stop `hop` to the next is drawn, 0..1. */
  arcDrawn(hop: number, progress: number) {
    return hopEase(clamp(progress - hop, 0, 1));
  }
}

/**
 * Seconds to page from stop `from` to stop `to` (the intro, -1, counts as
 * the first stop). Longer jumps take a little longer so the globe can fly
 * the path in between without whipping.
 */
export function pagingDuration(from: number, to: number) {
  const hops = Math.abs(to - Math.max(from, 0));
  return Math.min(3, 1 + 0.25 * hops);
}

/* ---------- Region patches ---------- */

// A patch starts loading when the camera heads within this many degrees of
// its region, and fades in as the camera settles into a close-up inside it.
const PATCH_LOAD_DEG = 30;

export type PatchRegion = Bounds & { id: string };

export type Patches<R extends PatchRegion> = {
  /** How far each region's patch has faded in, 0..1, by id. */
  fades: Map<string, number>;
  /** Regions the camera is near enough to that their patches should load. */
  near: string[];
  /** The patch fading in most; the global layer hides under it. */
  hole: { region: R; fade: number } | null;
};

/**
 * Which region patches show for a view. Only patches in `ready` (particles
 * on the GPU) fade in, so a region never goes sparse while its patch loads.
 */
export function regionPatches<R extends PatchRegion>(
  regions: readonly R[],
  ready: ReadonlySet<string>,
  view: Place & { closeness: number },
): Patches<R> {
  const fades = new Map<string, number>();
  const near: string[] = [];
  let hole: Patches<R>["hole"] = null;
  for (const region of regions) {
    const center = {
      lat: (region.south + region.north) / 2,
      lng: (region.west + region.east) / 2,
    };
    if (angularDistance(view, center) < PATCH_LOAD_DEG) near.push(region.id);
    // How far the camera's target is outside the region's inner area.
    const m = 2;
    const dx = Math.max(region.west + m - view.lng, 0, view.lng - (region.east - m));
    const dy = Math.max(region.south + m - view.lat, 0, view.lat - (region.north - m));
    const inside = 1 - smoothstep(0, 3, Math.hypot(dx, dy));
    const fade = ready.has(region.id) ? inside * smoothstep(0.55, 0.9, view.closeness) : 0;
    fades.set(region.id, fade);
    if (fade > (hole?.fade ?? 0)) hole = { region, fade };
  }
  return { fades, near, hole };
}

/* ---------- Helpers ---------- */

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Wraps degrees of longitude to -180..180. */
const wrapLng = (lng: number) => (((lng % 360) + 540) % 360) - 180;

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Eases a 0..1 hop with flat ends, so the camera holds on each stop while its
 * card is centered and only travels in the middle of the scroll between cards.
 */
function hopEase(t: number, hold = 0.2) {
  const x = clamp((t - hold) / (1 - 2 * hold), 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
}

/** Angular distance in degrees between two lat/lng points. */
function angularDistance(a: Place, b: Place) {
  const cos =
    Math.sin(a.lat * DEG) * Math.sin(b.lat * DEG) +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.cos((b.lng - a.lng) * DEG);
  return Math.acos(clamp(cos, -1, 1)) / DEG;
}
