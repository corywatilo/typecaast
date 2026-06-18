import type { ComposerMode, ConfigInput } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Field, Input, Segmented, Select } from "@typecaast/ui";
import { InfoTip } from "../Tooltip.js";
import { setSkin, updateMeta } from "../store.js";
import { capabilityLint } from "../lint.js";

/**
 * Friendly metadata for skin option keys we know about. Unknown keys fall
 * back to title-cased labels with no placeholder.
 */
const KNOWN_OPTIONS: Record<
  string,
  { label: string; placeholder: string } | undefined
> = {
  channel: { label: "Channel", placeholder: "#alerts" },
  title: { label: "Title", placeholder: "Chat" },
  contact: { label: "Contact", placeholder: "Sam Carter" },
  status: { label: "Status", placeholder: "online" },
};

/**
 * Discover the active skin's string-typed option keys by introspecting its
 * Zod options schema. We only render fields the active skin actually
 * consumes — previously we hard-coded `channel/title/contact/status` for
 * every skin, which meant most fields silently did nothing on most skins.
 */
function getStringOptionKeys(skin: Skin | undefined): string[] {
  const schema = skin?.meta.optionsSchema as
    | { shape?: Record<string, unknown> }
    | undefined;
  const shape = schema?.shape;
  if (!shape) return [];
  const out: string[] = [];
  for (const [key, fieldSchema] of Object.entries(shape)) {
    // Each shape entry is itself a ZodType. `.safeParse("…")` succeeds for
    // strings (incl. `ZodString`, `ZodOptional<ZodString>`, etc.) and fails
    // for booleans/numbers, so we render only the keys that accept text.
    const field = fieldSchema as
      | { safeParse?: (v: unknown) => { success: boolean } }
      | undefined;
    if (field?.safeParse?.("test")?.success) out.push(key);
  }
  return out;
}

function titleCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

interface Feature {
  label: string;
  /** When true, the skin renders this feature with first-class UI; when false,
   *  it falls back to a generic representation (still supported). */
  native: boolean;
}

/**
 * Build the affirmative "what works in this skin" list. We only include
 * features the skin renders in some form — `unsupported` events are hidden
 * here and surfaced in the Won't render section instead, so this list reads
 * as a positive checklist.
 */
function supportedFeatures(skin: Skin): Feature[] {
  const caps = skin.meta.capabilities;
  const ev = (
    k: keyof typeof caps.events,
  ): "native" | "fallback" | undefined =>
    caps.events[k] === "native"
      ? "native"
      : caps.events[k] === "fallback"
        ? "fallback"
        : undefined;
  const out: Feature[] = [];

  if (skin.meta.supportsThemes.includes("light"))
    out.push({ label: "Light theme", native: true });
  if (skin.meta.supportsThemes.includes("dark"))
    out.push({ label: "Dark theme", native: true });

  const m = ev("message");
  if (m) out.push({ label: "Messages", native: m === "native" });
  const t = ev("typing");
  if (t) out.push({ label: "Typing indicator", native: t === "native" });

  // Reactions need both the per-event flag *and* the top-level boolean.
  const r = ev("reaction");
  if (r && caps.reactions)
    out.push({ label: "Reactions", native: r === "native" });

  const e = ev("edit");
  if (e) out.push({ label: "Edits", native: e === "native" });
  const d = ev("delete");
  if (d) out.push({ label: "Deletes", native: d === "native" });

  const rr = ev("readReceipt");
  if (rr && caps.readReceipts !== false)
    out.push({ label: "Read receipts", native: rr === "native" });

  const sys = ev("system");
  if (sys) out.push({ label: "System cards", native: sys === "native" });

  if (caps.content.image !== false)
    out.push({ label: "Inline images", native: true });

  return out;
}

export function SkinPanel({
  config,
  skins,
  onChange,
}: {
  config: ConfigInput;
  skins: Record<string, Skin>;
  onChange: (next: ConfigInput) => void;
}) {
  const skin = skins[config.meta.skin.id];
  const options = (config.meta.skin.options ?? {}) as Record<string, unknown>;

  const setOption = (key: string, value: string) => {
    const next = { ...options };
    if (value) next[key] = value;
    else delete next[key];
    onChange(setSkin(config, config.meta.skin.id, next));
  };

  const warnings = skin ? capabilityLint(config, skin) : [];
  const features = skin ? supportedFeatures(skin) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Skin">
        <Select
          value={config.meta.skin.id}
          onChange={(e) =>
            onChange(setSkin(config, e.currentTarget.value, options))
          }
        >
          {Object.entries(skins).map(([id, s]) => (
            <option key={id} value={id}>
              {s.meta.name}
            </option>
          ))}
          {skins[config.meta.skin.id] ? null : (
            <option value={config.meta.skin.id}>
              {config.meta.skin.id} (unknown)
            </option>
          )}
        </Select>
      </Field>

      {(() => {
        const optionKeys = getStringOptionKeys(skin);
        if (optionKeys.length === 0) return null;
        return (
          <div>
            <p className="tc-label" style={{ marginBottom: 8 }}>
              Options
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {optionKeys.map((key) => {
                const known = KNOWN_OPTIONS[key];
                const label = known?.label ?? titleCase(key);
                const placeholder = known?.placeholder ?? "";
                return (
                  <Field key={key} label={label}>
                    <Input
                      value={(options[key] as string) ?? ""}
                      placeholder={placeholder}
                      onChange={(e) => setOption(key, e.currentTarget.value)}
                    />
                  </Field>
                );
              })}
            </div>
          </div>
        );
      })()}

      <Field
        label={
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            Message input
            <InfoTip text="Whether the reply box shows. Always keeps it visible; Hidden never shows it." />
          </span>
        }
      >
        <Segmented<Exclude<ComposerMode, "auto">>
          aria-label="Message input visibility"
          // Treat the legacy "auto" value as "always" for display so the
          // segmented control is never in a no-selection state — clicking
          // either option commits the new explicit value.
          value={config.meta.composer === "never" ? "never" : "always"}
          onChange={(v) => onChange(updateMeta(config, { composer: v }))}
          options={[
            { value: "always", label: "Always" },
            { value: "never", label: "Hidden" },
          ]}
        />
      </Field>

      {features.length > 0 ? (
        <div>
          <p className="tc-label" style={{ marginBottom: 8 }}>
            Supported features
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 4,
              columnGap: 8,
            }}
          >
            {features.map((f) => (
              <li
                key={f.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12.5,
                  color: "var(--tc-text)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 14,
                    height: 14,
                    flex: "0 0 auto",
                    color: "var(--tc-success, #16a34a)",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                  title={
                    f.native ? "Native" : "Rendered with a generic fallback"
                  }
                >
                  ✓
                </span>
                <span>
                  {f.label}
                  {f.native ? null : (
                    <span className="tc-muted" style={{ fontSize: 11.5 }}>
                      {" "}
                      (fallback)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--tc-warn-border, #e9c46a)",
            background: "var(--tc-warn-bg, rgba(250, 176, 5, 0.10))",
          }}
        >
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: "0 0 8px",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--tc-warn, #b45309)",
            }}
          >
            <span aria-hidden>⚠</span> Won't render in this skin
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {warnings.map((w, i) => (
              <li key={i} style={{ fontSize: 12.5, color: "var(--tc-text)" }}>
                {w.stepIndex !== undefined ? (
                  <strong>Step {w.stepIndex + 1}: </strong>
                ) : null}
                <span className="tc-muted">{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
