/** About 240 words a minute: an average adult's silent reading pace. */
export const WORDS_PER_SECOND = 4;

/**
 * Lets streamed text out a word at a time at reading pace, however fast it
 * arrives, so an answer reads like someone talking rather than a dump. Never
 * releases a word that might still be arriving in the next chunk.
 */
export class Pacer {
  private buffer = "";
  private ended = false;
  /** Words owed; the first one goes out straight away. */
  private credit = 1;
  private last: number | null = null;

  constructor(private wordsPerSecond = WORDS_PER_SECOND) {}

  push(text: string) {
    this.buffer += text;
  }

  /** The stream is over: the last word can go out whole. */
  end() {
    this.ended = true;
  }

  /** Everything not yet shown, at once (reduced motion, or the stream broke). */
  flush() {
    const out = this.buffer;
    this.buffer = "";
    return out;
  }

  /** Ended and all shown. */
  get done() {
    return this.ended && !this.buffer;
  }

  /** The words due by `now` (ms), with the whitespace before each. */
  take(now: number): string {
    const dt = this.last === null ? 0 : (now - this.last) / 1000;
    this.last = now;
    // Time spent waiting on the network isn't banked for a burst later.
    this.credit = Math.min(this.credit + dt * this.wordsPerSecond, this.buffer ? 2 : 1);

    let out = "";
    while (this.credit >= 1) {
      const word = /^\s*\S+/.exec(this.buffer)?.[0];
      // Only whitespace left, or a word that may not have fully arrived.
      if (!word || (word.length === this.buffer.length && !this.ended)) break;
      out += word;
      this.buffer = this.buffer.slice(word.length);
      this.credit -= 1;
    }
    // Trailing whitespace once it's all over.
    if (this.ended && !/\S/.test(this.buffer)) out += this.flush();
    return out;
  }
}
