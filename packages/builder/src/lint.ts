import type { ConfigInput, StepType } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";

export interface LintWarning {
  stepIndex?: number;
  message: string;
}

/**
 * How well a single step type is supported by a skin.
 *
 * - `native` — the skin renders this step type with its own first-class UI.
 * - `fallback` — the skin renders a generic stand-in (e.g. iMessage shows
 *   `system` cards as centered grey text instead of a custom card).
 * - `unsupported` — the skin will drop the step at render time. The builder
 *   should disable the control for adding/switching to this type, but **must
 *   still allow viewing or removing** existing steps of this type so changing
 *   the skin doesn't silently mangle the config.
 * - `unknown` — the skin didn't enumerate this step type; treat as supported
 *   so we don't disable controls for skins that haven't fully filled in
 *   their capability matrix.
 */
export type StepSupport = "native" | "fallback" | "unsupported" | "unknown";

export interface StepCapability {
  support: StepSupport;
  /** A short, user-facing reason — used as the tooltip explaining a disabled
   *  control or the warning on a stranded step row. */
  reason?: string;
}

/**
 * Returns whether `type` is renderable by `skin`. Centralises the per-step
 * capability lookup so the picker, the type select, and the row warning all
 * stay consistent.
 */
export function stepCapability(
  type: StepType,
  skin: Skin | undefined,
): StepCapability {
  if (!skin) return { support: "unknown" };
  const caps = skin.meta.capabilities;
  const ev = caps.events?.[type];

  // Reactions have an extra global gate alongside the per-event flag.
  if (type === "reaction") {
    if (caps.reactions === false || ev === "unsupported") {
      return {
        support: "unsupported",
        reason: `${skin.meta.name} doesn't render reactions.`,
      };
    }
  }

  if (ev === "unsupported") {
    return {
      support: "unsupported",
      reason: `${skin.meta.name} doesn't support “${type}” steps.`,
    };
  }
  if (ev === "fallback") {
    return {
      support: "fallback",
      reason: `${skin.meta.name} renders “${type}” with a generic fallback, not its own UI.`,
    };
  }
  if (ev === "native") return { support: "native" };
  return { support: "unknown" };
}

/** True when the active skin will drop steps of this type at render time. */
export function isStepUnsupported(
  type: StepType,
  skin: Skin | undefined,
): boolean {
  return stepCapability(type, skin).support === "unsupported";
}

/**
 * What the active skin will drop for this config — surfaced as non-blocking
 * warnings (the config keeps everything; switching skins restores it).
 */
export function capabilityLint(config: ConfigInput, skin: Skin): LintWarning[] {
  const caps = skin.meta.capabilities;
  const warnings: LintWarning[] = [];

  config.timeline.forEach((step, i) => {
    const cap = stepCapability(step.type, skin);
    if (cap.support === "unsupported") {
      warnings.push({
        stepIndex: i,
        message: `${skin.meta.name} drops "${step.type}" steps.`,
      });
    }
    const images = (step as { images?: unknown[] }).images;
    if (
      Array.isArray(images) &&
      images.length > 0 &&
      caps.content.image === false
    ) {
      warnings.push({
        stepIndex: i,
        message: `${skin.meta.name} can't render images.`,
      });
    }
  });

  return warnings;
}
