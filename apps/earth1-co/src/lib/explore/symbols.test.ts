import { describe, expect, it } from "vitest";

import { sections } from "@earth-one/content";

import { equations } from "@/lib/library/equations";

import { symbols } from "./symbols";

const STRUCTURAL = new Set([
  "frac",
  "left",
  "right",
  "quad",
  "qquad",
  "text",
  "mathrm",
  "mathbf",
  "mathbb",
  "operatorname",
]);
const glyphs = new Set(symbols.map((symbol) => symbol.glyph));
const texCommands = new Set(
  symbols
    .flatMap((symbol) => symbol.tex ?? [])
    .flatMap((tex) => [...tex.matchAll(/\\([a-zA-Z]+)/g)].map((match) => match[1])),
);

describe("math symbols", () => {
  it("includes every lowercase and uppercase Greek letter", () => {
    for (let cp = 0x0391; cp <= 0x03a9; cp += 1) {
      if (cp !== 0x03a2) expect(glyphs).toContain(String.fromCodePoint(cp));
    }
    for (let cp = 0x03b1; cp <= 0x03c9; cp += 1) {
      expect(glyphs).toContain(String.fromCodePoint(cp));
    }
  });

  it("documents every special character and TeX command in the equation library", () => {
    const contentEquations = sections.flatMap((section) =>
      (section.topics ?? []).flatMap((topic) => topic.equations ?? []),
    );
    const samples = [
      ...equations.flatMap((equation) => [equation.formula, equation.symbols ?? ""]),
      ...contentEquations.flatMap((equation) => [
        equation.tex,
        equation.label,
        equation.note ?? "",
      ]),
    ];
    for (const sample of samples) {
      for (const character of Array.from(sample)) {
        if (
          /[^\x00-\x7F]/u.test(character) &&
          !/[\p{L}\p{M}\p{N}\p{P}\p{Z}\s]/u.test(character)
        ) {
          expect(
            symbols.some((symbol) => symbol.glyph.includes(character)),
            `missing ${character} in ${sample}`,
          ).toBe(true);
        }
      }
      for (const [, command] of sample.matchAll(/\\([a-zA-Z]+)/g)) {
        expect(
          texCommands.has(command) || STRUCTURAL.has(command),
          `missing TeX command \\${command}`,
        ).toBe(true);
      }
    }
  });

  it("has unique glyphs and a non-empty meaning for each entry", () => {
    expect(glyphs.size).toBe(symbols.length);
    for (const symbol of symbols) {
      expect(symbol.meanings.length, symbol.glyph).toBeGreaterThan(0);
      expect(
        symbol.meanings.every((meaning) => meaning.trim().length > 0),
        symbol.glyph,
      ).toBe(true);
    }
  });
});
