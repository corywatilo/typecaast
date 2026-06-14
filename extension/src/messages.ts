import type { SkinDraft } from "@typecaast/capture/draft";

/** Messages exchanged between the popup, the injected picker, and the worker. */
export type ExtMessage =
  | { type: "tc-start-pick" }
  | { type: "tc-capture"; filename: string; json: string; draft: SkinDraft }
  | { type: "tc-picked"; ok: boolean; summary?: string };

export const LAST_DRAFT_KEY = "tc:last-draft";
