import { describe, expect, it } from "vitest";
import { clamp, fall, landing, type Surface } from "./physics";

const floor: Surface = { el: null, left: 0, right: 1000, top: 600 };
// Surfaces only compare elements by identity, so any object stands in.
const shelf = (top: number, left = 100, right = 300): Surface => ({ el: {} as Element, left, right, top });

describe("clamp", () => {
  it("limits to the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("fall", () => {
  it("accelerates under gravity", () => {
    const a = fall(0, 0, 0.1);
    expect(a.vy).toBeGreaterThan(0);
    expect(a.y).toBeGreaterThan(0);
  });

  it("caps the fall speed", () => {
    expect(fall(0, 1e6, 0.1).vy).toBeLessThanOrEqual(1400);
  });
});

describe("landing", () => {
  it("lands on a surface crossed this frame under the body", () => {
    const s = shelf(300);
    expect(landing([s], floor, 290, 310, 200, 10)).toBe(s);
  });

  it("misses a surface beside the body", () => {
    expect(landing([shelf(300)], floor, 290, 310, 500, 10)).toBeNull();
  });

  it("ignores surfaces above minTop (too close to the viewport top)", () => {
    expect(landing([shelf(5)], floor, 0, 10, 200, 20)).toBeNull();
  });

  it("falls through to the floor", () => {
    expect(landing([], floor, 590, 610, 200, 10)).toBe(floor);
  });
});
