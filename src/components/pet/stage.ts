import type { Surface, World } from "./physics";

/**
 * A pretend page for tests: a fixed floor and platforms that can scroll, move
 * and vanish. Like the real page (surfaces.ts), a change produces new surface
 * objects rather than editing the old ones, and platforms keep their element,
 * which is how the engine tells them apart.
 */
export class Stage implements World {
  readonly floor: Surface;
  private list: Surface[] = [];

  constructor(width = 1000, height = 600) {
    this.floor = { el: null, left: 0, right: width, top: height };
  }

  surfaces() {
    return this.list;
  }

  /** Add a platform; returns its stand-in element. */
  add(left: number, right: number, top: number) {
    // Surfaces only compare elements by identity, so any object stands in.
    const el = {} as Element;
    this.list = [...this.list, { el, left, right, top }];
    return el;
  }

  /** The platform for `el` as it is now, if it's still there. */
  get(el: Element) {
    return this.list.find((o) => o.el === el);
  }

  /** Scroll the page down by `dy`: every platform moves up. */
  scroll(dy: number) {
    this.list = this.list.map((o) => ({ ...o, top: o.top - dy }));
  }

  /** Move one platform (a layout shift). */
  move(el: Element, to: Partial<Omit<Surface, "el">>) {
    this.list = this.list.map((o) => (o.el === el ? { ...o, ...to } : o));
  }

  remove(el: Element) {
    this.list = this.list.filter((o) => o.el !== el);
  }
}
