/**
 * Line-art orbital behind the hero: concentric rings (one accent, one dashed), a tilted
 * ellipse and the monolith cross. Purely decorative; slow rotation, disabled under
 * prefers-reduced-motion via the global rule.
 */
export function Orbital({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 600"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeOpacity={0.22}>
        <circle cx="300" cy="300" r="280" strokeWidth={1} />
        <circle cx="300" cy="300" r="200" strokeWidth={1} className="text-accent" />
      </g>
      <g className="animate-orbit-reverse origin-center">
        <circle
          cx="300"
          cy="300"
          r="240"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="3 9"
        />
      </g>
      <g className="animate-orbit origin-center">
        <ellipse
          cx="300"
          cy="300"
          rx="290"
          ry="110"
          transform="rotate(-28 300 300)"
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
        <circle
          cx="300"
          cy="300"
          r="4"
          transform="rotate(-28 300 300) translate(290 0)"
          className="fill-accent"
        />
      </g>
      <g stroke="currentColor" strokeOpacity={0.5} strokeLinecap="round">
        <path d="M300 130v340" strokeWidth={1.5} />
        <path d="M200 243h200" strokeWidth={1.5} />
      </g>
    </svg>
  );
}
