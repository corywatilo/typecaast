"use client";

import { useEffect, useRef } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Builder } from "@typecaast/builder";
import { builtinSkins } from "@typecaast/skins";
import { billingToast } from "../../lib/configs";
import { track } from "../../lib/analytics";

export default function PlaygroundPage() {
  const prevConfig = useRef<ConfigInput | null>(null);

  useEffect(() => {
    track("builder_opened");
  }, []);

  function handleChange(config: ConfigInput) {
    const prev = prevConfig.current;
    if (prev) {
      if (config.meta.skin.id !== prev.meta.skin.id) {
        track("skin_selected", { skin_id: config.meta.skin.id });
      }
      if (config.timeline.length > prev.timeline.length) {
        const added = config.timeline[config.timeline.length - 1];
        track("step_added", {
          step_type: added?.type ?? "unknown",
          step_count: config.timeline.length,
        });
      }
    }
    prevConfig.current = config;
  }

  return (
    <div style={{ height: "100dvh", width: "100vw" }}>
      <Builder
        initialConfig={billingToast}
        skins={builtinSkins}
        theme="dark"
        onChange={handleChange}
        onEvent={(event) => track(event)}
      />
    </div>
  );
}
