import type { ConfigInput } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";

export interface LintWarning {
  stepIndex?: number;
  message: string;
}

/**
 * What the active skin will drop for this config — surfaced as non-blocking
 * warnings (the config keeps everything; switching skins restores it).
 */
export function capabilityLint(config: ConfigInput, skin: Skin): LintWarning[] {
  const caps = skin.meta.capabilities;
  const warnings: LintWarning[] = [];

  config.timeline.forEach((step, i) => {
    if (caps.events[step.type] === "unsupported") {
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
