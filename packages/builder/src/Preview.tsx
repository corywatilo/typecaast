import { useEffect, useRef, useState } from "react";
import type { Config, ThemeMode } from "@typecaast/schema";
import type { ResolvedTheme } from "@typecaast/core";
import type { Skin } from "@typecaast/skin-kit";
import { TypecaastStage, useTypecaast } from "@typecaast/react";
import { IconButton, Segmented, Slider } from "@typecaast/ui";
import { Tooltip } from "./Tooltip.js";
import {
  IconPause,
  IconPlay,
  IconRestart,
  IconStepBack,
  IconStepForward,
} from "./icons.js";

function fmt(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

const clamp = (x: number, lo: number, hi: number) =>
  x < lo ? lo : x > hi ? hi : x;

/** Discrete zoom stops for the −/+ buttons. */
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const MIN_SCALE = 0.05;
const MAX_SCALE = 3;

/**
 * Preview zoom:
 * - `responsive` — the stage fills the pane by aspect ratio and the skin
 *   **reflows** to that width (no transform; fonts stay their authored size).
 * - `fit` — the canvas is **scaled** (transform) to fit the pane; the readout
 *   shows the real scale (so a 1920×1080 canvas fills the pane at, say, 31%).
 * - a number — an explicit scale; the pane scrolls when it overflows.
 */
type Zoom = "responsive" | "fit" | number;

/** Observe an element's content-box size (client-only; builder is ssr:false). */
function useElementSize(): [
  React.RefObject<HTMLDivElement | null>,
  { w: number; h: number },
] {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

function ZoomButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 26,
        padding: "0 9px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        border: `1px solid ${active ? "var(--tc-accent)" : "var(--tc-border)"}`,
        background: active ? "var(--tc-panel-raised)" : "transparent",
        color: active ? "var(--tc-accent)" : "var(--tc-text)",
      }}
    >
      {children}
    </button>
  );
}

export function Preview({
  config,
  skin,
  previewTheme,
  onPreviewThemeChange,
  chromeTheme,
  onPlay,
}: {
  config: Config;
  skin: Skin;
  previewTheme: ThemeMode;
  onPreviewThemeChange: (t: ThemeMode) => void;
  /** The page/builder's resolved theme. When the preview is "auto" it follows
   *  this instead of `prefers-color-scheme`, so it matches the surrounding
   *  page (which has already resolved its own "auto" → light/dark, falling back
   *  to the browser preference). Explicit Light/Dark still override. */
  chromeTheme: ResolvedTheme;
  onPlay?: () => void;
}) {
  // `loop` lives on `config.meta.loop` (set in the Options panel) and is
  // honored by `useTypecaast` automatically when no prop overrides it.
  const tc = useTypecaast(config, {
    theme: previewTheme === "auto" ? chromeTheme : previewTheme,
    capabilities: skin.meta.capabilities,
  });

  // Preview-as-you-go: the builder opens on the **final** frame (full thread),
  // and editing restores the last scrub position instead of snapping to t=0.
  // `posRef` is null until the user navigates (= "open at the end"); we update it
  // only from explicit navigation (below), never from a per-render `currentMs`
  // capture — that raced the initial seek under StrictMode and reset it to 0.
  const posRef = useRef<number | null>(null);
  const remember = (ms: number) => {
    posRef.current = ms;
  };
  const seededFor = useRef<unknown>(null);
  useEffect(() => {
    // Seed once per player instance: an edit makes a fresh player, restoring the
    // remembered position; first load (posRef null) opens on the final frame.
    if (seededFor.current === tc.player) return;
    seededFor.current = tc.player;
    tc.player.seek(posRef.current ?? tc.player.durationMs);
  }, [tc.player]);

  const atEnd = tc.currentMs >= tc.duration - 1;
  const togglePlay = () => {
    if (tc.playing) {
      tc.pause();
      return;
    }
    if (atEnd) {
      tc.seek(0);
      remember(0);
    }
    tc.play();
    onPlay?.();
  };
  const scrubTo = (ms: number) => {
    tc.scrubTo(ms);
    remember(ms);
  };
  const stepPrev = () => {
    tc.stepPrev();
    remember(tc.currentMs);
  };
  const stepNext = () => {
    tc.stepNext();
    remember(tc.currentMs);
  };
  /** Jump to t=0 and play in one click. */
  const restart = () => {
    tc.seek(0);
    remember(0);
    tc.play();
    onPlay?.();
  };

  const { width: cw, height: ch } = config.meta.canvas;
  const aspect = cw / ch;

  const [stageRef, area] = useElementSize();
  const [zoom, setZoom] = useState<Zoom>("fit");

  const measured = area.w > 0 && area.h > 0;
  // "Fit" only ever scales **down** — a small canvas in a big pane stays at 100%
  // (it never blows up past its authored size). The user can still zoom past
  // 100% explicitly via the +/− buttons.
  const fitScale = measured
    ? clamp(Math.min(area.w / cw, area.h / ch, 1), MIN_SCALE, MAX_SCALE)
    : 1;
  // Until the pane is measured (first paint / SSR-less mount), fall back to the
  // responsive layout so the preview is never blank.
  const responsive = zoom === "responsive" || !measured;
  const scale = zoom === "fit" ? fitScale : (zoom as number);

  const stepZoom = (dir: 1 | -1) => {
    const current = zoom === "responsive" ? fitScale : scale;
    const next =
      dir > 0
        ? ZOOM_STEPS.find((s) => s > current + 1e-3)
        : [...ZOOM_STEPS].reverse().find((s) => s < current - 1e-3);
    setZoom(next ?? clamp(current, MIN_SCALE, MAX_SCALE));
  };

  const pct =
    zoom === "responsive"
      ? "Auto"
      : `${Math.round((scale || fitScale) * 100)}%`;

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
      {/* Zoom / fit controls */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          padding: "8px 16px",
          borderBottom: "1px solid var(--tc-border)",
        }}
      >
        <span
          className="tc-mono tc-muted"
          style={{ fontSize: 11, marginRight: "auto" }}
        >
          {cw}×{ch}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <Tooltip text="Scale the canvas down to fit the preview pane (never up past 100%).">
            <ZoomButton active={zoom === "fit"} onClick={() => setZoom("fit")}>
              Fit
            </ZoomButton>
          </Tooltip>
          <Tooltip text="Reflow the skin to the pane width — no scaling, fonts stay their authored size.">
            <ZoomButton
              active={zoom === "responsive"}
              onClick={() => setZoom("responsive")}
            >
              Responsive
            </ZoomButton>
          </Tooltip>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Tooltip text="Zoom out">
            <IconButton
              aria-label="Zoom out"
              disabled={zoom === "responsive"}
              onClick={() => stepZoom(-1)}
              style={{ width: 26, height: 26 }}
            >
              −
            </IconButton>
          </Tooltip>
          <Tooltip text="Reset to 100%">
            <button
              type="button"
              disabled={zoom === "responsive"}
              onClick={() => setZoom(1)}
              className="tc-mono"
              style={{
                minWidth: 44,
                fontSize: 12,
                fontWeight: 600,
                border: 0,
                background: "transparent",
                color: "var(--tc-text)",
                cursor: zoom === "responsive" ? "default" : "pointer",
              }}
            >
              {pct}
            </button>
          </Tooltip>
          <Tooltip text="Zoom in">
            <IconButton
              aria-label="Zoom in"
              disabled={zoom === "responsive"}
              onClick={() => stepZoom(1)}
              style={{ width: 26, height: 26 }}
            >
              +
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div
        ref={stageRef}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          overflow: "auto",
        }}
      >
        {responsive ? (
          // Reflow: a box that fills the pane by aspect ratio; the skin lays
          // out at this width (no transform). Falls back to a fixed width until
          // the pane is measured, so the preview is never blank.
          <div
            style={{
              width: measured
                ? Math.min(area.w - 48, (area.h - 48) * aspect)
                : 360,
              aspectRatio: String(aspect),
              flex: "0 0 auto",
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
              composer={config.meta.composer}
            />
          </div>
        ) : (
          // Scaled: render at the true canvas size, transformed to `scale`.
          <div
            style={{
              width: cw * scale,
              height: ch * scale,
              flex: "0 0 auto",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--tc-border)",
              boxShadow: "var(--tc-shadow)",
            }}
          >
            <div
              style={{
                width: cw,
                height: ch,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                display: "flex",
              }}
            >
              <TypecaastStage
                state={tc.state}
                skin={skin}
                participants={config.participants}
                options={config.meta.skin.options}
                composer={config.meta.composer}
              />
            </div>
          </div>
        )}
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
        <Tooltip text="Restart from the beginning">
          <IconButton aria-label="Restart" onClick={restart}>
            <IconRestart size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip text="Previous step">
          <IconButton aria-label="Previous step" onClick={stepPrev}>
            <IconStepBack size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip text={tc.playing ? "Pause" : "Play"}>
          <IconButton
            aria-label={tc.playing ? "Pause" : "Play"}
            onClick={togglePlay}
          >
            {tc.playing ? <IconPause size={18} /> : <IconPlay size={18} />}
          </IconButton>
        </Tooltip>
        <Tooltip text="Next step">
          <IconButton aria-label="Next step" onClick={stepNext}>
            <IconStepForward size={18} />
          </IconButton>
        </Tooltip>
        <Slider
          min={0}
          max={Math.max(1, Math.round(tc.duration))}
          step={10}
          value={Math.round(tc.currentMs)}
          aria-label="Scrub timeline"
          onChange={(e) => scrubTo(Number(e.currentTarget.value))}
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
