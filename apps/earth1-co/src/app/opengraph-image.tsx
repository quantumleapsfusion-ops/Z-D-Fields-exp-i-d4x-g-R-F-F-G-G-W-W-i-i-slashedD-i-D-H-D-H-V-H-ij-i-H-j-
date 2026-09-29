import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.org}: ${site.focus}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card shown when earth1.co is shared, pointing people on to e1-4. */
export default async function Image() {
  const [earth1Png, e14Png] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/earth1.png")),
    readFile(join(process.cwd(), "public/brand/e1-4.png")),
  ]);
  const earth1 = `data:image/png;base64,${earth1Png.toString("base64")}`;
  const e14 = `data:image/png;base64,${e14Png.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0e1a13",
        color: "#f1ede1",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img
          src={earth1}
          width={64}
          height={64}
          alt=""
          style={{ objectFit: "contain" }}
        />
        <div style={{ fontSize: 32, color: "#93a294" }}>{site.org}</div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 104,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {site.focus}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", height: 2, backgroundColor: "#d3a34c" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
          <img src={e14} width={48} height={48} alt="" style={{ objectFit: "contain" }} />
          <div style={{ fontSize: 40, color: "#d3a34c" }}>{site.flagship.domain}</div>
          <div style={{ fontSize: 36 }}>Talk by voice. No number needed.</div>
        </div>
      </div>
    </div>,
    size,
  );
}
