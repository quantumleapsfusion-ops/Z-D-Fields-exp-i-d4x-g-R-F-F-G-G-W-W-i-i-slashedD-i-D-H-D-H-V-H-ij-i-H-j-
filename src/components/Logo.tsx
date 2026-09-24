import type { SVGProps } from "react";

/**
 * Ψ-over-π mark: Psi stacked above pi, stroked in a rainbow gradient, on the
 * chalkboard. `mono` renders a single-colour chalk version.
 */
export function Logo({
  size = 40,
  mono = false,
  title = "e1-4",
  ...props
}: { size?: number; mono?: boolean; title?: string } & SVGProps<SVGSVGElement>) {
  const stroke = mono ? "currentColor" : "url(#e14-rainbow)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      {...props}
    >
      <title>{title}</title>
      {!mono && (
        <defs>
          <linearGradient id="e14-rainbow" x1="8" y1="8" x2="56" y2="56">
            <stop offset="0" stopColor="#e0533f" />
            <stop offset="0.25" stopColor="#d3a34c" />
            <stop offset="0.5" stopColor="#6fb26f" />
            <stop offset="0.75" stopColor="#4c8fd3" />
            <stop offset="1" stopColor="#9a5fd0" />
          </linearGradient>
        </defs>
      )}
      <rect x="2" y="2" width="60" height="60" rx="12" fill="#0e1a13" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="12"
        stroke="#93a294"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Ψ */}
      <g stroke={stroke} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 12v20" />
        <path d="M21 13c0 9 3.5 14 11 14s11-5 11-14" />
        <path d="M27 33h10" />
      </g>
      {/* π */}
      <g stroke={stroke} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 41c4-1.2 22-1.2 28 0" />
        <path d="M24 41v13" />
        <path d="M40 41c0 6 .5 10 3 13" />
      </g>
    </svg>
  );
}
