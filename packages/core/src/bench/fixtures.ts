import { configSchema, type Config } from "@typecaast/schema";

/**
 * Benchmark fixtures (PLAN §21, G.7). `makeBenchConfig(n)` builds a realistic
 * thread of ~`n` timeline steps — alternating messages, typing, reactions, and
 * a typed reply — so the engine's `compile` and `getStateAt` are measured
 * against representative, not toy, input. Used by `engine.bench.ts`.
 */
export function makeBenchConfig(steps = 500): Config {
  const timeline: Record<string, unknown>[] = [];
  for (let i = 0; timeline.length < steps; i++) {
    const from = i % 2 === 0 ? "ada" : "bob";
    timeline.push({ type: "typing", from });
    timeline.push({
      type: "message",
      id: `m${i}`,
      from,
      text: `Message number ${i} — a representative line with an emoji 🦔 and a #tag.`,
    });
    if (i % 3 === 0)
      timeline.push({ type: "reaction", target: "$prev", emoji: "👍" });
    if (i % 5 === 0) {
      timeline.push({
        type: "composerType",
        from: "ada",
        text: "typing a reply…",
      });
      timeline.push({ type: "send" });
    }
  }
  return configSchema.parse({
    version: 1,
    meta: { canvas: { width: 480, height: 720 }, skin: { id: "bench" } },
    participants: [
      { id: "ada", name: "Ada Lovelace", isSelf: true },
      { id: "bob", name: "Bob" },
    ],
    timeline: timeline.slice(0, steps),
  });
}
