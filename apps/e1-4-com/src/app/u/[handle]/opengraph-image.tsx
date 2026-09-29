import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { findByHandle } from "@/lib/people/handles";
import { site } from "@/lib/site";

export const alt = "Talk to me by voice on e1-4";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card people see when someone pastes their e1-4.com/@handle link into any app. */
export default async function PersonCardImage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const person = await findByHandle(decodeURIComponent(handle));
  const logo = await readFile(join(process.cwd(), "public/icon.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const name = person?.name ?? "e1-4";
  const initial = name.replace(/^@/, "").charAt(0).toUpperCase() || "e";

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
        <img src={logoSrc} width={64} height={64} alt="" />
        <div style={{ fontSize: 32, color: "#93a294" }}>{site.domain}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        {person?.image ? (
          <img
            src={person.image}
            width={200}
            height={200}
            alt=""
            style={{ borderRadius: 100, border: "4px solid #d3a34c", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              border: "4px solid #d3a34c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 104,
            }}
          >
            {initial}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {name}
          </div>
          {person ? (
            <div style={{ fontSize: 44, color: "#d3a34c", marginTop: 12 }}>
              {`${site.domain}/@${person.handle}`}
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", height: 2, backgroundColor: "#d3a34c" }} />
        <div style={{ fontSize: 40, marginTop: 24 }}>
          Talk to me by voice. No number needed.
        </div>
      </div>
    </div>,
    size,
  );
}
