"use client";

import { useMemo } from "react";
import {
  configSchema,
  type ConfigInput,
  type FitMode,
  type ThemeMode,
} from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Typecaast } from "@typecaast/react";

export function LiveSim({
  config,
  skin,
  theme = "auto",
  fit,
  autoplay = true,
  loop = true,
}: {
  config: ConfigInput;
  skin: Skin;
  theme?: ThemeMode;
  fit?: FitMode;
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
      autoplay={autoplay}
      loop={loop}
    />
  );
}
