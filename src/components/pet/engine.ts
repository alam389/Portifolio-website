import { ANIMATIONS, type SpeciesName } from "./sprites";

/**
 * The pet's brain and physics, free of DOM so it stays testable. Coordinates
 * are viewport pixels; `y` is the pet's feet. Each frame the caller passes the
 * surfaces on screen (top edges of page elements, plus the viewport floor) and
 * the engine walks, rides, falls and jumps between them.
 */

export interface Surface {
  /** The element whose top edge this is; null for the viewport floor. */
  el: Element | null;
  left: number;
  right: number;
  top: number;
}

interface Traits {
  /** Walk speed in sprite pixels per second (multiplied by display scale). */
  walk: number;
  /** Highest platform it will jump up to, in CSS pixels. */
  jump: number;
}

const TRAITS: Record<SpeciesName, Traits> = {
  cat: { walk: 22, jump: 190 },
  dog: { walk: 30, jump: 120 },
  bunny: { walk: 26, jump: 160 },
};

const GRAVITY = 2000;
const MAX_FALL = 1400;

type Mode = "air" | "idle" | "walk" | "sit" | "sleep" | "crouch" | "land" | "happy";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class PetEngine {
  x = 0;
  y = 0;
  facing = 1;
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
  species: SpeciesName;
  /** Sprite box in CSS pixels, and the display scale it was derived from. */
  size: number;
  scale: number;
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
    if (this.on && !this.reduced) this.set("happy", 1.2);
  }

  step(dt: number, surfaces: Surface[], floor: Surface) {
    this.clock += dt;
    const s = this.size;

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
      // Exact for constant gravity, so jump arcs reach the height they aim for.
      const vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
      this.y += ((this.vy + vy) / 2) * dt;
      this.vy = vy;
      this.x += this.vx * dt;
      if (this.x < 0 || this.x > floor.right - s) {
        this.x = Math.min(Math.max(this.x, 0), floor.right - s);
        this.vx = -this.vx * 0.3;
      }
      if (this.vy > 0) {
        const cx = this.x + s / 2;
        const hit = surfaces.find(
          (o) => prev <= o.top + 2 && this.y >= o.top && cx >= o.left && cx <= o.right && o.top > s * 0.75,
        );
        if (hit) this.stand(hit, this.x, "land");
        else if (this.y >= floor.top) this.stand(floor, this.x, "land");
      }
      return;
    }

    if (this.reduced) return;
    this.timer -= dt;
    const on = this.on!;

    if (this.mode === "walk") {
      const speed = TRAITS[this.species].walk * this.scale;
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
      const atEdge = this.x <= on.left || this.x >= on.right - s;
      if (atEdge) {
        this.x = Math.min(Math.max(this.x, on.left), on.right - s);
        const r = Math.random();
        if (!on.el || r < 0.3) {
          this.facing = -this.facing;
        } else if (r < 0.65 && this.tryJump(surfaces)) {
          return;
        } else {
          // Keep walking and step off the ledge.
          this.leaving = true;
          this.timer = Infinity;
          return;
        }
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
        } else this.set("idle", 1);
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

  /** Crouch, then leap up to a platform within reach. Getting down is walking off a ledge. */
  private tryJump(surfaces: Surface[]) {
    const s = this.size;
    const reach = TRAITS[this.species].jump;
    const options = surfaces.filter(
      (o) =>
        o.el !== this.on?.el &&
        o.top < this.y - 8 &&
        o.top > this.y - reach + 12 &&
        o.top > s + 4 &&
        Math.abs(Math.min(Math.max(this.x, o.left), o.right - s) - this.x) < 260,
    );
    if (!options.length) return false;
    const target = options[Math.floor(Math.random() * options.length)];
    const tx = Math.min(Math.max(this.x + rand(-40, 40), target.left), target.right - s);
    const dx = tx - this.x;
    // Aim a little above the edge so it lands on top rather than clipping it.
    const dy = target.top - this.y - 12;
    const t = Math.min(Math.max(0.4 + Math.abs(dx) / 700, 0.42), 0.75);
    this.launch = { vx: dx / t, vy: (dy - 0.5 * GRAVITY * t * t) / t };
    if (dx) this.facing = Math.sign(dx);
    this.set("crouch", 0.18);
    return true;
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
  }

  private set(mode: Mode, timer = 0) {
    if (mode !== this.mode) this.clock = 0;
    this.mode = mode;
    this.timer = timer;
  }

  /** The sprite frame to show now, plus a vertical offset (the bunny's hop). */
  frame(): { name: string; lift: number } {
    const anims = ANIMATIONS[this.species];
    const play = (key: string) => {
      const { frames, fps } = anims[key];
      return frames[Math.floor(this.clock * fps) % frames.length];
    };
    switch (this.mode) {
      case "air":
        return { name: this.vy < 0 ? "jump" : "fall", lift: 0 };
      case "crouch":
      case "land":
        return { name: "crouch", lift: 0 };
      case "walk": {
        const name = play("walk");
        const hop = this.species === "bunny" ? { walk2: 2, walk3: 4 }[name] ?? 0 : 0;
        return { name, lift: hop * this.scale };
      }
      case "sit":
      case "sleep":
      case "idle":
      case "happy":
        return { name: play(this.mode), lift: 0 };
    }
  }
}
