import { ImageResponse } from "next/og";

import { brand } from "@earth-one/ui";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const accent = brand.accents.earth1;
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
        <circle cx="24" cy="24" r="21" stroke={accent} strokeWidth="1.5" />
        <circle
          cx="24"
          cy="24"
          r="14"
          stroke={accent}
          strokeWidth="1"
          strokeDasharray="2.4 3.6"
        />
        <path d="M24 9v30" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <path d="M13 19h22" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
