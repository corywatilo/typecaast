import type { ConfigInput } from "@typecaast/schema";
import { Button, Field, Input, Select, Slider } from "@typecaast/ui";
import { setCanvas, updateMeta, updatePacing } from "../store.js";

export const ASPECT_PRESETS: Record<string, { width: number; height: number }> =
  {
    "16:9": { width: 1920, height: 1080 },
    "1:1": { width: 1080, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "4:5": { width: 1080, height: 1350 },
    Slack: { width: 880, height: 720 },
    Phone: { width: 390, height: 844 },
  };

const num = (v: unknown, fallback: number) =>
  typeof v === "number" ? v : fallback;

export function OutputPanel({
  config,
  onChange,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
}) {
  const { width, height } = config.meta.canvas;
  const pacing = config.pacing ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Aspect preset">
        <Select
          value=""
          onChange={(e) => {
            const p = ASPECT_PRESETS[e.currentTarget.value];
            if (p) onChange(setCanvas(config, p.width, p.height));
          }}
        >
          <option value="">Custom…</option>
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
        <Field label="Fit">
          <Select
            value={config.meta.fit ?? "reflow"}
            onChange={(e) =>
              onChange(
                updateMeta(config, {
                  fit: e.currentTarget.value as "reflow" | "scale" | "fixed",
                }),
              )
            }
          >
            <option value="reflow">reflow</option>
            <option value="scale">scale</option>
            <option value="fixed">fixed</option>
          </Select>
        </Field>
        <Field label="FPS">
          <Input
            type="number"
            value={config.meta.fps ?? 30}
            onChange={(e) =>
              onChange(
                updateMeta(config, { fps: Number(e.currentTarget.value) }),
              )
            }
          />
        </Field>
        <Field label="Seed">
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
        <Field label="Background">
          <Input
            value={config.meta.background ?? "transparent"}
            onChange={(e) =>
              onChange(
                updateMeta(config, { background: e.currentTarget.value }),
              )
            }
          />
        </Field>
      </div>

      <div style={{ paddingTop: 8, borderTop: "1px solid var(--tc-border)" }}>
        <p className="tc-label" style={{ marginBottom: 10 }}>
          Pacing
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Reading WPM">
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
          <Field label="Typing CPS">
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
          <Field label="Inter-message gap (ms)">
            <Input
              type="number"
              value={num(pacing.interMessageGapMs, 900)}
              onChange={(e) =>
                onChange(
                  updatePacing(config, {
                    interMessageGapMs: Number(e.currentTarget.value),
                  }),
                )
              }
            />
          </Field>
          <Field label="Reaction lag (ms)">
            <Input
              type="number"
              value={num(pacing.reactionDelayMs, 700)}
              onChange={(e) =>
                onChange(
                  updatePacing(config, {
                    reactionDelayMs: Number(e.currentTarget.value),
                  }),
                )
              }
            />
          </Field>
        </div>
        <Field
          label={`Humanize (${Math.round(num(pacing.humanize, 0.15) * 100)}%)`}
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

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(setCanvas(config, height, width))}
      >
        ⤢ Swap orientation
      </Button>
    </div>
  );
}
