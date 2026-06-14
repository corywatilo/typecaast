import type { StepType } from "@typecaast/schema";
import type { CompiledTimeline } from "./compiled.js";

/**
 * How a skin represents a given event type:
 * - `native`: a first-class affordance.
 * - `fallback`: a degraded but present form.
 * - `unsupported`: dropped from this skin's render (kept in the config).
 */
export type EventCapability = "native" | "fallback" | "unsupported";

/** What a skin supports and how it represents each event/content type. */
export interface Capabilities {
  events: Partial<Record<StepType, EventCapability>>;
  /** Keyed by content node type (e.g. `image: true`, `videoEmbed: false`). */
  content: Partial<Record<string, boolean>>;
  reactions: boolean;
  threads: boolean;
  readReceipts: boolean;
}

/**
 * Apply a skin's capabilities to a compiled timeline: drop the events/content
 * the skin can't render, returning a new timeline (the original config is
 * untouched, so switching skins restores everything — PLAN §7). Timing is
 * preserved; only what's shown changes.
 */
export function resolveCapabilities(
  compiled: CompiledTimeline,
  caps: Capabilities,
): CompiledTimeline {
  const ev = caps.events ?? {};
  const dropTyping = ev.typing === "unsupported";
  const dropReactions =
    caps.reactions === false || ev.reaction === "unsupported";
  const dropSystem = ev.system === "unsupported";
  const allowed = (type: string): boolean => caps.content?.[type] !== false;

  const messages = compiled.messages
    .filter((m) => !(dropSystem && m.variant === "system"))
    .map((m) => ({
      ...m,
      reactions: dropReactions ? [] : m.reactions,
      content: m.content.filter((n) => allowed(n.type)),
      ...(m.editedContent
        ? { editedContent: m.editedContent.filter((n) => allowed(n.type)) }
        : {}),
    }));

  return {
    ...compiled,
    messages,
    typings: dropTyping ? [] : compiled.typings,
  };
}
