import type { TimelineStepInput } from "@typecaast/schema";

export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

// Generous cap — the timeline row clamps to two lines via CSS, so this only
// guards pathologically long text rather than hard-cutting at one line.
function truncate(text: string, max = 96): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** A short human label for a timeline step, for the track chips. */
export function stepLabel(step: TimelineStepInput): string {
  switch (step.type) {
    case "message":
    case "composerType":
      return truncate(step.text ?? "(content)");
    case "system":
      return truncate(step.text ?? step.card ?? "card");
    case "reaction":
      return step.emoji;
    case "typing":
      return "typing…";
    case "send":
      return "send";
    case "edit":
      return "edit";
    case "delete":
      return "delete";
    case "readReceipt":
      return "read";
    case "beat":
      return `wait ${step.duration}ms`;
  }
}
