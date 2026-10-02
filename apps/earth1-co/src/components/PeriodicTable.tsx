"use client";

import { useState } from "react";

interface Element {
  symbol: string;
  number: number;
  name: string;
  mass: number;
  category: "nonmetal" | "metal" | "noble-gas" | "metalloid" | "halogen" | "alkali";
}

const ELEMENTS: Element[] = [
  { symbol: "H", number: 1, name: "Hydrogen", mass: 1.008, category: "nonmetal" },
  { symbol: "He", number: 2, name: "Helium", mass: 4.003, category: "noble-gas" },
  { symbol: "Li", number: 3, name: "Lithium", mass: 6.941, category: "alkali" },
  { symbol: "Be", number: 4, name: "Beryllium", mass: 9.012, category: "metal" },
  { symbol: "B", number: 5, name: "Boron", mass: 10.81, category: "metalloid" },
  { symbol: "C", number: 6, name: "Carbon", mass: 12.01, category: "nonmetal" },
  { symbol: "N", number: 7, name: "Nitrogen", mass: 14.01, category: "nonmetal" },
  { symbol: "O", number: 8, name: "Oxygen", mass: 16.00, category: "nonmetal" },
  { symbol: "F", number: 9, name: "Fluorine", mass: 19.00, category: "halogen" },
  { symbol: "Ne", number: 10, name: "Neon", mass: 20.18, category: "noble-gas" },
  { symbol: "Na", number: 11, name: "Sodium", mass: 22.99, category: "alkali" },
  { symbol: "Mg", number: 12, name: "Magnesium", mass: 24.31, category: "metal" },
  { symbol: "Cl", number: 17, name: "Chlorine", mass: 35.45, category: "halogen" },
  { symbol: "Ar", number: 18, name: "Argon", mass: 39.95, category: "noble-gas" },
];

const CATEGORY_COLORS: Record<Element["category"], string> = {
  nonmetal: "#6366f1",
  metal: "#f59e0b",
  "noble-gas": "#ec4899",
  metalloid: "#8b5cf6",
  halogen: "#06b6d4",
  alkali: "#10b981",
};

const CATEGORY_LABELS: Record<Element["category"], string> = {
  nonmetal: "Nonmetal",
  metal: "Metal",
  "noble-gas": "Noble Gas",
  metalloid: "Metalloid",
  halogen: "Halogen",
  alkali: "Alkali",
};

export function PeriodicTable() {
  const [selected, setSelected] = useState<Element | null>(null);

  return (
    <div className="space-y-6">
      <figure className="space-y-4">
        <div className="rounded-lg border border-white/20 p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {ELEMENTS.map((element) => (
              <button
                key={element.symbol}
                onClick={() => setSelected(element)}
                className="relative aspect-square rounded border transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: CATEGORY_COLORS[element.category],
                  backgroundColor: `${CATEGORY_COLORS[element.category]}15`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <span className="text-xs font-light text-white/60">{element.number}</span>
                  <span className="font-display text-sm font-semibold sm:text-base">
                    {element.symbol}
                  </span>
                  <span className="text-xs font-light text-white/40">{element.mass.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>

          <figcaption className="sr-only">
            Interactive periodic table showing 14 key elements from hydrogen to argon with atomic
            numbers, symbols, and atomic masses.
          </figcaption>
        </div>

        {selected && (
          <div className="rounded-lg border border-white/20 bg-white/5 p-4 transition-all duration-200">
            <h3 className="font-display text-lg tracking-[0.1em] uppercase">{selected.name}</h3>
            <div className="mt-3 space-y-2 text-sm font-light text-white/70">
              <p>
                <span className="text-white/90">Atomic Number:</span> {selected.number}
              </p>
              <p>
                <span className="text-white/90">Atomic Mass:</span> {selected.mass.toFixed(3)} u
              </p>
              <p>
                <span className="text-white/90">Category:</span>{" "}
                <span
                  className="rounded px-2 py-1 text-xs"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[selected.category]}25`,
                    color: CATEGORY_COLORS[selected.category],
                  }}
                >
                  {CATEGORY_LABELS[selected.category]}
                </span>
              </p>
            </div>
          </div>
        )}
      </figure>

      <div className="space-y-4 rounded-lg border border-white/20 p-4">
        <div className="space-y-3">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: CATEGORY_COLORS[key as Element["category"]] }}
              />
              <span className="text-sm text-white/70">{label}</span>
            </div>
          ))}
        </div>

        <p className="source text-sm leading-relaxed">
          The periodic table organizes elements by atomic number and chemical properties. Each element
          is a pure substance made of identical atoms. The atomic number tells you how many protons are
          in the nucleus; the atomic mass reflects the total mass of protons and neutrons. Elements in
          the same column share similar chemical behavior. Nonmetals form molecules with each other
          through covalent bonds, where electrons are shared. Metals lose electrons to form ionic bonds
          with nonmetals, creating salts. Noble gases have filled electron shells and are chemically
          inert—they rarely react. This organization reveals the hidden structure of matter and why some
          elements bond readily while others stand alone.
        </p>
      </div>
    </div>
  );
}
