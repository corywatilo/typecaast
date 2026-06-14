import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Segmented } from "@typecaast/ui";
import { StepEditor } from "./StepEditor.js";
import { CastPanel } from "./panels/CastPanel.js";
import { SkinPanel } from "./panels/SkinPanel.js";
import { updateStep } from "./store.js";

type Tab = "step" | "cast" | "skin";

export function Inspector({
  config,
  selected,
  skins,
  onChange,
}: {
  config: ConfigInput;
  selected: number | null;
  skins: Record<string, Skin>;
  onChange: (next: ConfigInput) => void;
}) {
  const [tab, setTab] = useState<Tab>("step");
  const selectedStep =
    selected !== null ? config.timeline[selected] : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Segmented<Tab>
        aria-label="Inspector"
        value={tab}
        onChange={setTab}
        options={[
          { value: "step", label: "Step" },
          { value: "cast", label: "Cast" },
          { value: "skin", label: "Skin" },
        ]}
      />
      {tab === "step" ? (
        selectedStep ? (
          <StepEditor
            step={selectedStep}
            participants={config.participants}
            onChange={(patch) =>
              selected !== null &&
              onChange(updateStep(config, selected, patch as never))
            }
          />
        ) : (
          <p className="tc-muted" style={{ fontSize: 13 }}>
            Select a step to edit it.
          </p>
        )
      ) : null}
      {tab === "cast" ? (
        <CastPanel config={config} onChange={onChange} />
      ) : null}
      {tab === "skin" ? (
        <SkinPanel config={config} skins={skins} onChange={onChange} />
      ) : null}
    </div>
  );
}
