import { ImageResponse } from "next/og";

import { brand } from "@earth-one/ui";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.motto}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const accent = brand.accents.e14;
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
          <g stroke={accent} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8v8a8 8 0 0 0 16 0V8" strokeWidth="2" />
            <path d="M24 6v16" strokeWidth="2" />
            <path d="M6 24h36" strokeWidth="1" strokeOpacity="0.6" />
            <path d="M14 30h20" strokeWidth="2" />
            <path d="M20 30v12" strokeWidth="2" />
            <path d="M29 30v9a3 3 0 0 0 4 3" strokeWidth="2" />
          </g>
        </svg>
        <div style={{ fontSize: 26, letterSpacing: "0.24em", color: brand.colors.text2 }}>
          {site.tagline.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 160, fontWeight: 700, lineHeight: 1, letterSpacing: -6 }}>
          {site.motto}
        </div>
        <div style={{ fontSize: 30, color: brand.colors.text2 }}>{site.pitch}</div>
        <div style={{ fontSize: 22, letterSpacing: "0.24em", color: accent }}>
          {`${site.domain} · ${site.org}`.toUpperCase()}
        </div>
      </div>
    </div>,
    size,
  );
}
