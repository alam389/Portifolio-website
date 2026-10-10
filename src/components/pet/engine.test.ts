import { afterEach, describe, expect, it, vi } from "vitest";
import { PetEngine } from "./engine";
import type { Surface } from "./physics";

const floor: Surface = { el: null, left: 0, right: 1000, top: 600 };
const SCALE = 3;
const SIZE = 16 * SCALE;
const DT = 1 / 60;

const make = (species: "cat" | "dog" | "bunny", reduced = false) => {
  const engine = new PetEngine(species, SIZE, SCALE, reduced);
  engine.spawn(floor);
  return engine;
};
const run = (engine: PetEngine, seconds: number, each?: () => void) => {
  for (let t = 0; t < seconds; t += DT) {
    engine.step(DT, [], floor);
    each?.();
  }
};

afterEach(() => vi.restoreAllMocks());

describe("PetEngine", () => {
  it("drops in from above the viewport and lands on the floor", () => {
    const engine = make("cat");
    expect(engine.y).toBeLessThan(0);
    run(engine, 3);
    expect(engine.y).toBe(floor.top);
    expect(engine.x).toBeGreaterThanOrEqual(0);
    expect(engine.x).toBeLessThanOrEqual(floor.right - SIZE);
  });

  it("never walks off the window", () => {
    const engine = make("dog");
    run(engine, 60, () => {
      expect(engine.x).toBeGreaterThanOrEqual(0);
      expect(engine.x).toBeLessThanOrEqual(floor.right - SIZE);
    });
  });

  it("under reduced motion is already asleep on the floor and stays put", () => {
    const engine = make("bunny", true);
    const { x, y } = engine;
    expect(y).toBe(floor.top);
    expect(engine.frame().name).toMatch(/^sleep/);
    run(engine, 5);
    expect(engine.x).toBe(x);
    expect(engine.y).toBe(y);
  });

  it("dangles from the pointer when grabbed and falls when released", () => {
    const engine = make("cat");
    run(engine, 3);
    engine.grab();
    engine.holdAt(400, 100);
    expect(engine.frame().name).toBe("held");
    expect(engine.y).toBeLessThan(floor.top);
    engine.release(0, 0, [], floor);
    run(engine, 3);
    expect(engine.y).toBe(floor.top);
  });

  it("gets pulled out of a pat only when standing", () => {
    const engine = make("cat");
    engine.pet(); // mid-air: ignored
    expect(engine.frame().name).not.toBe("happy");
    run(engine, 3);
    engine.pet();
    expect(engine.frame().name).toBe("happy");
  });

  it("can ignore a thrown ball according to its species' interest", () => {
    const engine = make("cat");
    run(engine, 3);
    vi.spyOn(Math, "random").mockReturnValue(0.9); // above the cat's 0.75 interest
    engine.throwBall(floor);
    const seen = new Set<string>();
    run(engine, 20, () => seen.add(engine.frame().name));
    expect([...seen].some((n) => n.startsWith("swat"))).toBe(false);
  });

  describe("fetch", () => {
    const fetchFrames = (species: "cat" | "dog" | "bunny", prefix: string) => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const engine = make(species);
      run(engine, 3);
      engine.throwBall(floor);
      const seen = new Set<string>();
      let carried = false;
      run(engine, 20, () => {
        seen.add(engine.frame().name);
        carried ||= !!engine.ball?.carried;
      });
      return { carried, played: [...seen].some((n) => n.startsWith(prefix)) };
    };

    it("the dog carries the ball", () => {
      const { carried, played } = fetchFrames("dog", "carry");
      expect(carried).toBe(true);
      expect(played).toBe(true);
    });

    it("the cat swats the ball", () => {
      expect(fetchFrames("cat", "swat").played).toBe(true);
    });

    it("the bunny nudges the ball", () => {
      expect(fetchFrames("bunny", "nudge").played).toBe(true);
    });
  });
});
