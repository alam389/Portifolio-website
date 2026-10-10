import { Ball } from "./ball";
import { GRAVITY, fall, landing, type Surface } from "./physics";
import { ANIMATIONS, type SpeciesName } from "./sprites";

export type { Surface } from "./physics";

/**
 * The pet's brain and physics, free of DOM so it stays testable. Coordinates
 * are viewport pixels; `y` is the pet's feet. Each frame the caller passes the
 * surfaces on screen (top edges of page elements, plus the viewport floor) and
 * the engine walks, rides, falls and jumps between them, and plays fetch.
 */

interface Traits {
  /** Walk speed in sprite pixels per second (multiplied by display scale). */
  walk: number;
  /** Highest platform it will jump up to, in CSS pixels. */
  jump: number;
  /** What it does on reaching the ball. */
  fetch: "carry" | "swat" | "nudge";
}

const TRAITS: Record<SpeciesName, Traits> = {
  cat: { walk: 22, jump: 190, fetch: "swat" },
  dog: { walk: 30, jump: 120, fetch: "carry" },
  bunny: { walk: 26, jump: 160, fetch: "nudge" },
};

const MAX_THROW = 2200;
/** Seconds a pet chases the ball before giving up. */
const FETCH_PATIENCE = 20;
/** The ball sprite is 6x6. */
const BALL_PX = 6;

type Mode =
  | "air"
  | "idle"
  | "walk"
  | "sit"
  | "sleep"
  | "crouch"
  | "land"
  | "happy"
  | "held"
  | "swat"
  | "nudge"
  | "carry"
  | "zoom";

/** Modes the pet can be pulled out of to go chase the ball. */
const FREE: ReadonlySet<Mode> = new Set(["idle", "walk", "sit", "land", "happy"]);

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class PetEngine {
  x = 0;
  y = 0;
  facing = 1;
  ball: Ball | null = null;
  /** Last pointer x: where the dog brings the ball back to. */
  pointerX: number | null = null;
  species: SpeciesName;
  /** Sprite box in CSS pixels, and the display scale it was derived from. */
  size: number;
  scale: number;
  private vx = 0;
  private vy = 0;
  private mode: Mode = "air";
  private timer = 0;
  private clock = 0;
  private on: Surface | null = null;
  private rel = 0;
  /** Walking off the edge: no clamping until the pet's middle is past it. */
  private leaving = false;
  private launch: { vx: number; vy: number } | null = null;
  /** Seconds of chasing left; 0 when not fetching. */
  private fetching = 0;
  private nudges = 0;
  private reduced: boolean;

  constructor(species: SpeciesName, size: number, scale: number, reduced: boolean) {
    this.species = species;
    this.size = size;
    this.scale = scale;
    this.reduced = reduced;
  }

  /** Drop in from above the viewport, somewhere around the middle. */
  spawn(floor: Surface) {
    this.x = rand(floor.right * 0.3, floor.right * 0.7 - this.size);
    this.y = -this.size;
    this.set("air");
    // Reduced motion: no entrance, just already napping on the floor.
    if (this.reduced) this.stand(floor, this.x);
  }

  pet() {
    if (this.on && !this.reduced && FREE.has(this.mode)) this.set("happy", 1.2);
  }

  /** Picked up: dangle from the pointer until released. */
  grab() {
    if (this.ball?.carried) {
      this.ball.x = this.x + this.size / 2;
      this.ball.y = this.y - this.size * 0.3;
      this.ball.kick(0, 0);
    }
    this.endFetch();
    this.on = null;
    this.leaving = false;
    this.launch = null;
    this.set("held");
  }

  /** Follow the pointer, held by the scruff just below the ears. */
  holdAt(px: number, py: number) {
    this.x = px - this.size / 2;
    this.y = py + this.size * 0.8;
  }

  /** Let go with the pointer's velocity; under reduced motion, set down gently. */
  release(vx: number, vy: number, surfaces: Surface[], floor: Surface) {
    if (this.mode !== "held") return;
    if (this.reduced) {
      const cx = this.x + this.size / 2;
      const below = surfaces
        .filter((o) => o.top >= this.y - 4 && cx >= o.left && cx <= o.right)
        .sort((a, b) => a.top - b.top)[0];
      return this.stand(below ?? floor, this.x);
    }
    const clamp = (v: number) => Math.min(Math.max(v, -MAX_THROW), MAX_THROW);
    this.vx = clamp(vx);
    this.vy = clamp(vy);
    if (Math.abs(this.vx) > 40) this.facing = Math.sign(this.vx);
    this.set("air");
  }

  /** A ball drops into the page and the pet goes after it (cats, not always). */
  throwBall(floor: Surface) {
    const size = BALL_PX * this.scale;
    this.ball = new Ball(size, rand(0.25, 0.75) * floor.right, -size, rand(-250, 250), 0);
    this.fetching = this.species === "cat" && Math.random() < 0.25 ? 0 : FETCH_PATIENCE;
    this.nudges = 0;
  }

  step(dt: number, surfaces: Surface[], floor: Surface) {
    this.clock += dt;
    const s = this.size;

    if (this.ball) {
      this.ball.step(dt, surfaces, floor);
      if (this.ball.gone) {
        this.ball = null;
        this.endFetch();
        if (this.mode === "carry") this.set("idle", 0.5);
      }
    }

    if (this.mode === "held") return;

    if (this.on) {
      const cur = this.on.el ? surfaces.find((o) => o.el === this.on!.el) : floor;
      if (!cur || cur.top > floor.top) {
        // Platform gone or scrolled below the floor: stand on the floor.
        this.stand(floor, this.x);
      } else if (cur.top < s * 0.75) {
        // Platform scrolled away upwards: lose footing and tumble down.
        this.on = null;
        if (this.reduced) {
          this.stand(floor, this.x);
        } else {
          this.y = Math.max(cur.top, s);
          this.vx = 0;
          this.vy = 0;
          this.set("air");
        }
      } else {
        this.on = cur;
        this.y = cur.top;
        this.x = this.leaving
          ? cur.left + this.rel
          : Math.min(Math.max(cur.left + this.rel, cur.left), cur.right - s);
      }
    }

    if (this.mode === "air") {
      const prev = this.y;
      ({ y: this.y, vy: this.vy } = fall(this.y, this.vy, dt));
      this.x += this.vx * dt;
      if (this.x < 0 || this.x > floor.right - s) {
        this.x = Math.min(Math.max(this.x, 0), floor.right - s);
        this.vx = -this.vx * 0.3;
      }
      if (this.vy > 0) {
        const hit = landing(surfaces, floor, prev, this.y, this.x + s / 2, s * 0.75);
        if (hit) this.stand(hit, this.x, "land");
      }
      return;
    }

    if (this.reduced) return;
    this.timer -= dt;
    const on = this.on!;

    if (this.fetching > 0) {
      this.fetching -= dt;
      if (this.fetching <= 0 || !this.ball) this.endFetch();
      else if (FREE.has(this.mode)) this.chase(surfaces);
    }

    if (this.mode === "walk" || this.mode === "zoom" || this.mode === "carry") {
      const boost = this.mode === "zoom" ? 2.5 : 1;
      const speed = TRAITS[this.species].walk * this.scale * boost;
      if (this.mode === "carry" && this.pointerX !== null) {
        const dx = this.pointerX - (this.x + s / 2);
        if (Math.abs(dx) < s * 0.6) this.timer = 0;
        else this.facing = Math.sign(dx);
      }
      this.x += this.facing * speed * dt;
      if (this.leaving) {
        this.rel = this.x - on.left;
        const cx = this.x + s / 2;
        if (cx < on.left || cx > on.right) {
          this.leaving = false;
          this.on = null;
          this.vx = this.facing * speed;
          this.vy = 0;
          this.set("air");
        }
        return;
      }
      if (this.x <= on.left || this.x >= on.right - s) {
        this.x = Math.min(Math.max(this.x, on.left), on.right - s);
        if (this.edge(surfaces)) return;
      }
      this.rel = this.x - on.left;
    }

    if (this.timer > 0) return;

    switch (this.mode) {
      case "crouch":
        if (this.launch) {
          this.on = null;
          this.vx = this.launch.vx;
          this.vy = this.launch.vy;
          this.launch = null;
          this.set("air");
        } else this.set("idle", 0.5);
        break;
      case "swat":
        // Knock it off the ledge, then sit and watch it go.
        this.ball?.kick(this.facing * rand(380, 520), -rand(220, 320));
        this.endFetch();
        this.set("sit", 1.5);
        break;
      case "nudge":
        this.ball?.kick(this.facing * rand(140, 200), -80);
        if (++this.nudges >= 3) {
          this.endFetch();
          this.set("zoom", 2.2);
        } else this.set("idle", 0.2);
        break;
      case "carry":
        // Drop it at the pointer, pleased with itself.
        if (this.ball) {
          const bs = this.ball.size;
          const bx = this.facing > 0 ? this.x + s * 0.8 : this.x + s * 0.2 - bs;
          this.ball.place(on, Math.min(Math.max(bx, on.left), on.right - bs));
        }
        this.endFetch();
        this.set("happy", 1);
        break;
      default:
        this.decide(surfaces);
    }
  }

  /** Always busy: mostly exploring on foot, often jumping, with brief pauses. */
  private decide(surfaces: Surface[]) {
    const r = Math.random();
    if (r < 0.3 && this.tryJump(surfaces)) return;
    if (r < 0.42) return this.set(Math.random() < 0.5 ? "sit" : "idle", rand(0.5, 1.5));
    if (Math.random() < 0.4) this.facing = -this.facing;
    this.set("walk", rand(3, 7));
  }

  /** Reached the end of the platform. Returns true if it left the ground. */
  private edge(surfaces: Surface[]) {
    const on = this.on!;
    if (!on.el || this.mode !== "walk") {
      this.facing = -this.facing;
      return false;
    }
    if (this.fetching > 0 && this.ball?.on) {
      const ball = this.ball.on;
      if (ball.top > this.y + 8) return this.stepOff();
      if (ball.top < this.y - 8 && this.tryJump(surfaces, { surface: ball, x: this.ball.x })) return true;
      this.facing = -this.facing;
      return false;
    }
    const r = Math.random();
    if (r < 0.3) {
      this.facing = -this.facing;
      return false;
    }
    if (r < 0.65 && this.tryJump(surfaces)) return true;
    return this.stepOff();
  }

  /** Keep walking past the edge and drop off it. */
  private stepOff() {
    this.leaving = true;
    this.timer = Infinity;
    return true;
  }

  /** One frame of going after the ball: head for it across platforms. */
  private chase(surfaces: Surface[]) {
    const ball = this.ball!;
    const on = this.on!;
    const s = this.size;
    const bx = ball.x + ball.size / 2;
    const dx = bx - (this.x + s / 2);
    const walkTo = (dir: number) => {
      if (dir) this.facing = dir;
      if (this.mode !== "walk") this.set("walk", Infinity);
      this.timer = Infinity;
    };

    if (!ball.on) {
      // Still bouncing: watch it.
      if (dx) this.facing = Math.sign(dx);
      if (this.mode !== "idle") this.set("idle", Infinity);
      return;
    }
    if (ball.on.el === on.el) {
      if (Math.abs(dx) < s * 0.45 && ball.resting) return this.reach();
      return walkTo(Math.sign(dx));
    }
    if (ball.on.top < this.y - 8) {
      if (this.tryJump(surfaces, { surface: ball.on, x: ball.x })) return;
      return walkTo(Math.sign(dx));
    }
    // Ball is lower: make for the nearer edge on the ball's side and drop.
    const under = bx > on.left && bx < on.right;
    const dir = under ? (this.x - on.left < on.right - this.x - s ? -1 : 1) : Math.sign(dx);
    walkTo(dir);
  }

  /** At the ball: each species plays differently. */
  private reach() {
    const how = TRAITS[this.species].fetch;
    if (how === "carry") {
      this.ball!.carried = true;
      this.set("carry", 4);
    } else if (how === "swat") {
      this.set("swat", 4 / 6);
    } else {
      this.set("nudge", 0.5);
    }
  }

  private endFetch() {
    if (this.fetching > 0 || this.mode === "carry") this.ball?.expireIn(10);
    this.fetching = 0;
    if (this.timer === Infinity) this.timer = rand(1, 3);
  }

  /**
   * Crouch, then leap up to a platform within reach: toward the ball's spot if
   * given, else a random one. Getting down is walking off a ledge.
   */
  private tryJump(surfaces: Surface[], toward?: { surface: Surface; x: number }) {
    const s = this.size;
    const reach = TRAITS[this.species].jump;
    const reachable = (o: Surface) =>
      o.el !== this.on?.el && o.top < this.y - 8 && o.top > this.y - reach + 12 && o.top > s + 4;
    const landX = (o: Surface, x: number) => Math.min(Math.max(x, o.left), o.right - s);

    if (toward) {
      const live = surfaces.find((o) => o.el === toward.surface.el);
      if (!live || !reachable(live)) return false;
      const tx = landX(live, toward.x);
      if (Math.abs(tx - this.x) > 300) return false;
      this.jumpTo(live, tx);
      return true;
    }
    const options = surfaces.filter(
      (o) => reachable(o) && Math.abs(landX(o, this.x) - this.x) < 260,
    );
    if (!options.length) return false;
    const target = options[Math.floor(Math.random() * options.length)];
    this.jumpTo(target, landX(target, this.x + rand(-40, 40)));
    return true;
  }

  private jumpTo(target: Surface, tx: number) {
    const dx = tx - this.x;
    // Aim a little above the edge so it lands on top rather than clipping it.
    const dy = target.top - this.y - 12;
    const t = Math.min(Math.max(0.4 + Math.abs(dx) / 700, 0.42), 0.75);
    this.launch = { vx: dx / t, vy: (dy - 0.5 * GRAVITY * t * t) / t };
    if (dx) this.facing = Math.sign(dx);
    this.set("crouch", 0.18);
  }

  private stand(surface: Surface, x: number, mode?: Mode) {
    this.on = surface;
    this.leaving = false;
    this.y = surface.top;
    this.x = Math.min(Math.max(x, surface.left), surface.right - this.size);
    this.rel = this.x - surface.left;
    this.vx = 0;
    this.vy = 0;
    if (this.reduced) this.set("sleep", Infinity);
    else if (mode) this.set(mode, 0.12);
    else if (!FREE.has(this.mode)) this.set("idle", 0.3);
  }

  private set(mode: Mode, timer = 0) {
    if (mode !== this.mode) this.clock = 0;
    this.mode = mode;
    this.timer = timer;
  }

  /** The sprite frame to show now, plus a vertical offset (the bunny's hop). */
  frame(): { name: string; lift: number } {
    const anims = ANIMATIONS[this.species];
    const play = (key: string, speed = 1) => {
      const { frames, fps } = anims[key];
      return frames[Math.floor(this.clock * fps * speed) % frames.length];
    };
    const hop = (name: string) =>
      this.species === "bunny" ? ({ walk2: 2, walk3: 4 }[name] ?? 0) * this.scale : 0;
    switch (this.mode) {
      case "air":
        return { name: this.vy < 0 ? "jump" : "fall", lift: 0 };
      case "crouch":
      case "land":
        return { name: "crouch", lift: 0 };
      case "walk":
      case "zoom": {
        const name = play("walk", this.mode === "zoom" ? 2 : 1);
        return { name, lift: hop(name) };
      }
      case "swat":
      case "nudge":
      case "carry":
      case "held":
      case "sit":
      case "sleep":
      case "idle":
      case "happy":
        return { name: play(this.mode), lift: 0 };
    }
  }
}
