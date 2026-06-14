import type { Config } from "@typecaast/schema";

export interface TranscriptLine {
  name: string;
  text: string;
}

/**
 * Build a plain-text transcript from the authored config — the accessible
 * representation of the conversation for screen readers (PLAN §20). The config
 * is already structured text, so this is a faithful, non-animated version.
 */
export function buildTranscript(config: Config): TranscriptLine[] {
  const name = new Map(config.participants.map((p) => [p.id, p.name]));
  const lines: TranscriptLine[] = [];
  for (const step of config.timeline) {
    let from: string | undefined;
    let text: string | undefined;
    if (step.type === "message" || step.type === "system") {
      from = step.from;
      text = step.text;
    } else if (step.type === "composerType") {
      from = step.from;
      text = step.text;
    }
    if (text) {
      lines.push({ name: from ? (name.get(from) ?? from) : "System", text });
    }
  }
  return lines;
}
