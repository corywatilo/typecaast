import type { ConfigInput } from "@typecaast/schema";
import {
  Badge,
  Button,
  Field,
  IconButton,
  Input,
  Panel,
  Select,
} from "@typecaast/ui";
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
} from "../store.js";

export function CastPanel({
  config,
  onChange,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {config.participants.map((p, i) => (
        <Panel key={i} style={{ padding: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: p.color ?? "#888",
                flex: "0 0 18px",
              }}
            />
            <strong style={{ fontSize: 13, flex: 1 }}>{p.name || p.id}</strong>
            {p.isSelf ? <Badge tone="accent">self</Badge> : null}
            <IconButton
              aria-label="Remove participant"
              onClick={() => onChange(removeParticipant(config, i))}
              style={{ width: 24, height: 24 }}
            >
              ✕
            </IconButton>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Field label="Name">
              <Input
                value={p.name}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      name: e.currentTarget.value,
                    }),
                  )
                }
              />
            </Field>
            <Field label="Id">
              <Input
                value={p.id}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, { id: e.currentTarget.value }),
                  )
                }
              />
            </Field>
            <Field label="Color">
              <Input
                value={p.color ?? ""}
                placeholder="#5b3a8e"
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      color: e.currentTarget.value || undefined,
                    }),
                  )
                }
              />
            </Field>
            <Field label="Kind">
              <Select
                value={p.kind ?? "person"}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      kind: e.currentTarget.value as "person" | "app",
                    }),
                  )
                }
              >
                <option value="person">person</option>
                <option value="app">app</option>
              </Select>
            </Field>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              checked={p.isSelf === true}
              onChange={(e) =>
                onChange(
                  updateParticipant(config, i, {
                    isSelf: e.currentTarget.checked || undefined,
                  }),
                )
              }
            />
            <span className="tc-muted" style={{ fontSize: 12 }}>
              self (the viewer)
            </span>
          </label>
        </Panel>
      ))}
      <Button
        variant="outline"
        onClick={() =>
          onChange(
            addParticipant(config, {
              id: `p${config.participants.length + 1}`,
              name: "New person",
            }),
          )
        }
      >
        + Add participant
      </Button>
    </div>
  );
}
