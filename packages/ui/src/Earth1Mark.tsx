import { useId } from "react";

type Earth1MarkProps = {
  size?: number;
  className?: string;
  /** Accessible name. Omit for a purely decorative mark (it is then `aria-hidden`). */
  title?: string;
};

/**
 * The earth1.co mark: a continuous vertical bar crossed by a horizontal beam in its
 * upper third, inside a solid outer circle and a dashed inner circle. No wordmark.
 * Draws in `currentColor`, so it follows the surrounding text colour in light and dark.
 */
export function Earth1Mark({ size = 32, className, title }: Earth1MarkProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? `${id}-title` : undefined}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {title ? <title id={`${id}-title`}>{title}</title> : null}
      <circle cx="50" cy="50" r="46" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="35" strokeWidth="1.6" strokeDasharray="0.1 5.4" />
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="5" />
      <line x1="31" y1="40" x2="69" y2="40" strokeWidth="4" />
    </svg>
  );
}
