import type { ReactNode } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Field, Input, Select, Slider } from "@typecaast/ui";
import { InfoTip } from "../Tooltip.js";
import { setCanvas, updateMeta, updatePacing } from "../store.js";

export const ASPECT_PRESETS: Record<string, { width: number; height: number }> =
  {
    "16:9": { width: 1920, height: 1080 },
    "1:1": { width: 1080, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "4:5": { width: 1080, height: 1350 },
    Slack: { width: 600, height: 500 },
    Phone: { width: 390, height: 760 },
  };

const num = (v: unknown, fallback: number) =>
  typeof v === "number" ? v : fallback;

/** A field label with a trailing info tooltip. */
function L({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {children}
      <InfoTip text={tip} />
    </span>
  );
}

export function OutputPanel({
  config,
  onChange,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
}) {
  const { width, height } = config.meta.canvas;
  const pacing = config.pacing ?? {};
  // Reflect the active preset in the label until the dimensions deviate.
  const currentPreset =
    Object.entries(ASPECT_PRESETS).find(
      ([, p]) => p.width === width && p.height === height,
    )?.[0] ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* The canvas size is the authoring/preview size — also the video frame
          size and, for a responsive embed, the fallback aspect ratio. Whether
          the embed fills its parent is the 'Responsive widget' toggle in
          Export → Code, not a Fit mode here. */}
      <Field
        label={
          <L tip="The authoring canvas size — also the video frame size and, for a responsive embed, the fallback aspect ratio. The 'Responsive widget' toggle (Export → Code) controls whether the embed fills its parent.">
            Size preset
          </L>
        }
      >
        <Select
          value={currentPreset}
          onChange={(e) => {
            const p = ASPECT_PRESETS[e.currentTarget.value];
            if (p) onChange(setCanvas(config, p.width, p.height));
          }}
        >
          <option value="">
            Custom ({width}×{height})
          </option>
          {Object.keys(ASPECT_PRESETS).map((k) => (
            <option key={k} value={k}>
              {k} ({ASPECT_PRESETS[k]!.width}×{ASPECT_PRESETS[k]!.height})
            </option>
          ))}
        </Select>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Width">
          <Input
            type="number"
            value={width}
            onChange={(e) =>
              onChange(setCanvas(config, Number(e.currentTarget.value), height))
            }
          />
        </Field>
        <Field label="Height">
          <Input
            type="number"
            value={height}
            onChange={(e) =>
              onChange(setCanvas(config, width, Number(e.currentTarget.value)))
            }
          />
        </Field>
      </div>

      {/* FPS + Background moved to Export → Video; Loop moved to Export → Code
          (they each only apply to one export path). Seed applies to both. */}
      <Field
        label={
          <L tip="Random seed for jitter/humanize. The same seed always replays identically — change it to reshuffle the timing.">
            Seed
          </L>
        }
      >
        <Input
          type="number"
          value={config.meta.seed ?? 42}
          onChange={(e) =>
            onChange(
              updateMeta(config, { seed: Number(e.currentTarget.value) }),
            )
          }
        />
      </Field>

      <div style={{ paddingTop: 8, borderTop: "1px solid var(--tc-border)" }}>
        <p
          className="tc-label"
          style={{
            marginBottom: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          Pacing{" "}
          <InfoTip text="Auto-timing for the conversation. Insert `delay` steps in the timeline to add explicit pauses." />
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field
            label={
              <L tip="Words-per-minute used to time how long a message lingers before the next one. Higher = faster.">
                Reading WPM
              </L>
            }
          >
            <Input
              type="number"
              value={num(pacing.readingWpm, 240)}
              onChange={(e) =>
                onChange(
                  updatePacing(config, {
                    readingWpm: Number(e.currentTarget.value),
                  }),
                )
              }
            />
          </Field>
          <Field
            label={
              <L tip="Characters-per-second for typing indicators and the composer animation.">
                Typing CPS
              </L>
            }
          >
            <Input
              type="number"
              value={num(pacing.typingCps, 14)}
              onChange={(e) =>
                onChange(
                  updatePacing(config, {
                    typingCps: Number(e.currentTarget.value),
                  }),
                )
              }
            />
          </Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <Field
            label={
              <L tip="Adds seeded random variation to delays so the timing feels less robotic. 0% = exact, no jitter.">
                {`Humanize (${Math.round(num(pacing.humanize, 0.15) * 100)}%)`}
              </L>
            }
          >
            <Slider
              min={0}
              max={50}
              value={Math.round(num(pacing.humanize, 0.15) * 100)}
              onChange={(e) =>
                onChange(
                  updatePacing(config, {
                    humanize: Number(e.currentTarget.value) / 100,
                  }),
                )
              }
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
