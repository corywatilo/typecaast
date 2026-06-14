import type { ContentNode } from "@typecaast/schema";
import type { MessageVariant, SystemCard } from "../sim-state.js";

/** A reaction baked onto a message with absolute timing. */
export interface CompiledReaction {
  emoji: string;
  by: string[];
  appearMs: number;
  popMs: number;
}

/** A thread item (message or system card) with absolute timing. */
export interface CompiledMessage {
  id: string;
  from: string;
  /** Whether the author is the self participant (baked in at compile). */
  isSelf: boolean;
  variant: MessageVariant;
  content: ContentNode[];
  /** When it starts revealing. */
  appearMs: number;
  /** Reveal animation duration (0 = instant). */
  revealMs: number;
  /** Display timestamp (= appearMs). */
  atMs: number;
  reactions: CompiledReaction[];
  system?: SystemCard;
  /** Set if an edit replaces the content at/after this time. */
  editedAtMs?: number;
  editedContent?: ContentNode[];
  /** Set if the message is removed at/after this time. */
  deletedAtMs?: number;
}

/** A typing indicator window. */
export interface CompiledTyping {
  from: string;
  startMs: number;
  endMs: number;
}

/** A composer-typing window (self typing into the input). */
export interface CompiledComposer {
  from: string;
  text: string;
  startMs: number;
  endMs: number;
  /** When the composed text commits to the thread (composer clears after). */
  sendMs?: number;
}

/**
 * The output of `compile(config)`: an absolute timeline. Pure and memoizable —
 * sampled by `getStateAt(t)` to produce `SimState` at any instant.
 */
export interface CompiledTimeline {
  messages: CompiledMessage[];
  typings: CompiledTyping[];
  composers: CompiledComposer[];
  durationMs: number;
  /** Step start times, for stepNext/stepPrev. */
  stepBoundaries: number[];
}
