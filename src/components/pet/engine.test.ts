import { afterEach, describe, expect, it, vi } from "vitest";
import { PetEngine } from "./engine";
import { Stage } from "./stage";

const SCALE = 3;
const SIZE = 16 * SCALE;
const DT = 1 / 60;
const floor = new Stage().floor;

const make = (species: "cat" | "dog" | "bunny", reduced = false, stage = new Stage()) => {
  const engine = new PetEngine(stage, species, SIZE, SCALE, reduced);
  engine.spawn();
  return engine;
};
const run = (engine: PetEngine, seconds: number, each?: () => void) => {
  for (let t = 0; t < seconds; t += DT) {
    engine.step(DT);
    each?.();
  }
};
/** Step until `done` holds, for at most `seconds`. Returns whether it did. */
const until = (engine: PetEngine, done: () => boolean, seconds = 10) => {
  for (let t = 0; t < seconds; t += DT) {
    engine.step(DT);
    if (done()) return true;
  }
  return false;
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
    engine.release(0, 0);
    run(engine, 3);
    expect(engine.y).toBe(floor.top);
  });

  it("gets pulled out of a pat only when standing", () => {
    // Pinned: some idle moods (stretch, look, shake) can't be interrupted.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
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
    engine.throwBall();
    const seen = new Set<string>();
    run(engine, 20, () => seen.add(engine.frame().name));
    expect([...seen].some((n) => n.startsWith("swat"))).toBe(false);
  });

  describe("fetch", () => {
    const fetchFrames = (species: "cat" | "dog" | "bunny", prefix: string) => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const engine = make(species);
      run(engine, 3);
      engine.throwBall();
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

    it("keeps playing until the ball expires, then misses it", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const engine = make("dog");
      const say = vi.spyOn(engine as unknown as { say: (m: string) => void }, "say");
      run(engine, 3);
      engine.throwBall();
      run(engine, 35);
      expect(engine.ball).toBeNull();
      expect(say).toHaveBeenCalledWith("ballGone");
    });

    it("picking the pet up doesn't end the game", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const engine = make("dog");
      run(engine, 3);
      engine.throwBall();
      run(engine, 2);
      engine.grab();
      engine.release(0, 0);
      run(engine, 15);
      expect(engine.ball).not.toBeNull();
    });
  });

  describe("platforms", () => {
    // With random pinned at 0.5 the pet spawns at x 476 (centre 500) and,
    // once down, stays put wagging, so only the page moves it.
    const perched = (species: "cat" | "dog" | "bunny" = "cat") => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const stage = new Stage();
      const shelf = stage.add(300, 700, 300);
      const engine = make(species, false, stage);
      run(engine, 3);
      return { stage, shelf, engine };
    };

    it("lands on a platform it falls onto", () => {
      const { engine, shelf } = perched();
      expect(engine.y).toBe(300);
      expect(engine.x).toBe(476);
      expect(engine.perch()?.el).toBe(shelf);
    });

    it("rides its platform as the page scrolls and the layout shifts", () => {
      const { engine, stage, shelf } = perched();
      for (let i = 0; i < 60; i++) {
        stage.scroll(2);
        engine.step(DT);
        expect(engine.y).toBe(stage.get(shelf)!.top);
      }
      expect(engine.y).toBe(180);
      stage.move(shelf, { left: 350, right: 750 });
      engine.step(DT);
      expect(engine.x).toBe(526);
      expect(engine.perch()?.el).toBe(shelf);
    });

    it("tumbles to the floor when its platform scrolls above the viewport", () => {
      const { engine, stage } = perched();
      stage.scroll(290); // the shelf is now 10px from the top
      engine.step(DT);
      expect(engine.perch()).toBeNull();
      expect(engine.frame().name).toBe("fall");
      run(engine, 3);
      expect(engine.y).toBe(floor.top);
    });

    it("drops to the floor when its platform vanishes", () => {
      const { engine, stage, shelf } = perched();
      stage.remove(shelf);
      engine.step(DT);
      expect(engine.y).toBe(floor.top);
      expect(engine.x).toBe(476);
    });

    it("stands on the floor when its platform scrolls below it", () => {
      const { engine, stage } = perched();
      stage.scroll(-400);
      engine.step(DT);
      expect(engine.y).toBe(floor.top);
    });

    it("walks off the end of a platform and drops to the floor", () => {
      // 0.9: always picks a walk, never turns round, and steps off at the edge.
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      const stage = new Stage();
      const shelf = stage.add(400, 700, 400);
      const engine = make("cat", false, stage);
      expect(until(engine, () => engine.perch()?.el === shelf)).toBe(true);
      expect(until(engine, () => engine.y === floor.top)).toBe(true);
      expect(engine.x + SIZE / 2).toBeGreaterThan(700);
    });

    it("jumps up to a platform within reach", () => {
      // 0.1: spawns at x 335, beside the shelf, and picks a jump when it can.
      vi.spyOn(Math, "random").mockReturnValue(0.1);
      const stage = new Stage();
      const shelf = stage.add(400, 700, 500);
      const engine = make("cat", false, stage);
      run(engine, 1);
      expect(engine.y).toBe(floor.top);
      const seen = new Set<string>();
      expect(until(engine, () => (seen.add(engine.frame().name), engine.perch()?.el === shelf))).toBe(true);
      expect(engine.y).toBe(500);
      expect(seen).toContain("crouch");
      expect(seen).toContain("jump");
    });

    it("doesn't jump for a platform out of its reach", () => {
      // The same shelf as above is too high for the dog.
      vi.spyOn(Math, "random").mockReturnValue(0.1);
      const stage = new Stage();
      stage.add(400, 700, 450);
      const engine = make("dog", false, stage);
      run(engine, 10, () => expect(engine.perch()).toBeNull());
      expect(engine.y).toBe(floor.top);
    });

    it("chases the ball up onto a higher platform", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const stage = new Stage();
      const engine = make("dog", false, stage);
      run(engine, 3);
      // Put up after it's down, so it lands on the floor first.
      const shelf = stage.add(400, 700, 520);
      engine.throwBall(); // drops straight down at x 500, onto the shelf
      expect(until(engine, () => engine.ball?.on?.el === shelf)).toBe(true);
      expect(engine.y).toBe(floor.top);
      expect(until(engine, () => !!engine.ball?.carried)).toBe(true);
      expect(engine.perch()?.el).toBe(shelf);
      expect(engine.y).toBe(520);
    });

    it("under reduced motion is set down on the platform below, then the floor when it scrolls away", () => {
      const stage = new Stage();
      const shelf = stage.add(300, 700, 300);
      const engine = make("cat", true, stage);
      engine.grab();
      engine.holdAt(500, 100);
      engine.release(0, 0);
      expect(engine.y).toBe(300);
      expect(engine.frame().name).toMatch(/^sleep/);
      engine.step(DT);
      expect(engine.perch()?.el).toBe(shelf);
      stage.scroll(290);
      engine.step(DT);
      expect(engine.y).toBe(floor.top);
      expect(engine.frame().name).toMatch(/^sleep/);
    });
  });

  describe("relaying the AI assistant", () => {
    /** A pet that has wandered a while, then is asked to relay the chat. */
    const listening = (species: "cat" | "dog" | "bunny", reduced = false, stage = new Stage()) => {
      const engine = make(species, reduced, stage);
      run(engine, 3);
      engine.summon();
      return engine;
    };

    it.each(["cat", "dog", "bunny"] as const)("the %s sits down where it is and stays put", (species) => {
      const engine = listening(species);
      const { x, y } = engine;
      expect(engine.frame().name).toBe("sit");
      run(engine, 10);
      expect(engine.x).toBe(x);
      expect(engine.y).toBe(y);
      expect(engine.frame().name).toBe("sit");
    });

    it("rides its platform when the page scrolls", () => {
      const stage = new Stage();
      const shelf = stage.add(0, 1000, 400);
      const engine = make("cat", false, stage);
      until(engine, () => engine.y === 400);
      engine.summon();
      stage.scroll(100);
      run(engine, 0.5);
      expect(engine.y).toBe(stage.get(shelf)!.top);
      expect(engine.frame().name).toBe("sit");
    });

    it("stays quiet, so the chat is its only voice", () => {
      const engine = listening("dog");
      engine.pet();
      expect(engine.speech).toBeNull();
    });

    it("looks about while thinking and bounces at an answer, then sits again", () => {
      const engine = listening("cat");
      engine.react("thinking");
      run(engine, 1);
      expect(engine.frame().name).toBe("idle1");
      engine.react("answered");
      expect(engine.frame().name).toBe("happy");
      run(engine, 2);
      expect(engine.frame().name).toBe("sit");
    });

    it("sits wherever it lands after being thrown", () => {
      const engine = listening("bunny");
      engine.grab();
      engine.holdAt(300, 100);
      engine.release(-300, -200);
      expect(until(engine, () => engine.y === floor.top)).toBe(true);
      const x = engine.x;
      run(engine, 3);
      expect(engine.x).toBe(x);
      expect(engine.frame().name).toBe("sit");
    });

    it("goes back to its own business when dismissed", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9); // decide() picks a walk
      const engine = listening("dog");
      const x = engine.x;
      engine.dismiss();
      expect(engine.relaying).toBe(false);
      expect(until(engine, () => engine.x !== x)).toBe(true);
    });

    it("holds still to show an invite, even with the cursor nearby", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.25); // decide() sits rather than jumps
      const engine = listening("dog");
      engine.dismiss();
      run(engine, 1);
      expect(engine.stay(2)).toBe(true);
      const x = engine.x;
      run(engine, 1.5, () => engine.point(x + 60, engine.y - 20, performance.now()));
      expect(engine.x).toBe(x);
      expect(engine.frame().name).toBe("sit");
    });

    it("turns to face whoever it's inviting", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.25);
      const engine = make("cat");
      run(engine, 3);
      expect(engine.stay(2, engine.x - 200)).toBe(true);
      expect(engine.frame().face).toBe(-1);
      expect(engine.stay(2, engine.x + 200)).toBe(true);
      expect(engine.frame().face).toBe(1);
    });

    it("counts pats, so the page can tell someone's there", () => {
      const engine = make("bunny");
      run(engine, 3);
      engine.pet();
      engine.pet();
      expect(engine.patted).toBe(2);
    });

    it("cuts a stretch short to stop for an invite", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.33); // decide() picks a stretch
      const engine = make("dog");
      run(engine, 3);
      expect(until(engine, () => engine.frame().name === "crouch" || engine.frame().name === "idle1", 5)).toBe(true);
      expect(engine.stay(2)).toBe(true);
      expect(engine.frame().name).toBe("sit");
    });

    it("won't stop for an invite while held or relaying", () => {
      const engine = listening("cat");
      expect(engine.stay(2)).toBe(false);
      engine.dismiss();
      engine.grab();
      expect(engine.stay(2)).toBe(false);
    });

    it("under reduced motion sits up from its nap without moving", () => {
      const engine = listening("cat", true);
      const { x, y } = engine;
      engine.step(DT);
      expect(engine.frame().name).toBe("sit");
      expect(engine.x).toBe(x);
      expect(engine.y).toBe(y);
    });
  });
});
