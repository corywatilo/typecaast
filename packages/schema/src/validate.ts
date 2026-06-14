import { CONFIG_VERSION, configSchema } from "./config.js";

/** Diagnostic severity tiers (PLAN §23). */
export type Severity = "error" | "warning" | "info";

/**
 * A single validation finding. Every diagnostic carries a stable `code`, the
 * offending `location` (step/message/path), and a `hint` for remediation.
 */
export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  /** Dotted/indexed path, e.g. `timeline[3].from` or `meta.canvas.width`. */
  location?: string;
  hint?: string;
}

function formatPath(path: ReadonlyArray<PropertyKey>): string {
  let out = "";
  for (const key of path) {
    if (typeof key === "number") out += `[${key}]`;
    else if (out === "") out += String(key);
    else out += `.${String(key)}`;
  }
  return out;
}

/** Read an optional `from`/`by`/`target` field off any step shape. */
function field(step: unknown, key: string): string | undefined {
  const value = (step as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Validate a parsed config value (already JSON-decoded). Returns all
 * diagnostics — schema errors, then semantic checks (reference integrity,
 * target resolution). Reusable by the CLI and the builder's lint panel.
 *
 * A version newer than the runtime short-circuits with a single hard error.
 */
export function validateConfig(raw: unknown): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (raw && typeof raw === "object" && "version" in raw) {
    const version = (raw as { version: unknown }).version;
    if (typeof version === "number" && version > CONFIG_VERSION) {
      return [
        {
          code: "E_VERSION",
          severity: "error",
          message: `Config version ${version} is newer than this runtime supports (max ${CONFIG_VERSION}).`,
          location: "version",
          hint: "Upgrade Typecaast (e.g. `npm i @typecaast/cli@latest`).",
        },
      ];
    }
  }

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) {
      diagnostics.push({
        code: "E_SCHEMA",
        severity: "error",
        message: issue.message,
        location: formatPath(issue.path) || undefined,
      });
    }
    return diagnostics;
  }

  const config = result.data;

  // Duplicate participant ids.
  const ids = config.participants.map((p) => p.id);
  const idSet = new Set(ids);
  for (const dup of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) {
    diagnostics.push({
      code: "E_DUP_PARTICIPANT",
      severity: "error",
      message: `Duplicate participant id "${dup}".`,
      location: "participants",
      hint: "Participant ids must be unique.",
    });
  }

  const hasSelf = config.participants.some((p) => p.isSelf);
  let warnedNoSelf = false;
  const messageIds = new Set<string>();
  let priorMessages = 0;

  config.timeline.forEach((step, i) => {
    const loc = `timeline[${i}]`;

    const from = field(step, "from");
    if (from !== undefined && !idSet.has(from)) {
      diagnostics.push({
        code: "E_REF_PARTICIPANT",
        severity: "error",
        message: `Step references unknown participant "${from}".`,
        location: `${loc}.from`,
        hint: `Add a participant with id "${from}" or fix the reference.`,
      });
    }

    if (step.type === "readReceipt") {
      const by = field(step, "by");
      if (by !== undefined && !idSet.has(by)) {
        diagnostics.push({
          code: "E_REF_PARTICIPANT",
          severity: "error",
          message: `Read receipt references unknown participant "${by}".`,
          location: `${loc}.by`,
          hint: `Add a participant with id "${by}" or fix the reference.`,
        });
      }
    }

    if (
      (step.type === "composerType" || step.type === "send") &&
      !hasSelf &&
      !warnedNoSelf
    ) {
      warnedNoSelf = true;
      diagnostics.push({
        code: "W_NO_SELF",
        severity: "warning",
        message: "The composer is used but no participant is marked as self.",
        location: loc,
        hint: 'Mark a participant with `"isSelf": true`.',
      });
    }

    if (
      (step.type === "message" || step.type === "system") &&
      typeof step.id === "string"
    ) {
      messageIds.add(step.id);
    }

    if (
      step.type === "reaction" ||
      step.type === "edit" ||
      step.type === "delete"
    ) {
      const target = step.target;
      if (target === "$prev") {
        if (priorMessages === 0) {
          diagnostics.push({
            code: "W_NO_PREV",
            severity: "warning",
            message: '"$prev" target has no preceding message.',
            location: `${loc}.target`,
            hint: "Place this after a message, or target a message id.",
          });
        }
      } else if (!messageIds.has(target)) {
        diagnostics.push({
          code: "W_TARGET",
          severity: "warning",
          message: `Target "${target}" matches no preceding message id.`,
          location: `${loc}.target`,
          hint: 'Give the target message an `"id"`, or check the reference.',
        });
      }
    }

    if (step.type === "message" || step.type === "system") priorMessages++;
  });

  return diagnostics;
}
