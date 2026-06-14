# Rendering video

Typecaast renders video **self-hosted** from the OSS packages — you run it on
your own machine (or in CI). The render path reuses the exact same engine and
skins as the live React player, sampled one frame at a time, so the preview and
the export are identical frame for frame.

## Quick start

```bash
# Render a config to MP4 (defaults: mp4, light theme, canvas size, scale 1)
typecaast render billing-toast.json

# Vertical social size at retina density, dark theme
typecaast render billing-toast.json --aspect 9:16 --scale 2 --theme dark

# Explicit size + transparent background (webm), into a chosen path
typecaast render billing-toast.json --size 1080x1080 --format webm --transparent -o out.webm
```

Flags: `--format mp4|gif|webm`, `--size WxH`, `--aspect 16:9|1:1|9:16|4:5`,
`--scale 1|2|3`, `--theme light|dark` (default `light`), `--transparent`,
`-o, --out <path>`.

- **Output size** comes from explicit `--size`, else `--aspect`, else
  `meta.canvas`. Changing it never invalidates the timeline — the layout
  reflows. **Scale** is retina pixel density, not a layout change.
- **Theme** — `auto` isn't meaningful for a fixed file; export resolves to a
  concrete mode and defaults to `light`. One render = one theme.
- **Transparent** backgrounds need an alpha-capable codec (`webm`).

On first render, Remotion downloads a pinned **Chrome Headless Shell**.

## Programmatic API

The renderer is a clean, callable package — the CLI and the future hosted
service both call it:

```ts
import { renderVideo } from "@typecaast/remotion/render";

await renderVideo({
  config, // a Typecaast config object
  outPath: "out.mp4",
  format: "mp4",
  theme: "light",
  aspect: "9:16",
  scale: 2,
  onProgress: (p) => console.log(`${Math.round(p * 100)}%`),
});
```

## Determinism & the pinned runtime (PLAN §19)

Timing is deterministic by construction (the engine is a pure function of time,
seeded RNG). **Visual** frame parity _across environments_ additionally requires
pinning the runtime, because fonts, emoji rasterization, and line-wrap vary by
OS/browser:

- **Node** is pinned (`engines` + the container base image).
- **Chromium** is the pinned Chrome Headless Shell tied to the `remotion`
  version in the lockfile.
- **Fonts** — each skin declares and loads its own web fonts (never relying on
  host OS fonts); only open-licensed fonts (OFL) are bundled.
- **Emoji** — a single source-of-truth emoji font (**Noto Color Emoji**) is
  installed in the render image so emoji rasterize identically everywhere.

The pinned environment is captured in [`docker/Dockerfile.render`](../docker/Dockerfile.render).
Use it for reproducible renders:

```bash
docker build -f docker/Dockerfile.render -t typecaast-render .
docker run --rm -v "$PWD:/work" typecaast-render /work/billing-toast.json -o /work/out.mp4
```

Within a single environment, parity holds without the container; across
environments, use it. CI runs a render smoke test (`.github/workflows/render-smoke.yml`)
on every push.
