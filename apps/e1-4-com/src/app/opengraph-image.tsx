import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/icon.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#000000",
        color: "#f1ede1",
        padding: "80px",
      }}
    >
      <img src={logoSrc} width={140} height={140} alt="" style={{ marginBottom: 32 }} />
      <div style={{ fontSize: 104, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
        {site.hero}
      </div>
      <div style={{ fontSize: 56, color: "#93a294", marginTop: 12 }}>{site.motto}</div>
      <div style={{ fontSize: 44, color: "#93a294", marginTop: 16 }}>{site.subhead}</div>
      <div
        style={{ display: "flex", marginTop: 56, height: 2, backgroundColor: "#d3a34c" }}
      />
      <div style={{ fontSize: 28, color: "#93a294", marginTop: 24 }}>
        {`${site.domain} · ${site.org}`}
      </div>
    </div>,
    size,
  );
}
