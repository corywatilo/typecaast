import type { ConfigInput, StepType } from "@typecaast/schema";
import { Field, Input, Select } from "@typecaast/ui";
import { STEP_GROUPS } from "./steps.js";

type Step = ConfigInput["timeline"][number];
type Participants = ConfigInput["participants"];

function get(step: Step, key: string): unknown {
  return (step as Record<string, unknown>)[key];
}

function Textarea({
  id,
  value,
  placeholder,
  onChange,
}: {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      id={id}
      className="tc-input"
      placeholder={placeholder}
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
  hint,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  hint?: string;
  value: unknown;
  placeholder?: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <Field label={label} hint={hint}>
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
  onChangeType,
}: {
  step: Step;
  participants: Participants;
  onChange: (patch: Record<string, unknown>) => void;
  /** Change the step's type (transforms the step, preserving compatible fields). */
  onChangeType: (type: StepType) => void;
}) {
  const type = step.type;
  // `send` deliberately has no From — it commits the preceding composer and
  // inherits whoever was typing (see compile.ts).
  const hasFrom = ["message", "typing", "composerType", "system"].includes(
    type,
  );
  const hasText = ["message", "composerType", "system", "edit"].includes(type);
  const hasTarget = ["reaction", "edit", "delete"].includes(type);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Type" hint="What this step does on the timeline.">
        <Select
          value={type}
          onChange={(e) => onChangeType(e.currentTarget.value as StepType)}
        >
          {STEP_GROUPS.map((g) => (
            <optgroup key={g.name} label={g.name}>
              {g.types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      {type === "send" ? (
        <p className="tc-muted" style={{ fontSize: 12, margin: 0 }}>
          Commits the preceding <code>composerType</code> as a message, sent by
          whoever was typing.
        </p>
      ) : null}

      {type === "composerType" ? (
        <p className="tc-muted" style={{ fontSize: 12, margin: 0 }}>
          Advanced: only needed for type-pause-retype choreography. A plain{" "}
          <code>message</code> from the viewer auto-renders through the
          composer.
        </p>
      ) : null}

      {hasFrom ? (
        <Field label="From" hint="Which participant performs this step.">
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
        <Field label="Text" hint="The message content. Supports markdown.">
          <Textarea
            value={(get(step, "text") as string) ?? ""}
            placeholder={
              type === "edit"
                ? "New text…"
                : type === "system"
                  ? "System card text…"
                  : type === "composerType"
                    ? "Type into the composer…"
                    : "Type a message…"
            }
            onChange={(v) => onChange({ text: v })}
          />
        </Field>
      ) : null}

      {hasTarget ? (
        <Field
          label="Target (message id or $prev)"
          hint="The id of the message to react to / edit / delete. Use $prev for the immediately previous message."
        >
          <Input
            value={(get(step, "target") as string) ?? ""}
            onChange={(e) => onChange({ target: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "reaction" ? (
        <Field label="Emoji" hint="Emoji shown as the reaction.">
          <Input
            value={(get(step, "emoji") as string) ?? ""}
            onChange={(e) => onChange({ emoji: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "system" ? (
        <Field
          label="Card"
          hint="System card id provided by the skin (e.g. pr-opened, deploy-success)."
        >
          <Input
            value={(get(step, "card") as string) ?? ""}
            placeholder="e.g. pr-opened"
            onChange={(e) => onChange({ card: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "delay" ? (
        <NumberField
          label="Duration (ms)"
          hint="How long this delay pauses the timeline."
          value={get(step, "duration")}
          onChange={(v) => onChange({ duration: v ?? 0 })}
        />
      ) : null}

      {type === "typing" ? (
        <NumberField
          label="Show typing for (ms)"
          hint="How long the typing indicator is visible. Auto = derived from the next message length."
          value={get(step, "showTypingFor")}
          placeholder="auto"
          onChange={(v) => onChange({ showTypingFor: v })}
        />
      ) : null}

      {type === "reaction" ? (
        <NumberField
          label="Reaction delay (ms)"
          hint="Gap between the target message appearing and this reaction landing. Auto = a humanised default."
          value={get(step, "delay")}
          placeholder="auto"
          onChange={(v) => onChange({ delay: v })}
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
        <Field
          label="Id (optional)"
          hint="Stable id you can target from later steps (reactions, edits, deletes). Otherwise auto-generated."
        >
          <Input
            value={(get(step, "id") as string) ?? ""}
            placeholder="m1"
            onChange={(e) =>
              onChange({ id: e.currentTarget.value || undefined })
            }
          />
        </Field>
        {type === "message" || type === "system" ? (
          <Field
            label="Instant"
            hint="Skip the auto-paced delay and reveal animation. On the first step, the message appears at t=0."
          >
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
        ) : null}
      </div>
    </div>
  );
}
