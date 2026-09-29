/**
 * Earth 1 Coalescent brand tokens shared by earth1.co and e1-4.com. The CSS equivalents live
 * in `tokens.css`; use these when a colour has to be computed in JS (canvas, OG images).
 */
export const brand = {
  org: "Earth 1 Coalescent",
  colors: {
    bg: "#050507",
    surface: "#0c0d12",
    border: "rgba(237, 238, 242, 0.08)",
    text: "#edeef2",
    text2: "#b4b7c3",
    text3: "#8a8d9b",
  },
  accents: {
    earth1: "#b9c4ff",
    e14: "#7fe7f0",
  },
  /** Reserved for the Ψπ mark only; nowhere else on either site. */
  rainbow: ["#e8574a", "#ef9a3c", "#e9d25a", "#6cc07a", "#4aa6d8", "#7a6fd6", "#b06cc6"],
} as const;

export type BrandColor = keyof typeof brand.colors;
