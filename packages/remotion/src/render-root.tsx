import type { FC } from "react";
import { Composition, registerRoot } from "remotion";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import { getSkin } from "@typecaast/skins";
import type { ResolvedTheme } from "@typecaast/core";
import { TypecaastComposition } from "./composition.js";
import { getCompositionMetadata, type AspectPreset } from "./metadata.js";

/** Props passed as Remotion `inputProps` at render time. */
export type RenderInputProps = {
  config: ConfigInput;
  theme?: ResolvedTheme;
  background?: string;
  width?: number;
  height?: number;
  aspect?: AspectPreset;
  // Remotion requires composition props to satisfy Record<string, unknown>.
} & Record<string, unknown>;

const PLACEHOLDER: ConfigInput = {
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [{ type: "message", from: "a", text: "…" }],
};

const TypecaastRoot: FC<RenderInputProps> = ({
  config: raw,
  theme = "light",
  background,
}) => {
  const config = configSchema.parse(raw);
  const skin = getSkin(config.meta.skin.id);
  if (!skin) {
    throw new Error(
      `Unknown skin "${config.meta.skin.id}". Built-in skins: slack.`,
    );
  }
  return (
    <TypecaastComposition
      config={config}
      skin={skin}
      theme={theme}
      background={background}
    />
  );
};

const RemotionRoot: FC = () => (
  <Composition
    id="Typecaast"
    component={TypecaastRoot}
    durationInFrames={1}
    fps={30}
    width={480}
    height={720}
    defaultProps={
      { config: PLACEHOLDER, theme: "light" } satisfies RenderInputProps
    }
    calculateMetadata={({ props }: { props: RenderInputProps }) => {
      const config = configSchema.parse(props.config);
      const m = getCompositionMetadata(config, {
        width: props.width,
        height: props.height,
        aspect: props.aspect,
      });
      return {
        durationInFrames: m.durationInFrames,
        fps: m.fps,
        width: m.width,
        height: m.height,
      };
    }}
  />
);

registerRoot(RemotionRoot);
