import type { ReactNode } from "react";
import { STEP_TYPES, type StepType } from "@typecaast/schema";
import { IconButton } from "@typecaast/ui";
import { IconClose } from "./icons.js";
import { Tooltip } from "./Tooltip.js";

/**
 * One source of truth for how each timeline step type is presented: a small
 * inline icon, a one-line "when to use" description, and a logical group. Used by
 * the timeline rows, the add-step picker, and the editable Type select.
 */

export type StepGroup =
  | "Messages"
  | "Reactions & edits"
  | "Timing"
  | "Advanced";

interface StepMeta {
  description: string;
  group: StepGroup;
}

export const STEP_META: Record<StepType, StepMeta> = {
  message: {
    description:
      "A chat message from a participant. Self messages auto-render via the composer.",
    group: "Messages",
  },
  system: {
    description: "An app or bot card (e.g. a PR opened).",
    group: "Messages",
  },
  typing: {
    description: "A “typing…” indicator from someone.",
    group: "Messages",
  },
  reaction: {
    description: "An emoji reaction on a message.",
    group: "Reactions & edits",
  },
  edit: {
    description: "Change an earlier message's text.",
    group: "Reactions & edits",
  },
  delete: {
    description: "Remove an earlier message.",
    group: "Reactions & edits",
  },
  readReceipt: {
    description: "Mark messages as read.",
    group: "Timing",
  },
  delay: {
    description: "An explicit pause in the timeline.",
    group: "Timing",
  },
  composerType: {
    description:
      "Animate text being typed into the reply box, separate from sending. Use when typing should overlap other timeline events.",
    group: "Advanced",
  },
  send: {
    description: "Commit the preceding composerType as a sent message.",
    group: "Advanced",
  },
};

/** Step types grouped + ordered for the picker and the Type select. */
export const STEP_GROUPS: { name: StepGroup; types: StepType[] }[] = (() => {
  const order: StepGroup[] = [
    "Messages",
    "Reactions & edits",
    "Timing",
    "Advanced",
  ];
  return order.map((name) => ({
    name,
    types: STEP_TYPES.filter((t) => STEP_META[t].group === name),
  }));
})();

// ── Icons ────────────────────────────────────────────────────────────────────
// 16px monochrome line icons (currentColor). No icon library in the repo — these
// match the minimal, glyph-based aesthetic of the rest of the builder.

function Svg({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const dot = (cx: number, cy: number) => (
  <circle cx={cx} cy={cy} r={0.85} fill="currentColor" stroke="none" />
);

const ICONS: Record<StepType, ReactNode> = {
  message: (
    <>
      <rect x="2.2" y="3" width="11.6" height="8" rx="2" />
      <path d="M5.2 11v2.4L8 11" />
    </>
  ),
  system: (
    <>
      <rect x="2.4" y="3" width="11.2" height="10" rx="1.6" />
      <path d="M2.4 6h11.2" />
      {dot(4.3, 4.5)}
    </>
  ),
  typing: (
    <>
      <rect x="2.2" y="3" width="11.6" height="8" rx="2" />
      <path d="M5.2 11v2.4L8 11" />
      {dot(5.4, 7)}
      {dot(8, 7)}
      {dot(10.6, 7)}
    </>
  ),
  composerType: (
    <>
      <path d="M8 3v10" />
      <path d="M6 3h4" />
      <path d="M6 13h4" />
    </>
  ),
  send: <path d="M14.2 1.8 1.6 6.9l5 2 2 5 5.6-12.1Z" />,
  reaction: (
    <>
      <circle cx="8" cy="8" r="6" />
      {dot(6, 6.8)}
      {dot(10, 6.8)}
      <path d="M5.6 9.9c.65 1.2 1.5 1.8 2.4 1.8s1.75-.6 2.4-1.8" />
    </>
  ),
  edit: (
    <>
      <path d="M10.8 2.6 13.4 5.2 6 12.6l-3 .6.6-3z" />
      <path d="M9.6 3.8 12.2 6.4" />
    </>
  ),
  delete: (
    <>
      <path d="M3 4.5h10" />
      <path d="M5.5 4.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" />
      <path d="M4.6 4.5 5.3 12.6a1 1 0 0 0 1 .9h3.4a1 1 0 0 0 1-.9l.7-8.1" />
      <path d="M7 7v4M9 7v4" />
    </>
  ),
  readReceipt: (
    <>
      <path d="M1.6 8.4 4.4 11l5.4-6.4" />
      <path d="M8.2 11l.4.4 5.4-6.4" />
    </>
  ),
  delay: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.6V8l2.4 1.5" />
    </>
  ),
};

export function StepIcon({
  type,
  size = 16,
}: {
  type: StepType;
  size?: number;
}) {
  return <Svg size={size}>{ICONS[type]}</Svg>;
}

// ── Grouped add-step picker ──────────────────────────────────────────────────

export function StepPicker({
  onAdd,
  onClose,
}: {
  onAdd: (type: StepType) => void;
  onClose: () => void;
}) {
  return (
    <div className="tc-steppick">
      <div className="tc-steppick-header">
        <span className="tc-steppick-title">Add step</span>
        <Tooltip text="Close">
          <IconButton
            aria-label="Close"
            onClick={onClose}
            style={{ width: 24, height: 24 }}
          >
            <IconClose size={12} />
          </IconButton>
        </Tooltip>
      </div>
      {STEP_GROUPS.map((g) => (
        <div key={g.name}>
          <div className="tc-steppick-group">{g.name}</div>
          {g.types.map((t) => (
            <button
              key={t}
              type="button"
              className="tc-steppick-item"
              onClick={() => onAdd(t)}
            >
              <span className="tc-steppick-icon">
                <StepIcon type={t} />
              </span>
              <span className="tc-steppick-text">
                <span className="tc-steppick-name tc-mono">{t}</span>
                <span className="tc-steppick-desc">
                  {STEP_META[t].description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
