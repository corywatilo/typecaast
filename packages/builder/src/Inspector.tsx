import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Segmented } from "@typecaast/ui";
import { StepEditor } from "./StepEditor.js";
import { CastPanel } from "./panels/CastPanel.js";
import { SkinPanel } from "./panels/SkinPanel.js";
import { OutputPanel } from "./panels/OutputPanel.js";
import { ExportPanel } from "./panels/ExportPanel.js";
import { updateStep } from "./store.js";
import type { BuilderEvent } from "./Builder.js";

type Tab = "step" | "cast" | "skin" | "output" | "export";

export function Inspector({
  config,
  selected,
  skins,
  onChange,
  onEvent,
}: {
  config: ConfigInput;
  selected: number | null;
  skins: Record<string, Skin>;
  onChange: (next: ConfigInput) => void;
  onEvent?: (event: BuilderEvent) => void;
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
          { value: "output", label: "Output" },
          { value: "export", label: "Export" },
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
      {tab === "output" ? (
        <OutputPanel config={config} onChange={onChange} />
      ) : null}
      {tab === "export" ? (
        <ExportPanel config={config} onChange={onChange} onEvent={onEvent} />
      ) : null}
    </div>
  );
}
