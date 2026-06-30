import {
  toContentNodes,
  type ActionsNode,
  type AttachmentNode,
  type Config,
  type ContentNode,
  type ContextNode,
  type HeaderNode,
  type InlineNode,
  type SectionNode,
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
/**
 * Default lag for a reaction whose `delay` is left blank — same beat the
 * builder auto-prepends between added steps (see `addStepAutoPaced`).
 */
const DEFAULT_REACTION_LAG_MS = 1000;
/** Padding after the last event so the final frame holds (ms). */
const TAIL_PAD_MS = 800;

function inlineText(span: InlineNode): string {
  switch (span.type) {
    case "text":
    case "code":
    case "bold":
    case "italic":
    case "strike":
    case "emoji":
      return span.value;
    case "mention":
      return span.label;
    case "link":
      return span.label ?? span.href;
  }
}

/** Concatenate a span list to plain text. */
function spansText(spans: InlineNode[]): string {
  return spans.map(inlineText).join("");
}

/** Flatten a single content node (incl. Block Kit blocks) to plain text. */
function nodeText(node: ContentNode): string {
  switch (node.type) {
    case "text":
      return spansText((node as TextNode).spans);
    case "header":
      return (node as HeaderNode).text;
    case "section":
      return spansText((node as SectionNode).spans ?? []);
    case "context":
      return (node as ContextNode).elements
        .map((el) => (el.type === "text" ? spansText(el.spans ?? []) : ""))
        .join(" ");
    case "actions":
      return (node as ActionsNode).elements.map((b) => b.label).join(" ");
    case "attachment":
      return (node as AttachmentNode).content.map(nodeText).join(" ");
    default:
      return ""; // image, divider, unknown — no readable text
  }
}

/** Flatten content nodes to plain text for pacing math. */
function plainText(content: ContentNode[]): string {
  return content.map(nodeText).join(" ").trim();
}

/** Resolve `<@id>` mentions to the participant's display name. */
function resolveSpans(
  spans: InlineNode[],
  names: Map<string, string>,
): InlineNode[] {
  return spans.map((s) =>
    s.type === "mention" && s.id !== undefined
      ? { type: "mention", id: s.id, label: `@${names.get(s.id) ?? s.id}` }
      : s,
  );
}

/** Walk content nodes resolving mention labels (recurses into attachments). */
function resolveMentions(
  nodes: ContentNode[],
  names: Map<string, string>,
): ContentNode[] {
  return nodes.map((node) => {
    if (node.type === "text") {
      const t = node as TextNode;
      return { ...t, spans: resolveSpans(t.spans, names) };
    }
    if (node.type === "section") {
      const s = node as SectionNode;
      return {
        ...s,
        spans: resolveSpans(s.spans ?? [], names),
        ...(s.fields
          ? {
              fields: s.fields.map((f) => ({
                spans: resolveSpans(f.spans ?? [], names),
              })),
            }
          : {}),
      };
    }
    if (node.type === "context") {
      const c = node as ContextNode;
      return {
        ...c,
        elements: c.elements.map((el) =>
          el.type === "text"
            ? {
                type: "text" as const,
                spans: resolveSpans(el.spans ?? [], names),
              }
            : el,
        ),
      };
    }
    if (node.type === "attachment") {
      const a = node as AttachmentNode;
      return { ...a, content: resolveMentions(a.content, names) };
    }
    return node;
  });
}

const cache = new WeakMap<Config, CompiledTimeline>();

/**
 * Resolve an authored, auto-paced config into an absolute timeline (PLAN §5).
 * Pure and memoized by config reference. Overrides (`instant`,
 * `typingDuration`, `showTypingFor`) win over computed values; all jitter is
 * seeded from `meta.seed`. Use a `delay` step to insert an explicit pause.
 *
 * A plain `message` step from the self participant is auto-rendered through
 * the composer (type-then-send) just like an explicit `composerType` + `send`
 * pair. Use `instant: true` to skip the composer animation. Use the explicit
 * `composerType`/`send` primitives only when you need the type-pause-retype
 * choreography.
 */
export function compile(config: Config): CompiledTimeline {
  const cached = cache.get(config);
  if (cached) return cached;

  const pacing = config.pacing;
  const rng = createRng(config.meta.seed);
  const selfIds = new Set(
    config.participants.filter((p) => p.isSelf).map((p) => p.id),
  );
  const nameById = new Map(config.participants.map((p) => [p.id, p.name]));
  /** Resolve a step's body sugar to content nodes with mentions bound. */
  const resolveContent = (
    body: Parameters<typeof toContentNodes>[0],
  ): ContentNode[] => resolveMentions(toContentNodes(body), nameById);
  const messages: CompiledMessage[] = [];
  const typings: CompiledTimeline["typings"] = [];
  const composers: CompiledComposer[] = [];
  const stepBoundaries: number[] = [];
  const byId = new Map<string, CompiledMessage>();

  // If the very first step is a message/system marked `instant`, the player
  // should open with that message already on screen — i.e. starting at t=0 —
  // rather than blank for `startDelayMs`.
  const firstStep = config.timeline[0];
  const firstStepIsInstantStart =
    firstStep !== undefined &&
    (firstStep.type === "message" || firstStep.type === "system") &&
    firstStep.instant === true;
  let cursor = firstStepIsInstantStart ? 0 : pacing.startDelayMs;
  let lastMessage: CompiledMessage | undefined;
  let lastComposer: CompiledComposer | undefined;
  let autoId = 0;
  const nextId = (explicit?: string): string => explicit ?? `auto-${autoId++}`;
  /**
   * Resolve a step's `target` to a compiled message. Blank/`undefined`/`$prev`
   * all mean "the most-recent message" so authors can leave the field empty in
   * the common case.
   */
  const resolveTarget = (target?: string): CompiledMessage | undefined => {
    if (!target || target === "$prev") return lastMessage;
    return byId.get(target);
  };

  for (const step of config.timeline) {
    stepBoundaries.push(cursor);

    switch (step.type) {
      case "message":
      case "system": {
        // Self messages are auto-rendered through the composer (type-then-send)
        // unless `instant` is set. This is pure sugar for an explicit
        // `composerType` + `send` pair, so timing matches: typing begins right
        // at the cursor with no auto-paced gap added on top. Keep the explicit
        // composerType+send pair available for the type-pause-retype case.
        const isSelfMessage =
          step.type === "message" && selfIds.has(step.from) && !step.instant;
        if (isSelfMessage) {
          const content = resolveContent(step);
          const text = plainText(content);
          const typingDur = typingDurationMs(text, pacing.typingCps);
          const sendAt = cursor + typingDur;
          const id = nextId(step.id);
          const comp: CompiledComposer = {
            from: step.from,
            text,
            startMs: cursor,
            endMs: sendAt,
            sendMs: sendAt,
          };
          composers.push(comp);
          const msg: CompiledMessage = {
            id,
            from: step.from,
            isSelf: true,
            variant: "message",
            content,
            appearMs: sendAt,
            revealMs: SEND_REVEAL_MS,
            atMs: sendAt,
            reactions: [],
          };
          messages.push(msg);
          byId.set(id, msg);
          lastMessage = msg;
          lastComposer = undefined;
          cursor = sendAt + SEND_REVEAL_MS;
          break;
        }

        let appearAt: number;
        if (step.instant) appearAt = cursor;
        else {
          // Auto-paced gap = simulated reading time of the prior message. For
          // explicit beats use a `delay` step.
          const gap = lastMessage
            ? readingDelayMs(plainText(lastMessage.content), pacing.readingWpm)
            : 0;
          appearAt = cursor + withJitter(rng, gap, pacing.humanize);
        }

        if (step.type === "message" && step.typing) {
          const showFor =
            (typeof step.typing === "object"
              ? step.typing.showTypingFor
              : undefined) ??
            typingDurationMs(plainText(resolveContent(step)), pacing.typingCps);
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
          content: resolveContent(step),
          appearMs: appearAt,
          revealMs: reveal,
          atMs: appearAt,
          reactions: [],
        };
        messages.push(msg);
        byId.set(id, msg);
        lastMessage = msg;
        cursor = appearAt + reveal;
        break;
      }

      case "typing": {
        const dur =
          step.showTypingFor ??
          withJitter(rng, DEFAULT_TYPING_MS, pacing.humanize);
        typings.push({ from: step.from, startMs: cursor, endMs: cursor + dur });
        cursor += dur;
        break;
      }

      case "composerType": {
        const dur =
          step.typingDuration ?? typingDurationMs(step.text, pacing.typingCps);
        const comp: CompiledComposer = {
          from: step.from,
          text: step.text,
          startMs: cursor,
          endMs: cursor + dur,
        };
        composers.push(comp);
        lastComposer = comp;
        cursor += dur;
        break;
      }

      case "send": {
        if (lastComposer) {
          lastComposer.sendMs = cursor;
          const id = nextId(step.id);
          // A send commits whatever's in the composer, so the message is always
          // from whoever was typing — never the step's own `from` (a stray
          // self-default there used to mis-attribute the sent message).
          const sendFrom = lastComposer.from;
          const msg: CompiledMessage = {
            id,
            from: sendFrom,
            isSelf: selfIds.has(sendFrom),
            variant: "message",
            content: resolveContent({ text: lastComposer.text }),
            appearMs: cursor,
            revealMs: SEND_REVEAL_MS,
            atMs: cursor,
            reactions: [],
          };
          messages.push(msg);
          byId.set(id, msg);
          lastMessage = msg;
          cursor += SEND_REVEAL_MS;
          lastComposer = undefined;
        }
        break;
      }

      case "reaction": {
        const target = resolveTarget(step.target);
        if (target) {
          // Default lag mirrors the builder's auto-prepended delay between
          // steps so reactions land with a natural beat unless overridden.
          const delay =
            step.delay ??
            withJitter(rng, DEFAULT_REACTION_LAG_MS, pacing.humanize);
          const appearAt = target.appearMs + target.revealMs + delay;
          const by = step.from ? [step.from] : [];
          target.reactions.push({
            emoji: step.emoji,
            ...(step.shortcode ? { shortcode: step.shortcode } : {}),
            by,
            byNames: by.map((id) => nameById.get(id) ?? id),
            appearMs: appearAt,
            popMs: REACTION_POP_MS,
          });
          cursor = Math.max(cursor, appearAt + REACTION_POP_MS);
        }
        break;
      }

      case "edit": {
        const target = resolveTarget(step.target);
        if (target) {
          // Edits/deletes happen at the cursor; insert a `delay` step before
          // them to add breathing room.
          target.editedAtMs = cursor;
          target.editedContent = resolveContent(step);
          cursor += REVEAL_MS;
        }
        break;
      }

      case "delete": {
        const target = resolveTarget(step.target);
        if (target) {
          target.deletedAtMs = cursor;
        }
        break;
      }

      case "readReceipt": {
        // No timeline advancement; receipts are visual-only and overlay the
        // current frame.
        break;
      }

      case "delay": {
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
