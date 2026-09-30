import { describe, expect, it } from "vitest";

import {
  LINE_MAX_LUMINANCE,
  palettes,
  resolveTheme,
  SKY_MAX_LUMINANCE,
  type SpacetimePalette,
  type SpacetimeTheme,
} from "./themes";

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: readonly number[]) =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const hex = (v: string) => {
  const n = Number.parseInt(v.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
};
const contrast = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Every brand colour used for text on either site. */
const TEXT = { chalk: "#f1ede1", dust: "#93a294", ochre: "#d3a34c" };

const cases: [SpacetimeTheme, SpacetimePalette][] = [
  ["earth1", "cosmos"],
  ...(Object.keys(palettes) as SpacetimePalette[]).map(
    (p): [SpacetimeTheme, SpacetimePalette] => ["e1-4", p],
  ),
];

describe("spacetime themes", () => {
  it("keeps 4.5:1 contrast for text over the brightest possible background pixel", () => {
    const worst = SKY_MAX_LUMINANCE + LINE_MAX_LUMINANCE;
    for (const colour of Object.values(TEXT))
      expect(contrast(luminance(hex(colour)), worst)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(cases)("%s/%s lines stay under the line luminance ceiling", (t, p) => {
    const theme = resolveTheme(t, p);
    for (const c of theme.colors)
      expect(luminance(c.map((v) => v * theme.brightness))).toBeLessThanOrEqual(
        LINE_MAX_LUMINANCE,
      );
  });

  it("keeps the sky and its glows under the sky ceiling", () => {
    const { sky } = resolveTheme("earth1");
    const add = (a: readonly number[], b: readonly number[]) => a.map((v, i) => v + b[i]);
    for (const base of [sky.top, sky.bottom])
      for (const glow of [sky.glowA, sky.glowB])
        expect(luminance(add(base, glow))).toBeLessThanOrEqual(SKY_MAX_LUMINANCE);
  });

  it("gives earth1 a permanent singularity and no voice", () => {
    const t = resolveTheme("earth1", "rainbow");
    expect(t.colors).toEqual(palettes.cosmos.colors);
    expect(t.singularity).not.toBeNull();
    expect(t.voice).toBe(false);
  });

  it("lets only e1-4 follow the recording amplitude", () => {
    expect(resolveTheme("e1-4").voice).toBe(true);
    expect(resolveTheme("e1-4").singularity).toBeNull();
    expect(resolveTheme("e1-4", "rainbow").colors).toHaveLength(7);
  });
});
