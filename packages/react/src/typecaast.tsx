import {
  Suspense,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactElement,
} from "react";
import {
  configSchema,
  type Config,
  type ConfigInput,
  type FitMode,
  type ThemeMode,
} from "@typecaast/schema";
import {
  TypecaastStage,
  type ComposerMode,
  type Skin,
} from "@typecaast/skin-kit";
import { useTypecaast } from "./use-typecaast.js";
import { useSkinFonts } from "./use-skin-fonts.js";
import { useReducedMotion } from "./use-reduced-motion.js";
import { buildTranscript } from "./transcript.js";
import { FitBox } from "./fit-box.js";
import { readBuiltinSkin } from "./builtin-skins.js";

/**
 * A loosely-typed config shape that a raw `import`ed `typecaast.json` satisfies —
 * TypeScript widens JSON literals (e.g. `version: number`, `type: string`), so it
 * matches neither `Config` nor `ConfigInput`. It's validated and normalized at
 * runtime, so this stays a convenience surface, not a bypass.
 */
export interface RawConfig {
  version: number;
  meta: {
    canvas: { width: number; height: number };
    skin: { id: string; options?: Record<string, unknown> };
    [key: string]: unknown;
  };
  participants: Array<{ id: string; name: string; [key: string]: unknown }>;
  timeline: Array<{ type: string; [key: string]: unknown }>;
  pacing?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * What `<Typecaast config>` accepts: a precise `ConfigInput`/`Config` (full
 * intellisense when hand-authoring) or a raw config object such as an imported
 * `typecaast.json`. All forms are normalized through the schema at runtime.
 */
export type TypecaastConfig = ConfigInput | Config | RawConfig;

export interface TypecaastProps {
  /**
   * The conversation config. Accepts your exported `typecaast.json` directly (or
   * a hand-authored `ConfigInput`); it's validated and defaulted at runtime, so
   * you never need to pre-parse it.
   */
  config: TypecaastConfig;
  /**
   * The skin to render with. **Optional** — by default the built-in skin named
   * by `config.meta.skin.id` is resolved and lazy-loaded (only that skin's chunk
   * is fetched), so the config is the single source of truth and the embed stays
   * fully serializable (works in a React Server Component, no `"use client"`).
   * Pass a `Skin` object only to use a custom skin not in `@typecaast/skins`.
   */
  skin?: Skin;
  /** Force a theme; otherwise resolved from `config.meta.theme`. */
  theme?: ThemeMode;
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
  /** Container fit mode; defaults to `config.meta.fit`. */
  fit?: FitMode;
  /** Composer (reply box) visibility: `auto` (default) / `always` / `never`. */
  composer?: ComposerMode;
  /** Accessible label for the simulation. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Default sizing for the outer `<Typecaast>` wrapper. The widget is
 * **container-driven**: it fills its parent in both axes. When the host
 * gives the wrapper a definite height (responsive grid + fixed-height
 * card, hero box with `aspectRatio`, …) `height: 100%` resolves to that
 * height and the skin reflows / scales to fit. When the host gives only a
 * width, `height: 100%` resolves to `auto` and the canvas's own
 * `aspect-ratio` takes over, deriving a sensible height from the
 * authored canvas dimensions instead of letting message content drive
 * the widget taller as more steps play.
 *
 * The user's `style` prop is spread *after* these defaults so any
 * explicit width/height/aspectRatio overrides win — same opt-out story
 * as the `style.position` pass-through.
 */
function rootStyle(canvas: { width: number; height: number }): CSSProperties {
  return {
    position: "relative",
    width: "100%",
    height: "100%",
    aspectRatio: `${canvas.width} / ${canvas.height}`,
  };
}

/**
 * Renders a `<Typecaast>` from a config. The skin defaults to the built-in named
 * by `config.meta.skin.id` (lazy-loaded by id — see `builtin-skins.ts`); pass an
 * explicit `skin` to use a custom one. `<Typecaast>` is a client component, but
 * since the default path takes only the serializable `config`, the embed drops
 * straight into a React Server Component.
 */
export function Typecaast(props: TypecaastProps): ReactElement {
  // Normalize once: validate and apply schema defaults (pacing, fit, theme, …)
  // so a raw exported `typecaast.json` works without the caller pre-parsing it.
  const config = useMemo<Config>(
    () => configSchema.parse(props.config),
    [props.config],
  );

  // Explicit skin object → render synchronously, no lazy load.
  if (props.skin)
    return <Player {...props} config={config} skin={props.skin} />;
  // Otherwise resolve (and lazy-load) the built-in named in the config.
  return (
    <Suspense
      fallback={
        <SkinFallback
          config={config}
          fit={props.fit}
          label={props.label}
          className={props.className}
          style={props.style}
        />
      }
    >
      <ResolvedPlayer {...props} config={config} />
    </Suspense>
  );
}

function ResolvedPlayer(
  props: Omit<TypecaastProps, "config"> & { config: Config },
): ReactElement {
  const skin = readBuiltinSkin(props.config.meta.skin.id);
  return <Player {...props} skin={skin} />;
}

/**
 * The actual player. The animated visuals are `aria-hidden`; an accessible
 * transcript carries the conversation for screen readers, and
 * `prefers-reduced-motion` snaps to the final state instead of animating
 * (PLAN §20).
 */
function Player({
  config,
  skin,
  theme,
  autoplay,
  loop,
  rate,
  fit,
  composer,
  label,
  className,
  style,
}: Omit<TypecaastProps, "config"> & {
  config: Config;
  skin: Skin;
}): ReactElement {
  const reduced = useReducedMotion();
  const tc = useTypecaast(config, {
    theme,
    autoplay: autoplay && !reduced,
    loop: loop && !reduced,
    rate,
    capabilities: skin.meta.capabilities,
  });
  const fonts = useSkinFonts(skin);

  // Reduced motion: hold the completed conversation, no animation.
  useEffect(() => {
    if (reduced) tc.seek(tc.duration);
  }, [reduced, tc]);

  const transcript = useMemo(() => buildTranscript(config), [config]);

  return (
    <div
      className={className}
      style={{ ...rootStyle(config.meta.canvas), ...style }}
      data-typecaast=""
      data-fonts={fonts}
      role="figure"
      aria-label={label ?? `Chat simulation (${skin.meta.name})`}
    >
      <ol style={SR_ONLY}>
        {transcript.map((line, i) => (
          <li key={i}>
            {line.name}: {line.text}
          </li>
        ))}
      </ol>
      <div aria-hidden="true" style={{ width: "100%", height: "100%" }}>
        <FitBox fit={fit ?? config.meta.fit} canvas={config.meta.canvas}>
          <TypecaastStage
            state={tc.state}
            skin={skin}
            participants={config.participants}
            options={config.meta.skin.options}
            composer={composer ?? config.meta.composer}
          />
        </FitBox>
      </div>
    </div>
  );
}

/**
 * A same-size placeholder shown while a built-in skin's chunk loads, so there's
 * no layout shift between fallback and the rendered skin. (On static/prerendered
 * pages the skin resolves before HTML is emitted, so this never paints.)
 */
function SkinFallback({
  config,
  fit,
  label,
  className,
  style,
}: Pick<TypecaastProps, "fit" | "label" | "className" | "style"> & {
  config: Config;
}) {
  return (
    <div
      className={className}
      style={{ ...rootStyle(config.meta.canvas), ...style }}
      data-typecaast=""
      data-typecaast-loading=""
      role="figure"
      aria-label={label ?? "Chat simulation"}
      aria-busy="true"
    >
      <div aria-hidden="true" style={{ width: "100%", height: "100%" }}>
        <FitBox fit={fit ?? config.meta.fit} canvas={config.meta.canvas}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--tc-skin-loading-bg, transparent)",
            }}
          />
        </FitBox>
      </div>
    </div>
  );
}
