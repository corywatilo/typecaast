import {
  toContentNodes,
  type Config,
  type ContentNode,
  type InlineNode,
  type TextNode,
} from "@typecaast/schema";
import { createRng, withJitter } from "./rng.js";
import { readingDelayMs, typingDurationMs } from "./pacing.js";
import type {
  CompiledComposer,
  CompiledMessage,
  CompiledTimeline,
} from "./compiled.js";

/** Reveal animation duration for a newly appearing message (ms). */
const REVEAL_MS = 280;
/** Faster reveal when the self participant sends (commit feels snappy). */
const SEND_REVEAL_MS = 180;
const REACTION_POP_MS = 200;
const DEFAULT_TYPING_MS = 1500;
/** Padding after the last event so the final frame holds (ms). */
const TAIL_PAD_MS = 800;

function inlineText(span: InlineNode): string {
  switch (span.type) {
    case "text":
    case "code":
    case "emoji":
      return span.value;
    case "mention":
      return span.label;
    case "link":
      return span.label ?? span.href;
  }
}

/** Flatten content nodes to plain text for pacing math. */
function plainText(content: ContentNode[]): string {
  return content
    .map((node) =>
      node.type === "text"
        ? (node as TextNode).spans.map(inlineText).join("")
        : "",
    )
    .join(" ")
    .trim();
}

const cache = new WeakMap<Config, CompiledTimeline>();

/**
 * Resolve an authored, auto-paced config into an absolute timeline (PLAN §5).
 * Pure and memoized by config reference. Overrides (`delay`, `instant`,
 * `typingDuration`, `showTypingFor`, `holdAfter`) win over computed values; all
 * jitter is seeded from `meta.seed`.
 */
export function compile(config: Config): CompiledTimeline {
  const cached = cache.get(config);
  if (cached) return cached;

  const pacing = config.pacing;
  const rng = createRng(config.meta.seed);
  const selfIds = new Set(
    config.participants.filter((p) => p.isSelf).map((p) => p.id),
  );
  const messages: CompiledMessage[] = [];
  const typings: CompiledTimeline["typings"] = [];
  const composers: CompiledComposer[] = [];
  const stepBoundaries: number[] = [];
  const byId = new Map<string, CompiledMessage>();

  let cursor = pacing.startDelayMs;
  let lastMessage: CompiledMessage | undefined;
  let lastComposer: CompiledComposer | undefined;
  let autoId = 0;
  const nextId = (explicit?: string): string => explicit ?? `auto-${autoId++}`;
  const resolveTarget = (target: string): CompiledMessage | undefined =>
    target === "$prev" ? lastMessage : byId.get(target);

  for (const step of config.timeline) {
    stepBoundaries.push(cursor);

    switch (step.type) {
      case "message":
      case "system": {
        let appearAt: number;
        if (step.delay != null) appearAt = cursor + step.delay;
        else if (step.instant) appearAt = cursor;
        else {
          let gap = pacing.interMessageGapMs;
          if (lastMessage) {
            gap += readingDelayMs(
              plainText(lastMessage.content),
              pacing.readingWpm,
            );
          }
          appearAt = cursor + withJitter(rng, gap, pacing.humanize);
        }

        if (step.type === "message" && step.typing) {
          const showFor =
            (typeof step.typing === "object"
              ? step.typing.showTypingFor
              : undefined) ??
            typingDurationMs(plainText(toContentNodes(step)), pacing.typingCps);
          typings.push({
            from: step.from,
            startMs: appearAt,
            endMs: appearAt + showFor,
          });
          appearAt += showFor;
        }

        const id = nextId(step.id);
        const reveal = step.instant ? 0 : REVEAL_MS;
        const from =
          step.type === "system" ? (step.from ?? "system") : step.from;
        const msg: CompiledMessage = {
          id,
          from,
          isSelf: selfIds.has(from),
          variant: step.type === "system" ? "system" : "message",
          content: toContentNodes(step),
          appearMs: appearAt,
          revealMs: reveal,
          atMs: appearAt,
          reactions: [],
          ...(step.type === "system"
            ? { system: { card: step.card, actions: step.actions } }
            : {}),
        };
        messages.push(msg);
        byId.set(id, msg);
        lastMessage = msg;
        cursor = appearAt + reveal + (step.holdAfter ?? 0);
        break;
      }

      case "typing": {
        const start = cursor + (step.delay ?? 0);
        const dur =
          step.showTypingFor ??
          withJitter(rng, DEFAULT_TYPING_MS, pacing.humanize);
        typings.push({ from: step.from, startMs: start, endMs: start + dur });
        cursor = start + dur + (step.holdAfter ?? 0);
        break;
      }

      case "composerType": {
        const start = cursor + (step.delay ?? 0);
        const dur =
          step.typingDuration ?? typingDurationMs(step.text, pacing.typingCps);
        const comp: CompiledComposer = {
          from: step.from,
          text: step.text,
          startMs: start,
          endMs: start + dur,
        };
        composers.push(comp);
        lastComposer = comp;
        cursor = start + dur + (step.holdAfter ?? 0);
        break;
      }

      case "send": {
        const sendAt = cursor + (step.delay ?? 0);
        if (lastComposer) {
          lastComposer.sendMs = sendAt;
          const id = nextId(step.id);
          const sendFrom = step.from ?? lastComposer.from;
          const msg: CompiledMessage = {
            id,
            from: sendFrom,
            isSelf: selfIds.has(sendFrom),
            variant: "message",
            content: toContentNodes({ text: lastComposer.text }),
            appearMs: sendAt,
            revealMs: SEND_REVEAL_MS,
            atMs: sendAt,
            reactions: [],
          };
          messages.push(msg);
          byId.set(id, msg);
          lastMessage = msg;
          cursor = sendAt + SEND_REVEAL_MS + (step.holdAfter ?? 0);
          lastComposer = undefined;
        } else {
          cursor = sendAt + (step.holdAfter ?? 0);
        }
        break;
      }

      case "reaction": {
        const target = resolveTarget(step.target);
        if (target) {
          const delay =
            step.delay ??
            withJitter(rng, pacing.reactionDelayMs, pacing.humanize);
          const appearAt = target.appearMs + target.revealMs + delay;
          target.reactions.push({
            emoji: step.emoji,
            by: step.from ? [step.from] : [],
            appearMs: appearAt,
            popMs: REACTION_POP_MS,
          });
          cursor =
            Math.max(cursor, appearAt + REACTION_POP_MS) +
            (step.holdAfter ?? 0);
        }
        break;
      }

      case "edit": {
        const target = resolveTarget(step.target);
        if (target) {
          const editAt = cursor + (step.delay ?? pacing.interMessageGapMs);
          target.editedAtMs = editAt;
          target.editedContent = toContentNodes(step);
          cursor = editAt + REVEAL_MS + (step.holdAfter ?? 0);
        }
        break;
      }

      case "delete": {
        const target = resolveTarget(step.target);
        if (target) {
          const delAt = cursor + (step.delay ?? pacing.interMessageGapMs);
          target.deletedAtMs = delAt;
          cursor = delAt + (step.holdAfter ?? 0);
        }
        break;
      }

      case "readReceipt": {
        cursor += step.delay ?? 0;
        break;
      }

      case "beat": {
        cursor += step.duration;
        break;
      }
    }
  }

  const compiled: CompiledTimeline = {
    messages,
    typings,
    composers,
    durationMs: cursor + TAIL_PAD_MS,
    stepBoundaries,
  };
  cache.set(config, compiled);
  return compiled;
}
