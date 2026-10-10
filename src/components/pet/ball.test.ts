import { describe, expect, it } from "vitest";
import { Ball } from "./ball";
import type { Surface } from "./physics";

const floor: Surface = { el: null, left: 0, right: 1000, top: 600 };
const run = (ball: Ball, seconds: number, surfaces: Surface[] = []) => {
  for (let t = 0; t < seconds; t += 1 / 60) ball.step(1 / 60, surfaces, floor);
};

describe("Ball", () => {
  it("drops, bounces and settles on the floor", () => {
    const ball = new Ball(18, 500, 0, 0, 0);
    run(ball, 6);
    expect(ball.on).toBe(floor);
    expect(ball.y).toBe(600);
    expect(ball.resting).toBe(true);
  });

  it("stays inside the window edges", () => {
    const ball = new Ball(18, 20, 0, -900, 0);
    run(ball, 4);
    expect(ball.x).toBeGreaterThanOrEqual(0);
    expect(ball.x).toBeLessThanOrEqual(1000 - 18);
  });

  it("lands on a platform and rides it as the page scrolls", () => {
    const shelf: Surface = { el: {} as Element, left: 100, right: 400, top: 300 };
    const ball = new Ball(18, 200, 0, 0, 0);
    run(ball, 4, [shelf]);
    expect(ball.on?.el).toBe(shelf.el);
    const scrolled = { ...shelf, top: 250 };
    ball.step(1 / 60, [scrolled], floor);
    expect(ball.y).toBe(250);
  });

  it("vanishes after its lifetime unless carried or refreshed", () => {
    const ball = new Ball(18, 500, 0, 0, 0);
    expect(ball.gone).toBe(false);
    ball.expireIn(1);
    run(ball, 1.1);
    expect(ball.gone).toBe(true);
  });

  it("is not simulated while carried", () => {
    const ball = new Ball(18, 500, 100, 0, 0);
    ball.carried = true;
    run(ball, 1);
    expect(ball.y).toBe(100);
  });
});
