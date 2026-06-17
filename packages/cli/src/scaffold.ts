import type { SkinDraft } from "@typecaast/capture/draft";

/**
 * `scaffold-skin` turns a captured `SkinDraft` into an **editable template-skin
 * package** (PLAN §10). The generated package plays back immediately via
 * `templateSkinFromDraft`, and its README is a per-capture cleanup checklist
 * derived from the draft's detection report + warnings — so the author knows
 * exactly which slots to confirm by hand (the capture gets ~80% there).
 *
 * Pure (string → files map) so it's unit-testable without touching disk.
 */

export interface SkinNames {
  id: string;
  name: string;
  varName: string;
}

export function toNames(input: string, fallback: string): SkinNames {
  const base = input.trim() || fallback;
  const id =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "captured-skin";
  const words = id.split("-").filter(Boolean);
  const name = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const varName =
    (words[0] ?? "skin") +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
  return { id, name, varName };
}

const INDEX = (
  n: SkinNames,
) => `import draft from "./draft.json" with { type: "json" };
import { templateSkinFromDraft } from "@typecaast/capture";
import { capabilities } from "./capabilities.js";
import type { SkinDraft } from "@typecaast/capture/draft";

/**
 * ${n.name} — a template skin scaffolded from a capture. It plays back as-is;
 * edit \`draft.json\` (the slot templates) and \`capabilities.ts\` to finish it,
 * then graduate to a hand-written component skin if you need full fidelity.
 */
export const ${n.varName} = templateSkinFromDraft(draft as SkinDraft, {
  id: "${n.id}",
  capabilities,
});
`;

const CAPABILITIES = `import type { Capabilities } from "@typecaast/skin-kit";

// Declare only what the captured UI can actually render. Start conservative.
export const capabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "fallback",
    reaction: "unsupported",
    system: "fallback",
    edit: "unsupported",
    delete: "unsupported",
    readReceipt: "unsupported",
    delay: "native",
  },
  content: { text: true, image: false },
  reactions: false,
  threads: false,
  readReceipts: false,
};
`;

function checklist(draft: SkinDraft): string {
  const d = draft.detection;
  const mark = (ok: boolean) => (ok ? "x" : " ");
  const has = (slot: string) => d.message.detected.includes(slot);
  const lines = [
    `- [${mark(d.message.found)}] **Message row** detected (confidence ${d.message.confidence.toFixed(2)})`,
    `- [${mark(has("author"))}] **Author** slot — confirm \`data-tc-slot="author"\` is on the name element`,
    `- [${mark(has("avatar"))}] **Avatar** slot — confirm \`data-tc-slot="avatar"\``,
    `- [${mark(has("body"))}] **Body** slot — confirm \`data-tc-slot="body"\` wraps the message text`,
    `- [${mark(has("time"))}] **Timestamp** slot — confirm \`data-tc-slot="time"\``,
    `- [${mark(d.composer.found)}] **Composer** detected`,
    `- [${mark(d.frame.found)}] **Frame** chrome with a \`data-tc-slot="messages"\` mount`,
  ];
  return lines.join("\n");
}

const README = (
  n: SkinNames,
  draft: SkinDraft,
) => `# ${n.name} (captured template skin)

Scaffolded by \`typecaast scaffold-skin\` from a captured UI${draft.meta.sourceUrl ? ` (${draft.meta.sourceUrl})` : ""}.

\`\`\`tsx
import { Typecaast } from "@typecaast/react";
import { ${n.varName} } from "./${n.id}/index.js";

<Typecaast config={config} skin={${n.varName}} autoplay loop />;
\`\`\`

## Confirm the slots (capture gets you ~80% there)

Open \`draft.json\` and check each slot marker. The distiller's auto-detection:

${checklist(draft)}
${
  draft.warnings.length
    ? `\n### Warnings from capture\n\n${draft.warnings.map((w) => `- ${w}`).join("\n")}\n`
    : ""
}
## Editing

- **draft.json → slots** — the slotted HTML for \`frame\`, \`message\`, \`composer\`.
  Move/add a \`data-tc-slot="…"\` marker to fix a mis-detected node.
- **draft.json → tokens** — rename/curate the extracted colors.
- **capabilities.ts** — declare only what the UI renders.

> ⚠️ Captured markup is untrusted: it's allowlist-sanitized and rendered in a
> shadow root at runtime (§10). Don't bundle proprietary fonts/marks. Name the
> skin \`"<Platform>-style"\`.
`;

/** All files for a scaffolded captured skin, keyed by relative path. */
export function scaffoldSkinFiles(
  draft: SkinDraft,
  nameInput = "",
): Record<string, string> {
  const n = toNames(nameInput, draft.meta.name);
  return {
    "draft.json": JSON.stringify(draft, null, 2) + "\n",
    "index.ts": INDEX(n),
    "capabilities.ts": CAPABILITIES,
    "README.md": README(n, draft),
  };
}
