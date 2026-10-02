import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "e1-4: earth life-forms";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {/* Metallic bead with dark Ψπ glyph */}
        <svg
          viewBox="0 0 100 100"
          width="280"
          height="280"
          style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.8))" }}
        >
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

        {/* Text: e1-4 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "-2px",
          }}
        >
          e1-4
        </div>

        {/* Tagline: earth life-forms */}
        <div
          style={{
            fontSize: 32,
            color: "#b0b0b0",
            letterSpacing: "1px",
            textTransform: "lowercase",
          }}
        >
          earth life-forms
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
