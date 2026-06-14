import type { ConfigInput } from "@typecaast/schema";
import { Field, Input, Select } from "@typecaast/ui";

type Step = ConfigInput["timeline"][number];
type Participants = ConfigInput["participants"];

function get(step: Step, key: string): unknown {
  return (step as Record<string, unknown>)[key];
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className="tc-input"
      style={{
        height: 64,
        padding: "7px 10px",
        resize: "vertical",
        lineHeight: 1.4,
      }}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: unknown;
  placeholder?: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        placeholder={placeholder}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => {
          const v = e.currentTarget.value;
          onChange(v === "" ? undefined : Number(v));
        }}
      />
    </Field>
  );
}

export function StepEditor({
  step,
  participants,
  onChange,
}: {
  step: Step;
  participants: Participants;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const type = step.type;
  const hasFrom = [
    "message",
    "typing",
    "composerType",
    "send",
    "system",
  ].includes(type);
  const hasText = ["message", "composerType", "system", "edit"].includes(type);
  const hasTarget = ["reaction", "edit", "delete"].includes(type);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Type">
        <Input value={type} disabled />
      </Field>

      {hasFrom ? (
        <Field label="From">
          <Select
            value={(get(step, "from") as string) ?? ""}
            onChange={(e) => onChange({ from: e.currentTarget.value })}
          >
            <option value="">—</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {hasText ? (
        <Field label="Text">
          <Textarea
            value={(get(step, "text") as string) ?? ""}
            onChange={(v) => onChange({ text: v })}
          />
        </Field>
      ) : null}

      {hasTarget ? (
        <Field label="Target (message id or $prev)">
          <Input
            value={(get(step, "target") as string) ?? ""}
            onChange={(e) => onChange({ target: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "reaction" ? (
        <Field label="Emoji">
          <Input
            value={(get(step, "emoji") as string) ?? ""}
            onChange={(e) => onChange({ emoji: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "system" ? (
        <Field label="Card">
          <Input
            value={(get(step, "card") as string) ?? ""}
            placeholder="e.g. pr-opened"
            onChange={(e) => onChange({ card: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "beat" ? (
        <NumberField
          label="Duration (ms)"
          value={get(step, "duration")}
          onChange={(v) => onChange({ duration: v ?? 0 })}
        />
      ) : null}

      {type === "typing" ? (
        <NumberField
          label="Show typing for (ms)"
          value={get(step, "showTypingFor")}
          placeholder="auto"
          onChange={(v) => onChange({ showTypingFor: v })}
        />
      ) : null}

      <div
        style={{
          marginTop: 4,
          paddingTop: 12,
          borderTop: "1px solid var(--tc-border)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <NumberField
          label="Delay (ms)"
          value={get(step, "delay")}
          placeholder="auto"
          onChange={(v) => onChange({ delay: v })}
        />
        <NumberField
          label="Hold after (ms)"
          value={get(step, "holdAfter")}
          placeholder="0"
          onChange={(v) => onChange({ holdAfter: v })}
        />
        <Field label="Id (optional)">
          <Input
            value={(get(step, "id") as string) ?? ""}
            placeholder="m1"
            onChange={(e) =>
              onChange({ id: e.currentTarget.value || undefined })
            }
          />
        </Field>
        <Field label="Instant">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 32,
            }}
          >
            <input
              type="checkbox"
              checked={get(step, "instant") === true}
              onChange={(e) => onChange({ instant: e.currentTarget.checked })}
            />
            <span className="tc-muted" style={{ fontSize: 12 }}>
              no animation / delay
            </span>
          </label>
        </Field>
      </div>
    </div>
  );
}
