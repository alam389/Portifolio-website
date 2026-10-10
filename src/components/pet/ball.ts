import { clamp, fall, landing, type Surface } from "./physics";

const BOUNCE = 0.45;
/** Slower landings than this stop bouncing and settle. */
const SETTLE = 260;
/** Rolling friction: speed decays by this factor per second. */
const ROLL = 0.08;
/** Seconds a ball lasts after it was last thrown. */
const LIFETIME = 30;
/** It blinks for this long before vanishing. */
const FADE = 2;

/**
 * The fetch ball (and, bouncing less, the pet's food): bounces, rolls, rides
 * platforms as the page scrolls and rolls off their ends. `y` is its bottom,
 * like the pet's feet, and `size` its width.
 */
export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  on: Surface | null = null;
  /** In the dog's mouth: not simulated, not drawn. */
  carried = false;
  /** Under the visitor's pointer: frozen in place, and not ageing. */
  held = false;
  private rel = 0;
  private ttl = LIFETIME;
  private bounce: number;

  constructor(size: number, x: number, y: number, vx: number, vy: number, bounce = BOUNCE) {
    this.size = size;
    this.bounce = bounce;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  get gone() {
    return this.ttl <= 0;
  }

  get resting() {
    return !!this.on && Math.abs(this.vx) < 8;
  }

  get fading() {
    return this.ttl < FADE;
  }

  /** Let it linger a little longer once play is over, then vanish. */
  expireIn(seconds: number) {
    this.ttl = Math.min(this.ttl, seconds);
  }

  /** A fresh throw from the visitor: the clock starts over. */
  refresh() {
    this.ttl = LIFETIME;
  }

  kick(vx: number, vy: number) {
    this.on = null;
    this.carried = false;
    this.vx = vx;
    this.vy = vy;
  }

  /** Set down at a point on a surface (the dog dropping it). */
  place(surface: Surface, x: number) {
    this.carried = false;
    this.on = surface;
    this.y = surface.top;
    this.x = x;
    this.rel = x - surface.left;
    this.vx = 0;
    this.vy = 0;
  }

  step(dt: number, surfaces: Surface[], floor: Surface) {
    if (this.held) return;
    this.ttl -= dt;
    if (this.carried) return;
    const s = this.size;

    if (this.on) {
      const cur = this.on.el ? surfaces.find((o) => o.el === this.on!.el) : floor;
      if (!cur || cur.top > floor.top) return this.place(floor, this.x);
      if (cur.top < s) {
        this.on = null;
        this.vy = 0;
      } else {
        this.on = cur;
        this.y = cur.top;
        this.vx *= Math.pow(ROLL, dt);
        if (Math.abs(this.vx) < 8) this.vx = 0;
        this.rel += this.vx * dt;
        this.x = cur.left + this.rel;
        const cx = this.x + s / 2;
        if (cx < cur.left || cx > cur.right) {
          if (!cur.el) {
            // The floor's ends are the window edges: bounce back.
            this.x = clamp(this.x, 0, cur.right - s);
            this.rel = this.x - cur.left;
            this.vx = -this.vx * 0.5;
          } else {
            this.on = null;
            this.vy = 0;
          }
        }
        return;
      }
    }

    const prev = this.y;
    ({ y: this.y, vy: this.vy } = fall(this.y, this.vy, dt));
    this.x += this.vx * dt;
    if (this.x < 0 || this.x > floor.right - s) {
      this.x = clamp(this.x, 0, floor.right - s);
      this.vx = -this.vx * 0.6;
    }
    if (this.vy <= 0) return;
    const hit = landing(surfaces, floor, prev, this.y, this.x + s / 2, s);
    if (!hit) return;
    this.y = hit.top;
    if (this.vy > SETTLE) {
      this.vy = -this.vy * this.bounce;
      this.vx *= 0.8;
    } else {
      this.on = hit;
      this.rel = this.x - hit.left;
      this.vy = 0;
    }
  }
}
