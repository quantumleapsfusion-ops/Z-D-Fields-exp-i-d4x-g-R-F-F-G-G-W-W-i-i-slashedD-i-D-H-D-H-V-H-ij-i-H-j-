/**
 * Cosmic brand tokens shared by earth1.co and e1-4.com. The CSS equivalents live in
 * `tokens.css`; use these when a colour has to be computed in JS (canvas, OG images).
 */
export const brand = {
  org: "Earth One Global Coalescent",
  colors: {
    blackboard: "#070a1f",
    board2: "#0f1433",
    chalk: "#eef1fb",
    dust: "#9db2d6",
    ochre: "#7fd4ff",
    glow: "#38bdf8",
    nebula: "#2a1f66",
  },
  rainbow: ["#e8574a", "#ef9a3c", "#e9d25a", "#6cc07a", "#4aa6d8", "#7a6fd6", "#b06cc6"],
} as const;

export type BrandColor = keyof typeof brand.colors;
