import { brand } from "./brand";

type LogoVariant = "rainbow" | "mono";

type LogoProps = {
  /** `rainbow` is the primary mark; `mono` takes `currentColor` (accent, text, …). */
  variant?: LogoVariant;
  size?: number;
  className?: string;
  title?: string;
};

/** The e1-4 mark: a Ψ set over a π, divided by a hairline rule. */
export function E14Mark({
  variant = "rainbow",
  size = 32,
  className,
  title = "e1-4",
}: LogoProps) {
  const gradientId = "e14-logo-rainbow";
  const stroke = variant === "rainbow" ? `url(#${gradientId})` : "currentColor";

  return (
    <svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{title}</title>
      {variant === "rainbow" ? (
        <defs>
          <linearGradient
            id={gradientId}
            x1="8"
            y1="6"
            x2="40"
            y2="42"
            gradientUnits="userSpaceOnUse"
          >
            {brand.rainbow.map((color, i) => (
              <stop
                key={color}
                offset={i / (brand.rainbow.length - 1)}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>
      ) : null}
      <g stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
        {/* Ψ */}
        <path d="M16 8v8a8 8 0 0 0 16 0V8" strokeWidth={2} />
        <path d="M24 6v16" strokeWidth={2} />
        {/* hairline rule */}
        <path d="M6 24h36" strokeWidth={1} strokeOpacity={0.6} />
        {/* π */}
        <path d="M14 30h20" strokeWidth={2} />
        <path d="M20 30v12" strokeWidth={2} />
        <path d="M29 30v9a3 3 0 0 0 4 3" strokeWidth={2} />
      </g>
    </svg>
  );
}

/** Backwards-compatible alias. */
export const Logo = E14Mark;

type MonolithMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * The Earth 1 "monolith": a circle, a dashed inner circle, and a vertical bar crossed by a
 * horizontal beam in the upper third. Strokes take `currentColor`.
 */
export function MonolithMark({
  size = 32,
  className,
  title = "Earth 1",
}: MonolithMarkProps) {
  return (
    <svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{title}</title>
      <g stroke="currentColor" strokeLinecap="round">
        <circle cx="24" cy="24" r="21" strokeWidth={1.5} />
        <circle cx="24" cy="24" r="14" strokeWidth={1} strokeDasharray="2.4 3.6" />
        <path d="M24 9v30" strokeWidth={2} />
        <path d="M13 19h22" strokeWidth={2} />
      </g>
    </svg>
  );
}
