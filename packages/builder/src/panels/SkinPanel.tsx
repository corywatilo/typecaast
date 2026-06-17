import type { ComposerMode, ConfigInput } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Badge, Field, Input, Panel, Segmented, Select } from "@typecaast/ui";
import { InfoTip } from "../Tooltip.js";
import { setSkin, updateMeta } from "../store.js";
import { capabilityLint } from "../lint.js";

const OPTION_FIELDS = [
  { key: "channel", label: "Channel", placeholder: "#alerts" },
  { key: "title", label: "Title", placeholder: "Chat" },
  { key: "contact", label: "Contact", placeholder: "Sam Carter" },
  { key: "status", label: "Status", placeholder: "online" },
] as const;

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

      {skin ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {skin.meta.supportsThemes.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          {skin.meta.capabilities.reactions ? <Badge>reactions</Badge> : null}
          {skin.meta.capabilities.readReceipts ? <Badge>receipts</Badge> : null}
        </div>
      ) : null}

      <div>
        <p className="tc-label" style={{ marginBottom: 8 }}>
          Options
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {OPTION_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <Input
                value={(options[f.key] as string) ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setOption(f.key, e.currentTarget.value)}
              />
            </Field>
          ))}
        </div>
      </div>

      <Field
        label={
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            Message input
            <InfoTip text="Whether the reply box shows. Auto reveals it only while someone is typing/sending; Always keeps it visible; Hidden never shows it." />
          </span>
        }
      >
        <Segmented<ComposerMode>
          aria-label="Message input visibility"
          value={config.meta.composer ?? "auto"}
          onChange={(v) => onChange(updateMeta(config, { composer: v }))}
          options={[
            { value: "auto", label: "Auto" },
            { value: "always", label: "Always" },
            { value: "never", label: "Hidden" },
          ]}
        />
      </Field>

      {warnings.length > 0 ? (
        <Panel style={{ padding: 12 }}>
          <p className="tc-label" style={{ marginBottom: 8 }}>
            Capability lint
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {warnings.map((w, i) => (
              <li key={i} style={{ fontSize: 12.5 }}>
                <Badge tone="warn">drop</Badge>{" "}
                <span className="tc-muted">
                  {w.stepIndex !== undefined ? `step ${w.stepIndex + 1}: ` : ""}
                  {w.message}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : skin ? (
        <p className="tc-muted" style={{ fontSize: 12.5 }}>
          {skin.meta.name} renders everything in this config.
        </p>
      ) : null}
    </div>
  );
}
