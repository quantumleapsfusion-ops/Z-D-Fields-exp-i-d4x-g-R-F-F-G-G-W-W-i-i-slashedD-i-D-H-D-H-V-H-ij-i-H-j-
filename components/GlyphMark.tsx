type GlyphMarkProps = {
  variant?: 'chalk' | 'outline';
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Placeholder brand mark: a Ψ set over a π, divided by a hairline rule.
 * `chalk` renders soft chalk strokes for the chalkboard surface;
 * `outline` renders a crisp white outline for black backgrounds.
 */
export function GlyphMark({
  variant = 'chalk',
  size = 32,
  className,
  title = 'e1-4 mark',
}: GlyphMarkProps) {
  const stroke = variant === 'outline' ? '#ffffff' : 'rgb(var(--color-chalk))';
  const opacity = variant === 'outline' ? 1 : 0.92;

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
      <g stroke={stroke} strokeOpacity={opacity} strokeLinecap="round" strokeLinejoin="round">
        {/* Ψ */}
        <path d="M16 8v8a8 8 0 0 0 16 0V8" strokeWidth={variant === 'outline' ? 2 : 1.6} />
        <path d="M24 6v16" strokeWidth={variant === 'outline' ? 2 : 1.6} />
        {/* hairline rule */}
        <path d="M6 24h36" strokeWidth={1} strokeOpacity={variant === 'outline' ? 0.9 : 0.5} />
        {/* π */}
        <path d="M14 30h20" strokeWidth={variant === 'outline' ? 2 : 1.6} />
        <path d="M20 30v12" strokeWidth={variant === 'outline' ? 2 : 1.6} />
        <path d="M29 30v9a3 3 0 0 0 4 3" strokeWidth={variant === 'outline' ? 2 : 1.6} />
      </g>
    </svg>
  );
}
