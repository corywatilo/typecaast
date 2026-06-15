import type { Skin } from "@typecaast/skin-kit";

type SkinModule = { default: Skin };

/**
 * Lazy loaders for the built-in skins, keyed by `meta.skin.id`. Each value is a
 * **static** `import()` of a per-skin subpath, so bundlers emit one chunk per
 * skin and only the skin a config actually references is fetched. Custom skins
 * bypass this entirely (pass the `skin` prop to `<Typecaast>`).
 *
 * Adding a built-in skin = add one line here + the subpath export in
 * `@typecaast/skins`.
 */
export const BUILTIN_SKIN_LOADERS: Record<
  string,
  () => Promise<SkinModule>
> = {
  slack: () => import("@typecaast/skins/slack"),
  telegram: () => import("@typecaast/skins/telegram"),
  "claude-code": () => import("@typecaast/skins/claude-code"),
  imessage: () => import("@typecaast/skins/imessage"),
  whatsapp: () => import("@typecaast/skins/whatsapp"),
  cursor: () => import("@typecaast/skins/cursor"),
  "messages-macos": () => import("@typecaast/skins/messages-macos"),
  discord: () => import("@typecaast/skins/discord"),
};

/** Ids of the built-in skins resolvable by `<Typecaast>` without a `skin` prop. */
export const builtinSkinIds = Object.keys(BUILTIN_SKIN_LOADERS);

// Stable promise per id so React's `use()` sees the same promise across renders.
const cache = new Map<string, Promise<Skin>>();

/**
 * Resolve a built-in skin id to a cached promise of its `Skin`. Throws
 * synchronously for an unknown id (a render error with a clear message), rather
 * than suspending forever.
 */
export function loadBuiltinSkin(id: string): Promise<Skin> {
  let promise = cache.get(id);
  if (!promise) {
    const loader = BUILTIN_SKIN_LOADERS[id];
    if (!loader) {
      throw new Error(
        `Typecaast: unknown skin "${id}". Built-in skins: ${builtinSkinIds.join(
          ", ",
        )}. For a custom skin, pass the \`skin\` prop.`,
      );
    }
    promise = loader().then((m) => m.default);
    cache.set(id, promise);
  }
  return promise;
}
