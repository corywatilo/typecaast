import type { ReactNode } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Field, Input, Select, Slider } from "@typecaast/ui";
import { DisabledWrap, InfoTip } from "../Tooltip.js";
import { setCanvas, updateMeta, updatePacing } from "../store.js";
import type { ExportMode } from "./ExportPanel.js";

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

/** A field label with a trailing info tooltip. */
function L({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {children}
      <InfoTip text={tip} />
    </span>
  );
}

/**
 * Background picker. A native colour swatch + hex input pair, plus a
 * "Transparent" toggle that drops the value to the literal string
 * `"transparent"`. Clearer than a freeform text input — the user can either
 * pick a colour explicitly or opt out of one entirely.
 */
function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const isTransparent =
    value === "transparent" || value === "" || value === "none";
  // Normalise to a `#rrggbb` for the swatch — the native colour input only
  // accepts that form. Free-form CSS colours (e.g. `rgb(...)`) round-trip
  // through the text input but reset the swatch to black.
  const hex = isTransparent
    ? "#000000"
    : /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : "#000000";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="color"
          aria-label="Pick background colour"
          disabled={isTransparent}
          value={hex}
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: "1px solid var(--tc-border)",
            borderRadius: 6,
            background: "transparent",
            cursor: isTransparent ? "not-allowed" : "pointer",
            opacity: isTransparent ? 0.45 : 1,
            flex: "0 0 auto",
          }}
        />
        <Input
          aria-label="Background colour"
          disabled={isTransparent}
          value={isTransparent ? "transparent" : value}
          placeholder="#000000"
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{ flex: "1 1 auto", minWidth: 0 }}
        />
      </div>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--tc-muted)",
        }}
      >
        <input
          type="checkbox"
          checked={isTransparent}
          onChange={(e) =>
            onChange(e.currentTarget.checked ? "transparent" : "#000000")
          }
        />
        Transparent
      </label>
    </div>
  );
}

export function OutputPanel({
  config,
  onChange,
  exportMode,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
  /** Active export pipeline. Drives which fields are disabled — FPS only
   *  applies to video, Loop only applies to live code embeds, etc. */
  exportMode: ExportMode;
}) {
  const { width, height } = config.meta.canvas;
  const pacing = config.pacing ?? {};
  const fpsDisabled = exportMode === "code";
  const loopDisabled = exportMode === "video";
  // Reflect the active preset in the label until the dimensions deviate.
  const currentPreset =
    Object.entries(ASPECT_PRESETS).find(
      ([, p]) => p.width === width && p.height === height,
    )?.[0] ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Fit comes first: it decides whether an explicit canvas size matters
          at all. Responsive fills its container, so the size controls below are
          hidden in that mode. */}
      <Field
        label={
          <L tip="How the sim fits its container. Responsive re-wraps to the available width and fills its height; Scale renders at the exact canvas size, scaled to fit; Fixed is the exact size, clipped.">
            Fit
          </L>
        }
      >
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
          <option value="reflow">Responsive</option>
          <option value="scale">Scale to fit</option>
          <option value="fixed">Fixed size</option>
        </Select>
      </Field>

      {config.meta.fit !== "reflow" ? (
        <>
          <Field
            label={
              <L tip="Pick a canvas size. The label stays on the preset until you change the width or height.">
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="Width">
              <Input
                type="number"
                value={width}
                onChange={(e) =>
                  onChange(
                    setCanvas(config, Number(e.currentTarget.value), height),
                  )
                }
              />
            </Field>
            <Field label="Height">
              <Input
                type="number"
                value={height}
                onChange={(e) =>
                  onChange(
                    setCanvas(config, width, Number(e.currentTarget.value)),
                  )
                }
              />
            </Field>
          </div>
        </>
      ) : (
        <p className="tc-muted" style={{ margin: 0, fontSize: 12 }}>
          Responsive fills its container; the canvas size only sets the fallback
          aspect ratio for video and width-only layouts.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <DisabledWrap
          disabled={fpsDisabled}
          reason="FPS only applies when rendering video — the live code embed plays at the browser's frame rate."
        >
          <Field
            label={
              <L tip="Frames per second for video export only — it has no effect on the live web preview.">
                FPS
              </L>
            }
          >
            <Input
              type="number"
              disabled={fpsDisabled}
              value={config.meta.fps ?? 30}
              onChange={(e) =>
                onChange(
                  updateMeta(config, { fps: Number(e.currentTarget.value) }),
                )
              }
            />
          </Field>
        </DisabledWrap>
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
        <Field
          label={
            <L tip="Background behind the skin for video export (e.g. transparent for WebM, or a CSS color).">
              Background
            </L>
          }
        >
          <BackgroundPicker
            value={config.meta.background ?? "transparent"}
            onChange={(v) => onChange(updateMeta(config, { background: v }))}
          />
        </Field>
        <DisabledWrap
          disabled={loopDisabled}
          reason="Loop is a live-playback setting — it doesn't apply to a one-shot video render."
        >
          <Field
            label={
              <L tip="Auto-replay when the timeline reaches the end. Honored by the preview and zero-prop embeds.">
                Loop
              </L>
            }
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 32,
              }}
            >
              <input
                type="checkbox"
                disabled={loopDisabled}
                checked={config.meta.loop === true}
                onChange={(e) =>
                  onChange(
                    updateMeta(config, { loop: e.currentTarget.checked }),
                  )
                }
              />
              <span className="tc-muted" style={{ fontSize: 12 }}>
                auto-replay
              </span>
            </label>
          </Field>
        </DisabledWrap>
      </div>

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
