import { describe, expect, it } from "vitest";
import { FlightPath, WIDE, pagingDuration, regionPatches } from "./flightPath";

// A short hop east along the equator, then a long one north-east.
const stops = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 60, lng: 100 },
];
const path = new FlightPath(stops);
const hold = path.camera(0);

describe("camera", () => {
  it("starts the intro wide, 50° east of the first stop", () => {
    const c = path.camera(-1);
    expect(c.lat).toBe(0);
    expect(c.lng).toBeCloseTo(50);
    expect(c.distance).toBeCloseTo(WIDE);
    expect(c.closeness).toBe(0);
    expect(c.tilt).toBe(0);
    // Scrolling above the intro doesn't move it.
    expect(path.camera(-3)).toEqual(c);
  });

  it("holds on a stop, close and tilted, at integer progress", () => {
    const c = path.camera(1);
    expect(c.lat).toBe(0);
    expect(c.lng).toBe(10);
    expect(c.closeness).toBe(1);
    expect(c.tilt).toBeGreaterThan(0);
    expect(c.distance).toBeLessThan(WIDE);
    expect(c.distance).toBeCloseTo(hold.distance);
    // The hold lasts a little either side, while the card is centered.
    expect(path.camera(0.9)).toEqual(c);
    expect(path.camera(1.1)).toEqual(c);
  });

  it("stays on the last stop past the end", () => {
    expect(path.camera(5)).toEqual(path.camera(2));
    expect(path.camera(2).lat).toBe(60);
  });

  it("pulls out midway in proportion to the hop", () => {
    const short = path.camera(0.5);
    expect(short.lng).toBeCloseTo(5);
    expect(short.distance).toBeGreaterThan(hold.distance);
    expect(short.closeness).toBeGreaterThan(0);
    expect(short.closeness).toBeLessThan(1);

    const long = path.camera(1.5);
    expect(long.lat).toBeCloseTo(30);
    expect(long.lng).toBeCloseTo(55);
    expect(long.distance).toBeGreaterThan(short.distance);
    expect(long.distance).toBeCloseTo(WIDE); // capped at the intro's width
    expect(long.closeness).toBeCloseTo(0);
  });

  it("flies the short way across the antimeridian", () => {
    const pacific = new FlightPath([
      { lat: 10, lng: 170 },
      { lat: 20, lng: -170 },
    ]);
    expect(Math.abs(pacific.camera(0.5).lng)).toBeCloseTo(180);
    expect(pacific.camera(0.5).lat).toBeCloseTo(15);
    const early = pacific.camera(0.4).lng;
    expect(early).toBeGreaterThan(170);
    expect(early).toBeLessThan(180);
    const late = pacific.camera(0.6).lng;
    expect(late).toBeGreaterThan(-180);
    expect(late).toBeLessThan(-170);
    // A 20° hop barely lifts, unlike the 340° the long way would be.
    expect(pacific.camera(0.5).closeness).toBeGreaterThan(0.5);
  });

  it("wraps the intro's start longitude", () => {
    const c = new FlightPath([{ lat: 0, lng: 160 }]).camera(-1);
    expect(c.lng).toBeCloseTo(-150);
  });

  it("handles a single-stop journey", () => {
    const one = new FlightPath([{ lat: 43, lng: -80 }]);
    for (const p of [-2, -1, -0.5, 0, 0.5, 3]) {
      const c = one.camera(p);
      for (const v of Object.values(c)) expect(Number.isFinite(v)).toBe(true);
    }
    expect(one.camera(0)).toMatchObject({ lat: 43, lng: -80, closeness: 1 });
    expect(one.camera(3)).toEqual(one.camera(0));
    expect(one.activeStop(3)).toBe(0);
  });
});

describe("activeStop", () => {
  it("is -1 on the intro, up to halfway to the first stop", () => {
    expect(path.activeStop(-1)).toBe(-1);
    expect(path.activeStop(-0.51)).toBe(-1);
    expect(path.activeStop(-0.5)).toBe(0);
  });

  it("is the nearest stop, switching halfway between", () => {
    expect(path.activeStop(0)).toBe(0);
    expect(path.activeStop(0.49)).toBe(0);
    expect(path.activeStop(0.5)).toBe(1);
    expect(path.activeStop(1.49)).toBe(1);
  });

  it("stays on the last stop past the end", () => {
    expect(path.activeStop(2)).toBe(2);
    expect(path.activeStop(2.5)).toBe(2);
    expect(path.activeStop(10)).toBe(2);
  });
});

describe("arcDrawn", () => {
  it("is empty before its hop and while holding on its first stop", () => {
    expect(path.arcDrawn(1, -1)).toBe(0);
    expect(path.arcDrawn(1, 0.5)).toBe(0);
    expect(path.arcDrawn(1, 1.1)).toBe(0);
  });

  it("draws as the camera travels the hop", () => {
    expect(path.arcDrawn(1, 1.5)).toBeCloseTo(0.5);
    const a = path.arcDrawn(1, 1.35);
    const b = path.arcDrawn(1, 1.65);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(b).toBeLessThan(1);
  });

  it("is complete once the next stop is reached", () => {
    expect(path.arcDrawn(1, 1.9)).toBe(1);
    expect(path.arcDrawn(1, 2)).toBe(1);
    expect(path.arcDrawn(0, 5)).toBe(1);
  });
});

describe("pagingDuration", () => {
  it("takes a second per stop plus a little per extra hop, up to 3s", () => {
    expect(pagingDuration(0, 1)).toBe(1.25);
    expect(pagingDuration(3, 1)).toBe(1.5);
    expect(pagingDuration(0, 30)).toBe(3);
  });

  it("counts the intro as the first stop", () => {
    expect(pagingDuration(-1, 0)).toBe(1);
    expect(pagingDuration(-1, 2)).toBe(pagingDuration(0, 2));
  });
});

describe("regionPatches", () => {
  const alps = { id: "alps", west: 0, south: 40, east: 20, north: 50 };
  const andes = { id: "andes", west: -80, south: -40, east: -60, north: -20 };
  const regions = [alps, andes];
  const inAlps = { lat: 45, lng: 10, closeness: 1 };

  it("fades in a ready region when close inside it", () => {
    const p = regionPatches(regions, new Set(["alps", "andes"]), inAlps);
    expect(p.fades.get("alps")).toBe(1);
    expect(p.hole).toEqual({ region: alps, fade: 1 });
  });

  it("keeps a region hidden until its patch is ready", () => {
    const p = regionPatches(regions, new Set(), inAlps);
    expect(p.fades.get("alps")).toBe(0);
    expect(p.hole).toBeNull();
  });

  it("keeps a ready region hidden when the camera is far away", () => {
    const p = regionPatches(regions, new Set(["andes"]), inAlps);
    expect(p.fades.get("andes")).toBe(0);
    expect(p.hole).toBeNull();
  });

  it("keeps patches hidden in the wide shot", () => {
    const p = regionPatches(regions, new Set(["alps"]), { ...inAlps, closeness: 0 });
    expect(p.fades.get("alps")).toBe(0);
    expect(p.hole).toBeNull();
  });

  it("fades partway near a region's edge", () => {
    const p = regionPatches(regions, new Set(["alps"]), { lat: 45, lng: 20, closeness: 1 });
    const fade = p.fades.get("alps") ?? 0;
    expect(fade).toBeGreaterThan(0);
    expect(fade).toBeLessThan(1);
  });

  it("loads only regions the camera is near", () => {
    expect(regionPatches(regions, new Set(), inAlps).near).toEqual(["alps"]);
    expect(regionPatches(regions, new Set(), { lat: 0, lng: 150, closeness: 0 }).near).toEqual([]);
  });
});
