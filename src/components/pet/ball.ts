import { fall, landing, type Surface } from "./physics";

const BOUNCE = 0.45;
/** Slower landings than this stop bouncing and settle. */
const SETTLE = 260;
/** Rolling friction: speed decays by this factor per second. */
const ROLL = 0.08;
/** Seconds before an unclaimed ball disappears. */
const LIFETIME = 30;

/**
 * The fetch ball: bounces, rolls, rides platforms as the page scrolls and rolls
 * off their ends. `y` is the ball's bottom, like the pet's feet.
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
  private rel = 0;
  private ttl = LIFETIME;

  constructor(size: number, x: number, y: number, vx: number, vy: number) {
    this.size = size;
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

  /** Let it linger a little longer once play is over, then vanish. */
  expireIn(seconds: number) {
    this.ttl = Math.min(this.ttl, seconds);
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
            this.x = Math.min(Math.max(this.x, 0), cur.right - s);
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
      this.x = Math.min(Math.max(this.x, 0), floor.right - s);
      this.vx = -this.vx * 0.6;
    }
    if (this.vy <= 0) return;
    const hit = landing(surfaces, floor, prev, this.y, this.x + s / 2, s);
    if (!hit) return;
    this.y = hit.top;
    if (this.vy > SETTLE) {
      this.vy = -this.vy * BOUNCE;
      this.vx *= 0.8;
    } else {
      this.on = hit;
      this.rel = this.x - hit.left;
      this.vy = 0;
    }
  }
}
