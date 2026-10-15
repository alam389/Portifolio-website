// In-memory sliding-window limits per visitor. Per server instance, so on
// serverless it's a speed bump rather than a hard cap; move to Upstash if
// abuse ever shows up in the OpenRouter bill.

const WINDOWS = [
  { ms: 60_000, max: 8 },
  { ms: 24 * 60 * 60_000, max: 60 },
];

export class RateLimiter {
  private hits = new Map<string, number[]>();
  private longest: number;

  constructor(private windows = WINDOWS) {
    this.longest = Math.max(...windows.map((w) => w.ms));
  }

  /** Records a hit for `id` and says whether it's allowed. Denied hits aren't recorded. */
  take(id: string, now = Date.now()): boolean {
    const recent = (this.hits.get(id) ?? []).filter((t) => now - t < this.longest);
    const allowed = this.windows.every((w) => recent.filter((t) => now - t < w.ms).length < w.max);
    if (allowed) recent.push(now);
    this.hits.set(id, recent);
    if (this.hits.size > 10_000) this.prune(now);
    return allowed;
  }

  private prune(now: number) {
    for (const [id, times] of this.hits) {
      if (times.every((t) => now - t >= this.longest)) this.hits.delete(id);
    }
  }
}
