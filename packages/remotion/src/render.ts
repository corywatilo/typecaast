import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { ConfigInput } from "@typecaast/schema";
import type { ResolvedTheme } from "@typecaast/core";
import type { AspectPreset } from "./metadata.js";

export type RenderFormat = "mp4" | "gif" | "webm";

export interface RenderVideoOptions {
  /** The config to render (raw or parsed). */
  config: ConfigInput;
  /** Output file path. */
  outPath: string;
  format?: RenderFormat;
  /** Concrete theme; `auto` isn't meaningful for a file (default light). */
  theme?: ResolvedTheme;
  width?: number;
  height?: number;
  aspect?: AspectPreset;
  /** Retina scale factor (1/2/3); renders at scale× pixel density. */
  scale?: number;
  /** Transparent background (webm/vp8 only). */
  transparent?: boolean;
  onProgress?: (progress: number) => void;
}

const CODECS: Record<RenderFormat, "h264" | "gif" | "vp8"> = {
  mp4: "h264",
  gif: "gif",
  webm: "vp8",
};

/**
 * Render a config to a video file. The renderer is a **clean, callable
 * package** (PLAN §9/M2.8): the CLI and the future hosted service both call
 * this. Bundles the render root, selects the `Typecaast` composition (size +
 * duration computed from the config), and renders with the chosen codec.
 */
export async function renderVideo(
  options: RenderVideoOptions,
): Promise<string> {
  const {
    config,
    outPath,
    format = "mp4",
    theme = "light",
    scale = 1,
    transparent = false,
    onProgress,
  } = options;

  const entryPoint = fileURLToPath(
    new URL("./render-root.js", import.meta.url),
  );
  const serveUrl = await bundle({ entryPoint });

  const inputProps: Record<string, unknown> = {
    config,
    theme,
    width: options.width,
    height: options.height,
    aspect: options.aspect,
    background: transparent ? "transparent" : undefined,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "Typecaast",
    inputProps,
  });

  await renderMedia({
    serveUrl,
    composition,
    codec: CODECS[format],
    outputLocation: outPath,
    inputProps,
    scale,
    ...(transparent ? { pixelFormat: "yuva420p" as const } : {}),
    onProgress: onProgress
      ? ({ progress }: { progress: number }) => onProgress(progress)
      : undefined,
  });

  return outPath;
}
