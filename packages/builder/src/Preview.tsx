import type { Config, ThemeMode } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { TypecaastStage, useTypecaast } from "@typecaast/react";
import { IconButton, Segmented, Slider } from "@typecaast/ui";

function fmt(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function Preview({
  config,
  skin,
  previewTheme,
  onPreviewThemeChange,
}: {
  config: Config;
  skin: Skin;
  previewTheme: ThemeMode;
  onPreviewThemeChange: (t: ThemeMode) => void;
}) {
  const tc = useTypecaast(config, {
    theme: previewTheme,
    capabilities: skin.meta.capabilities,
  });
  const aspect = config.meta.canvas.width / config.meta.canvas.height;
  const w = Math.min(380, 520 * Math.min(1, aspect));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--tc-bg-subtle)",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: w,
            aspectRatio: String(aspect),
            maxHeight: "100%",
            display: "flex",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--tc-border)",
            boxShadow: "var(--tc-shadow)",
          }}
        >
          <TypecaastStage
            state={tc.state}
            skin={skin}
            participants={config.participants}
            options={config.meta.skin.options}
          />
        </div>
      </div>
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderTop: "1px solid var(--tc-border)",
          background: "var(--tc-panel)",
        }}
      >
        <IconButton aria-label="Previous step" onClick={tc.stepPrev}>
          ⏮
        </IconButton>
        <IconButton
          aria-label={tc.playing ? "Pause" : "Play"}
          onClick={() => (tc.playing ? tc.pause() : tc.play())}
        >
          {tc.playing ? "⏸" : "▶"}
        </IconButton>
        <IconButton aria-label="Next step" onClick={tc.stepNext}>
          ⏭
        </IconButton>
        <Slider
          min={0}
          max={Math.max(1, Math.round(tc.duration))}
          step={10}
          value={Math.round(tc.currentMs)}
          aria-label="Scrub timeline"
          onChange={(e) => tc.scrubTo(Number(e.currentTarget.value))}
          style={{ flex: 1 }}
        />
        <span
          className="tc-mono tc-muted"
          style={{ fontSize: 12, whiteSpace: "nowrap" }}
        >
          {fmt(tc.currentMs)} / {fmt(tc.duration)}
        </span>
        <Segmented
          aria-label="Preview theme"
          value={previewTheme}
          onChange={onPreviewThemeChange}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </div>
    </div>
  );
}
