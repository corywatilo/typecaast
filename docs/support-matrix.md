# Support matrix

What Typecaast is built and tested against (PLAN §21). Outside these ranges it
may still work, but it isn't part of the test/CI contract.

## Runtime (embed + SDK)

| Target                            | Supported                                        | Notes                                                                                            |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Node**                          | 22 LTS, 24                                       | CI runs the test matrix on both. ≥ 20 likely works; not gated.                                   |
| **React**                         | 18, 19                                           | `react`/`react-dom` are peer deps (`>=18`).                                                      |
| **TypeScript**                    | 5.5+                                             | Strict; `moduleResolution: bundler`. Types ship with every package.                              |
| **Browsers (live `<Typecaast>`)** | Last 2 versions of Chrome, Edge, Firefox, Safari | Needs `ResizeObserver`, `IntersectionObserver`, `matchMedia`, shadow DOM (capture skins). No IE. |
| **Module format**                 | ESM + CJS                                        | Every package ships both (`import`/`require` exports).                                           |
| **SSR**                           | Yes                                              | Skins are SSR-safe (no `window` at module top level); the player hydrates client-side.           |

## Video export

| Target                | Supported                                  | Notes                                                          |
| --------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| **Remotion**          | 4.x                                        | `@typecaast/remotion` peer-deps Remotion 4.                    |
| **Renderer**          | Headless Chromium via Remotion             | Pinned in `docker/Dockerfile.render` for deterministic frames. |
| **Output**            | MP4 (H.264), GIF, WebM (incl. transparent) | Via `typecaast render --format`.                               |
| **Node (CLI render)** | 22 / 24                                    | Same as runtime; render smoke job runs in CI.                  |

## Capture (cut-line feature)

| Target                   | Supported                | Notes                                                     |
| ------------------------ | ------------------------ | --------------------------------------------------------- |
| **Extension**            | Chrome / Chromium MV3    | Loaded unpacked; not on the Web Store.                    |
| **Importer**             | Node 22+                 | `@typecaast/capture/import` (jsdom); `.html` / `.mhtml`.  |
| **Template-skin render** | Browsers with shadow DOM | Isolation relies on `attachShadow` (all modern browsers). |

## Not supported

- Internet Explorer; pre-18 React; Remotion 3.x.
- Bundling proprietary platform fonts (see [`fonts.md`](./fonts.md)).
