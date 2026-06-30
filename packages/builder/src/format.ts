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

/** Best-effort one-line summary of Block Kit content (header/section text). */
function contentSummary(content: unknown): string | undefined {
  if (!Array.isArray(content)) return undefined;
  for (const node of content) {
    if (!node || typeof node !== "object") continue;
    const n = node as {
      type?: string;
      text?: string;
      spans?: { value?: string }[];
      content?: unknown;
    };
    const spans = () =>
      Array.isArray(n.spans) ? n.spans.map((s) => s.value ?? "").join("") : "";
    if (n.type === "header" && n.text) return n.text;
    if (n.type === "section" || n.type === "text") return n.text || spans();
    if (n.type === "codeblock" && n.text) return n.text;
    if (n.type === "attachment") {
      const inner = contentSummary(n.content);
      if (inner) return inner;
    }
  }
  return undefined;
}

/** A short human label for a timeline step, for the track chips. */
export function stepLabel(step: TimelineStepInput): string {
  switch (step.type) {
    case "message":
      return truncate(step.text || contentSummary(step.content) || "(no text)");
    case "composerType":
      return truncate(step.text || "(no text)");
    case "system":
      return truncate(step.text || contentSummary(step.content) || "notice");
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
    case "delay":
      return `wait ${step.duration}ms`;
  }
}
