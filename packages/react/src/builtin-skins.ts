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
export const BUILTIN_SKIN_LOADERS: Record<string, () => Promise<SkinModule>> = {
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

/**
 * A status-tracked load, cached per id. Tracking the settled state lets us
 * Suspense-read it on **React 18 and 19** alike (via the throw-the-promise
 * primitive) instead of React 19's `use()`, which doesn't exist on 18.
 */
interface SkinResource {
  promise: Promise<Skin>;
  status: "pending" | "fulfilled" | "rejected";
  value?: Skin;
  error?: unknown;
}

// Stable resource per id so the same promise is seen across renders.
const cache = new Map<string, SkinResource>();

/**
 * Get (or create) the cached resource for a skin id. Throws synchronously for an
 * unknown id (a render error with a clear message), rather than suspending forever.
 */
function getResource(id: string): SkinResource {
  let resource = cache.get(id);
  if (resource) return resource;

  const loader = BUILTIN_SKIN_LOADERS[id];
  if (!loader) {
    throw new Error(
      `Typecaast: unknown skin "${id}". Built-in skins: ${builtinSkinIds.join(
        ", ",
      )}. For a custom skin, pass the \`skin\` prop.`,
    );
  }

  resource = {
    status: "pending",
    promise: loader().then((m) => m.default),
  };
  // Record the settled state for the synchronous Suspense read. This handler
  // also keeps `promise`'s rejection from going unhandled.
  void resource.promise.then(
    (skin) => {
      resource!.status = "fulfilled";
      resource!.value = skin;
    },
    (error: unknown) => {
      resource!.status = "rejected";
      resource!.error = error;
    },
  );
  cache.set(id, resource);
  return resource;
}

/**
 * Resolve a built-in skin id to a cached promise of its `Skin`. Stable per id.
 */
export function loadBuiltinSkin(id: string): Promise<Skin> {
  return getResource(id).promise;
}

/**
 * Suspense-read a built-in skin by id: returns the `Skin` once loaded, throws the
 * pending promise to suspend, or re-throws a load error. This is the universal
 * Suspense primitive — it works on React 18 and 19, unlike `use()` (19-only).
 */
export function readBuiltinSkin(id: string): Skin {
  const resource = getResource(id);
  if (resource.status === "fulfilled") return resource.value as Skin;
  if (resource.status === "rejected") throw resource.error;
  throw resource.promise;
}
