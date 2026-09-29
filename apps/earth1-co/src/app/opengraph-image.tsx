import { ImageResponse } from "next/og";

import { brand } from "@earth-one/ui";

import { site } from "@/lib/site";

export const alt = `${site.org} — ${site.motto}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const accent = brand.accents.earth1;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: brand.colors.bg,
        color: brand.colors.text,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
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
        <div style={{ fontSize: 26, letterSpacing: "0.24em", color: brand.colors.text2 }}>
          EARTH 1
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{ fontSize: 84, fontWeight: 300, lineHeight: 1.05, letterSpacing: -2 }}
        >
          {site.motto}
        </div>
        <div style={{ fontSize: 22, letterSpacing: "0.24em", color: accent }}>
          {`${site.org} · ${site.domain}`.toUpperCase()}
        </div>
      </div>
    </div>,
    size,
  );
}
