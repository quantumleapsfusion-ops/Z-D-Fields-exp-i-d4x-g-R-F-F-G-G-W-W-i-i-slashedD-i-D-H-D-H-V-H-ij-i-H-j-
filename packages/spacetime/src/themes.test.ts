import { describe, expect, it } from "vitest";

import {
  palettes,
  resolveTheme,
  themes,
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

describe("spacetime themes", () => {
  const cases: [SpacetimeTheme, SpacetimePalette][] = [
    ["earth1", "chalk"],
    ...(Object.keys(palettes) as SpacetimePalette[]).map(
      (p): [SpacetimeTheme, SpacetimePalette] => ["e1-4", p],
    ),
  ];

  it.each(cases)(
    "%s/%s keeps 4.5:1 contrast for text over its brightest line",
    (t, p) => {
      const theme = resolveTheme(t, p);
      const brightest = Math.max(
        ...theme.colors.map((c) => luminance(c.map((v) => v * theme.brightness))),
      );
      for (const colour of Object.values(TEXT))
        expect(contrast(luminance(hex(colour)), brightest)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("keeps grid opacity within the 15–25% brief", () => {
    for (const t of Object.values(themes)) {
      expect(t.brightness).toBeGreaterThanOrEqual(0.15);
      expect(t.brightness).toBeLessThanOrEqual(0.25);
    }
  });

  it("gives earth1 a white grid with a permanent singularity and no voice", () => {
    const t = resolveTheme("earth1", "rainbow");
    expect(t.colors).toEqual([[1, 1, 1]]);
    expect(t.singularity).not.toBeNull();
    expect(t.voice).toBe(false);
  });

  it("lets only e1-4 follow the recording amplitude", () => {
    expect(resolveTheme("e1-4").voice).toBe(true);
    expect(resolveTheme("e1-4").singularity).toBeNull();
    expect(resolveTheme("e1-4", "rainbow").colors).toHaveLength(7);
  });
});
