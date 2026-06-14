import { useEffect, useRef } from "react";
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
  loop,
  onLoopChange,
  onPlay,
}: {
  config: Config;
  skin: Skin;
  previewTheme: ThemeMode;
  onPreviewThemeChange: (t: ThemeMode) => void;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
  onPlay?: () => void;
}) {
  const tc = useTypecaast(config, {
    theme: previewTheme,
    capabilities: skin.meta.capabilities,
    loop,
  });

  // Preview-as-you-go: remember the scrub position and restore it whenever the
  // engine recompiles (an edit), so editing never throws you back to t=0. The
  // builder opens on the **final** frame (full thread) — `posRef` starts at the
  // end and `inited` guards the per-render capture so it isn't reset to 0 before
  // the first seek runs.
  const posRef = useRef<number>(Number.MAX_SAFE_INTEGER);
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) posRef.current = tc.currentMs;
  });
  useEffect(() => {
    tc.player.seek(Math.min(posRef.current, tc.player.durationMs));
    inited.current = true;
  }, [tc.player]);

  const atEnd = tc.currentMs >= tc.duration - 1;
  const togglePlay = () => {
    if (tc.playing) {
      tc.pause();
      return;
    }
    if (atEnd) tc.seek(0);
    tc.play();
    onPlay?.();
  };

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
          aria-label={tc.playing ? "Pause" : atEnd ? "Replay" : "Play"}
          onClick={togglePlay}
        >
          {tc.playing ? "⏸" : atEnd ? "↺" : "▶"}
        </IconButton>
        <IconButton aria-label="Next step" onClick={tc.stepNext}>
          ⏭
        </IconButton>
        <IconButton
          aria-label="Loop"
          onClick={() => onLoopChange(!loop)}
          style={
            loop
              ? { borderColor: "var(--tc-accent)", color: "var(--tc-accent)" }
              : undefined
          }
        >
          🔁
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
