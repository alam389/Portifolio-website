import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rateLimit";

describe("RateLimiter", () => {
  it("allows up to the limit per window, then recovers", () => {
    const limiter = new RateLimiter([{ ms: 1000, max: 2 }]);
    expect(limiter.take("a", 0)).toBe(true);
    expect(limiter.take("a", 10)).toBe(true);
    expect(limiter.take("a", 20)).toBe(false);
    expect(limiter.take("b", 20)).toBe(true);
    expect(limiter.take("a", 1001)).toBe(true);
  });
});
