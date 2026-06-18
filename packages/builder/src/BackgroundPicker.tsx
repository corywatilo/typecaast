import { Input } from "@typecaast/ui";

/**
 * Background picker. A native colour swatch + hex input pair, plus a
 * "Transparent" toggle that drops the value to the literal string
 * `"transparent"`. Clearer than a freeform text input — the user can either
 * pick a colour explicitly or opt out of one entirely.
 *
 * Background only applies to **video** export (the live code embed is
 * transparent over the host page), so this lives next to the Video export.
 */
export function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const isTransparent =
    value === "transparent" || value === "" || value === "none";
  // Normalise to a `#rrggbb` for the swatch — the native colour input only
  // accepts that form. Free-form CSS colours (e.g. `rgb(...)`) round-trip
  // through the text input but reset the swatch to black.
  const hex = isTransparent
    ? "#000000"
    : /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : "#000000";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="color"
          aria-label="Pick background colour"
          disabled={isTransparent}
          value={hex}
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: "1px solid var(--tc-border)",
            borderRadius: 6,
            background: "transparent",
            cursor: isTransparent ? "not-allowed" : "pointer",
            opacity: isTransparent ? 0.45 : 1,
            flex: "0 0 auto",
          }}
        />
        <Input
          aria-label="Background colour"
          disabled={isTransparent}
          value={isTransparent ? "transparent" : value}
          placeholder="#000000"
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{ flex: "1 1 auto", minWidth: 0 }}
        />
      </div>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--tc-muted)",
        }}
      >
        <input
          type="checkbox"
          checked={isTransparent}
          onChange={(e) =>
            onChange(e.currentTarget.checked ? "transparent" : "#000000")
          }
        />
        Transparent
      </label>
    </div>
  );
}
