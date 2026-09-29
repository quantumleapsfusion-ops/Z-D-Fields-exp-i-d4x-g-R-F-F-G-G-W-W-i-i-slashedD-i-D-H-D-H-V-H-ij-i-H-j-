const RINGS = [
  { rx: 150, ry: 34, width: 10, opacity: 0.35 },
  { rx: 176, ry: 40, width: 22, opacity: 0.7 },
  { rx: 212, ry: 48, width: 14, opacity: 0.5 },
  { rx: 232, ry: 53, width: 3, opacity: 0.4 },
];

/** The coalescent's emblem: one world held inside its rings. */
export function SaturnRings({ className }: { className?: string }) {
  return (
    <svg viewBox="-260 -160 520 320" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="saturn-planet" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f4ead2" />
          <stop offset="0.55" stopColor="#c9a86a" />
          <stop offset="1" stopColor="#3b2f1f" />
        </radialGradient>
        <linearGradient id="saturn-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a7a5c" />
          <stop offset="0.5" stopColor="#f1e4c3" />
          <stop offset="1" stopColor="#8a7a5c" />
        </linearGradient>
        <clipPath id="saturn-back">
          <rect x="-260" y="-160" width="520" height="160" />
        </clipPath>
        <clipPath id="saturn-front">
          <rect x="-260" y="0" width="520" height="160" />
        </clipPath>
      </defs>
      <g transform="rotate(-16)">
        <g clipPath="url(#saturn-back)">
          {RINGS.map((ring) => (
            <ellipse
              key={ring.rx}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="url(#saturn-ring)"
              strokeWidth={ring.width}
              opacity={ring.opacity}
            />
          ))}
        </g>
        <circle r="104" fill="url(#saturn-planet)" />
        <g opacity="0.18" stroke="#3b2f1f" strokeWidth="6" fill="none">
          <path d="M-100 -30Q0 -10 100 -30M-102 12Q0 32 102 12M-90 48Q0 66 90 48" />
        </g>
        <g clipPath="url(#saturn-front)">
          {RINGS.map((ring) => (
            <ellipse
              key={ring.rx}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="url(#saturn-ring)"
              strokeWidth={ring.width}
              opacity={ring.opacity}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
