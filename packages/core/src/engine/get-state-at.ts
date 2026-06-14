import type { GetStateAt } from "../player.js";
import type {
  RenderedMessage,
  RenderedReaction,
  ResolvedTheme,
  SimState,
  TypingState,
} from "../sim-state.js";
import type { CompiledTimeline } from "./compiled.js";

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Approximate row height used for the scroll target (skins reflow on top). */
const ROW_HEIGHT = 64;
/** Window after an event during which the scroll reason flags it. */
const SCROLL_FLAG_MS = 300;

/**
 * Sample the complete renderable state at time `t` from a compiled timeline —
 * the engine's pure function of time (PLAN §3). No `Date.now()`, no mutation;
 * the same `(compiled, t, theme)` always yields a deep-equal `SimState`.
 */
export function sampleState(
  compiled: CompiledTimeline,
  t: number,
  theme: ResolvedTheme,
): SimState {
  const messages: RenderedMessage[] = [];
  let lastAppear = 0;
  let reactionRecently = false;

  for (const m of compiled.messages) {
    if (m.appearMs > t) continue;
    if (m.deletedAtMs !== undefined && t >= m.deletedAtMs) continue;

    const edited =
      m.editedAtMs !== undefined &&
      m.editedContent !== undefined &&
      t >= m.editedAtMs;

    const reactions: RenderedReaction[] = [];
    for (const r of m.reactions) {
      if (r.appearMs > t) continue;
      reactions.push({
        emoji: r.emoji,
        ...(r.shortcode ? { shortcode: r.shortcode } : {}),
        count: r.by.length || 1,
        by: r.by,
        byNames: r.byNames,
        progress: r.popMs === 0 ? 1 : clamp01((t - r.appearMs) / r.popMs),
      });
      if (t - r.appearMs < SCROLL_FLAG_MS) reactionRecently = true;
    }

    const previous = messages[messages.length - 1];
    messages.push({
      id: m.id,
      from: m.from,
      variant: m.variant,
      content: edited ? m.editedContent! : m.content,
      revealProgress:
        m.revealMs === 0 ? 1 : clamp01((t - m.appearMs) / m.revealMs),
      state: edited ? "edited" : "sent",
      reactions,
      isSelf: m.isSelf,
      isGrouped: previous !== undefined && previous.from === m.from,
      atMs: m.atMs,
      ...(m.system ? { system: m.system } : {}),
    });

    if (m.appearMs > lastAppear) lastAppear = m.appearMs;
  }

  const typingIndicators: TypingState[] = [];
  for (const ty of compiled.typings) {
    if (t >= ty.startMs && t < ty.endMs) {
      const span = ty.endMs - ty.startMs;
      typingIndicators.push({
        from: ty.from,
        progress: span <= 0 ? 1 : clamp01((t - ty.startMs) / span),
      });
    }
  }

  // Composer: the latest one whose window contains t and hasn't yet sent.
  let composer: SimState["composer"] = {
    text: "",
    caret: 0,
    sending: false,
  };
  for (const c of compiled.composers) {
    const end = c.sendMs ?? Number.POSITIVE_INFINITY;
    if (t < c.startMs || t >= end) continue;
    const text =
      t >= c.endMs
        ? c.text
        : c.text.slice(
            0,
            Math.round(
              clamp01((t - c.startMs) / Math.max(1, c.endMs - c.startMs)) *
                c.text.length,
            ),
          );
    composer = {
      from: c.from,
      text,
      caret: text.length,
      sending: c.sendMs !== undefined && t >= c.endMs,
    };
  }

  const reason: SimState["scroll"]["reason"] =
    messages.length > 0 && t - lastAppear < SCROLL_FLAG_MS
      ? "new-message"
      : reactionRecently
        ? "reaction"
        : "none";

  return {
    messages,
    typingIndicators,
    composer,
    scroll: { targetOffset: messages.length * ROW_HEIGHT, reason },
    durationMs: compiled.durationMs,
    theme,
  };
}

/** Bind a compiled timeline + theme into a `GetStateAt` closure. */
export function createGetStateAt(
  compiled: CompiledTimeline,
  theme: ResolvedTheme = "light",
): GetStateAt {
  return (t: number) => sampleState(compiled, t, theme);
}
