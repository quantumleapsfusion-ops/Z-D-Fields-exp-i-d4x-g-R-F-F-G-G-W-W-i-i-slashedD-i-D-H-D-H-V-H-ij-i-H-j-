type LogoVariant = "rainbow" | "white" | "chalk";

type LogoProps = {
  /** `rainbow` is the primary mark; `white` and `chalk` are monochrome variants. */
  variant?: LogoVariant;
  size?: number;
  className?: string;
  title?: string;
};

const RAINBOW = [
  "#e8574a",
  "#ef9a3c",
  "#e9d25a",
  "#6cc07a",
  "#4aa6d8",
  "#7a6fd6",
  "#b06cc6",
];

/** The e1-4 mark: a Ψ set over a π, divided by a hairline rule. */
export function Logo({
  variant = "rainbow",
  size = 32,
  className,
  title = "e1-4",
}: LogoProps) {
  const gradientId = "e14-logo-rainbow";
  const stroke =
    variant === "rainbow"
      ? `url(#${gradientId})`
      : variant === "white"
        ? "#ffffff"
        : "rgb(var(--color-chalk))";
  const weight = variant === "chalk" ? 1.6 : 2;
  const ruleOpacity = variant === "chalk" ? 0.5 : 0.8;

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
            {RAINBOW.map((color, i) => (
              <stop key={color} offset={i / (RAINBOW.length - 1)} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
      ) : null}
      <g stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
        {/* Ψ */}
        <path d="M16 8v8a8 8 0 0 0 16 0V8" strokeWidth={weight} />
        <path d="M24 6v16" strokeWidth={weight} />
        {/* hairline rule */}
        <path d="M6 24h36" strokeWidth={1} strokeOpacity={ruleOpacity} />
        {/* π */}
        <path d="M14 30h20" strokeWidth={weight} />
        <path d="M20 30v12" strokeWidth={weight} />
        <path d="M29 30v9a3 3 0 0 0 4 3" strokeWidth={weight} />
      </g>
    </svg>
  );
}
