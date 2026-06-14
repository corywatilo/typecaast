import { z } from "zod";
import { contentSchema } from "./content-registry.js";

/**
 * Per-step overrides shared by every step. The engine computes timing from the
 * pacing model; these win over the computed values.
 */
const stepBaseShape = {
  /** Optional id so reactions/edits/deletes can target this step's message. */
  id: z.string().optional(),
  /** Override the computed gap before this step (ms, relative to the prior). */
  delay: z.number().optional(),
  /** Reveal with no animation and no computed delay. */
  instant: z.boolean().optional(),
  /** Extra pause held after this step completes (ms). */
  holdAfter: z.number().nonnegative().optional(),
};

/** Authoring sugar for an in-message image (compiled to an image node). */
export const imageSugarSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

/** Message-body sugar fields; `content` (explicit nodes) wins when present. */
const bodyShape = {
  text: z.string().optional(),
  images: z.array(imageSugarSchema).optional(),
  content: contentSchema.optional(),
};

/** Optional typing indicator preceding a message. */
const messageTypingSchema = z.union([
  z.boolean(),
  z.object({ showTypingFor: z.number().nonnegative().optional() }),
]);

/** An incoming message, optionally preceded by a typing indicator. */
export const messageStepSchema = z.object({
  type: z.literal("message"),
  from: z.string(),
  typing: messageTypingSchema.optional(),
  ...bodyShape,
  ...stepBaseShape,
});

/** A reaction landing on a target message (`$prev` or a message id). */
export const reactionStepSchema = z.object({
  type: z.literal("reaction"),
  target: z.string(),
  emoji: z.string(),
  /** Emoji shortcode without colons, e.g. `"eyes"` — shown in skin tooltips. */
  shortcode: z.string().optional(),
  from: z.string().optional(),
  ...stepBaseShape,
});

/** A standalone typing indicator (no message necessarily follows). */
export const typingStepSchema = z.object({
  type: z.literal("typing"),
  from: z.string(),
  showTypingFor: z.number().nonnegative().optional(),
  ...stepBaseShape,
});

/** The self participant typing into the composer, char by char. */
export const composerTypeStepSchema = z.object({
  type: z.literal("composerType"),
  from: z.string(),
  text: z.string(),
  /** Override the computed typing duration (ms). */
  typingDuration: z.number().nonnegative().optional(),
  ...stepBaseShape,
});

/** Commit the composer's current text to the thread. */
export const sendStepSchema = z.object({
  type: z.literal("send"),
  from: z.string().optional(),
  ...stepBaseShape,
});

/** Edit a previously sent message's body. */
export const editStepSchema = z.object({
  type: z.literal("edit"),
  target: z.string(),
  ...bodyShape,
  ...stepBaseShape,
});

/** Delete a previously sent message. */
export const deleteStepSchema = z.object({
  type: z.literal("delete"),
  target: z.string(),
  ...stepBaseShape,
});

/** A read receipt (optionally by a participant, optionally up to a message). */
export const readReceiptStepSchema = z.object({
  type: z.literal("readReceipt"),
  by: z.string().optional(),
  target: z.string().optional(),
  ...stepBaseShape,
});

/** An app/system card (e.g. "Pull request opened" with action buttons). */
export const systemStepSchema = z.object({
  type: z.literal("system"),
  from: z.string().optional(),
  /** Named card variant the skin renders, e.g. `"pr-opened"`. */
  card: z.string().optional(),
  actions: z
    .array(z.object({ label: z.string(), href: z.string().optional() }))
    .optional(),
  ...bodyShape,
  ...stepBaseShape,
});

/** An explicit pause in the timeline. */
export const beatStepSchema = z.object({
  type: z.literal("beat"),
  duration: z.number().nonnegative(),
  ...stepBaseShape,
});

export const timelineStepSchema = z.discriminatedUnion("type", [
  messageStepSchema,
  reactionStepSchema,
  typingStepSchema,
  composerTypeStepSchema,
  sendStepSchema,
  editStepSchema,
  deleteStepSchema,
  readReceiptStepSchema,
  systemStepSchema,
  beatStepSchema,
]);
export type TimelineStep = z.infer<typeof timelineStepSchema>;
export type TimelineStepInput = z.input<typeof timelineStepSchema>;

export const timelineSchema = z.array(timelineStepSchema);

/** The discriminant values of every timeline step. */
export const STEP_TYPES = [
  "message",
  "reaction",
  "typing",
  "composerType",
  "send",
  "edit",
  "delete",
  "readReceipt",
  "system",
  "beat",
] as const;
export type StepType = (typeof STEP_TYPES)[number];
