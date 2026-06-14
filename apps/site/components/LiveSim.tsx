"use client";

import { useMemo } from "react";
import {
  configSchema,
  type ConfigInput,
  type FitMode,
  type ThemeMode,
} from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Typecaast, type ComposerMode } from "@typecaast/react";

export function LiveSim({
  config,
  skin,
  theme = "auto",
  fit,
  composer,
  autoplay = true,
  // Rest on the final frame by default; opt into cycling with loop.
  loop = false,
}: {
  config: ConfigInput;
  skin: Skin;
  theme?: ThemeMode;
  fit?: FitMode;
  composer?: ComposerMode;
  autoplay?: boolean;
  loop?: boolean;
}) {
  const parsed = useMemo(() => configSchema.parse(config), [config]);
  return (
    <Typecaast
      config={parsed}
      skin={skin}
      theme={theme}
      fit={fit}
      composer={composer}
      autoplay={autoplay}
      loop={loop}
    />
  );
}
