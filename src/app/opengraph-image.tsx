import { ImageResponse } from "next/og";

export const alt = "e1-4 — Greetings Earthling. Think.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#0e1a13",
        color: "#f1ede1",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ fontSize: 112, lineHeight: 1, letterSpacing: -3 }}>
        Greetings Earthling.
      </div>
      <div style={{ fontSize: 64, marginTop: 24, color: "#d3a34c", fontStyle: "italic" }}>
        Think.
      </div>
      <div
        style={{
          marginTop: 72,
          fontSize: 28,
          color: "#93a294",
          fontFamily: "sans-serif",
          display: "flex",
        }}
      >
        e1-4.com · earth life-forms
      </div>
    </div>,
    size,
  );
}
