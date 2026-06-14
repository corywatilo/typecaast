/**
 * Pacing helpers: convert text into typing/reading durations. Counting is by
 * **grapheme cluster** (not code unit) so emoji ZWJ sequences, combining marks,
 * and mixed scripts pace correctly (PLAN §20).
 */

interface SegmenterCtor {
  new (
    locales?: string,
    options?: { granularity?: "grapheme" | "word" | "sentence" },
  ): { segment(input: string): Iterable<unknown> };
}

/** Count grapheme clusters, preferring `Intl.Segmenter`, falling back to code points. */
export function graphemeCount(text: string): number {
  const Segmenter = (
    globalThis as unknown as { Intl?: { Segmenter?: SegmenterCtor } }
  ).Intl?.Segmenter;
  if (Segmenter) {
    let n = 0;
    for (const _ of new Segmenter(undefined, {
      granularity: "grapheme",
    }).segment(text)) {
      void _;
      n++;
    }
    return n;
  }
  return [...text].length;
}

/** ms to type `text` at `cps` chars/sec (min one grapheme of time). */
export function typingDurationMs(text: string, cps: number): number {
  const chars = Math.max(1, graphemeCount(text));
  return (chars / cps) * 1000;
}

/**
 * ms to "read" `text` at `wpm` words/min — used as the gap before an incoming
 * message ≈ reading time of the prior message. Words ≈ graphemes / 5.
 */
export function readingDelayMs(text: string, wpm: number): number {
  const words = Math.max(1, graphemeCount(text) / 5);
  return (words / wpm) * 60000;
}
