import type { ReactNode } from "react";

/**
 * Builder-chrome icons. Distinct from `StepIcon` (timeline-step iconography) —
 * these are the glyphs for buttons in the toolbar, row controls, and pickers.
 * 16px viewBox, currentColor stroke, slightly thicker (1.7) than StepIcon so
 * they read as solid affordances at 14–16px display size.
 */

function Svg({
  size = 16,
  strokeWidth = 1.7,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconArrowUp({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M8 13V3.5" />
      <path d="M3.8 7.7 8 3.5l4.2 4.2" />
    </Svg>
  );
}

export function IconArrowDown({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M8 3v9.5" />
      <path d="M3.8 8.3 8 12.5l4.2-4.2" />
    </Svg>
  );
}

export function IconUndo({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M3 7h7a3.5 3.5 0 0 1 0 7H6" />
      <path d="M5.6 4.2 2.6 7l3 2.8" />
    </Svg>
  );
}

export function IconRedo({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M13 7H6a3.5 3.5 0 0 0 0 7h4" />
      <path d="M10.4 4.2 13.4 7l-3 2.8" />
    </Svg>
  );
}

export function IconDuplicate({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <rect x="2.5" y="2.5" width="8" height="8" rx="1.4" />
      <path d="M5.5 13.5h7a1 1 0 0 0 1-1v-7" />
    </Svg>
  );
}

export function IconTrash({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M2.6 4.5h10.8" />
      <path d="M5.6 4.5v-1a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v1" />
      <path d="M4.3 4.5 5 12.7a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.7-8.2" />
      <path d="M6.8 7v4M9.2 7v4" />
    </Svg>
  );
}

export function IconClose({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M3.6 3.6l8.8 8.8" />
      <path d="M12.4 3.6l-8.8 8.8" />
    </Svg>
  );
}

/** Solid play triangle. */
export function IconPlay({ size }: { size?: number } = {}) {
  return (
    <Svg size={size} strokeWidth={1.4}>
      <path
        d="M4.5 3.2v9.6a.6.6 0 0 0 .9.5l7.5-4.8a.6.6 0 0 0 0-1l-7.5-4.8a.6.6 0 0 0-.9.5z"
        fill="currentColor"
      />
    </Svg>
  );
}

/** Two solid pause bars. */
export function IconPause({ size }: { size?: number } = {}) {
  return (
    <Svg size={size} strokeWidth={0}>
      <rect x="4" y="3" width="2.6" height="10" rx="0.6" fill="currentColor" />
      <rect
        x="9.4"
        y="3"
        width="2.6"
        height="10"
        rx="0.6"
        fill="currentColor"
      />
    </Svg>
  );
}

/** Skip back to previous step: triangle pointing left, vertical stop bar. */
export function IconStepBack({ size }: { size?: number } = {}) {
  return (
    <Svg size={size} strokeWidth={1.4}>
      <path d="M4 3.5v9" />
      <path
        d="M13 3.4v9.2a.5.5 0 0 1-.78.42L5.6 8.42a.5.5 0 0 1 0-.84l6.62-4.6A.5.5 0 0 1 13 3.4z"
        fill="currentColor"
      />
    </Svg>
  );
}

/** Skip forward to next step. */
export function IconStepForward({ size }: { size?: number } = {}) {
  return (
    <Svg size={size} strokeWidth={1.4}>
      <path d="M12 3.5v9" />
      <path
        d="M3 3.4v9.2a.5.5 0 0 0 .78.42l6.62-4.6a.5.5 0 0 0 0-.84L3.78 2.98A.5.5 0 0 0 3 3.4z"
        fill="currentColor"
      />
    </Svg>
  );
}

/**
 * Restart from the start. Counter-clockwise arc with an arrowhead at the
 * top-left, reading as "rewind back around to the beginning".
 */
export function IconRestart({ size }: { size?: number } = {}) {
  return (
    <Svg size={size}>
      <path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.45" />
      <path d="M2.6 2.6v3h3" />
    </Svg>
  );
}
