import { ImageResponse } from "next/og";

import { brand } from "@earth-one/ui";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const accent = brand.accents.e14;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brand.colors.bg,
      }}
    >
      <svg width="132" height="132" viewBox="0 0 48 48" fill="none">
        <g stroke={accent} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8v8a8 8 0 0 0 16 0V8" strokeWidth="2" />
          <path d="M24 6v16" strokeWidth="2" />
          <path d="M6 24h36" strokeWidth="1" strokeOpacity="0.6" />
          <path d="M14 30h20" strokeWidth="2" />
          <path d="M20 30v12" strokeWidth="2" />
          <path d="M29 30v9a3 3 0 0 0 4 3" strokeWidth="2" />
        </g>
      </svg>
    </div>,
    size,
  );
}
