import type { ReactNode } from "react";
import type { ConfigInput, StepType } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { Badge, Button, Field, IconButton, Input, Select } from "@typecaast/ui";
import { STEP_GROUPS } from "./steps.js";
import { InfoTip, Tooltip } from "./Tooltip.js";
import { IconTrash } from "./icons.js";
import { stepCapability } from "./lint.js";

/**
 * Inline label + builder-side `InfoTip`. We use the JS-positioned tooltip from
 * `./Tooltip` (rather than `Field`'s `hint` prop, which renders the SSR-safe
 * `InfoTip` from `@typecaast/ui`) so the popover escapes the Options column's
 * `overflow:auto` clip.
 */
function L({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {children}
      <InfoTip text={tip} />
    </span>
  );
}

type Step = ConfigInput["timeline"][number];
type Participants = ConfigInput["participants"];
type SystemAction = {
  label: string;
  href?: string;
  variant?: "primary" | "secondary";
};

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
  tip,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  tip?: string;
  value: unknown;
  placeholder?: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <Field label={tip ? <L tip={tip}>{label}</L> : label}>
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

function ActionsEditor({
  actions,
  onChange,
}: {
  actions: SystemAction[];
  onChange: (actions: SystemAction[]) => void;
}) {
  const update = (i: number, patch: Partial<SystemAction>) => {
    onChange(actions.map((a, j) => (i === j ? { ...a, ...patch } : a)));
  };
  const remove = (i: number) => onChange(actions.filter((_, j) => j !== i));
  const add = () => onChange([...actions, { label: "" }]);

  return (
    <Field
      label={
        <L tip="Buttons rendered alongside the system message. Add a URL to make a button open in a new tab; without one it shows a 'not-allowed' cursor. Variant controls visual emphasis.">
          Actions
        </L>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actions.map((a, i) => (
          <div
            key={i}
            style={{
              // Two rows; URL spans the full label+variant span on row 2 so it
              // has room to breathe. Trash column lines up across both rows
              // and is visually empty on the URL row.
              display: "grid",
              gridTemplateColumns: "1fr 110px auto",
              rowGap: 4,
              columnGap: 6,
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Label"
              value={a.label}
              onChange={(e) => update(i, { label: e.currentTarget.value })}
            />
            <Select
              value={a.variant ?? (i === 0 ? "primary" : "secondary")}
              onChange={(e) =>
                update(i, {
                  variant: e.currentTarget.value as "primary" | "secondary",
                })
              }
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </Select>
            <Tooltip text="Remove action">
              <IconButton aria-label="Remove action" onClick={() => remove(i)}>
                <IconTrash size={14} />
              </IconButton>
            </Tooltip>
            <div style={{ gridColumn: "1 / span 2" }}>
              <Input
                placeholder="https://… (optional, opens in a new tab)"
                value={a.href ?? ""}
                onChange={(e) =>
                  update(i, { href: e.currentTarget.value || undefined })
                }
              />
            </div>
          </div>
        ))}
        <div>
          <Button size="sm" variant="outline" onClick={add}>
            + Add action
          </Button>
        </div>
      </div>
    </Field>
  );
}

export function StepEditor({
  step,
  participants,
  skin,
  onChange,
  onChangeType,
}: {
  step: Step;
  participants: Participants;
  /** Active skin — drives the disabled state of unsupported step types. */
  skin?: Skin;
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

  // What the active skin does (or doesn't do) with the current step type. We
  // use this both to decorate the row and to grey out unsupported types in the
  // "switch type" picker — but we never block the user from leaving the type
  // alone, so existing data is never silently mangled when the skin changes.
  const currentCap = stepCapability(type, skin);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {currentCap.support === "unsupported" ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            padding: 10,
            border: "1px solid var(--tc-border)",
            borderRadius: 8,
            background: "var(--tc-warn-bg, rgba(250, 176, 5, 0.10))",
          }}
        >
          <Badge tone="warn">drop</Badge>
          <span
            className="tc-muted"
            style={{ fontSize: 12.5, lineHeight: 1.4 }}
          >
            {currentCap.reason} It will be skipped at render time until you
            change the skin or this step.
          </span>
        </div>
      ) : null}

      <Field label={<L tip="What this step does on the timeline.">Type</L>}>
        <Select
          value={type}
          onChange={(e) => onChangeType(e.currentTarget.value as StepType)}
        >
          {STEP_GROUPS.map((g) => (
            <optgroup key={g.name} label={g.name}>
              {g.types.map((t) => {
                const cap = stepCapability(t, skin);
                const unsupported = cap.support === "unsupported";
                // Keep the current value selectable so React doesn't snap the
                // select to the first enabled option — only flag the *other*
                // unsupported types as disabled.
                const isCurrent = t === type;
                return (
                  <option
                    key={t}
                    value={t}
                    disabled={unsupported && !isCurrent}
                  >
                    {t}
                    {unsupported && skin ? ` — not in ${skin.meta.name}` : ""}
                  </option>
                );
              })}
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
        <p
          className="tc-muted"
          style={{ fontSize: 12, margin: 0, lineHeight: 1.45 }}
        >
          Animates text being typed into the reply box, separately from{" "}
          <code>send</code>. Use this when you need typing to overlap with other
          timeline events — e.g. another participant sends a message while the
          viewer is mid-sentence, or the viewer types, pauses, edits, then
          sends. For a simple &ldquo;viewer types and sends&rdquo; a plain{" "}
          <code>message</code> from the viewer auto-animates through the
          composer.
        </p>
      ) : null}

      {hasFrom ? (
        <Field label={<L tip="Which participant performs this step.">From</L>}>
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
        <Field
          label={<L tip="The message content. Supports markdown.">Text</L>}
        >
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
          label={
            <L tip="Id of the message to react to / edit / delete. Leave blank to target the most-recent message.">
              Target (message id)
            </L>
          }
        >
          <Input
            value={(get(step, "target") as string) ?? ""}
            placeholder="previous message"
            onChange={(e) =>
              onChange({ target: e.currentTarget.value || undefined })
            }
          />
        </Field>
      ) : null}

      {type === "reaction" ? (
        <Field label={<L tip="Emoji shown as the reaction.">Emoji</L>}>
          <Input
            value={(get(step, "emoji") as string) ?? ""}
            onChange={(e) => onChange({ emoji: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "system" ? (
        <Field
          label={
            <L tip="System card id provided by the skin (e.g. pr-opened, deploy-success).">
              Card
            </L>
          }
        >
          <Input
            value={(get(step, "card") as string) ?? ""}
            placeholder="e.g. pr-opened"
            onChange={(e) => onChange({ card: e.currentTarget.value })}
          />
        </Field>
      ) : null}

      {type === "system" ? (
        <ActionsEditor
          actions={(get(step, "actions") as SystemAction[] | undefined) ?? []}
          onChange={(actions) =>
            onChange({ actions: actions.length > 0 ? actions : undefined })
          }
        />
      ) : null}

      {type === "delay" ? (
        <NumberField
          label="Duration (ms)"
          tip="How long this delay pauses the timeline."
          value={get(step, "duration")}
          onChange={(v) => onChange({ duration: v ?? 0 })}
        />
      ) : null}

      {type === "typing" ? (
        <NumberField
          label="Show typing for (ms)"
          tip="How long the typing indicator is visible. Auto = derived from the next message length."
          value={get(step, "showTypingFor")}
          placeholder="auto"
          onChange={(v) => onChange({ showTypingFor: v })}
        />
      ) : null}

      {type === "reaction" ? (
        <NumberField
          label="Reaction delay (ms)"
          tip="Gap between the target message appearing and this reaction landing. Leave blank for the default beat (~1000ms with humanise jitter)."
          value={get(step, "delay")}
          placeholder="1000"
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
          label={
            <L tip="Stable id you can target from later steps (reactions, edits, deletes). Otherwise auto-generated.">
              Id (optional)
            </L>
          }
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
            label={
              <L tip="Skips the auto-paced gap and reveal animation. On the first step, the message appears at t=0. Manual `delay` steps still take effect.">
                Instant
              </L>
            }
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
