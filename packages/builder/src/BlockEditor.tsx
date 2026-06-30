import type { ConfigInput } from "@typecaast/schema";
import { Button, IconButton, Input, Select } from "@typecaast/ui";
import { InfoTip, Tooltip } from "./Tooltip.js";
import { IconArrowDown, IconArrowUp, IconTrash } from "./icons.js";

/**
 * A typed Block Kit editor — the authoring UI for an app message's `content`.
 * Blocks are stored in sugar form (text strings, normalized to spans by the
 * engine) and edits spread the original node, so fields the UI doesn't expose
 * (section accessory/fields, context images) round-trip untouched.
 */

type Block = Record<string, unknown>;
type Participants = ConfigInput["participants"];

/** The block types offered in the "add block" menu, with their display labels. */
const BLOCK_TYPES: { type: string; label: string }[] = [
  { type: "header", label: "Header" },
  { type: "section", label: "Text" },
  { type: "codeblock", label: "Code" },
  { type: "context", label: "Context" },
  { type: "divider", label: "Divider" },
  { type: "actions", label: "Buttons" },
  { type: "image", label: "Image" },
  { type: "attachment", label: "Attachment" },
];

const LABELS: Record<string, string> = Object.fromEntries(
  BLOCK_TYPES.map((b) => [b.type, b.label]),
);

function blankBlock(type: string): Block {
  switch (type) {
    case "header":
      return { type: "header", text: "" };
    case "section":
      return { type: "section", text: "" };
    case "codeblock":
      return { type: "codeblock", text: "" };
    case "context":
      return { type: "context", elements: [{ type: "text", text: "" }] };
    case "divider":
      return { type: "divider" };
    case "actions":
      return { type: "actions", elements: [{ type: "button", label: "" }] };
    case "image":
      return { type: "image", src: "" };
    case "attachment":
      return { type: "attachment", content: [] };
    default:
      return { type };
  }
}

function Area({
  value,
  placeholder,
  onChange,
  mono = false,
  height = 52,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  /** Monospaced, non-wrapping field for preformatted text (code blocks). */
  mono?: boolean;
  height?: number;
}) {
  return (
    <textarea
      className="tc-input"
      placeholder={placeholder}
      // `wrap=off` keeps columns aligned while authoring a table.
      wrap={mono ? "off" : undefined}
      style={{
        height,
        padding: "6px 9px",
        resize: "vertical",
        lineHeight: mono ? 1.5 : 1.4,
        ...(mono
          ? {
              fontFamily: "Menlo, Monaco, Consolas, monospace",
              fontSize: 12.5,
              whiteSpace: "pre",
              overflowX: "auto",
            }
          : {}),
      }}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}

/** A "+ mention" dropdown that appends a `<@id>` token to a text field. */
function MentionInsert({
  participants,
  onInsert,
}: {
  participants: Participants;
  onInsert: (token: string) => void;
}) {
  if (participants.length === 0) return null;
  return (
    <Select
      aria-label="Insert mention"
      value=""
      onChange={(e) => {
        const id = e.currentTarget.value;
        if (id) onInsert(`<@${id}>`);
      }}
    >
      <option value="">＋ mention…</option>
      {participants.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  );
}

/** The buttons (an `actions` block or a section accessory) sub-editor. */
function ButtonsField({
  buttons,
  onChange,
}: {
  buttons: Block[];
  onChange: (buttons: Block[]) => void;
}) {
  const update = (i: number, patch: Block) =>
    onChange(buttons.map((b, j) => (i === j ? { ...b, ...patch } : b)));
  const remove = (i: number) => onChange(buttons.filter((_, j) => j !== i));
  const add = () => onChange([...buttons, { type: "button", label: "" }]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {buttons.map((b, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 110px auto",
            rowGap: 4,
            columnGap: 6,
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Label"
            value={(b.label as string) ?? ""}
            onChange={(e) => update(i, { label: e.currentTarget.value })}
          />
          <Select
            value={(b.style as string) ?? "default"}
            onChange={(e) =>
              update(i, {
                style:
                  e.currentTarget.value === "default"
                    ? undefined
                    : e.currentTarget.value,
              })
            }
          >
            <option value="default">Default</option>
            <option value="primary">Primary</option>
            <option value="danger">Danger</option>
          </Select>
          <Tooltip text="Remove button">
            <IconButton aria-label="Remove button" onClick={() => remove(i)}>
              <IconTrash size={14} />
            </IconButton>
          </Tooltip>
          <div style={{ gridColumn: "1 / span 2" }}>
            <Input
              placeholder="https://… (optional, opens in a new tab)"
              value={(b.href as string) ?? ""}
              onChange={(e) =>
                update(i, { href: e.currentTarget.value || undefined })
              }
            />
          </div>
        </div>
      ))}
      <div>
        <Button size="sm" variant="outline" onClick={add}>
          + Add button
        </Button>
      </div>
    </div>
  );
}

/** A single block's type-specific fields. */
function BlockFields({
  block,
  participants,
  onChange,
}: {
  block: Block;
  participants: Participants;
  onChange: (patch: Block) => void;
}) {
  const type = block.type as string;
  const text = (block.text as string) ?? "";
  const appendText = (token: string) =>
    onChange({
      text: `${text}${text && !text.endsWith(" ") ? " " : ""}${token}`,
    });

  if (type === "header") {
    return (
      <Input
        placeholder="Heading text"
        value={text}
        onChange={(e) => onChange({ text: e.currentTarget.value })}
      />
    );
  }
  if (type === "section") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Area
          value={text}
          placeholder="Body text — *bold*, _italic_, `code`, <@id> mentions"
          onChange={(v) => onChange({ text: v })}
        />
        <MentionInsert participants={participants} onInsert={appendText} />
      </div>
    );
  }
  if (type === "codeblock") {
    return (
      <Area
        value={text}
        mono
        height={120}
        placeholder={
          "Preformatted text — rendered verbatim in a monospaced box\n(tables, logs, snippets). Not parsed for *marks*."
        }
        onChange={(v) => onChange({ text: v })}
      />
    );
  }
  if (type === "context") {
    // The builder edits a single text element; image elements / multiple
    // elements round-trip from JSON untouched (we only rewrite element 0).
    const elements = Array.isArray(block.elements)
      ? (block.elements as Block[])
      : [];
    const first = elements[0];
    const ctxText = (first?.text as string) ?? "";
    const setCtx = (v: string) => {
      const next = [...elements];
      next[0] = { ...(first ?? { type: "text" }), type: "text", text: v };
      onChange({ elements: next });
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Input
          placeholder="Small grey context — emoji, *bold*, <@id> mentions"
          value={ctxText}
          onChange={(e) => setCtx(e.currentTarget.value)}
        />
        <MentionInsert
          participants={participants}
          onInsert={(token) =>
            setCtx(
              `${ctxText}${ctxText && !ctxText.endsWith(" ") ? " " : ""}${token}`,
            )
          }
        />
      </div>
    );
  }
  if (type === "divider") {
    return (
      <p className="tc-muted" style={{ fontSize: 12, margin: 0 }}>
        A horizontal rule between blocks.
      </p>
    );
  }
  if (type === "actions") {
    const buttons = Array.isArray(block.elements)
      ? (block.elements as Block[])
      : [];
    return (
      <ButtonsField
        buttons={buttons}
        onChange={(elements) => onChange({ elements })}
      />
    );
  }
  if (type === "image") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Input
          placeholder="Image URL"
          value={(block.src as string) ?? ""}
          onChange={(e) => onChange({ src: e.currentTarget.value })}
        />
        <Input
          placeholder="Alt text (optional)"
          value={(block.alt as string) ?? ""}
          onChange={(e) =>
            onChange({ alt: e.currentTarget.value || undefined })
          }
        />
      </div>
    );
  }
  if (type === "attachment") {
    const nested = Array.isArray(block.content)
      ? (block.content as Block[])
      : [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Input
          placeholder="Bar color (e.g. #36a64f) — optional"
          value={(block.color as string) ?? ""}
          onChange={(e) =>
            onChange({ color: e.currentTarget.value || undefined })
          }
        />
        <BlockEditor
          content={nested}
          participants={participants}
          nested
          onChange={(content) => onChange({ content: content ?? [] })}
        />
      </div>
    );
  }
  return null;
}

export function BlockEditor({
  content,
  participants,
  onChange,
  nested = false,
}: {
  content: Block[] | undefined;
  participants: Participants;
  onChange: (content: Block[] | undefined) => void;
  nested?: boolean;
}) {
  const blocks = content ?? [];
  const commit = (next: Block[]) =>
    onChange(next.length > 0 ? next : undefined);
  const update = (i: number, patch: Block) =>
    commit(blocks.map((b, j) => (i === j ? { ...b, ...patch } : b)));
  const remove = (i: number) => commit(blocks.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j]!, next[i]!];
    commit(next);
  };
  const add = (type: string) => commit([...blocks, blankBlock(type)]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {blocks.map((block, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--tc-border)",
            borderRadius: 8,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>
              {LABELS[block.type as string] ?? (block.type as string)}
            </span>
            <Tooltip text="Move up">
              <IconButton
                aria-label="Move block up"
                onClick={() => move(i, -1)}
              >
                <IconArrowUp size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip text="Move down">
              <IconButton
                aria-label="Move block down"
                onClick={() => move(i, 1)}
              >
                <IconArrowDown size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip text="Remove block">
              <IconButton aria-label="Remove block" onClick={() => remove(i)}>
                <IconTrash size={14} />
              </IconButton>
            </Tooltip>
          </div>
          <BlockFields
            block={block}
            participants={participants}
            onChange={(patch) => update(i, patch)}
          />
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Select
          aria-label="Add block"
          value=""
          onChange={(e) => {
            if (e.currentTarget.value) add(e.currentTarget.value);
          }}
        >
          <option value="">
            {nested ? "+ Add nested block…" : "+ Add block…"}
          </option>
          {BLOCK_TYPES.map((b) => (
            <option key={b.type} value={b.type}>
              {b.label}
            </option>
          ))}
        </Select>
        {!nested ? (
          <InfoTip text="Block Kit blocks for an app message (header, text, context, buttons, …). If any blocks are present they render instead of the plain Text above. Slack renders the full set; other skins show the text and skip the rest." />
        ) : null}
      </div>
    </div>
  );
}
