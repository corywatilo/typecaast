import { XIcon } from "./icons";

const X_FOLLOW_URL = "https://x.com/intent/follow?screen_name=ninepixelgrid";

/**
 * "Follow on X" button for @ninepixelgrid. Icon-only by default (compact enough
 * for the nav); pass `showLabel` to include the text.
 */
export function XFollow({
  size = "sm",
  showLabel = false,
}: {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  return (
    <a
      href={X_FOLLOW_URL}
      target="_blank"
      rel="noreferrer"
      className={`tc-btn tc-btn--ghost tc-btn--${size}`}
      aria-label="Follow @ninepixelgrid on X"
      title="Follow @ninepixelgrid on X"
    >
      <XIcon />
      {showLabel ? <span>Follow on X</span> : null}
    </a>
  );
}
