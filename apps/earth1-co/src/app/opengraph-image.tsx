import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/earth1.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        color: "#ffffff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
      <img src={src} width={260} height={260} alt="" />
      <div style={{ marginTop: 40, fontSize: 72, letterSpacing: "0.3em" }}>EARTH ONE</div>
      <div style={{ marginTop: 16, fontSize: 36, color: "#cccccc" }}>{site.motto}</div>
    </div>,
    size,
  );
}
