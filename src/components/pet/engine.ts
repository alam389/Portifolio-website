import { Ball } from "./ball";
import { GRAVITY, clamp, fall, landing, type Surface, type World } from "./physics";
import { line, lingerFor, type Moment } from "./speech";
import { ANIMATIONS, BALL, TRAITS, type SpeciesName } from "./sprites";

export type { Surface, World } from "./physics";

/** How to draw the pet this frame. */
export interface Pose {
  name: string;
  /** Vertical lift in CSS pixels. */
  lift: number;
  /** Squash and stretch about the feet. */
  sx: number;
  sy: number;
  /** Direction it's drawn facing (the sign of the flip). */
  face: number;
}

/**
 * The pet's brain and physics, free of DOM so it stays testable. Coordinates
 * are viewport pixels; `y` is the pet's feet. It lives in a `World`: the
 * viewport floor plus the surfaces on screen (top edges of page elements),
 * read once per step. The engine walks, rides, falls and jumps between them,
 * and plays fetch.
 */

const MAX_THROW = 2200;
/** Seconds a pet chases a ball it can't reach before giving up. */
const FETCH_PATIENCE = 20;
/** Seconds to eat a whole treat. */
const EAT_SECONDS = 2.4;
/** How close (in sprite widths) the cursor must come before the pet notices. */
const SENSE = 3;
/** Seconds after the cursor last moved that the pet still cares about it. */
const CURSOR_MEMORY = 4;
/** Cursor speed (px/s) that startles the bunny when it's close. */
const STARTLE_SPEED = 900;

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
  | "zoom"
  | "eat"
  | "stretch"
  | "look"
  | "shake";

/** Modes the pet can be pulled out of to go after the ball or the cursor. */
const FREE: ReadonlySet<Mode> = new Set(["idle", "walk", "sit", "sleep", "land", "happy", "zoom"]);
/** Little antics it'll also cut short to stop and say hi (batting at the cursor, a stretch). */
const ANTICS: ReadonlySet<Mode> = new Set(["stretch", "look", "shake", "swat"]);

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class PetEngine {
  x = 0;
  y = 0;
  facing = 1;
  ball: Ball | null = null;
  food: Ball | null = null;
  /** What it's saying right now, if anything (drawn as a bubble). */
  speech: { text: string; until: number; id: number } | null = null;
  /** Whether it talks at all (the visitor can mute it). */
  talk = true;
  /** Pats so far; the page glue watches it to notice the visitor. */
  patted = 0;
  /** Share of the food eaten so far, 0 to 1 (drawn as bites). */
  foodEaten = 0;
  /** The visitor's cursor: what the pet follows, and where the dog brings the ball. */
  pointer: { x: number; y: number; at: number; speed: number } | null = null;
  species: SpeciesName;
  /** Sprite box in CSS pixels, and the display scale it was derived from. */
  size: number;
  scale: number;
  private vx = 0;
  private vy = 0;
  private mode: Mode = "air";
  private timer = 0;
  /** Seconds in the current mode (drives animation). */
  private clock = 0;
  /** Seconds since spawn. */
  private time = 0;
  /** Whether it's paying the cursor any mind, re-decided every few seconds. */
  private attention: { on: boolean; until: number } | null = null;
  /** `time` when the cursor last moved. */
  private pointerSeen = -Infinity;
  private on: Surface | null = null;
  private rel = 0;
  /** Walking off the edge: no clamping until the pet's middle is past it. */
  private leaving = false;
  private launch: { vx: number; vy: number } | null = null;
  /** Seconds of chasing left; 0 when not fetching. */
  private fetching = 0;
  /** Seconds of breather between rounds of play. */
  private rest = 0;
  /** The visitor threw it since the dog last brought it back. */
  private fresh = false;
  private nudges = 0;
  /** `foodEaten` when the current meal started (it can be interrupted). */
  private eatFrom = 0;
  private reduced: boolean;
  /** Ambient chatter waits until this `time`, so it never turns into a stream. */
  private quietUntil = 0;
  private spoken = 0;
  /** The platform it's standing on and since when, for remarks about the page. */
  private perchEl: Element | null = null;
  /** The AI twin's chat is open: it sits where it is and the chat speaks for it. */
  private listening = false;
  private perchSince = 0;
  private world: World;

  constructor(world: World, species: SpeciesName, size: number, scale: number, reduced: boolean) {
    this.world = world;
    this.species = species;
    this.size = size;
    this.scale = scale;
    this.reduced = reduced;
  }

  /** Drop in from above the viewport, somewhere around the middle. */
  spawn() {
    const floor = this.world.floor;
    this.x = rand(floor.right * 0.3, floor.right * 0.7 - this.size);
    this.y = -this.size;
    this.set("air");
    // Reduced motion: no entrance, just already napping on the floor.
    if (this.reduced) this.stand(floor, this.x);
  }

  pet() {
    if (!this.on) return;
    this.patted++;
    if (!this.reduced && FREE.has(this.mode)) {
      this.set("happy", 1.2);
      this.say("pat");
    }
  }

  /** Show a line in a bubble. `ambient` lines hold back if it just spoke. */
  private say(moment: Moment, ambient = false) {
    this.show(line(this.species, moment), ambient);
  }

  private show(text: string, ambient: boolean) {
    // While the twin talks through it, the chat bubble is its only voice.
    if (!this.talk || this.reduced || this.listening) return false;
    if (ambient && (this.speech || this.time < this.quietUntil)) return false;
    this.speech = { text, until: this.time + lingerFor(text), id: ++this.spoken };
    this.quietUntil = this.speech.until + 4;
    return true;
  }

  /**
   * A remark about the page, from outside. Returns whether it was said, so the
   * caller knows to try again later if the pet was busy. `urgent` ones (the
   * theme just changed) cut in; the rest wait for a calm moment.
   */
  remark(text: string, urgent = false) {
    if (this.mode === "held" || this.mode === "air") return false;
    return this.show(text, !urgent);
  }

  /** The element it's standing on and for how long (seconds), or null in the air. */
  perch() {
    const el = this.on?.el ?? null;
    if (!el || this.mode === "air" || this.mode === "held") return null;
    return { el, seconds: this.time - this.perchSince };
  }

  /**
   * The chat opened: drop everything and sit down right where it is (once it
   * lands, if it's in the air). The chat's bubble is anchored to it.
   */
  summon() {
    this.listening = true;
    this.speech = null;
    this.fetching = 0;
    this.attention = null;
    this.leaving = false;
    this.launch = null;
    this.dropBall();
    if (this.on && this.mode !== "held") this.set("sit", Infinity);
  }

  /** The chat closed: back to its own business. */
  dismiss() {
    if (!this.listening) return;
    this.listening = false;
    if (this.mode === "held" || !this.on) return;
    if (this.reduced) this.set("sleep", Infinity);
    else this.set("idle", 0.5);
  }

  /** Acts out the chat: looks about while the twin thinks, bounces at an answer. */
  react(mood: "thinking" | "answered" | "idle") {
    if (!this.listening || !this.on || this.mode === "held" || this.reduced) return;
    if (mood === "thinking") this.set("look", Infinity);
    else if (mood === "answered") this.set("happy", 1.2);
    else this.set("sit", Infinity);
  }

  /**
   * Sit still for `seconds` (while it shows an invite), if it's free to,
   * facing `lookAt` (a viewport x) if given. Returns whether it did; under
   * reduced motion it's always still already.
   */
  stay(seconds: number, lookAt?: number) {
    if (!this.on || this.listening || this.mode === "held") return false;
    if (this.reduced) return true;
    if (!(FREE.has(this.mode) || ANTICS.has(this.mode)) || this.target()) return false;
    if (lookAt !== undefined) this.facing = Math.sign(lookAt - (this.x + this.size / 2)) || this.facing;
    this.breather("sit", seconds);
    return true;
  }

  /** Whether the chat is talking through it. */
  get relaying() {
    return this.listening;
  }

  /** Picked up: dangle from the pointer until released. */
  grab() {
    this.say("grabbed");
    this.dropBall();
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
  release(vx: number, vy: number) {
    if (this.mode !== "held") return;
    if (this.reduced) {
      const cx = this.x + this.size / 2;
      const below = this.world
        .surfaces()
        .filter((o) => o.top >= this.y - 4 && cx >= o.left && cx <= o.right)
        .sort((a, b) => a.top - b.top)[0];
      return this.stand(below ?? this.world.floor, this.x);
    }
    this.vx = clamp(vx, -MAX_THROW, MAX_THROW);
    this.vy = clamp(vy, -MAX_THROW, MAX_THROW);
    if (Math.abs(this.vx) > 40) this.facing = Math.sign(this.vx);
    this.set("air");
  }

  /** A treat drops in near the pet, which goes and eats it before anything else. */
  feed(width: number) {
    const floor = this.world.floor;
    const size = width * this.scale;
    // Dropped a little way in front of it, onto the platform it's on, so it
    // can always get there. In midair, it falls from the top instead.
    const on = this.on ?? floor;
    const ahead = this.x + this.size / 2 + this.facing * rand(1.5, 3.5) * this.size - size / 2;
    const x = Math.min(Math.max(ahead, on.left), on.right - size);
    const y = this.on ? this.on.top - this.size * 1.5 : -size;
    this.food = new Ball(size, x, y, 0, 0, 0.25);
    this.foodEaten = 0;
    // Under reduced motion it just appears beside the sleeping pet.
    if (this.reduced) return this.food.place(this.on ?? floor, x);
    if (this.mode === "carry" || this.mode === "eat") {
      this.dropBall();
      this.set("idle", 0.2);
    }
    this.rest = 0;
  }

  /** If the dog has the ball in its mouth, let it fall. */
  private dropBall() {
    if (!this.ball?.carried) return;
    this.ball.x = this.x + this.size / 2;
    this.ball.y = this.y - this.size * 0.3;
    this.ball.kick(0, 0);
  }

  /** What it's going after: food first, then the ball while playing. */
  private target() {
    return this.food ?? (this.fetching ? this.ball : null);
  }

  /** A ball drops into the page and the pet goes after it. */
  throwBall() {
    const size = BALL.length * this.scale;
    if (this.mode === "carry") this.set("idle", 0.2);
    this.ball = new Ball(size, rand(0.25, 0.75) * this.world.floor.right, -size, rand(-250, 250), 0);
    this.play();
    // Not every pet cares about every ball.
    if (Math.random() >= TRAITS[this.species].ballInterest) this.fetching = 0;
    this.say("ball");
  }

  /** The visitor picks the ball up. Returns false if there's none to take. */
  grabBall() {
    const ball = this.ball;
    if (!ball || ball.carried) return false;
    ball.held = true;
    ball.on = null;
    ball.vx = ball.vy = 0;
    // Mid-swat or mid-nudge: the ball's gone from under its paw.
    if (this.mode === "swat" || this.mode === "nudge") this.set("idle", 0.3);
    this.play();
    return true;
  }

  holdBall(px: number, py: number) {
    const ball = this.ball;
    if (!ball?.held) return;
    ball.x = px - ball.size / 2;
    ball.y = py + ball.size / 2;
  }

  releaseBall(vx: number, vy: number) {
    const ball = this.ball;
    if (!ball?.held) return;
    ball.held = false;
    ball.refresh();
    ball.kick(clamp(vx, -MAX_THROW, MAX_THROW), clamp(vy, -MAX_THROW, MAX_THROW));
  }

  /** The cursor moved to (x, y); `ms` is the event's timestamp. */
  point(x: number, y: number, ms: number) {
    const p = this.pointer;
    let speed = 0;
    if (p && ms > p.at) {
      const inst = Math.hypot(x - p.x, y - p.y) / ((ms - p.at) / 1000);
      speed = p.speed * 0.6 + inst * 0.4;
    }
    this.pointer = { x, y, at: ms, speed };
    this.pointerSeen = this.time;
  }

  /** The cursor left the window. */
  unpoint() {
    this.pointer = null;
  }

  /** A new round: chase straight away, and the dog will bring this one back. */
  private play() {
    this.fetching = FETCH_PATIENCE;
    this.rest = 0;
    this.nudges = 0;
    this.fresh = true;
  }

  step(dt: number) {
    // One look at the page per frame; everything below works from it.
    const surfaces = this.world.surfaces();
    const floor = this.world.floor;
    this.clock += dt;
    this.time += dt;
    const s = this.size;
    if (this.speech && this.time > this.speech.until) this.speech = null;
    const standing = this.on?.el ?? null;
    if (standing !== this.perchEl) {
      this.perchEl = standing;
      this.perchSince = this.time;
    }

    if (this.ball) {
      this.ball.step(dt, surfaces, floor);
      if (this.ball.gone) {
        this.ball = null;
        if (this.fetching > 0) this.say("ballGone");
        this.fetching = 0;
        if (this.timer === Infinity) this.timer = rand(1, 3);
        if (this.mode === "carry") this.set("idle", 0.5);
      }
    }
    if (this.food) {
      this.food.step(dt, surfaces, floor);
      if (this.food.gone) {
        this.food = null;
        if (this.timer === Infinity) this.timer = rand(1, 3);
        if (this.mode === "eat") this.set("idle", 0.5);
      }
    }

    if (this.mode === "held") return;

    // Couldn't get to the ball in time: it's left to fade.
    if (this.fetching > 0) {
      this.fetching -= dt;
      if (this.fetching <= 0) this.endFetch();
    }

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
          this.say("tumble");
        }
      } else {
        this.on = cur;
        this.y = cur.top;
        this.x = this.leaving
          ? cur.left + this.rel
          : clamp(cur.left + this.rel, cur.left, cur.right - s);
      }
    }

    if (this.mode === "air") {
      const prev = this.y;
      ({ y: this.y, vy: this.vy } = fall(this.y, this.vy, dt));
      this.x += this.vx * dt;
      if (this.x < 0 || this.x > floor.right - s) {
        this.x = clamp(this.x, 0, floor.right - s);
        this.vx = -this.vx * 0.3;
      }
      if (this.vy > 0) {
        const hit = landing(surfaces, floor, prev, this.y, this.x + s / 2, s * 0.75);
        if (hit) this.stand(hit, this.x, "land");
      }
      return;
    }

    if (this.listening) return this.listen(dt);
    if (this.reduced) return;
    this.timer -= dt;
    const on = this.on!;

    if (this.rest > 0) this.rest -= dt;
    if (this.mode === "eat") this.foodEaten = Math.min(this.eatFrom + this.clock / EAT_SECONDS, 1);
    // Food, then the ball; otherwise, maybe the cursor.
    const target = this.target();
    if (target) {
      if (this.rest <= 0 && FREE.has(this.mode)) this.chase(surfaces, target);
    } else if (this.rest <= 0 && FREE.has(this.mode)) this.follow(surfaces);

    if (this.mode === "walk" || this.mode === "zoom" || this.mode === "carry") {
      const boost = this.mode === "zoom" ? 2.5 : 1;
      const speed = TRAITS[this.species].walk * this.scale * boost;
      if (this.mode === "carry" && this.pointer) {
        const dx = this.pointer.x - (this.x + s / 2);
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
        this.x = clamp(this.x, on.left, on.right - s);
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
        // Knock the ball (or bat at the cursor), sit and watch, then go again.
        this.ball?.kick(this.facing * rand(380, 520), -rand(220, 320));
        this.breather("sit", rand(1, 2));
        break;
      case "nudge":
        this.ball?.kick(this.facing * rand(140, 200), -80);
        if (++this.nudges >= 3) {
          this.nudges = 0;
          this.breather("zoom", 2.2);
        } else this.set("idle", 0.2);
        break;
      case "carry":
        // Drop it at the pointer and wag, waiting for another throw.
        if (this.ball) {
          const bs = this.ball.size;
          const bx = this.facing > 0 ? this.x + s * 0.8 : this.x + s * 0.2 - bs;
          this.ball.place(on, clamp(bx, on.left, on.right - bs));
        }
        this.fresh = false;
        this.say("bring");
        this.breather("happy", rand(2.5, 4));
        break;
      case "sleep":
        this.set("stretch", 1.1);
        break;
      case "eat":
        // All gone: pleased with itself for a bit.
        this.food = null;
        this.foodEaten = 0;
        this.say("eatDone");
        this.breather("happy", rand(1.5, 2.5));
        break;
      default:
        this.decide(surfaces);
    }
  }

  /** Always busy: mostly exploring on foot, with jumps, antics and the odd nap. */
  private decide(surfaces: Surface[]) {
    const r = Math.random();
    if (Math.random() < 0.12) this.say("idle", true);
    if (r < 0.22 && this.tryJump(surfaces)) return;
    if (r < 0.3) return this.set(Math.random() < 0.5 ? "sit" : "idle", rand(0.5, 1.5));
    if (r < 0.36) return this.set("stretch", 1.1);
    if (r < 0.42) return this.set("look", rand(1.4, 2.2));
    if (r < 0.46) return this.set("shake", 0.7);
    if (r < 0.52) return this.set("happy", rand(1, 1.6));
    if (r < 0.58) return this.set("zoom", rand(1.2, 2.2));
    if (r < 0.63) {
      this.say("sleep", true);
      return this.set("sleep", rand(5, 9));
    }
    if (Math.random() < 0.4) this.facing = -this.facing;
    this.set("walk", rand(3, 7));
  }

  /** Reached the end of the platform. Returns true if it left the ground. */
  private edge(surfaces: Surface[]) {
    const on = this.on!;
    if (!on.el || (this.mode !== "walk" && this.mode !== "zoom")) {
      this.facing = -this.facing;
      return false;
    }
    // Following the cursor down off this platform.
    if (this.attention?.on && this.pointer && this.pointer.y > this.y - this.size) {
      return this.stepOff();
    }
    const target = this.target();
    if (target?.on && this.rest <= 0) {
      const at = target.on;
      if (at.top > this.y + 8) return this.stepOff();
      if (at.top < this.y - 8 && this.tryJump(surfaces, { surface: at, x: target.x })) return true;
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

  /**
   * One frame of sitting still while the chat talks through it. Pats, landings
   * and the chat's moods play out, then it settles back into a sit.
   */
  private listen(dt: number) {
    if (this.reduced) {
      if (this.mode !== "sit") this.set("sit", Infinity);
      return;
    }
    this.timer -= dt;
    const acting = this.mode === "look" || this.mode === "happy" || this.mode === "land";
    if (this.mode !== "sit" && (!acting || this.timer <= 0)) this.set("sit", Infinity);
  }

  /** Keep walking past the edge and drop off it. */
  private stepOff() {
    this.leaving = true;
    this.timer = Infinity;
    return true;
  }

  /** One frame of going after the ball or food: head for it across platforms. */
  private chase(surfaces: Surface[], ball: Ball) {
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
      if (Math.abs(dx) < s * 0.45 && ball.resting) return this.reach(ball);
      return walkTo(Math.sign(dx));
    }
    if (ball.on.top < this.y - 8) {
      const target = ball.on;
      if (this.tryJump(surfaces, { surface: target, x: ball.x })) return;
      // Too high to reach in one go: climb via a platform in between.
      const steps = surfaces
        .filter((o) => o.top > target.top + 8 && o.top < this.y - 8)
        .sort((a, b) => b.top - a.top);
      for (const o of steps) if (this.tryJump(surfaces, { surface: o, x: ball.x })) return;
      // No way up: wait underneath, watching it.
      if (Math.abs(dx) > s) return walkTo(Math.sign(dx));
      this.facing = Math.sign(dx) || this.facing;
      if (this.mode !== "sit") this.set("sit", Infinity);
      return;
    }
    // Ball is lower: make for the nearer edge on the ball's side and drop.
    const under = bx > on.left && bx < on.right;
    const dir = under ? (this.x - on.left < on.right - this.x - s ? -1 : 1) : Math.sign(dx);
    walkTo(dir);
  }

  /** One frame of minding the cursor, in the species' own way. */
  private follow(surfaces: Surface[]) {
    const p = this.pointer;
    const s = this.size;
    const traits = TRAITS[this.species];
    // Only notices a cursor that comes near; once interested, it follows a bit further.
    const range = SENSE * s * (this.attention?.on ? 1.5 : 1);
    const gap = p ? Math.hypot(p.x - (this.x + s / 2), p.y - (this.y - s / 2)) : Infinity;
    if (!p || gap > range || this.time - this.pointerSeen > CURSOR_MEMORY) {
      // Out of range or gone still: back to its own business.
      if (this.attention) {
        this.attention = null;
        if (this.timer === Infinity && !this.leaving) this.timer = rand(0.5, 2);
      }
      return;
    }
    if (!this.attention || this.time > this.attention.until) {
      const on = Math.random() < traits.notice;
      this.attention = { on, until: this.time + rand(4, 8) };
      if (on) this.say("notice", true);
      if (!on && this.timer === Infinity && !this.leaving) this.timer = rand(0.5, 2);
    }
    if (!this.attention.on) return;

    const on = this.on!;
    const dx = p.x - (this.x + s / 2);
    const dist = Math.abs(dx);
    const dir = Math.sign(dx) || this.facing;
    const moving = this.mode === "walk" || this.mode === "zoom";
    // Already settled beside it: let it drift a bit further before getting up.
    const near = (d: number) => dist < (moving ? d : d * 1.8);
    // Walk/zoom toward it, or sit/wag facing it, until something changes.
    const act = (mode: Mode, face = dir) => {
      this.facing = face;
      if (this.mode !== mode) this.set(mode, Infinity);
      this.timer = Infinity;
    };

    // Cursor up over another platform: jump up to it if it can.
    if (p.y < this.y - s) {
      const under = surfaces
        .filter((o) => o.el !== on.el && o.top >= p.y && p.x >= o.left && p.x <= o.right)
        .sort((a, b) => a.top - b.top)[0];
      if (under && this.tryJump(surfaces, { surface: under, x: p.x - s / 2 })) return;
      // Out of reach past the edge: wait there, looking.
      const atEdge = dir > 0 ? this.x >= on.right - s - 1 : this.x <= on.left + 1;
      if (atEdge) return act("sit");
    }
    // Cursor well below: make for the platform edge nearest it and drop.
    if (p.y > this.y + s * 2 && on.el) {
      const edgeX = p.x - on.left < on.right - p.x ? on.left : on.right;
      const pace = traits.cursor === "eager" && dist > s * 2 ? "zoom" : "walk";
      return act(pace, Math.sign(edgeX - (this.x + s / 2)) || dir);
    }

    const still = this.time - this.pointerSeen > 0.35;
    // Right on top of it.
    const touching = gap < s * 0.9;
    switch (traits.cursor) {
      case "eager":
        // Runs over and wags at it.
        if (touching || near(s * 0.6)) return act("happy");
        return act(dist > (this.mode === "zoom" ? s * 1.5 : s * 2) ? "zoom" : "walk");
      case "stalk":
        // Bats at it up close; otherwise creeps up, watches it move, and
        // pounces once it stops.
        if (touching) {
          this.facing = dir;
          this.set("swat", 4 / 6);
          return;
        }
        if (near(s * 0.5)) return act("sit");
        if (dist < s * 2 && still && Math.abs(p.y - this.y) < s * 1.5) {
          this.jumpTo(on, Math.min(Math.max(p.x - s / 2, on.left), on.right - s));
          this.rest = rand(2, 3.5);
          return;
        }
        if (dist < s * 2) return act("sit");
        return act("walk");
      case "skittish":
        // Hops over and keeps a polite distance; bolts if it rushes in.
        if (!still && p.speed > STARTLE_SPEED && dist < s * 2.5) {
          this.facing = -dir;
          this.say("startle");
          return this.breather("zoom", rand(0.8, 1.2));
        }
        // A slow, gentle hover over it is welcome.
        if (touching) return act("happy");
        if (near(s * 1.2)) return act("sit");
        return act("walk");
    }
  }

  /** At the food: eat it. At the ball: each species plays differently. */
  private reach(prop: Ball) {
    if (prop === this.food) {
      if (this.foodEaten === 0) this.say("eat");
      this.eatFrom = this.foodEaten;
      this.set("eat", (1 - this.foodEaten) * EAT_SECONDS);
      return;
    }
    // Got to it: the game's still on.
    this.fetching = FETCH_PATIENCE;
    const how = TRAITS[this.species].fetch;
    if (how === "carry" && this.fresh) {
      this.ball!.carried = true;
      this.set("carry", 4);
    } else if (how === "carry") {
      // Nobody threw it back: toss it for itself.
      this.ball!.kick(this.facing * rand(200, 320), -rand(260, 360));
      this.breather("happy", 0.8);
    } else if (how === "swat") {
      this.set("swat", 4 / 6);
    } else {
      this.set("nudge", 0.5);
    }
  }

  private endFetch() {
    this.ball?.expireIn(10);
    this.fetching = 0;
    if (this.mode === "carry") this.set("idle", 0.5);
    if (this.timer === Infinity) this.timer = rand(1, 3);
  }

  /** Pause play for a moment in `mode`; it goes back to the ball after. */
  private breather(mode: Mode, seconds: number) {
    this.rest = seconds;
    this.set(mode, seconds);
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
    const landX = (o: Surface, x: number) => clamp(x, o.left, o.right - s);

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
    const t = clamp(0.4 + Math.abs(dx) / 700, 0.42, 0.75);
    this.launch = { vx: dx / t, vy: (dy - 0.5 * GRAVITY * t * t) / t };
    if (dx) this.facing = Math.sign(dx);
    this.set("crouch", 0.18);
  }

  private stand(surface: Surface, x: number, mode?: Mode) {
    this.on = surface;
    this.leaving = false;
    this.y = surface.top;
    this.x = clamp(x, surface.left, surface.right - this.size);
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

  /**
   * The sprite frame to show now, plus how to pose it: a vertical lift (hops,
   * bobs), squash and stretch about the feet, and which way it faces.
   */
  frame(): Pose {
    const anims = ANIMATIONS[this.species];
    const sc = this.scale;
    const t = this.clock;
    const play = (key: string, speed = 1) => {
      const { frames, fps } = anims[key];
      return frames[Math.floor(t * fps * speed) % frames.length];
    };
    const pose = (name: string, p: Partial<Pose> = {}): Pose => ({
      name,
      lift: 0,
      sx: 1,
      sy: 1,
      face: this.facing,
      ...p,
    });
    // Settles from 1 + amount back to 1 over `over` seconds.
    const settle = (amount: number, over: number) => 1 + amount * Math.max(0, 1 - t / over);
    switch (this.mode) {
      case "air": {
        // Stretches along its fall, a little more the faster it goes.
        const k = Math.min(Math.abs(this.vy) / 1400, 0.18);
        return pose(this.vy < 0 ? "jump" : "fall", { sx: 1 - k * 0.6, sy: 1 + k });
      }
      case "crouch":
        return pose("crouch", { sx: 1.1, sy: 0.88 });
      case "land":
        // Squashes on impact and springs back.
        return pose("crouch", { sx: settle(0.18, 0.12), sy: 1 / settle(0.18, 0.12) });
      case "walk":
      case "zoom": {
        const fast = this.mode === "zoom";
        const name = play("walk", fast ? 2 : 1);
        const hop = TRAITS[this.species].lift[name] ?? 0;
        // Zoomies lean into the run.
        return pose(name, { lift: hop * sc, sx: fast ? 1.06 : 1, sy: fast ? 0.96 : 1 });
      }
      case "happy": {
        // Bounces on the spot, squashing on each landing.
        const b = Math.abs(Math.sin(t * 9));
        return pose("happy", { lift: b * 3 * sc, sx: 1 + (1 - b) * 0.06, sy: 1 - (1 - b) * 0.06 });
      }
      case "stretch": {
        // Play-bow: front down, then up on tiptoe for a big yawn-stretch.
        const u = Math.min(t / 1.1, 1);
        if (u < 0.55) return pose("crouch", { sx: 1 + 0.14 * Math.sin((u / 0.55) * Math.PI), sy: 0.9 });
        const v = Math.sin(((u - 0.55) / 0.45) * Math.PI);
        return pose("idle1", { sx: 1 - 0.06 * v, sy: 1 + 0.14 * v });
      }
      case "look":
        // Glances one way, then the other.
        return pose("idle1", { face: Math.floor(t / 0.55) % 2 ? -this.facing : this.facing });
      case "shake":
        // Quick shimmy, flipping side to side.
        return pose("idle1", {
          face: Math.floor(t * 18) % 2 ? -this.facing : this.facing,
          sx: 1 + 0.05 * Math.sin(t * 60),
        });
      case "sleep": {
        // Breathes: the whole body swells a hair on each slow exhale.
        const breath = this.reduced ? 0 : Math.sin(t * 2.2) * 0.03;
        return pose(play("sleep"), { sy: 1 + breath, sx: 1 - breath * 0.5 });
      }
      case "eat": {
        const chew = Math.abs(Math.sin(t * 10));
        return pose(play("eat"), { sy: 1 - chew * 0.03 });
      }
      case "swat":
      case "nudge":
      case "carry":
      case "held":
      case "sit":
      case "idle":
        return pose(play(this.mode));
    }
  }
}
