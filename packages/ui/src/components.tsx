import {
  cloneElement,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type ResolvedTheme = "light" | "dark";

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Root that scopes the design system + sets the theme. Wrap your app in it. */
export function ThemeRoot({
  theme = "dark",
  className,
  style,
  children,
}: {
  theme?: ResolvedTheme;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={cx("tc", className)} data-tc-theme={theme} style={style}>
      {children}
    </div>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "outline",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "tc-btn",
        `tc-btn--${variant}`,
        size !== "md" && `tc-btn--${size}`,
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx("tc-icon-btn", className)} {...props} />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("tc-input", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx("tc-select", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: ReactNode;
  /** Optional explanatory tooltip shown via an `ⓘ` next to the label. */
  hint?: string;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
}) {
  // Programmatically tie the label to its control. If no `htmlFor` is given and
  // the single child is an element without its own id, inject a generated one so
  // the `<label htmlFor>` association holds (axe `label` / `select-name`).
  const generatedId = useId();
  let control = children;
  let labelFor = htmlFor;
  if (!labelFor && isValidElement(children)) {
    const child = children as ReactElement<{ id?: string }>;
    if (child.props.id) {
      labelFor = child.props.id;
    } else {
      labelFor = generatedId;
      control = cloneElement(child, { id: generatedId });
    }
  }
  return (
    <div className={cx("tc-field", className)}>
      {label ? (
        <div className="tc-field-label-row">
          <label className="tc-label" htmlFor={labelFor}>
            {label}
          </label>
          {hint ? (
            <InfoTip
              text={hint}
              label={
                typeof label === "string" ? `${label}: more info` : undefined
              }
            />
          ) : null}
        </div>
      ) : null}
      {control}
    </div>
  );
}

export function Panel({
  raised,
  className,
  children,
  style,
}: {
  raised?: boolean;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("tc-panel", raised && "tc-panel--raised", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "accent" | "warn";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        "tc-badge",
        tone !== "neutral" && `tc-badge--${tone}`,
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      className={cx("tc-segmented", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="tc-segmented__item"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input type="range" className={cx("tc-slider", className)} {...props} />
  );
}

export function Kbd({ children }: { children?: ReactNode }) {
  return <kbd className="tc-kbd">{children}</kbd>;
}

/**
 * A small "ⓘ" affordance with a tooltip describing a control. CSS-driven
 * (hover + keyboard focus) so it stays server-renderable — no client hooks.
 */
export function InfoTip({ text, label }: { text: string; label?: string }) {
  return (
    <span className="tc-infotip-wrap">
      <button
        type="button"
        className="tc-infotip"
        aria-label={label ?? "More info"}
      >
        i
      </button>
      <span role="tooltip" className="tc-infotip-pop">
        {text}
      </span>
    </span>
  );
}

export function Heading({
  level = 2,
  className,
  children,
  ...rest
}: { level?: 0 | 1 | 2 } & HTMLAttributes<HTMLHeadingElement>) {
  const cls = level === 0 ? "tc-display" : level === 1 ? "tc-h1" : "tc-h2";
  const Tag = (level === 1 ? "h1" : level === 0 ? "h1" : "h2") as "h1" | "h2";
  return (
    <Tag className={cx(cls, className)} {...rest}>
      {children}
    </Tag>
  );
}
