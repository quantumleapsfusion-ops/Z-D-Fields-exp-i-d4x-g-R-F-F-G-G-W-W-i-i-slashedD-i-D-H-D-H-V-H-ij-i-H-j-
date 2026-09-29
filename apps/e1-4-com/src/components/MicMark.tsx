const WAVES = [
  "#3a2fd8",
  "#7b1fc9",
  "#c21c6a",
  "#ea2f2f",
  "#ff6a1a",
  "#ffb21f",
  "#ffe35a",
];
const TILE = "M14 0H56A44 44 0 0 1 100 44V56A44 44 0 0 1 56 100H0V14A14 14 0 0 1 14 0Z";

/** The e1-4 mark: a microphone on a blue tile with liquid colour pouring through its corner. */
export function MicMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="e14-mark-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a9bff" />
          <stop offset="1" stopColor="#1453f0" />
        </linearGradient>
        <clipPath id="e14-mark-tile">
          <path d={TILE} />
        </clipPath>
      </defs>
      <g clipPath="url(#e14-mark-tile)">
        <path d={TILE} fill="url(#e14-mark-blue)" />
        {WAVES.map((color, i) => (
          <path
            key={color}
            fill={color}
            d={`M${22 + i * 9} 100C${44 + i * 7} 96 ${50 + i * 5} ${62 + i * 3} 100 ${36 + i * 8}V100Z`}
          />
        ))}
      </g>
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="5">
        <rect x="31" y="16" width="18" height="32" rx="9" fill="#fff" stroke="none" />
        <path d="M22 38a18 18 0 0 0 36 0M40 56v14" />
      </g>
    </svg>
  );
}
