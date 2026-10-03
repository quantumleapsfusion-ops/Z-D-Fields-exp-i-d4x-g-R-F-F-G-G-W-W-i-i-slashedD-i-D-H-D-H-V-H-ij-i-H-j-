import { describe, expect, it } from "vitest";

import { elements } from "./elements";

const coreElectrons: Record<string, number> = {
  He: 2,
  Ne: 10,
  Ar: 18,
  Kr: 36,
  Xe: 54,
  Rn: 86,
};

function configurationElectrons(config: string) {
  const core = config.match(/^\[(He|Ne|Ar|Kr|Xe|Rn)\]/);
  const coreCount = core ? coreElectrons[core[1]] : 0;
  const terms = config.replace(/^\[[A-Za-z]+\]\s*/, "").match(/\d[spdf]\d+/g) ?? [];
  return (
    coreCount + terms.reduce((sum, term) => sum + Number(term.match(/\d+$/)?.[0]), 0)
  );
}

describe("periodic-table data", () => {
  it("has one entry for every element in atomic-number order", () => {
    expect(elements).toHaveLength(118);
    expect(elements.map((element) => element.z)).toEqual(
      Array.from({ length: 118 }, (_, index) => index + 1),
    );
    expect(new Set(elements.map((element) => element.symbol)).size).toBe(118);
    expect(new Set(elements.map((element) => element.name)).size).toBe(118);
  });

  it("keeps each occupied table position unique", () => {
    const slots = elements
      .filter((element) => element.group !== null)
      .map((element) => `${element.group}-${element.period}`);
    expect(new Set(slots).size).toBe(slots.length);
    expect(elements.find((element) => element.symbol === "Fe")).toMatchObject({
      group: 8,
      period: 4,
    });
    expect(elements.find((element) => element.symbol === "Au")).toMatchObject({
      group: 11,
      period: 6,
    });
    expect(elements.find((element) => element.symbol === "Lu")).toMatchObject({
      group: 3,
      period: 6,
    });
    expect(elements.find((element) => element.symbol === "Og")).toMatchObject({
      group: 18,
      period: 7,
    });
    expect(elements.find((element) => element.symbol === "La")).toMatchObject({
      group: null,
      period: 6,
    });
  });

  it("has electron configurations that contain exactly the atomic number of electrons", () => {
    for (const element of elements) {
      expect(
        configurationElectrons(element.config),
        `${element.symbol}: ${element.config}`,
      ).toBe(element.z);
    }
  });

  it("assigns blocks from the displayed group and period layout", () => {
    for (const element of elements) {
      const expected =
        element.group === null
          ? "f"
          : element.symbol === "He" || element.group <= 2
            ? "s"
            : element.group <= 12
              ? "d"
              : "p";
      expect(element.block, element.symbol).toBe(expected);
    }
  });

  it("uses group 18 for the noble-gas family, including superheavy oganesson", () => {
    expect(
      elements.filter((element) => element.group === 18).map((element) => element.symbol),
    ).toEqual(["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"]);
  });

  it("uses abridged atomic weights and isotope masses for selected elements", () => {
    for (const [symbol, mass] of [
      ["H", "1.008"],
      ["C", "12.011"],
      ["Fe", "55.845"],
      ["Au", "196.97"],
      ["U", "238.03"],
      ["Tc", "[98]"],
      ["Og", "[294]"],
    ]) {
      expect(elements.find((element) => element.symbol === symbol)?.mass).toBe(mass);
    }
    const mass = (symbol: string) =>
      Number(elements.find((element) => element.symbol === symbol)!.mass);
    expect(mass("Ar")).toBeGreaterThan(mass("K"));
    expect(mass("Co")).toBeGreaterThan(mass("Ni"));
    expect(mass("Te")).toBeGreaterThan(mass("I"));
  });
});
