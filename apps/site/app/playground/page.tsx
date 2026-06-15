"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { ConfigInput } from "@typecaast/schema";
import { builtinSkins } from "@typecaast/skins";
import { billingToast } from "../../lib/configs";
import { track } from "../../lib/analytics";
import { useResolvedSiteTheme } from "../../lib/theme";
import { ThemeToggle } from "../../components/ThemeToggle";

// The builder reads localStorage to restore the working config, so it can only
// render correctly on the client — render it client-only to avoid an
// SSR/client hydration mismatch (the server can't see localStorage).
const Builder = dynamic(
  () => import("@typecaast/builder").then((m) => m.Builder),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--tc-text-muted)",
          fontSize: 13,
        }}
      >
        Loading builder…
      </div>
    ),
  },
);

export default function PlaygroundPage() {
  const prevConfig = useRef<ConfigInput | null>(null);
  const siteTheme = useResolvedSiteTheme();

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
        theme={siteTheme}
        onChange={handleChange}
        onEvent={(event) => track(event)}
        headerActions={<ThemeToggle />}
      />
    </div>
  );
}
