/** The official e1-4 mark: a metallic bead with dark Ψπ glyph in the center. */
export function BeadMark({ className, size = 100 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Metallic bead with dark Ψπ glyph, silver gradient with depth */}
      <defs>
        <radialGradient id="bead-shine" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="50%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <radialGradient id="bead-shadow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
        </radialGradient>
      </defs>

      {/* Main bead sphere */}
      <circle cx="50" cy="50" r="45" fill="url(#bead-shine)" />
      <circle cx="50" cy="50" r="45" fill="url(#bead-shadow)" />

      {/* Highlight for metallic shine */}
      <ellipse cx="38" cy="32" rx="18" ry="16" fill="white" opacity="0.6" />

      {/* Dark glyph (Ψ over π) in the center */}
      <g fill="#1a1a1a">
        {/* Ψ (psi) symbol */}
        <g transform="translate(50, 38)">
          {/* Vertical stem */}
          <rect x="-2" y="-8" width="4" height="16" rx="2" />
          {/* Left curve */}
          <path
            d="M -8,-6 Q -10,-2 -8,2 Q -6,4 -4,2"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right curve */}
          <path
            d="M 8,-6 Q 10,-2 8,2 Q 6,4 4,2"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* π (pi) symbol below */}
        <g transform="translate(50, 54)">
          {/* Top line */}
          <line x1="-8" y1="-3" x2="8" y2="-3" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Left vertical */}
          <line x1="-4" y1="-3" x2="-4" y2="6" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right vertical */}
          <line x1="4" y1="-3" x2="4" y2="6" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
